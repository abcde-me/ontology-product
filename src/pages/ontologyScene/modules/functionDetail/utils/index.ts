import { python } from '@codemirror/lang-python';
import { syntaxTree } from '@codemirror/language';
import { Decoration, EditorView } from '@codemirror/view';
import {
  Annotation,
  EditorState,
  RangeSet,
  StateField,
  Transaction
} from '@codemirror/state';
import type { SyntaxNodeRef, TreeCursor } from '@lezer/common';

import { ExternalChange } from '@uiw/react-codemirror';
import {
  InputType,
  OntologyFunctionDetail,
  OntologyFunctionParam,
  OntologyFunctionSchema,
  ParamType,
  TestFunction,
  TestFunctionItem,
  TYPE_MAP
} from '@/pages/ontologyScene/types/ontologyFunction';
import { isNil } from 'lodash-es';
import dayjs from 'dayjs';
import { formatParamValueByType } from '@/pages/ontologyScene/utils';

export const bypassFrozenRange = Annotation.define<boolean>();

/**
 * 根据给定的冻结区间，创建一个 transactionFilter
 * 用于拦截对这些区间的编辑操作
 *
 * 原理：
 * - CodeMirror 的每一次编辑都会生成一个 transaction
 * - transactionFilter 可以决定：
 *   - 放行这个 transaction
 *   - 或直接丢弃（返回 []）
 */
function freezeRanges(ranges: { from: number; to: number }[]) {
  return EditorState.transactionFilter.of((tr) => {
    // 没有文档变更（比如只移动光标），直接放行
    if (!tr.docChanged) return tr;
    // 外部更新允许通过（React CodeMirror 的 value 变化会带 ExternalChange）
    if (tr.annotation(ExternalChange)) return tr;
    // // 需要强制放行时，也可以用注解绕过
    if (tr.annotation(bypassFrozenRange)) return tr;
    // 只拦截用户输入相关事务
    if (!tr.annotation(Transaction.userEvent)) return tr;

    let blocked = false;

    /**
     * iterChanges 会遍历本次 transaction 中的所有变更区间
     * from / to 是变更前文档中的字符偏移量
     */
    tr.changes.iterChanges((from, to) => {
      for (const r of ranges) {
        /**
         * 判断当前变更是否和某个冻结区间发生重叠
         * 只要有重叠，就认为是非法编辑
         */
        if (from < r.to && to > r.from) {
          blocked = true;
          break;
        }
      }
    });

    // 若命中冻结区间，丢弃本次编辑；否则正常执行
    return blocked ? [] : tr;
  });
}

/**
 * 从 Python 源码中提取「函数签名」对应的字符区间
 *
 * 冻结范围：
 * - 从 def 关键字开始
 * - 到参数列表结束，或返回值类型声明结束
 * - 不包含函数体
 */
function getPythonFuncSignatureRanges(code: string) {
  const state = EditorState.create({
    doc: code,
    extensions: [python()]
  });

  const tree = syntaxTree(state);
  const ranges: { from: number; to: number }[] = [];

  tree.iterate({
    enter(node) {
      if (node.name === 'FunctionDefinition') {
        const from = node.from;
        let to = node.to;

        let paramsEnd = -1;
        let returnTypeEnd = -1;

        node.node.cursor().iterate((child) => {
          if (child.name === 'Parameters') {
            paramsEnd = child.to;
          }

          if (child.name === 'TypeDef' || child.name === 'TypeAnnotation') {
            returnTypeEnd = child.to;
          }
        });

        if (returnTypeEnd !== -1) {
          to = returnTypeEnd;
        } else if (paramsEnd !== -1) {
          to = paramsEnd;
        }
        to += 1;

        ranges.push({ from, to });
      }
    }
  });

  return ranges;
}

/**
 * 解析 Python 源码中每个函数的「最后一条 return 语句」区间
 *
 * 规则：
 * - 仅统计当前函数体内的 return
 * - 遇到嵌套函数时跳过其内部的 return
 */
export function getPythonFuncLastReturnRanges(code: string) {
  const state = EditorState.create({
    doc: code,
    extensions: [python()]
  });

  const tree = syntaxTree(state);
  const ranges: { from: number; to: number }[] = [];

  /**
   * 查找某个函数节点下最后一个 return 的区间
   * 返回 null 表示该函数没有 return
   */
  const findLastReturnInFunction = (funcNode: SyntaxNodeRef) => {
    let lastReturn: { from: number; to: number } | null = null;
    const cursor = funcNode.node.cursor();

    // 递归遍历函数体，遇到嵌套函数直接跳过
    const walk = (cur: TreeCursor) => {
      if (cur.name === 'FunctionDefinition') {
        return;
      }

      if (cur.name === 'ReturnStatement') {
        if (!lastReturn || cur.from >= lastReturn.from) {
          lastReturn = { from: cur.from, to: cur.to };
        }
      }

      if (cur.firstChild()) {
        do {
          walk(cur);
        } while (cur.nextSibling());
        cur.parent();
      }
    };

    if (cursor.firstChild()) {
      do {
        walk(cursor);
      } while (cursor.nextSibling());
      cursor.parent();
    }

    return lastReturn;
  };

  tree.iterate({
    enter(node) {
      if (node.name !== 'FunctionDefinition') return;

      const lastReturn = findLastReturnInFunction(node);
      if (lastReturn) {
        ranges.push(lastReturn);
      }
    }
  });

  return ranges;
}

const buildFUnctionSignature = (data: {
  name: string;
  input: OntologyFunctionParam[];
  output: OntologyFunctionParam[];
}) => {
  const { name, input, output } = data;
  const signature = `def ${name}(${input
    ?.map(
      ({ name: p_name, type, uiTypeAndValue }) =>
        `${p_name} : ${TYPE_MAP[uiTypeAndValue!.uiType!.split('_')[0]]}`
    )
    .join(',')})`;
  const returnType = output.length > 0 ? 'dict' : 'None';
  return `${signature} -> ${returnType}:`;
};
const buildReturnCode = (outputs: OntologyFunctionParam[]) => {
  if (outputs.length === 0) return 'return None';
  return `return {${outputs.map((item) => `"${item.name}":${item.name}`).join(',')}}`;
};

/**
 * 根据函数元数据生成 Python 脚本
 *
 * 规则：
 * - 使用 input/output 生成函数签名
 * - output 为多个时返回 Tuple[...] 与 tuple 表达式
 * - content 中若包含函数体，则复用其内容，并替换最后一条 return
 */
export function buildPythonFunctionScript(meta: {
  code: string;
  input?: OntologyFunctionParam[];
  output?: OntologyFunctionParam[];
  content?: string;
}) {
  const inputs = meta.input ?? [];
  const outputs = meta.output ?? [];
  const code = meta.content ?? '';
  const functionSignature = buildFUnctionSignature({
    name: meta.code,
    input: inputs,
    output: outputs
  });
  const returnCode = buildReturnCode(outputs);
  const signatureRanges = getPythonFuncSignatureRanges(code);
  const funcLastReturnRanges = getPythonFuncLastReturnRanges(code);
  const { from: s_start, to: s_end } = signatureRanges[0];
  const { from: r_start, to: r_end } = funcLastReturnRanges[0];
  // 替换code中s_start到s_end的代码为signatureRanges
  const imports = code.slice(0, s_start);
  const functionBody = code.slice(s_end, r_start);
  return `${imports}${functionSignature}${functionBody}${returnCode}`;
}

/**
 * 冻结区间的高亮 StateField
 * 根据 AST 计算出的 ranges 生成 Decoration
 */
function frozenRangeHighlight(ranges: { from: number; to: number }[]) {
  return StateField.define<RangeSet<Decoration>>({
    create() {
      // 初始化时生成冻结高亮
      const decorations = ranges.map((r) => frozenMark.range(r.from, r.to));
      return RangeSet.of(decorations, true);
    },

    update(deco, tr) {
      // 文档变化时，同步映射 decoration 位置
      // if (tr.docChanged) {
      //   return deco.map(tr.changes);
      // }
      return deco;
    },

    provide: (field) => EditorView.decorations.from(field)
  });
}

/**
 * 冻结区域的高亮样式
 * 仅用于视觉提示，不影响编辑逻辑
 */
const frozenMark = Decoration.mark({
  class: 'cm-frozen-range',
  attributes: { title: '由参数配置生成，禁止修改' }
});

/**
 * 对外暴露的统一入口
 *
 * 功能：
 * - 解析 Python 代码
 * - 计算需要冻结的区间
 * - 返回可直接用于 CodeMirror 的 transactionFilter 扩展
 */
export function getFreezeRanges(code: string) {
  const funcSignatureRanges = getPythonFuncSignatureRanges(code);
  const lastReturnRanges = getPythonFuncLastReturnRanges(code);

  const ranges = [...funcSignatureRanges, ...lastReturnRanges];

  return [
    // 禁止修改
    freezeRanges(ranges),
    // 冻结区域高亮
    frozenRangeHighlight(ranges)
  ];
}

export function buildFunctionSchema(
  meta: OntologyFunctionDetail
): OntologyFunctionSchema {
  const { name, code, params = [], description, content } = meta;
  const paramsSetting = params.reduce<
    Record<InputType, OntologyFunctionParam[]>
  >(
    (p, c) => {
      const { name, type, inputType, value, idx, uiType } = c;
      const base: OntologyFunctionParam = {
        name,
        type,
        idx
      };
      if (inputType === InputType.Input) {
        base.value = value;
        base.uiTypeAndValue = {
          uiType: `${type}_${uiType}`
        };
      }
      p[inputType === InputType.Input ? 'input' : 'output'].push(base);
      return p;
    },
    {
      input: [],
      output: []
    }
  );
  const { input, output } = paramsSetting;
  return {
    code,
    name,
    description,
    input: input.sort((a, b) => {
      return a.idx! - b.idx!;
    }),
    output: output.sort((a, b) => {
      return a.idx! - b.idx!;
    }),
    content
  };
}

export function buildFunctionDetail(
  meta: OntologyFunctionSchema
): Partial<OntologyFunctionDetail> {
  const { name, description, input, output, content, code } = meta;
  const inputParams = (input || []).map((item, idx) => {
    const { name, code, uiTypeAndValue } = item;
    const [type, ui] = uiTypeAndValue!.uiType!.split('_');
    return {
      name,
      code: name,
      type,
      inputType: InputType.Input,
      uiType: ui,
      idx
    };
  });
  const outputParams = (output || []).map((item, idx) => {
    const { name, code, type } = item;
    return {
      name,
      code: name,
      type,
      inputType: InputType.Output,
      idx
    };
  });

  return {
    name,
    description,
    content,
    code,
    // @ts-ignore
    params: [...inputParams, ...outputParams]
  };
}

/**
 *
 * @param formData
 * @param config
 */
export const buildTestFunctionData = (
  formData: Required<OntologyFunctionSchema>,
  config: Record<string, any> = {}
): TestFunction => {
  const { content, code, name, description = '', input, output } = formData;
  const res: TestFunction = {
    list_data: [],
    run_action_with_validate: true,
    run_type: 'function',
    target: [code]
  };
  const testData: TestFunctionItem = {
    arguments: [],
    code: code,
    content: content,
    logic_function: [code],
    name: name,
    params: [],
    description,
    ...config
  };
  testData.params = [input, output].flatMap((params) => {
    return params.map((param, idx) => {
      const { name, type, uiTypeAndValue } = param;
      const base: OntologyFunctionParam = {
        code: name,
        name,
        type,
        inputType: InputType.Output
      };
      if (!isNil(uiTypeAndValue)) {
        const [dataType] = uiTypeAndValue.uiType!.split('_')!;
        const paramValue = formatParamValueByType(param);
        testData.arguments.push({
          name,
          value: paramValue
        });
        base.inputType = InputType.Input;
        base.value = paramValue;
        base.type = dataType as ParamType;
      }
      return base;
    });
  });
  res.list_data.push(testData);
  return res;
};

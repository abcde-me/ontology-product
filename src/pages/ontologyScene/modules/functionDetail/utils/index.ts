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

function getFunctionDefinitionName(
  code: string,
  funcNode: SyntaxNodeRef
): string {
  const cursor = funcNode.node.cursor();
  let functionName = '';

  if (cursor.firstChild()) {
    do {
      if (cursor.name === 'VariableName') {
        functionName = code.slice(cursor.from, cursor.to);
        break;
      }
    } while (cursor.nextSibling());
    cursor.parent();
  }

  return functionName;
}

function getLineEndPosition(code: string, from: number) {
  const lineEnd = code.indexOf('\n', from);
  return lineEnd === -1 ? code.length : lineEnd;
}

type TextFunctionBlock = {
  name: string;
  indent: number;
  from: number;
  signatureTo: number;
  startLine: number;
  bodyStartLine: number;
  bodyEndLine: number;
};

function getLineStartOffsets(code: string) {
  const offsets = [0];
  for (let index = 0; index < code.length; index += 1) {
    if (code[index] === '\n' && index + 1 < code.length) {
      offsets.push(index + 1);
    }
  }
  return offsets;
}

function getIndentSize(line: string) {
  const match = line.match(/^[ \t]*/);
  return match?.[0].length ?? 0;
}

function isBlankOrComment(line: string) {
  const trimmed = line.trim();
  return !trimmed || trimmed.startsWith('#');
}

function scanPythonFunctionBlocks(code: string): TextFunctionBlock[] {
  const lines = code.split('\n');
  const lineOffsets = getLineStartOffsets(code);
  const blocks: TextFunctionBlock[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^([ \t]*)def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    if (!match) {
      return;
    }

    const indent = match[1].length;
    const defOffset = line.indexOf('def');
    blocks.push({
      name: match[2],
      indent,
      from: lineOffsets[index] + defOffset,
      signatureTo: lineOffsets[index] + line.length,
      startLine: index,
      bodyStartLine: index + 1,
      bodyEndLine: lines.length
    });
  });

  blocks.forEach((block) => {
    for (
      let lineIndex = block.startLine + 1;
      lineIndex < lines.length;
      lineIndex += 1
    ) {
      const line = lines[lineIndex];
      if (isBlankOrComment(line)) {
        continue;
      }

      const indent = getIndentSize(line);
      if (indent <= block.indent) {
        block.bodyEndLine = lineIndex;
        break;
      }
    }
  });

  return blocks;
}

function findEditableFunctionBlock(code: string, functionName?: string) {
  const blocks = scanPythonFunctionBlocks(code);
  const normalizedFunctionName = functionName?.trim();

  if (normalizedFunctionName) {
    const matchedBlock = blocks.find(
      (block) => block.name === normalizedFunctionName
    );
    if (matchedBlock) {
      return matchedBlock;
    }
  }

  const topLevelBlocks = blocks.filter((block) => block.indent === 0);
  return (
    topLevelBlocks[topLevelBlocks.length - 1] ??
    blocks[blocks.length - 1] ??
    null
  );
}

/**
 * 从 Python 源码中提取「函数签名」对应的字符区间
 *
 * 冻结范围：
 * - 从 def 关键字开始
 * - 到参数列表结束，或返回值类型声明结束
 * - 不包含函数体
 */
function getPythonFuncSignatureRanges(code: string, functionName?: string) {
  const state = EditorState.create({
    doc: code,
    extensions: [python()]
  });

  const tree = syntaxTree(state);
  const ranges: { from: number; to: number }[] = [];
  const normalizedFunctionName = functionName?.trim();

  tree.iterate({
    enter(node) {
      if (node.name !== 'FunctionDefinition') return;

      // 传入函数名时，只返回目标函数的签名区间；未传时保持原有“返回全部函数”的行为。
      if (
        normalizedFunctionName &&
        getFunctionDefinitionName(code, node) !== normalizedFunctionName
      ) {
        return;
      }

      const from = node.from;
      let to = node.to;

      let bodyStart = -1;
      const cursor = node.node.cursor();

      // 只看当前 FunctionDefinition 的直接子节点。
      // 之前用 iterate 深度遍历时，会把函数体内 class/def 的 TypeDef 也算进来，
      // 导致签名范围被错误扩展到函数体内部。
      if (cursor.firstChild()) {
        do {
          if (cursor.name === 'Body') {
            bodyStart = cursor.from;
            break;
          }
        } while (cursor.nextSibling());
        cursor.parent();
      }

      if (bodyStart !== -1) {
        to = bodyStart;
      }
      // 函数签名通常和“# 只读”注释在同一行，冻结和替换时需要把整行都算进去。
      // 因此这里不只截到 AST 的签名节点末尾，而是扩到当前行行尾。
      to = getLineEndPosition(code, to);

      ranges.push({ from, to });
    }
  });

  if (!ranges.length && normalizedFunctionName) {
    const fallbackBlock = findEditableFunctionBlock(
      code,
      normalizedFunctionName
    );
    if (fallbackBlock) {
      return [
        {
          from: fallbackBlock.from,
          to: fallbackBlock.signatureTo
        }
      ];
    }
  }

  return ranges;
}

/**
 * 解析 Python 源码中每个函数的「最后一条 return 语句」区间
 *
 * 规则：
 * - 仅统计当前函数体内的 return
 * - 遇到嵌套函数时跳过其内部的 return
 */
export function getPythonFuncLastReturnRanges(
  code: string,
  functionName?: string,
  returnCode?: string
) {
  const state = EditorState.create({
    doc: code,
    extensions: [python()]
  });

  const tree = syntaxTree(state);
  const ranges: { from: number; to: number }[] = [];
  const normalizedFunctionName = functionName?.trim();
  const normalizedReturnCode = returnCode?.trim();

  const isValidReturnStatement = (targetReturnCode?: string) => {
    if (!targetReturnCode) {
      return false;
    }

    const verifyState = EditorState.create({
      doc: `def __verify_return__():\n    ${targetReturnCode}`,
      extensions: [python()]
    });
    const verifyTree = syntaxTree(verifyState);
    let hasReturnStatement = false;
    let hasErrorNode = false;

    verifyTree.iterate({
      enter(node) {
        if (node.name === 'ReturnStatement') {
          hasReturnStatement = true;
        }
        if (node.name === '⚠') {
          hasErrorNode = true;
        }
      }
    });

    return hasReturnStatement && !hasErrorNode;
  };

  const findLastReturnByText = (
    fallbackBlock: ReturnType<typeof findEditableFunctionBlock>,
    targetReturnCode?: string
  ) => {
    if (!fallbackBlock) {
      return null;
    }

    const lines = code.split('\n');
    const lineOffsets = getLineStartOffsets(code);
    let lastReturn: { from: number; to: number } | null = null;
    let nestedBlockIndent: number | null = null;

    for (
      let lineIndex = fallbackBlock.bodyStartLine;
      lineIndex < fallbackBlock.bodyEndLine;
      lineIndex += 1
    ) {
      const line = lines[lineIndex];
      const trimmed = line.trim();
      const indent = getIndentSize(line);

      if (isBlankOrComment(line)) {
        continue;
      }

      if (nestedBlockIndent !== null) {
        if (indent > nestedBlockIndent) {
          continue;
        }
        nestedBlockIndent = null;
      }

      if (/^(def|class)\b/.test(trimmed)) {
        nestedBlockIndent = indent;
        continue;
      }

      if (/^return\b/.test(trimmed)) {
        const currentReturn = {
          from: lineOffsets[lineIndex] + line.indexOf('return'),
          to: lineOffsets[lineIndex] + line.length
        };

        if (
          targetReturnCode &&
          line.slice(line.indexOf('return')).trim() === targetReturnCode
        ) {
          return currentReturn;
        }

        lastReturn = currentReturn;
      }
    }

    return lastReturn;
  };

  const shouldFallbackToTextReturn = (range: { from: number; to: number }) => {
    const returnSource = code.slice(range.from, range.to);
    const lines = returnSource.split('\n');

    // AST 在非法 Python 下可能会把“return (”和下一行真正的 return
    // 合并成同一个 ReturnStatement。若后续行再次以 return 开头，说明该区间已被污染，
    // 应回退到文本级最后一行 return。
    return lines.slice(1).some((line) => line.trimStart().startsWith('return'));
  };

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
          lastReturn = {
            from: cur.from,
            // return 语句末尾可能跟着“# 只读”注释，返回整行范围便于冻结与替换。
            to: getLineEndPosition(code, cur.to)
          };
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

      // 传入函数名时，只统计目标函数；未传时保持原有“遍历全部函数”的行为。
      if (
        normalizedFunctionName &&
        getFunctionDefinitionName(code, node) !== normalizedFunctionName
      ) {
        return;
      }

      if (isValidReturnStatement(normalizedReturnCode)) {
        const exactRange = findLastReturnByText(
          findEditableFunctionBlock(code, normalizedFunctionName),
          normalizedReturnCode
        );
        if (exactRange) {
          ranges.push(exactRange);
        }
        return;
      }

      const lastReturn = findLastReturnInFunction(node) as any;
      if (lastReturn) {
        if (
          normalizedReturnCode &&
          code.slice(lastReturn.from, lastReturn.to).trim() !==
            normalizedReturnCode
        ) {
          const fallbackRange = findLastReturnByText(
            findEditableFunctionBlock(code, normalizedFunctionName),
            normalizedReturnCode
          );
          if (fallbackRange) {
            ranges.push(fallbackRange);
            return;
          }
        }

        if (
          !normalizedFunctionName ||
          !shouldFallbackToTextReturn(lastReturn)
        ) {
          ranges.push(lastReturn);
          return;
        }

        const fallbackRange = findLastReturnByText(
          findEditableFunctionBlock(code, normalizedFunctionName),
          normalizedReturnCode
        );
        if (fallbackRange) {
          ranges.push(fallbackRange);
        }
      }
    }
  });

  if (!ranges.length && normalizedFunctionName) {
    if (isValidReturnStatement(normalizedReturnCode)) {
      const exactRange = findLastReturnByText(
        findEditableFunctionBlock(code, normalizedFunctionName),
        normalizedReturnCode
      );
      if (exactRange) {
        return [exactRange];
      }
    }

    const fallbackRange = findLastReturnByText(
      findEditableFunctionBlock(code, normalizedFunctionName),
      normalizedReturnCode
    );
    return fallbackRange ? [fallbackRange] : ranges;
  }

  return ranges;
}

const buildFUnctionSignature = (data: {
  name: string;
  input: OntologyFunctionParam[];
  output: OntologyFunctionParam[];
}) => {
  const { name, input, output } = data;
  const signature = `def ${name}(${input
    ?.map(({ name: p_name, uiTypeAndValue }) => {
      return `${p_name} : ${TYPE_MAP[uiTypeAndValue!.uiType!.split('_')[0]]}`;
    })
    .join(',')})`;
  const returnType = output.length > 0 ? 'dict' : 'None';
  return `${signature} -> ${returnType}:`;
};
export const buildReturnCode = (outputs: OntologyFunctionParam[]) => {
  if (!outputs?.length) return 'return None';
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
  const signatureRanges = getPythonFuncSignatureRanges(code, meta.code);
  const funcLastReturnRanges = getPythonFuncLastReturnRanges(code, meta.code);
  if (!signatureRanges.length || !funcLastReturnRanges.length) {
    return code;
  }
  const { from: s_start, to: s_end } = signatureRanges[0];
  const { from: r_start } = funcLastReturnRanges[0];
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
  // 用最新的 range 重新生成 decoration。参数变更时代码会被整段重写，
  // 这时不能沿用旧 decoration 的位置映射，否则高亮会丢失。
  const buildDecorations = (docLength: number) => {
    const decorations = ranges
      .filter((r) => r.from >= 0 && r.to <= docLength && r.from < r.to)
      .map((r) => frozenMark.range(r.from, r.to));
    return RangeSet.of(decorations, true);
  };

  return StateField.define<RangeSet<Decoration>>({
    create(state) {
      // 初始化时生成冻结高亮
      return buildDecorations(state.doc.length);
    },

    update(deco, tr) {
      if (!tr.docChanged) {
        return deco;
      }

      // 外部回填 content 时，ranges 已经对应“新代码”的坐标，
      // 需要直接按新文档重建 decoration，不能 map 旧位置。
      if (tr.annotation(ExternalChange) || tr.annotation(bypassFrozenRange)) {
        return buildDecorations(tr.newDoc.length);
      }

      // 普通编辑只会发生在非冻结区，直接映射旧 decoration 即可。
      return deco.map(tr.changes);
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
export function getFreezeRanges(data: {
  code: string;
  functionName?: string;
  funcReturn?: string;
}) {
  const { code, functionName, funcReturn } = data;
  const funcSignatureRanges = getPythonFuncSignatureRanges(code, functionName);
  const lastReturnRanges = getPythonFuncLastReturnRanges(
    code,
    functionName,
    funcReturn
  );
  debugger;
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
      const { name, type, inputType, value, idx, uiType, id } = c;
      const base: OntologyFunctionParam = {
        name,
        type,
        idx,
        id: id || 0
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
    const { name, code, uiTypeAndValue, id } = item;
    const [type, ui] = uiTypeAndValue!.uiType!.split('_');
    return {
      name,
      code: name,
      type,
      inputType: InputType.Input,
      uiType: ui,
      idx: idx + 1,
      id: id || 0
    };
  });
  const outputParams = (output || []).map((item, idx) => {
    const { name, code, type, id } = item;
    return {
      name,
      code: name,
      id: id || 0,
      type,
      inputType: InputType.Output,
      idx: idx + 1
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
    return (
      params?.map((param) => {
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
          if (dataType.includes('Object')) {
            if (
              uiTypeAndValue.paramValue &&
              uiTypeAndValue.paramValue.objectTypeData
            ) {
              const { icon, name } = uiTypeAndValue.paramValue.objectTypeData;
              base.obj_data = { icon, name };
            }
          }
        }
        return base;
      }) || []
    );
  });
  res.list_data.push(testData);
  return res;
};

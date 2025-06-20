import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveEffectVarConfirm from '../_base/components/remove-effect-var-confirm';
import useConfig from './use-config';
import type {
  CodeNodeType,
  SegmentationOption,
  TextProcessingRules
} from './types';
import { CodeLanguage } from './types';
import { extractFunctionParams, extractReturnType } from './text-parser';
import VarList from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/var-list';
import OutputVarList from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/output-var-list';
import AddButton from '@/pages/workflowConfig/components/button/add-button';
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field';
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split';
import CodeEditor from '@/pages/workflowConfig/workflow/nodes/_base/components/editor/code-editor';
import TypeSelector from '@/pages/workflowConfig/workflow/nodes/_base/components/selector';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import BeforeRunForm from '@/pages/workflowConfig/workflow/nodes/_base/components/before-run-form';
import ResultPanel from '@/pages/workflowConfig/workflow/run/result-panel';
import {
  Table,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox
} from '@arco-design/web-react';
import { RiAddLine } from '@remixicon/react';
import { cloneDeep } from 'lodash-es';
import { v4 as uuid4 } from 'uuid';
import './text.scss';
const i18nPrefix = 'workflow.nodes.code';

const codeLanguages = [
  {
    label: 'Python3',
    value: CodeLanguage.python3
  },
  {
    label: 'JavaScript',
    value: CodeLanguage.javascript
  }
];
// 分段方式选项
const segmentationOptions: any = [
  { value: 0, label: '按字符'  },
  { value: 1, label: '按句子'  },
  { value: 2, label: '按段落'}
];
const Panel: FC<NodePanelProps<CodeNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;

  const [fileNum, setFileNum] = useState(0);
  const [type, setType] = useState('checkbox');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 定义分段最大长度状态变量
  const [maxSegmentLength, setMaxSegmentLength] = useState<number | null>(null);
  const { t } = useTranslation('plugin__console-plugin-appforge');

  const {
    readOnly,
    inputs,
    outputKeyOrders,
    handleCodeAndVarsChange,
    handleVarListChange,
    handleAddVariable,
    handleRemoveVariable,
    handleCodeChange,
    handleCodeLanguageChange,
    handleVarsChange,
    handleAddOutputVariable,
    filterVar,
    isShowRemoveVarConfirm,
    hideRemoveVarConfirm,
    onRemoveVarConfirm,
    // single run
    isShowSingleRun,
    hideSingleRun,
    runningStatus,
    handleRun,
    handleStop,
    runResult,
    varInputs,
    inputVarValues,
    setInputVarValues
  } = useConfig(id, data);

  const handleGeneratedCode = (value: string) => {
    const params = extractFunctionParams(value, inputs.code_language);
    const codeNewInput = params.map((p) => {
      return {
        variable: p,
        value_selector: []
      };
    });
    const returnTypes = extractReturnType(value, inputs.code_language);
    handleCodeAndVarsChange(value, codeNewInput, returnTypes);
  };

  const defaultData = [...new Array(5)].map((_, index) => {
    return {
      key: index,
      name: 'Jane Doe ' + index,
      salary: 23000,
      email: 'jane.doe@example.com',
      gender: index % 2 > 0 ? 'male' : 'female',
      age: 20 + index
    };
  });

  // 初始化文本处理规则状态
  const [textProcessingRules, setTextProcessingRules] =
    useState<TextProcessingRules>({
      replaceExpressionsAndSymbols: false,
      removeValidUrlsAndEmails: false
    });

  // 处理复选框变化的函数
  const handleCheckboxChange = (
    field: keyof TextProcessingRules,
    checked: boolean
  ) => {
    setTextProcessingRules((prev) => ({
      ...prev,
      [field]: checked
    }));
  };
  return (
    <div className="wk-node-panel-content code-panel-content mt-[16px]">
      <Form
        form={form}
        disabled={readOnly}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          vars: cloneDeep(inputs.variables || [])
        }}
        layout="inline"
        onValuesChange={(_, v) => {
          // console.log('valuechange', _, v);
          if (v.vars.some((v) => !v || !v.type || !v.id)) {
            form.setFieldValue(
              'vars',
              v.vars.map(
                (v) =>
                  v ?? {
                    variable: '',
                    label: '',
                    required: false,
                    type: 'string',
                    id: uuid4()
                  }
              )
            );
          }
          // window.setTimeout(async() => {
          //   try {
          //     await form.validate()
          //   } catch{}
          // })
        }}
      >
        <FormItem
          layout="inline"
          label="选择文件："
          field="fileList"
          labelAlign="left"
          required
        >
          <div>已选择{fileNum}个文件</div>
        </FormItem>
        <div>
          <Table
            columns={[
              {
                title: '文件名',
                dataIndex: 'name'
              },
              {
                title: '类型',
                dataIndex: 'salary',
                filters: [
                  {
                    text: 'London',
                    value: 'London'
                  },
                  {
                    text: 'Paris',
                    value: 'Paris'
                  }
                ]
              },
              {
                title: '文件大小',
                dataIndex: 'gender'
              },
              {
                title: 'Age',
                dataIndex: 'age'
              },
              {
                title: '载入开始时间',
                dataIndex: 'email',
                sorter: (a, b) => a.name.length - b.name.length
              }
            ]}
            pagePosition={null}
            rowSelection={{
              selectedRowKeys,
              onChange: (selectedRowKeys, selectedRows) => {
                console.log('onChange:', selectedRowKeys, selectedRows);
                setSelectedRowKeys(selectedRowKeys);
                setFileNum(selectedRowKeys.length);
              },
              onSelect: (selected, record, selectedRows) => {
                console.log('onSelect:', selected, record, selectedRows);
              }
            }}
            data={defaultData}
          />
        </div>
        <FormItem
          layout="vertical"
          label="分段方式："
          field="fileList"
          labelAlign="left"
          required
        >
          <Select
            placeholder="Select city"
            style={{ width: 154 }}
            onChange={(value) => {
              console.log(value);
            }}
            defaultValue={0}
          >
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <div>选择切分文本的方式，目前支持按照字符、句子和段落。</div>
        </FormItem>
        <FormItem
          layout="vertical"
          label="分段最大长度："
          field="fileList"
          labelAlign="left"
          required
        >
          <InputNumber
            placeholder="Please enter"
            min={0}
            max={1200}
            style={{ width: 160, margin: '10px 24px 10px 0' }}
            onChange={(value) => {
              setMaxSegmentLength(value);
            }}
          />
          <div>800-1200</div>
        </FormItem>
        <FormItem
          layout="vertical"
          label="文本处理规则："
          field="fileList"
          labelAlign="left"
          required
        >
          <Checkbox
            checked={textProcessingRules.replaceExpressionsAndSymbols}
            onChange={(checked) =>
              handleCheckboxChange('replaceExpressionsAndSymbols', checked)
            }
          >
            替换表达和特殊符号
          </Checkbox>
          <Checkbox
            checked={textProcessingRules.removeValidUrlsAndEmails}
            onChange={(checked) =>
              handleCheckboxChange('removeValidUrlsAndEmails', checked)
            }
          >
            删除有效URL和电子邮箱地址
          </Checkbox>
          <div>
            选择是否需要替换掉标点和一些特殊字符，以及是否删除有效URL和电子邮箱地址。
          </div>
        </FormItem>
        <FormItem
          layout="vertical"
          label="OCR模型："
          field="fileList"
          labelAlign="left"
          required
        >
          <Select
            placeholder="Select city"
            style={{ width: 154 }}
            onChange={(value) => {
              console.log(value);
            }}
            defaultValue={0}
          >
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <div>
            当遇到文本文件（例如：ppt，pdf，doc）中的图片时采用的ocr模型名称。
          </div>
        </FormItem>
        <FormItem
          layout="vertical"
          label="图片描述模型："
          field="fileList"
          labelAlign="left"
          required
        >
          <Select
            placeholder="Select city"
            style={{ width: 154 }}
            onChange={(value) => {
              console.log(value);
            }}
            defaultValue={0}
          >
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <div>用于指定对文本文件中的图片进行caption 时使用的模型。</div>
        </FormItem>
        <FormItem
          layout="vertical"
          label="文本嵌入模型："
          field="fileList"
          labelAlign="left"
          required
        >
          <Select
            placeholder="Select city"
            style={{ width: 154 }}
            onChange={(value) => {
              console.log(value);
            }}
            defaultValue={0}
          >
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <div>指定对文本内容进行embedding 的模型。</div>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);

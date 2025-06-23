import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
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
import './data-enhancement.scss';
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
  { value: 1, label: '按字符' },
  { value: 2, label: '按句子' },
  { value: 3, label: '按段落' }
];
const Panel: FC<NodePanelProps<CodeNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;
  const TextArea = Input.TextArea;

  const [fileNum, setFileNum] = useState(0);
  const [type, setType] = useState('checkbox');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [newTableData, setNewTableData] = useState([]);
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

  const [customPromptChecked, setCustomPromptChecked] = useState(false);

  useEffect(() => {
    const allValues = form.getFieldsValue();
    console.log('所有字段的值:', allValues);
  }, [form]);

  const onValuesChange = (changeValue: any, values: any) => {
    console.log('1111111111:', values, changeValue);
  };
  return (
    <div className="wk-node-panel-content code-panel-content data-enhancement-panel mt-[16px]">
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          vars: cloneDeep(inputs.variables || [])
        }}
        layout="inline"
        onChange={onValuesChange}
      >
        <FormItem
          layout="vertical"
          label="场景选择:"
          field="sceneSelection"
          labelAlign="left"
          required
        >
          <Select
            placeholder="请选择场景"
            style={{ width: '100%' }}
            onChange={(value) => {
              console.log(value);
            }}
          >
            <Option key={1} value={1}>
              {1}
            </Option>
          </Select>
        </FormItem>
        <div className="wk-node-panel-content-tip">
          常见的针对SFT的模型微调场景生成数据集。
        </div>
        <div className="content-box">
          <FormItem label="指令生成依赖样本数:" field="">
            <Input placeholder="请输入指令" />
          </FormItem>
          <div className="content-tips-text">
            该参数是指从进行生成前的数据集中选择进行生成的记录条数。它会作为context
            部分，增加到prompt 中去。
          </div>
          <FormItem label="过滤相似度阈值:" field="">
            <Input placeholder="请输入阈值" />
          </FormItem>
          <div className="content-tips-text">
            这里通过Rouge-L
            分数来计算生成的训练数据集的相似度，超过这个阀值就认为两条生成数据是相同的，只保留其中之一。
          </div>
          <FormItem label="生成样本数:" field="">
            <Input placeholder="请输入样本数" />
          </FormItem>
          <div className="content-tips-text">指定生成的数据集的条数。</div>
        </div>
        <FormItem
          layout="vertical"
          field="enhancementTextArea"
          label="数据示例（JSON格式）"
        >
          <TextArea
            placeholder="请在这里输入期望的数据集的示例数据（JSON格式）"
            style={{ minHeight: 64, minWidth: 350 }}
          />
        </FormItem>
        <FormItem field="enhancementTextArea" label={null}>
          <Checkbox
            checked={customPromptChecked} // 绑定选中状态
            onChange={(checked) => setCustomPromptChecked(checked)} // 处理选中状态变化
          >
            自定义提示词
          </Checkbox>
        </FormItem>
        <FormItem
          layout="vertical"
          label="模型选择:"
          field="modelSelection"
          labelAlign="left"
          required
        >
          <Select
            placeholder="请选择模型"
            style={{ width: '100%' }}
            onChange={(value) => {
              console.log(value);
            }}
          >
            <Option key={1} value={1}>
              {1}
            </Option>
          </Select>
        </FormItem>
        <FormItem layout="vertical" field="nodeDescription" label="说明">
          <TextArea
            placeholder="请输入对该节点的描述"
            style={{ minHeight: 64, minWidth: 350 }}
          />
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);

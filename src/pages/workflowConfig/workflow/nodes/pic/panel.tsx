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
  { value: 1, label: '按字符'  },
  { value: 2, label: '按句子'  },
  { value: 3, label: '按段落'}
];
const Panel: FC<NodePanelProps<CodeNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const Option = Select.Option;

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
  //
  // 生成 1970 年 1 月 1 日到当前时间之间的随机日期
  function getRandomDateOverall(): Date {
    // 生成 1970 年 1 月 1 日到当前时间之间的随机时间戳
    const randomTime = Math.random() * Date.now();
    return new Date(randomTime);
  }

  const randomDateOverall = getRandomDateOverall();
  // 格式化日期为 YYYY-MM-DD 格式
  const formattedDateOverall = `${randomDateOverall.getFullYear()}-${String(randomDateOverall.getMonth() + 1).padStart(2, '0')}-${String(randomDateOverall.getDate()).padStart(2, '0')} ${String(randomDateOverall.getHours()).padStart(2, '0')}:${String(randomDateOverall.getMinutes()).padStart(2, '0')}:${String(randomDateOverall.getSeconds()).padStart(2, '0')}`;
  console.log(formattedDateOverall);
  const fileType = ['pdf', 'excel', 'word', 'txt', 'markdown'];
  const defaultData = [...new Array(5)].map((_, index) => {
    return {
      key: index,
      name: 'Jane Doe ' + index,
      size: Math.floor(Math.random() * 100),
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
  useEffect(() => {
    const allValues = form.getFieldsValue();
    console.log('所有字段的值:', allValues);
  }, [form]);

  const onValuesChange = (changeValue: any, values: any) => {
    console.log('1111111111:', values, changeValue);
  };
  return (
    <div className="wk-node-panel-content code-panel-content mt-[16px]">
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
          <Table
            style={{
              width: '100%'
            }}
            columns={[
              {
                title: '文件名',
                dataIndex: 'name'
              },
              {
                title: '文件大小',
                dataIndex: 'size',
                sorter: (a, b) => a.name.length - b.name.length
              }
            ]}
            pagination={false}
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
        <FormItem
          layout="vertical"
          label="图片描述模型:"
          field="imgDescModel"
          labelAlign="left"
          required
        >
          <Select
            placeholder="Select city"
            style={{ width: '100%' }}
            onChange={(value) => {
              console.log(value);
            }}
            defaultValue={1}
          >
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <div className="wk-node-panel-content-tip">
            选择切分文本的方式，目前支持按照字符、句子和段落。
          </div>
        </FormItem>
        <FormItem
          layout="vertical"
          label="图片嵌入模型:"
          field="imgEmbedModel"
          labelAlign="left"
          required
        >
          <Select
            placeholder="Select city"
            style={{ width: '100%' }}
            onChange={(value) => {
              console.log(value);
            }}
            defaultValue={1}
          >
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <div className="wk-node-panel-content-tip">
            选择切分文本的方式，目前支持按照字符、句子和段落。
          </div>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);

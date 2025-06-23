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
const FormItem = Form.Item;
const Option = Select.Option;
const test = '1';

test = '5';

// 分段方式选项
const segmentationOptions: any = [
  { value: 1, label: '按字符' },
  { value: 2, label: '按句子' },
  { value: 3, label: '按段落' }
];

const Panel: FC<NodePanelProps<CodeNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();

  const [fileNum, setFileNum] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const { t } = useTranslation('plugin__console-plugin-appforge');

  const { readOnly, inputs, handleFilesChange, handleFiledsChange } = useConfig(
    id,
    data
  );

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name'
    },
    {
      title: '类型',
      dataIndex: 'type',
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
      dataIndex: 'size'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      sorter: (a, b) => a.name.length - b.name.length
    }
  ];

  const defaultData = [...new Array(5)].map((_, index) => {
    return {
      key: index,
      name: 'Jane Doe ' + index,
      type: 'docx',
      size: '3.8M',
      created_at: '2025-05-05 05:05:05'
    };
  });

  return (
    <div className="wk-node-panel-content text-parser-panel-content mt-[16px]">
      <Form
        form={form}
        disabled={readOnly}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          ...data
        }}
        layout="vertical"
        onValuesChange={(_, v) => {
          // console.log('valuechange', _, v);
        }}
      >
        <FormItem
          label={`选择文件：已选择${fileNum}个文件`}
          field="files"
          labelAlign="left"
          required
        >
          <Table
            columns={columns}
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
        </FormItem>
        <Split className="my-[16px]" />
        <FormItem
          label="分段方式："
          field="text_slice_rule"
          labelAlign="left"
          required
          extra="选择切分文本的方式，目前支持按照字符、句子和段落。"
        >
          <Select>
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="分段最大长度："
          field="slice_max_size"
          labelAlign="left"
          required
          extra="取值范围：800-1200"
        >
          <InputNumber min={800} max={1200} />
        </FormItem>
        <FormItem
          label="文本处理规则："
          field="text_proc_rules"
          labelAlign="left"
          extra="选择是否需要替换掉标点和一些特殊字符，以及是否删除有效URL和电子邮箱地址。"
        >
          <Checkbox.Group
            options={[
              { label: '替换表达和特殊符号', value: 0 },
              { label: '删除有效URL和电子邮箱地址', value: 1 }
            ]}
          />
        </FormItem>
        <FormItem
          label="多模态模型："
          field="multi_model"
          labelAlign="left"
          extra="当遇到文本文件（例如：ppt，pdf，doc）中的图片时采用的ocr模型名称。"
        >
          <Select>
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="图片描述模型："
          field="pic_model"
          labelAlign="left"
          extra="用于指定对文本文件中的图片进行caption 时使用的模型。"
        >
          <Select>
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="文本嵌入模型："
          field="text_emb_model"
          labelAlign="left"
          extra="指定对文本内容进行embedding 的模型。"
        >
          <Select>
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);

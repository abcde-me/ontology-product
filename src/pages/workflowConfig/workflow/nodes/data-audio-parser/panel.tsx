import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveEffectVarConfirm from '../_base/components/remove-effect-var-confirm';
import useConfig from './use-config';
import type {
  AudioParserNodeType,
} from './types';
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

const i18nPrefix = 'workflow.nodes.code';
const FormItem = Form.Item;
const Option = Select.Option;

// 分段方式选项
const segmentationOptions: any = [
  { value: 1, label: '按字符'  },
  { value: 2, label: '按句子'  },
  { value: 3, label: '按段落'}
];

const Panel: FC<NodePanelProps<AudioParserNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();
  const activityMode = Form.useWatch('activity_mode', form);

  const [fileNum, setFileNum] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const { t } = useTranslation('plugin__console-plugin-appforge');

  const {
    readOnly,
    inputs,
    handleFilesChange,
    handleFiledsChange
  } = useConfig(id, data);

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
  ]

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
    <div className="wk-node-panel-content audio-parser-panel-content mt-[16px]">
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
          console.log('valuechange', _, v);
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
        <Split className='my-[16px]'/>
        <FormItem
          label="音频预处理："
          field="audio_pret"
          labelAlign="left"
          extra="用于指定对文本文件中的图片进行caption 时使用的模型。"
        >
          <Checkbox.Group
            options={[{ label: '降噪', value: 1 }, { label: '语音增强', value: 2 }]}
          />
        </FormItem>
        <FormItem label="语音活动检测（VAD）与切片设置：" field='vad_options'>
          <Checkbox.Group
            options={[{ label: '启用语音活体检测', value: 'vad' }, { label: '启用多说话人识别', value: 'conv' }]}
          />
        </FormItem>
        <FormItem
          label="切片模式："
          field="activity_mode"
          labelAlign="left"
        >
          <Select>
            <Option value="自动">自动</Option>
            <Option value="定时长">定时长</Option>
          </Select>
        </FormItem>
        {activityMode === '定时长' && <FormItem
            label="时长："
            field="activity_mode_num"
            labelAlign="left"
            required
          >
            <InputNumber min={0} />
          </FormItem>
        }
        <FormItem
          label="解析模型："
          field="audio_model"
          labelAlign="left"
          extra="指定对图片caption进行embedding 的模型。"
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
          label="后处理与校验："
          field="after_proc"
          labelAlign="left"
        >
          <Checkbox.Group
            options={[{ label: '使用大模型进行错别字校验', value: 0 }, { label: '文字标准化', value: 1 }]}
          />
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);

import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveEffectVarConfirm from '../_base/components/remove-effect-var-confirm';
import useConfig from './use-config';
import type { ImageParserNodeType } from './types';
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
import FileList from '../data-text-parser/file-list';

const i18nPrefix = 'workflow.nodes.code';
const FormItem = Form.Item;
const Option = Select.Option;

// 分段方式选项
const segmentationOptions: any = [
  { value: 1, label: '按字符' },
  { value: 2, label: '按句子' },
  { value: 3, label: '按段落' }
];

const Panel: FC<NodePanelProps<ImageParserNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();

  const { t } = useTranslation('plugin__console-plugin-appforge');

  const { readOnly, inputs, handleFilesChange, handleFiledsChange } = useConfig(
    id,
    data
  );

  return (
    <div className="wk-node-panel-content image-parser-panel-content mt-[16px]">
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
          label={`选择文件：已选择${inputs.selected_files_num}个文件`}
          field="files"
          labelAlign="left"
          required
        >
          <FileList
            catetoryId={2}
            files={inputs.files}
            selectedFilesNum={inputs.selected_files_num}
            handleFilesChange={handleFilesChange}
          />
        </FormItem>
        <Split className="my-[16px]" />
        <FormItem
          label="图片描述模型："
          field="pic_model_id"
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
          label="图片嵌入模型："
          field="pic_embc_model_id"
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
      </Form>
    </div>
  );
};

export default React.memo(Panel);

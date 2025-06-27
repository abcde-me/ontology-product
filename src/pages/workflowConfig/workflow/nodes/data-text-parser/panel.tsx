import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useConfig from './use-config';
import type { TextParserNodeType } from './types';
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split';
import { type NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import { Form, Select, InputNumber, Checkbox } from '@arco-design/web-react';
import FileList from './file-list';

const i18nPrefix = 'workflow.nodes.code';
const FormItem = Form.Item;
const Option = Select.Option;

// 分段方式选项
const segmentationOptions: any = [
  { value: 1, label: '按字符' },
  { value: 2, label: '按段落' },
  { value: 3, label: '按句子' }
];

const Panel: FC<NodePanelProps<TextParserNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();

  const { t } = useTranslation('plugin__console-plugin-appforge');

  const { readOnly, inputs, handleFilesChange, handleFiledsChange } = useConfig(
    id,
    data
  );

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
          label={`选择文件：已选择${inputs.selected_files_num}个文件`}
          field="files"
          labelAlign="left"
          required
        >
          <FileList
            catetoryId={1}
            files={inputs.files}
            selectedFilesNum={inputs.selected_files_num}
            handleFilesChange={handleFilesChange}
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
              { label: '替换表达和特殊符号', value: 1 },
              { label: '删除有效URL和电子邮箱地址', value: 2 }
            ]}
          />
        </FormItem>
        <FormItem
          label="多模态模型："
          field="text_ocr_model_id"
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
          field="text_pic_model_id"
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
          field="text_emb_model_id"
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

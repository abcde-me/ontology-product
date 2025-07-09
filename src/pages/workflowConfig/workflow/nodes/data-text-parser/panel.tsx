import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useConfig from './use-config';
import type { TextParserNodeType } from './types';
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split';
import { type NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import { Form, Select, InputNumber, Checkbox } from '@arco-design/web-react';
import FileList from './file-list';
import { getModelList } from '@/api/modelV2';
import { FileOptions } from '../start/default';
import { useUnmountedRef } from 'ahooks';

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
  const [ocrModels, setOcrModels] = useState<Record<string, any>[]>([]);
  const [picModels, setPicModels] = useState<Record<string, any>[]>([]);
  const [textEmbModels, setTextEmbModels] = useState<Record<string, any>[]>([]);
  const unmountedRef = useUnmountedRef();
  const textSlice = Form.useWatch('text_slice_rule', form);

  const { readOnly, inputs, handleFilesChange, handleFiledsChange } = useConfig(
    id,
    data
  );

  useEffect(() => {
    getModelList().then((res: any) => {
      if (unmountedRef.current) return;
      const ocrList =
        res.data.find((d) => d.type === 'text_ocr_model')?.model_data || [];
      const picList =
        res.data.find((d) => d.type === 'text_pic_model')?.model_data || [];
      const textList =
        res.data.find((d) => d.type === 'text_emb_model')?.model_data || [];

      setOcrModels(ocrList);
      setPicModels(picList);
      setTextEmbModels(textList);

      const defaultOcrId = ocrList[0]?.id || '';
      const defaultPicId = picList[0]?.id || '';
      const defaultTextId = textList[0]?.id || '';

      const fields = {} as Record<string, any>;
      if (!inputs.text_ocr_model_id) {
        fields.text_ocr_model_id = defaultOcrId;
      }
      if (!inputs.text_pic_model_id) {
        fields.text_pic_model_id = defaultPicId;
      }
      if (!inputs.text_ocr_model_id) {
        fields.text_emb_model_id = defaultTextId;
      }
      if (Object.keys(fields).length) {
        form.setFieldsValue(fields);
      }
    });
  }, []);

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
        onValuesChange={(_, v: any) => {
          console.log('text parser valuechange', _, v);
          handleFiledsChange(v);
        }}
      >
        <FormItem
          label={`选择文件：已选择${inputs.selected_files_num}个文件`}
          field="files"
          labelAlign="left"
          extra="系统限制，只展示文件大小大于0且小于2G的文件"
          required
        >
          <FileList
            catetoryId={1}
            readOnly={readOnly}
            fileTypes={FileOptions.doc}
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
          hidden={textSlice !== 1}
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
        {/* <FormItem
          label="多模态模型："
          field="text_ocr_model_id"
          labelAlign="left"
          extra="当遇到文本文件（例如：ppt，pdf，doc）中的图片时采用的ocr模型名称。"
        >
          <Select>
            {ocrModels.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.type}
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
            {picModels.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.type}
              </Option>
            ))}
          </Select>
        </FormItem> */}
        <FormItem
          label="文本嵌入模型："
          field="text_emb_model_id"
          labelAlign="left"
          extra="指定对文本内容进行embedding 的模型。"
        >
          <Select>
            {textEmbModels.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.type}
              </Option>
            ))}
          </Select>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);

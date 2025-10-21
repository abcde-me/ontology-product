import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import useConfig from './use-config';
import type { VideoParserNodeType } from './types';
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split';
import type { NodePanelProps } from '@/pages/workflowConfig/workflow/types';
import {
  Form,
  Select,
  InputNumber,
  Checkbox
} from '@arco-design/web-react';
import FileList from '../data-text-parser/file-list';
import { getModelList } from '@/api/modelV2';
import { FileOptions } from '../start/default';
import { useUnmountedRef } from 'ahooks';

const FormItem = Form.Item;
const Option = Select.Option;

const Panel: FC<NodePanelProps<VideoParserNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();
  const activityMode = Form.useWatch('activity_mode', form);

  const [audioModels, setAudioModels] = useState<Record<string, any>[]>([]);
  const unmountedRef = useUnmountedRef();

  const { readOnly, inputs, handleFilesChange, handleFieldsChange } = useConfig(
    id,
    data
  );

  useEffect(() => {
    getModelList().then((res: any) => {
      if (unmountedRef.current) return;
      const audioList =
        res.data.find((d) => d.type === 'audio_model')?.model_data || [];

      setAudioModels(audioList);

      const defaultAudioId = audioList[0]?.id || '';

      if (!inputs.audio_model_id) {
        form.setFieldValue('audio_model_id', defaultAudioId);
      }
    });
  }, []);

  return (
    <div className="wk-node-panel-content video-parser-panel-content mt-[16px]">
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
          console.log('video parser valuechange', _, v);
          handleFieldsChange(v);
        }}
      >
        <FormItem
          label={`选择文件：已选择${inputs.selected_files_num < 0 ? 0 : inputs.selected_files_num}个文件`}
          field="files"
          labelAlign="left"
          extra="系统限制，只展示文件大小大于0且小于2G的文件"
          required
        >
          <FileList
            catetoryId={4}
            readOnly={readOnly}
            fileTypes={FileOptions.video}
            files={inputs.files}
            selectedFilesNum={inputs.selected_files_num}
            handleFilesChange={handleFilesChange}
          />
        </FormItem>
        <Split className="mb-[16px]" />
        <FormItem
          label="字幕与音频校验："
          field="audio_options"
          labelAlign="left"
        >
          <Checkbox.Group
            options={[
              { label: '支持多音轨解析', value: 'orbit', disabled: true },
              { label: '开启降噪处理', value: 'denoise' }
            ]}
          />
        </FormItem>
        <FormItem label="语音活动检测（VAD）与切片设置：" field="vad_options">
          <Checkbox.Group
            options={[
              { label: '启用语音活体检测', value: 'vad', disabled: true },
              { label: '启用多说话人识别', value: 'conv' }
            ]}
          />
        </FormItem>
        <FormItem label="切片模式：" field="activity_mode" labelAlign="left">
          <Select>
            <Option value={1}>自动</Option>
            <Option value={2}>定时长</Option>
          </Select>
        </FormItem>
        {activityMode === 2 && (
          <FormItem
            label="时长（秒）："
            field="activity_mode_num"
            labelAlign="left"
            required
          >
            <InputNumber min={0} />
          </FormItem>
        )}
        <FormItem
          label="音频解析模型："
          field="audio_model_id"
          labelAlign="left"
          extra="指定音频解析的模型。系统仅支持对于普通话和英语信息进行解析，对于各种中国方言和其他外语暂时不支持。"
        >
          <Select>
            {audioModels.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.type}
              </Option>
            ))}
          </Select>
        </FormItem>
        {/* <FormItem label="后处理与校验：" field="after_proc" labelAlign="left">
          <Checkbox.Group
            options={[
              { label: '使用大模型进行错别字校验', value: 1 },
              { label: '文字标准化', value: 2 }
            ]}
          />
        </FormItem> */}
      </Form>
    </div>
  );
};

export default React.memo(Panel);

import { FC, useEffect, useRef, useState } from 'react';
import React from 'react';
import produce from 'immer';
import { useTranslation } from 'react-i18next';
import useConfig from './use-config';
import type { StartNodeType } from './types';
import {
  BlockEnum,
  type InputVar,
  type NodePanelProps
} from '@/pages/workflowConfig/workflow/types';
import { Form, Input, Select, Checkbox, Switch } from '@arco-design/web-react';
import { v4 as uuid4 } from 'uuid';
import { cloneDeep, debounce } from 'lodash-es';
import PdfIcon from '@/assets/file/pdf-icon.svg';
import ImageIcon from '@/assets/file/image-icon.svg';
import AudioIcon from '@/assets/file/audio-icon.svg';
import VideoIcon from '@/assets/file/video-icon.svg';
import StartNodeDefault, { FileOptions } from './default';
import { useNodes } from 'reactflow';
import { useNodeDataUpdate } from '@/pages/workflowConfig/workflow/hooks';
import { getCatalogList } from '@/api/dataCatalog';
import { getLoadTaskFiles } from '@/api/loadApi';

const FormItem = Form.Item;
const i18nPrefix = 'workflow.nodes.start';

const Panel: FC<NodePanelProps<StartNodeType>> = ({ id, data }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const [srcDirs, setSrcDirs] = useState<Array<Record<string, any>>>([]);
  const [form] = Form.useForm();
  const nodes = useNodes();
  const { handleNodeDataUpdateWithSyncDraft } = useNodeDataUpdate();

  const docParams = Form.useWatch('data_category[0]', form);
  const imageParams = Form.useWatch('data_category[1]', form);
  const audioParams = Form.useWatch('data_category[2]', form);
  const videoParams = Form.useWatch('data_category[3]', form);

  const { readOnly, inputs, updateInputs } = useConfig(id, data);

  const handleChanged = (values: any) => {
    const name = srcDirs.find((s) => s.id === values.source_path)?.name;
    updateInputs({ ...values, source_path_name: name });
  };

  const doFileConfigChange = (nodeType: BlockEnum, config: any) => {
    const targetNodes = nodes.filter(
      (node: any) => node.data.type === nodeType
    );
    if (config.enabled && config.format.length) {
      const sourcePath = form.getFieldValue('source_path');
      const formats = config.format
        .join('/')
        .split('/')
        .map((f) => f.toLowerCase());
      console.log('sourcePath', sourcePath, formats);
      getLoadTaskFiles({
        data_path_id: sourcePath,
        file_type: formats,
        page_size: 1,
        page: 1
      }).then((res: any) => {
        targetNodes.forEach((n: any) => {
          handleNodeDataUpdateWithSyncDraft({
            id: n.id,
            data: {
              ...n.data,
              selected_files_num: res.total,
              files: []
            }
          });
        });
      });
    } else {
      targetNodes.forEach((n: any) => {
        handleNodeDataUpdateWithSyncDraft({
          id: n.id,
          data: {
            ...n.data,
            selected_files_num: 0,
            files: []
          }
        });
      });
    }
  };

  const handlePathChange = () => {
    handleDocChange();
    handleImageChange();
    handleAudioChange();
    handleVideoChange();
  };
  const handleDocChange = () => {
    const docConfig = form.getFieldValue('data_category[0]');
    doFileConfigChange(BlockEnum.Text, docConfig);
  };
  const handleImageChange = () => {
    const imageConfig = form.getFieldValue('data_category[1]');
    doFileConfigChange(BlockEnum.Pic, imageConfig);
  };
  const handleAudioChange = () => {
    const audioConfig = form.getFieldValue('data_category[2]');
    doFileConfigChange(BlockEnum.Audio, audioConfig);
  };
  const handleVideoChange = () => {
    const videoConfig = form.getFieldValue('data_category[3]');
    doFileConfigChange(BlockEnum.Video, videoConfig);
  };

  useEffect(() => {
    getCatalogList({ root_type: 1 }).then((res) => {
      const dirs: Record<string, any>[] = [];
      res.data.src.forEach((catalog) => {
        dirs.push(...catalog.children.volume);
      });
      setSrcDirs(dirs);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="wk-node-panel-content start-panel-content mt-[24px]">
      <Form
        form={form}
        disabled={readOnly}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={cloneDeep(inputs)}
        layout="vertical"
        onChange={(_, v) => {
          // form.validate().catch(() => {})
          console.log('valuechange', _, v);
          handleChanged(v);
        }}
      >
        <FormItem
          label="源数据目录"
          field="source_path"
          rules={[{ required: true, message: '源数据目录必须选择' }]}
          extra="选择工作流需处理数据的源数据目录，目录变更时将会同步下游节点更新。"
        >
          <Select placeholder="请选择源数据目录" onChange={handlePathChange}>
            {srcDirs.map((s) => (
              <Select.Option value={s.id} key={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="文件类型"
          required
          rules={[
            {
              validator(v, cb) {
                if (
                  (docParams.enabled && docParams.types.length) ||
                  (imageParams.enabled && imageParams.types.length) ||
                  (audioParams.enabled && audioParams.types.length) ||
                  (videoParams.enabled && videoParams.types.length)
                ) {
                  return cb();
                }
                return cb('请至少选择一种文件类型');
              }
            }
          ]}
        >
          <div className="flex flex-col gap-y-[12px] rounded-[12px] border-[1px] border-[#CBD5E1] p-[16px]">
            <div className="flex h-[22px] items-center gap-x-[8px]">
              <FormItem
                field="data_category[0].enabled"
                noStyle
                triggerPropName="checked"
              >
                <Switch onChange={handleDocChange} />
              </FormItem>
              <PdfIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">文档</span>
            </div>
            <FormItem
              field="data_category[0].format"
              noStyle
              disabled={!docParams?.enabled}
            >
              <Checkbox.Group
                options={FileOptions.doc}
                onChange={handleDocChange}
              />
            </FormItem>
          </div>
          <div className="mt-[12px] flex flex-col gap-y-[12px] rounded-[12px] border-[1px] border-[#CBD5E1] p-[16px]">
            <div className="flex h-[22px] items-center gap-x-[8px]">
              <FormItem
                field="data_category[1].enabled"
                noStyle
                triggerPropName="checked"
              >
                <Switch onChange={handleImageChange} />
              </FormItem>
              <ImageIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">图片</span>
            </div>
            <FormItem
              field="data_category[1].format"
              noStyle
              disabled={!imageParams?.enabled}
            >
              <Checkbox.Group
                options={FileOptions.image}
                onChange={handleImageChange}
              />
            </FormItem>
          </div>
          <div className="mt-[12px] flex flex-col gap-y-[12px] rounded-[12px] border-[1px] border-[#CBD5E1] p-[16px]">
            <div className="flex h-[22px] items-center gap-x-[8px]">
              <FormItem
                field="data_category[2].enabled"
                noStyle
                triggerPropName="checked"
              >
                <Switch onChange={handleAudioChange} />
              </FormItem>
              <AudioIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">音频</span>
            </div>
            <FormItem
              field="data_category[2].format"
              noStyle
              disabled={!audioParams?.enabled}
            >
              <Checkbox.Group
                options={FileOptions.audio}
                onChange={handleAudioChange}
              />
            </FormItem>
          </div>
          <div className="mt-[12px] flex flex-col gap-y-[12px] rounded-[12px] border-[1px] border-[#CBD5E1] p-[16px]">
            <div className="flex h-[22px] items-center gap-x-[8px]">
              <FormItem
                field="data_category[3].enabled"
                noStyle
                triggerPropName="checked"
              >
                <Switch onChange={handleVideoChange} />
              </FormItem>
              <VideoIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">视频</span>
            </div>
            <FormItem
              field="data_category[3].format"
              noStyle
              disabled={!videoParams?.enabled}
            >
              <Checkbox.Group
                options={FileOptions.video}
                onChange={handleVideoChange}
              />
            </FormItem>
          </div>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);

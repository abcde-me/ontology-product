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
import {
  Form,
  Input,
  Select,
  Checkbox,
  Switch,
  Cascader,
  Button,
  Tag,
  AutoComplete
} from '@arco-design/web-react';
import { v4 as uuid4 } from 'uuid';
import { cloneDeep, debounce } from 'lodash-es';
import PdfIcon from '@/assets/file/pdf-icon.svg';
import ImageIcon from '@/assets/file/image-icon.svg';
import AudioIcon from '@/assets/file/audio-icon.svg';
import VideoIcon from '@/assets/file/video-icon.svg';
import CustomizeIcon from '@/assets/file/customize-icon.svg';
import StartNodeDefault, { FileOptions } from './default';
import { useStoreApi } from 'reactflow';
import { useNodeDataUpdate } from '@/pages/workflowConfig/workflow/hooks';
import { getCatalogList } from '@/api/dataCatalog';
import { getLoadTaskFiles } from '@/api/loadApi';
import { useHistory } from 'react-router-dom';
import { IconPlus } from '@arco-design/web-react/icon';

const FormItem = Form.Item;
const i18nPrefix = 'workflow.nodes.start';

const Panel: FC<NodePanelProps<StartNodeType>> = ({ id, data }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const [srcDirs, setSrcDirs] = useState<Array<Record<string, any>>>([]);
  const [customizeFormat, setCustomizeFormat] = useState<string[]>(
    data?.data_category?.[4]?.format || []
  );
  const [customizeInputValue, setCustomizeInputValue] = useState('');
  const [customizeOptions, setCustomizeOptions] = useState<string[]>([]);
  const [form] = Form.useForm();
  // const store = useStoreApi();
  // const { handleNodeDataUpdateWithSyncDraft } = useNodeDataUpdate();
  const history = useHistory();
  const { Option } = AutoComplete;

  const docParams = Form.useWatch('data_category[0]', form);
  const imageParams = Form.useWatch('data_category[1]', form);
  const audioParams = Form.useWatch('data_category[2]', form);
  const videoParams = Form.useWatch('data_category[3]', form);
  const customizeParams = Form.useWatch('data_category[4]', form);

  const { readOnly, inputs, updateInputs, doFileConfigChange } = useConfig(
    id,
    data
  );

  const gotoData = () => {
    history.push(`/tenant/compute/modaforge/dataCatalog`);
  };

  const handleChanged = (values: any) => {
    const name = srcDirs.find((s) => s.id === values.data_path_id)?.name;
    console.log(values, 'valuesvaluesvalues');

    updateInputs({ ...values, data_path_name: name });
  };

  // const doFileConfigChange = (nodeType: BlockEnum, config: any) => {
  //   const { getNodes } = store.getState();
  //   const targetNodes = getNodes().filter(
  //     (node: any) => node.data.type === nodeType
  //   );
  //   const sourcePath = form.getFieldValue('data_path_id');
  //   if (sourcePath && config.enabled && config.format.length) {
  //     const formats = config.format
  //       .join('/')
  //       .split('/')
  //       .map((f) => f.toLowerCase());
  //     console.log('sourcePath', sourcePath, formats);
  //     getLoadTaskFiles({
  //       data_path_id: sourcePath,
  //       file_type: formats,
  //       file_size: 2 * 1024 * 1024 * 1024 - 1, // 过滤掉2G以上文件
  //       page_size: 1,
  //       page: 1
  //     }).then((res: any) => {
  //       targetNodes.forEach((n: any) => {
  //         handleNodeDataUpdateWithSyncDraft({
  //           id: n.id,
  //           data: {
  //             ...n.data,
  //             selected_files_num: res.data?.total || 0,
  //             files: []
  //           }
  //         });
  //       });
  //     });
  //   } else {
  //     targetNodes.forEach((n: any) => {
  //       handleNodeDataUpdateWithSyncDraft({
  //         id: n.id,
  //         data: {
  //           ...n.data,
  //           selected_files_num: 0,
  //           files: []
  //         }
  //       });
  //     });
  //   }
  // };

  const handlePathChange = () => {
    handleDocChange();
    handleImageChange();
    handleAudioChange();
    handleVideoChange();
    handleCustomizeChange(false);
  };
  const handleDocChange = () => {
    const docConfig = form.getFieldValue('data_category[0]');
    doFileConfigChange(
      BlockEnum.Text,
      form.getFieldValue('data_path_id'),
      docConfig
    );
  };
  const handleImageChange = () => {
    const imageConfig = form.getFieldValue('data_category[1]');
    doFileConfigChange(
      BlockEnum.Pic,
      form.getFieldValue('data_path_id'),
      imageConfig
    );
  };
  const handleAudioChange = () => {
    const audioConfig = form.getFieldValue('data_category[2]');
    doFileConfigChange(
      BlockEnum.Audio,
      form.getFieldValue('data_path_id'),
      audioConfig
    );
  };
  const handleVideoChange = () => {
    const videoConfig = form.getFieldValue('data_category[3]');
    doFileConfigChange(
      BlockEnum.Video,
      form.getFieldValue('data_path_id'),
      videoConfig
    );
  };

  const handleCustomizeSwitch = () => {
    const customizeConfig = form.getFieldValue('data_category[4]');
    doFileConfigChange(
      BlockEnum.Customize,
      form.getFieldValue('data_path_id'),
      customizeConfig
    );
  };
  const handleCustomizeChange = (isClose: boolean, index?: number) => {
    if (!customizeInputValue) {
      if (!isClose) {
        return;
      }
    }
    const customizeConfig = form.getFieldValue('data_category[4]');
    const newFormat = isClose
      ? customizeFormat.filter((_, i) => i !== index)
      : [...customizeFormat, customizeInputValue];
    setCustomizeFormat(newFormat);
    setCustomizeInputValue('');
    const updatedConfig = {
      ...customizeConfig,
      format: newFormat
    };
    form.setFieldValue('data_category[4]', updatedConfig);
    handleChanged({
      ...data,
      data_category: [
        docParams,
        imageParams,
        audioParams,
        videoParams,
        updatedConfig
      ]
    });
    console.log(updatedConfig, index, 'updatedConfig');
    doFileConfigChange(
      BlockEnum.Customize,
      form.getFieldValue('data_path_id'),
      updatedConfig
    );
  };

  const handleSearch = (inputValue) => {
    setCustomizeOptions(
      inputValue
        ? new Array(5).fill(null).map((_, index) => `${inputValue}_${index}`)
        : []
    );
  };

  useEffect(() => {
    getCatalogList({ root_type: 1 }).then((res) => {
      const dirs: Record<string, any>[] = [];
      res.data.src.forEach((catalog) => {
        dirs.push(
          ...(catalog.children?.volume || []).map((v) => ({
            ...v,
            parent_name: catalog.name
          }))
        );
      });
      setSrcDirs(dirs);
    });

    // if (inputs.data_path_id) {
    //   handlePathChange()
    // }
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
          field="data_path_id"
          rules={[{ required: true, message: '源数据目录必须选择' }]}
          disabled={readOnly || !srcDirs.length}
          extra={
            srcDirs.length ? (
              '选择工作流需处理数据的源数据目录，目录变更时将会同步下游节点更新。'
            ) : (
              <>
                <span>
                  暂无源数据目录，请先到
                  <span
                    className="cursor-pointer text-[#007DFA]"
                    onClick={gotoData}
                  >
                    数据目录
                  </span>
                  中创建
                </span>
              </>
            )
          }
        >
          <Select
            placeholder="请选择源数据目录"
            showSearch
            onChange={handlePathChange}
            filterOption={(inputValue, option) =>
              String(option.props.value)
                .toLowerCase()
                .indexOf(inputValue.toLowerCase()) >= 0 ||
              option.props.children
                .toLowerCase()
                .indexOf(inputValue.toLowerCase()) >= 0
            }
          >
            {srcDirs.map((s) => (
              <Select.Option value={s.id} key={s.id}>
                {`${s.parent_name} / ${s.name}`}
              </Select.Option>
            ))}
          </Select>
          {/* <Cascader
            placeholder='请选择源数据目录'
            options={srcDirs}
            fieldNames={{label: 'name', value: 'id'}}
          /> */}
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
                  (videoParams.enabled && videoParams.types.length) ||
                  (customizeParams.enabled && customizeParams.types.length)
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
                <Switch
                  checkedText="开"
                  uncheckedText="关"
                  onChange={handleDocChange}
                />
              </FormItem>
              <PdfIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">文档</span>
            </div>
            <FormItem
              field="data_category[0].format"
              noStyle
              disabled={!docParams?.enabled || readOnly}
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
                <Switch
                  checkedText="开"
                  uncheckedText="关"
                  onChange={handleImageChange}
                />
              </FormItem>
              <ImageIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">图片</span>
            </div>
            <FormItem
              field="data_category[1].format"
              noStyle
              disabled={!imageParams?.enabled || readOnly}
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
                <Switch
                  checkedText="开"
                  uncheckedText="关"
                  onChange={handleAudioChange}
                />
              </FormItem>
              <AudioIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">音频</span>
            </div>
            <FormItem
              field="data_category[2].format"
              noStyle
              disabled={!audioParams?.enabled || readOnly}
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
                <Switch
                  checkedText="开"
                  uncheckedText="关"
                  onChange={handleVideoChange}
                />
              </FormItem>
              <VideoIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">视频</span>
            </div>
            <FormItem
              field="data_category[3].format"
              noStyle
              disabled={!videoParams?.enabled || readOnly}
            >
              <Checkbox.Group
                options={FileOptions.video}
                onChange={handleVideoChange}
              />
            </FormItem>
          </div>
          <div className="mt-[12px] flex flex-col gap-y-[12px] rounded-[12px] border-[1px] border-[#CBD5E1] p-[16px]">
            <div className="flex h-[22px] items-center gap-x-[8px]">
              <FormItem
                field="data_category[4].enabled"
                noStyle
                triggerPropName="checked"
              >
                <Switch
                  checkedText="开"
                  uncheckedText="关"
                  onChange={handleCustomizeSwitch}
                />
              </FormItem>
              <CustomizeIcon className="size-[16px]" />
              <span className="text-[14px]/[22px] font-semibold">自定义</span>
            </div>
            {customizeParams?.enabled && !readOnly && (
              <div>
                <div className="flex">
                  <AutoComplete
                    className="w-[422px]"
                    placeholder="请输入文件类型"
                    value={customizeInputValue}
                    onChange={(v) => setCustomizeInputValue(v)}
                    onSearch={handleSearch}
                  >
                    {customizeOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </AutoComplete>
                  <Button
                    className="ml-[12px]"
                    style={{
                      borderColor: '#007DFA',
                      color: '#007DFA'
                    }}
                    type="outline"
                    icon={<IconPlus />}
                    onClick={() => handleCustomizeChange(false)}
                  >
                    添加
                  </Button>
                </div>
                {customizeFormat.length > 0 && (
                  <div className="mt-[15px] flex">
                    <span className="line-h-[20px] w-[36px]">已选：</span>
                    <div>
                      {customizeFormat.map((item, index) => (
                        <Tag
                          className="mx-[8px] bg-[#E7ECF0]"
                          closable
                          key={index}
                          onClose={() => handleCustomizeChange(true, index)}
                        >
                          {item}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);

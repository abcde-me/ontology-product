import { FC, useRef } from 'react'
import React from 'react'
import produce from 'immer'
import { useTranslation } from 'react-i18next'
import useConfig from './use-config'
import type { StartNodeType } from './types'
import type { InputVar, NodePanelProps } from '@/pages/workflowConfig/workflow/types'
import {
  Form,
  Input,
  Select,
  Checkbox,
  Switch,
} from '@arco-design/web-react';
import { v4 as uuid4 } from 'uuid'
import { cloneDeep, debounce } from 'lodash-es'
import PdfIcon from '@/assets/file/pdf-icon.svg'
import ImageIcon from '@/assets/file/image-icon.svg'
import AudioIcon from '@/assets/file/audio-icon.svg'
import VideoIcon from '@/assets/file/video-icon.svg'
import StartNodeDefault from './default'

const FormItem = Form.Item;
const i18nPrefix = 'workflow.nodes.start'
const FileOptions = {
  doc: ['PDF', 'PPT/PPTX', 'DOC/DOCX', 'TXT/MD'],
  image: ['JPEG', 'PNG', 'JPG'],
  audio: ['WAV', 'MP#', 'AAC', 'FLAC'],
  video: ['MP4', 'MOV', 'MKV'],
}
const Panel: FC<NodePanelProps<StartNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const [form] = Form.useForm();

  const docParams = Form.useWatch('data_category[0]', form);
  const imageParams = Form.useWatch('data_category[1]', form);
  const audioParams = Form.useWatch('data_category[2]', form);
  const videoParams = Form.useWatch('data_category[3]', form);

  const {
    readOnly,
    inputs,
    updateInputs,
  } = useConfig(id, data)

  const handleChanged = (values: any) => {
    updateInputs(values)
  }

  return (
    <div className='mt-[24px] wk-node-panel-content start-panel-content'>
      <Form
        form={form}
        disabled={readOnly}
        autoComplete='off'
        labelCol={{span: 0}}
        wrapperCol={{span: 24}}
        initialValues={cloneDeep(StartNodeDefault.defaultValue)}
        layout="vertical"
        onChange={async(_, v) => {
          // form.validate().catch(() => {})
          console.log('valuechange', _, v);
          handleChanged(v);
        }}
      >
        <FormItem
          label='源数据目录'
          field='source_path'
          rules={[{ required: true, message: '源数据目录必须选择' }]}
          extra='选择工作流需处理数据的源数据目录，目录变更时将会同步下游节点更新。'
        >
          <Select placeholder='请输入或选择源数据目录'>
            <Select.Option value="string">String</Select.Option>
            <Select.Option value="integer">Integer</Select.Option>
            <Select.Option value="number">Number</Select.Option>
            <Select.Option value="boolean">Boolean</Select.Option>
            <Select.Option value="array">Array</Select.Option>
          </Select>
        </FormItem>
        <FormItem label='文件类型' required rules={[
          {
            validator(v, cb) {
              if (docParams.enabled && docParams.types.length ||
                  imageParams.enabled && imageParams.types.length ||
                  audioParams.enabled && audioParams.types.length ||
                  videoParams.enabled && videoParams.types.length) {
                return cb();
              }
              return cb('请至少选择一种文件类型');
            },
          }
        ]}>
          <div className='border-[1px] border-[#CBD5E1] rounded-[12px] p-[16px] flex flex-col gap-y-[12px]'>
            <div className='flex items-center gap-x-[8px] h-[22px]'>
              <FormItem field='data_category[0].enabled' noStyle triggerPropName='checked'>
                <Switch />
              </FormItem>
              <PdfIcon className='size-[16px]'/>
              <span className='text-[14px]/[22px] font-semibold'>文档</span>
            </div>
            <FormItem field='data_category[0].format' noStyle disabled={!docParams?.enabled}>
              <Checkbox.Group options={FileOptions.doc}/>
            </FormItem>
          </div>
          <div className='mt-[12px] border-[1px] border-[#CBD5E1] rounded-[12px] p-[16px] flex flex-col gap-y-[12px]'>
            <div className='flex items-center gap-x-[8px] h-[22px]'>
              <FormItem field='data_category[1].enabled' noStyle triggerPropName='checked'>
                <Switch />
              </FormItem>
              <ImageIcon className='size-[16px]'/>
              <span className='text-[14px]/[22px] font-semibold'>图片</span>
            </div>
            <FormItem field='data_category[1].format' noStyle disabled={!imageParams?.enabled}>
              <Checkbox.Group options={FileOptions.image}/>
            </FormItem>
          </div>
          <div className='mt-[12px] border-[1px] border-[#CBD5E1] rounded-[12px] p-[16px] flex flex-col gap-y-[12px]'>
            <div className='flex items-center gap-x-[8px] h-[22px]'>
              <FormItem field='data_category[2].enabled' noStyle triggerPropName='checked'>
                <Switch />
              </FormItem>
              <AudioIcon className='size-[16px]'/>
              <span className='text-[14px]/[22px] font-semibold'>音频</span>
            </div>
            <FormItem field='data_category[2].format' noStyle disabled={!audioParams?.enabled}>
              <Checkbox.Group options={FileOptions.audio}/>
            </FormItem>
          </div>
          <div className='mt-[12px] border-[1px] border-[#CBD5E1] rounded-[12px] p-[16px] flex flex-col gap-y-[12px]'>
            <div className='flex items-center gap-x-[8px] h-[22px]'>
              <FormItem field='data_category[3].enabled' noStyle triggerPropName='checked'>
                <Switch />
              </FormItem>
              <VideoIcon className='size-[16px]'/>
              <span className='text-[14px]/[22px] font-semibold'>视频</span>
            </div>
            <FormItem field='data_category[3].format' noStyle disabled={!videoParams?.enabled}>
              <Checkbox.Group options={FileOptions.video}/>
            </FormItem>
          </div>
        </FormItem>
      </Form>
    </div>
  )
}

export default React.memo(Panel)

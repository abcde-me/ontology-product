import type { FC } from 'react'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import produce from 'immer'
import { Select as ASelect } from '@arco-design/web-react'
import {
  RiDeleteBinLine,
} from '@remixicon/react'
import type { InputVar } from '../../../../types'
import { BlockEnum, InputVarType, SupportUploadFileTypes } from '../../../../types'
import CodeEditor from '../editor/code-editor'
import { CodeLanguage } from '../../../code/types'
import TextEditor from '../editor/text-editor'
import Select from '@/pages/workflowConfig/components/select'
import Input from '@/pages/workflowConfig/components/input'
import Textarea from '@/pages/workflowConfig/components/textarea'
import TextGenerationImageUploader from '@/pages/workflowConfig/components/image-uploader/text-generation-image-uploader'
import { FileUploaderInAttachmentWrapper } from '@/pages/workflowConfig/components/file-uploader'
import { Resolution, TransferMethod } from '@/pages/workflowConfig/types/app'
// import { useFeatures } from '@/app/components/base/features/hooks'
import { VarBlockIcon } from '@/pages/workflowConfig/workflow/block-icon'
import { FILE_EXTS } from '@/pages/workflowConfig/components/prompt-editor/constants'
import cn from '@/pages/workflowConfig/utils/classnames'
import type { FileEntity } from '@/pages/workflowConfig/components/file-uploader/types'

type Props = {
  payload: InputVar
  value: any
  onChange: (value: any) => void
  className?: string
  autoFocus?: boolean
  inStepRun?: boolean
  disabled?: boolean
}

const FormItem: FC<Props> = ({
  payload,
  value,
  onChange,
  className,
  autoFocus,
  disabled = false,
  inStepRun = false,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const { type } = payload
  // const fileSettings = useFeatures(s => s.features.file)
  const fileSettings = {} as any
  const handleArrayItemChange = useCallback((index: number) => {
    return (newValue: any) => {
      const newValues = produce(value, (draft: any) => {
        draft[index] = newValue
      })
      onChange(newValues)
    }
  }, [value, onChange])

  const handleArrayItemRemove = useCallback((index: number) => {
    return () => {
      const newValues = produce(value, (draft: any) => {
        draft.splice(index, 1)
      })
      onChange(newValues)
    }
  }, [value, onChange])
  const nodeKey = (() => {
    if (typeof payload.label === 'object') {
      const { nodeType, nodeName, variable, isChatVar } = payload.label
      return (
        <div className='h-full flex items-center'>
          {!isChatVar && (
            <div className='flex items-center'>
              <div className='p-[1px]'>
                <VarBlockIcon type={nodeType || BlockEnum.Start} />
              </div>
              <div className='mx-0.5 text-xs font-medium text-gray-700 max-w-[150px] truncate' title={nodeName}>
                {nodeName}
              </div>
              {/* <Line3 className='mr-0.5'></Line3> */}
            </div>
          )}
          <div className='flex items-center text-primary-600'>
            {/* {!isChatVar && <Variable02 className='w-3.5 h-3.5' />}
            {isChatVar && <BubbleX className='w-3.5 h-3.5 text-util-colors-teal-teal-700' />} */}
            <div className={cn('ml-0.5 text-xs font-medium max-w-[150px] truncate', isChatVar && 'text-text-secondary')} title={variable} >
              {variable}
            </div>
          </div>
        </div>
      )
    }
    return ''
  })()

  const isArrayLikeType = [InputVarType.contexts, InputVarType.iterator].includes(type)
  const isContext = type === InputVarType.contexts
  const isIterator = type === InputVarType.iterator
  const singleFileValue = useMemo(() => {
    if (payload.variable === '#files#')
      return value?.[0] || []

    return value ? [value] : []
  }, [payload.variable, value])
  const handleSingleFileChange = useCallback((files: FileEntity[]) => {
    if (payload.variable === '#files#')
      onChange(files)
    else if (files.length)
      onChange(files[0])
    else
      onChange(null)
  }, [onChange, payload.variable])

  return (
    <div className={cn(className)}>
      {!isArrayLikeType && (
        <div className='h-[20px] mb-[6px] flex items-center text-text-secondary system-sm-semibold'>
          {!!payload.required && <span className='text-[rgb(245,63,63)] size-[12px] text-center font-bold'>*</span>}
          <div className='truncate text-[#151B26] text-[12px]/[16px] font-medium mr-[12px]'>{typeof payload.label === 'object' ? nodeKey : (payload.variable || payload.label)}</div>
          <div className='text-[#6E7B8D] text-[12px]/[20px] px-[8px] bg-[#F7F7F9] rounded-[4px]'>{payload.type}</div>
          {/* {!payload.required && <span className='text-text-tertiary system-xs-regular'>{t('workflow.panel.optional')}</span>} */}
        </div>
      )}
      <div className='grow'>
        {
          (type === InputVarType.textInput || type === InputVarType.string) && (
            <Input
              className="rounded-[4px] outline-input"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder={t('appDebug.variableConfig.inputPlaceholder')!}
              autoFocus={autoFocus}
              disabled={disabled}
            />
          )
        }

        {
          (type === InputVarType.number || type === InputVarType.integer) && (
            <Input
              className="rounded-[4px] outline-input"
              type="number"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder={t('appDebug.variableConfig.inputPlaceholder')!}
              autoFocus={autoFocus}
              disabled={disabled}
            />
          )
        }

        {
          (type === InputVarType.paragraph || type === InputVarType.array) && (
            <Textarea
              className="!rounded-[4px] outline-input"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder={t('appDebug.variableConfig.inputPlaceholder')!}
              autoFocus={autoFocus}
              disabled={disabled}
            />
          )
        }

        {
          type === InputVarType.select && (
            <Select
              className="w-full rounded-[4px]"
              defaultValue={value || ''}
              items={payload.options?.map(option => ({ name: option, value: option })) || []}
              onSelect={i => onChange(i.value)}
              allowSearch={false}
              disabled={disabled}
            />
          )
        }

        {
          type === InputVarType.boolean && (
            <ASelect className="w-full" disabled={disabled} defaultValue={value || ''} allowClear onChange={i => onChange(i)}>
              <ASelect.Option value="True">True</ASelect.Option>
              <ASelect.Option value="False">False</ASelect.Option>
            </ASelect>
          )
        }

        {
          type === InputVarType.json && (
            <CodeEditor
              value={value}
              title={<span>JSON</span>}
              language={CodeLanguage.json}
              onChange={onChange}
            />
          )
        }
        {(type === InputVarType.singleFile) && (
          <FileUploaderInAttachmentWrapper
            value={singleFileValue}
            onChange={handleSingleFileChange}
            fileConfig={{
              allowed_file_types: inStepRun
                ? [
                  SupportUploadFileTypes.image,
                  SupportUploadFileTypes.document,
                  SupportUploadFileTypes.audio,
                  SupportUploadFileTypes.video,
                ]
                : payload.allowed_file_types,
              allowed_file_extensions: inStepRun
                ? [
                  ...FILE_EXTS[SupportUploadFileTypes.image],
                  ...FILE_EXTS[SupportUploadFileTypes.document],
                  ...FILE_EXTS[SupportUploadFileTypes.audio],
                  ...FILE_EXTS[SupportUploadFileTypes.video],
                ]
                : payload.allowed_file_extensions,
              allowed_file_upload_methods: inStepRun ? [TransferMethod.local_file, TransferMethod.remote_url] : payload.allowed_file_upload_methods,
              number_limits: 1,
              fileUploadConfig: fileSettings?.fileUploadConfig,
            }}
          />
        )}
        {(type === InputVarType.multiFiles) && (
          <FileUploaderInAttachmentWrapper
            value={value}
            onChange={files => onChange(files)}
            fileConfig={{
              allowed_file_types: inStepRun
                ? [
                  SupportUploadFileTypes.image,
                  SupportUploadFileTypes.document,
                  SupportUploadFileTypes.audio,
                  SupportUploadFileTypes.video,
                ]
                : payload.allowed_file_types,
              allowed_file_extensions: inStepRun
                ? [
                  ...FILE_EXTS[SupportUploadFileTypes.image],
                  ...FILE_EXTS[SupportUploadFileTypes.document],
                  ...FILE_EXTS[SupportUploadFileTypes.audio],
                  ...FILE_EXTS[SupportUploadFileTypes.video],
                ]
                : payload.allowed_file_extensions,
              allowed_file_upload_methods: inStepRun ? [TransferMethod.local_file, TransferMethod.remote_url] : payload.allowed_file_upload_methods,
              number_limits: inStepRun ? 5 : payload.max_length,
              fileUploadConfig: fileSettings?.fileUploadConfig,
            }}
          />
        )}
        {
          type === InputVarType.files && (
            <TextGenerationImageUploader
              settings={{
                ...fileSettings,
                detail: fileSettings?.image?.detail || Resolution.high,
                transfer_methods: fileSettings?.allowed_file_upload_methods || [],
              } as any}
              onFilesChange={files => onChange(files.filter(file => file.progress !== -1).map(fileItem => ({
                type: 'image',
                transfer_method: fileItem.type,
                url: fileItem.url,
                upload_file_id: fileItem.fileId,
              })))}
            />
          )
        }

        {
          isContext && (
            <div className='space-y-2'>
              {(value || []).map((item: any, index: number) => (
                <CodeEditor
                  key={index}
                  value={item}
                  title={<span>JSON</span>}
                  headerRight={
                    (value as any).length > 1
                      ? (<RiDeleteBinLine
                        onClick={handleArrayItemRemove(index)}
                        className='mr-1 w-3.5 h-3.5 text-text-tertiary cursor-pointer'
                      />)
                      : undefined
                  }
                  language={CodeLanguage.json}
                  onChange={handleArrayItemChange(index)}
                />
              ))}
            </div>
          )
        }

        {
          isIterator && (
            <div className='space-y-2'>
              {(value || []).map((item: any, index: number) => (
                <TextEditor
                  key={index}
                  isInNode
                  value={item}
                  title={<span>{t('appDebug.variableConfig.content')} {index + 1} </span>}
                  onChange={handleArrayItemChange(index)}
                  headerRight={
                    (value as any).length > 1
                      ? (<RiDeleteBinLine
                        onClick={handleArrayItemRemove(index)}
                        className='mr-1 w-3.5 h-3.5 text-text-tertiary cursor-pointer'
                      />)
                      : undefined
                  }
                />
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
export default React.memo(FormItem)

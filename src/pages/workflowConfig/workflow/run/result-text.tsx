
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
// import { ImageIndentLeft } from '@/app/components/base/icons/src/vender/line/editor'
import { Markdown } from '@/pages/workflowConfig/components/markdown'
import LoadingAnim from '@/pages/workflowConfig/chat/chat/loading-anim'
import StatusContainer from '@/pages/workflowConfig/workflow/run/status-container'
import { FileList } from '@/pages/workflowConfig/components/file-uploader'
import CodeEditor from '@/pages/workflowConfig/workflow/nodes/_base/components/editor/code-editor'
import { CodeLanguage } from '@/pages/workflowConfig/workflow/nodes/code/types'
import ErrorHandleTip from '@/pages/workflowConfig/workflow/nodes/_base/components/error-handle/error-handle-tip'

interface ResultTextProps {
  isRunning?: boolean
  outputs?: any
  outputsDetail?: string
  error?: string
  onClick?: () => void
  allFiles?: any[]
}

const ResultText: FC<ResultTextProps> = ({
  isRunning,
  outputs,
  outputsDetail,
  error,
  onClick,
  allFiles,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  return (
    <div className='bg-[white] border-[#CBD5E1] border-[1px] rounded-[4px]'>
      {isRunning && !outputs && (
        <div className='p-[8px] w-full flex items-center justify-center'>
          <LoadingAnim type='text' />
        </div>
      )}
      {!isRunning && error && (
        <div className='px-4 py-2'>
          <StatusContainer status='failed'>
            {error}
          </StatusContainer>
        </div>
      )}
      {!isRunning && !outputs && !error && !allFiles?.length && (
        // <div className='mt-[120px] px-4 py-2 flex flex-col items-center text-[13px] leading-[18px] text-gray-500'>
        //   {/* <ImageIndentLeft className='w-6 h-6 text-gray-400' /> */}
        //   <div className='mr-2'>{t('runLog.resultEmpty.title')}</div>
        //   <div>
        //     {t('runLog.resultEmpty.tipLeft')}
        //     <span onClick={onClick} className='cursor-pointer text-primary-600'>{t('runLog.resultEmpty.link')}</span>
        //     {t('runLog.resultEmpty.tipRight')}
        //   </div>
        // </div>
        <CodeEditor
          readOnly
          noWrapper
          title={<div>{t('workflow.common.output').toLocaleUpperCase()}</div>}
          language={CodeLanguage.json}
          value={outputsDetail}
          isJSONStringifyBeauty
          tip={<ErrorHandleTip />}
        />
      )}
      {(outputs || !!allFiles?.length) && (
        <>
          {outputs && (
            <div className='p-[8px]'>
              <Markdown content={outputs} />
            </div>
          )}
          {!!allFiles?.length && allFiles.map(item => (
            <div key={item.varName} className='px-4 py-2 flex flex-col gap-1 system-xs-regular'>
              <div className='py-1 text-text-tertiary '>{item.varName}</div>
              <FileList
                files={item.list}
                showDeleteAction={false}
                showDownloadAction
                canPreview
              />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default ResultText

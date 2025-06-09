import React, {
  memo,
} from 'react'
import { Markdown } from '@/pages/workflowConfig/components/markdown'
import CodeEditor from '@/pages/workflowConfig/workflow/nodes/_base/components/editor/code-editor'
import { CodeLanguage } from '@/pages/workflowConfig/workflow/nodes/code/types'
import type { WorkflowProcess } from '@/pages/workflowConfig/chat/types'
import { FileList } from '@/pages/workflowConfig/components/file-uploader'

const ResultTab = ({
  data,
  content,
  currentTab,
}: {
  data?: WorkflowProcess
  content: any
  currentTab: string
}) => {
  return (
    <>
      {currentTab === 'RESULT' && (
        <div className='p-4 px-3 mx-2 space-y-3 result markdown-filelist-wrapper'>
          {data?.resultText && <Markdown content={data?.resultText || ''} />}
          {!!data?.files?.length && (
            <div className='flex flex-col gap-2'>
              {data?.files.map((item: any) => (
                <div key={item.varName} className='flex flex-col gap-1 system-xs-regular'>
                  <div className='py-1 text-text-tertiary '>{item.varName}</div>
                  <FileList
                    files={item.list}
                    showDeleteAction={false}
                    showDownloadAction
                    canPreview
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {currentTab === 'DETAIL' && content && (
        <div className='p-4 px-3 code-editor-wrapper detail'>
          <CodeEditor
            readOnly
            title={<div>JSON OUTPUT</div>}
            language={CodeLanguage.json}
            value={content}
            isJSONStringifyBeauty
          />
        </div>
      )}
    </>
  )
}

export default memo(ResultTab)

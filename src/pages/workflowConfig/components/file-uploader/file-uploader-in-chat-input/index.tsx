import React, {
  memo,
  useCallback,
} from 'react'
import {
  RiAttachmentLine,
} from '@remixicon/react'
import FileFromLinkOrLocal from '../file-from-link-or-local'
import ActionButton from '@/pages/workflowConfig/components/action-button'
import cn from '@/pages/workflowConfig/utils/classnames'
import { TransferMethod } from '@/pages/workflowConfig/types/app'


type FileUpload = any
type FileUploaderInChatInputProps = {
  fileConfig: FileUpload
}
const FileUploaderInChatInput = ({
  fileConfig,
}: FileUploaderInChatInputProps) => {
  const renderTrigger = useCallback((open: boolean) => {
    return (
      <ActionButton
        size='l'
        className={cn(open && 'bg-state-base-hover')}
      >
        <RiAttachmentLine className='w-5 h-5' />
      </ActionButton>
    )
  }, [])

  return (
    <FileFromLinkOrLocal
      trigger={renderTrigger}
      fileConfig={fileConfig}
      showFromLocal={fileConfig?.allowed_file_upload_methods?.includes(TransferMethod.local_file)}
      showFromLink={fileConfig?.allowed_file_upload_methods?.includes(TransferMethod.remote_url)}
    />
  )
}

export default memo(FileUploaderInChatInput)

import {
  RiCloseLine,
  RiDownloadLine,
} from '@remixicon/react'
import React, { useState } from 'react'
import {
  downloadFile,
  fileIsUploaded,
  getFileAppearanceType,
  getFileExtension,
} from '../utils'
import FileTypeIcon from '../file-type-icon'
import type { FileEntity } from '../types'
import cn from '@/pages/workflowConfig/utils/classnames'
import { formatFileSize } from '@/pages/workflowConfig/utils/format'
import ProgressCircle from '@/pages/workflowConfig/components/progress-bar/progress-circle'
import { RiReplay5Line } from '@remixicon/react'
import ActionButton from '@/pages/workflowConfig/components/action-button'
import Button from '@/pages/workflowConfig/components/button'
import PdfPreview from '@/pages/workflowConfig/components/file-uploader/dynamic-pdf-preview'
import AudioPreview from '@/pages/workflowConfig/components/file-uploader/audio-preview'
import VideoPreview from '@/pages/workflowConfig/components/file-uploader/video-preview'

type FileItemProps = {
  file: FileEntity
  showDeleteAction?: boolean
  showDownloadAction?: boolean
  canPreview?: boolean
  onRemove?: (fileId: string) => void
  onReUpload?: (fileId: string) => void
}
const FileItem = ({
  file,
  showDeleteAction,
  showDownloadAction = true,
  onRemove,
  onReUpload,
  canPreview,
}: FileItemProps) => {
  const { id, name, type, progress, url, base64Url, isRemote } = file
  const [previewUrl, setPreviewUrl] = useState('')
  const ext = getFileExtension(name, type, isRemote)
  const uploadError = progress === -1

  let tmp_preview_url = url || base64Url
  if (!tmp_preview_url && file?.originalFile)
    tmp_preview_url = URL.createObjectURL(file.originalFile.slice()).toString()

  return (
    <>
      <div
        className={cn(
          'group/file-item relative p-2 w-[144px] h-[68px] rounded-lg border-[0.5px] border-components-panel-border bg-components-card-bg shadow-xs',
          !uploadError && 'hover:bg-components-card-bg-alt',
          uploadError && 'border border-state-destructive-border bg-state-destructive-hover',
          uploadError && 'hover:border-[0.5px] hover:border-state-destructive-border bg-state-destructive-hover-alt',
        )}
      >
        {
          showDeleteAction && (
            <Button
              className='hidden group-hover/file-item:flex absolute -right-1.5 -top-1.5 p-0 w-5 h-5 rounded-full z-[11]'
              styleCss={{minWidth: 'unset !important'}}
              onClick={() => onRemove?.(id)}
            >
              <RiCloseLine className='w-4 h-4 text-components-button-secondary-text' />
            </Button>
          )
        }
        <div
          className='mb-1 h-8 line-clamp-2 system-xs-medium text-text-tertiary break-all cursor-pointer'
          title={name}
          onClick={() => canPreview && setPreviewUrl(tmp_preview_url || '')}
        >
          {name}
        </div>
        <div className='relative flex items-center justify-between'>
          <div className='flex items-center system-2xs-medium-uppercase text-text-tertiary'>
            <FileTypeIcon
              size='sm'
              type={getFileAppearanceType(name, type)}
              className='mr-1'
            />
            {
              ext && (
                <>
                  {ext}
                  <div className='mx-1'>·</div>
                </>
              )
            }
            {
              !!file.size && formatFileSize(file.size)
            }
          </div>
          {
            showDownloadAction && tmp_preview_url && (
              <ActionButton
                size='m'
                className='hidden group-hover/file-item:flex absolute -right-1 -top-1'
                onClick={(e) => {
                  e.stopPropagation()
                  downloadFile(tmp_preview_url || '', name)
                }}
              >
                <RiDownloadLine className='w-3.5 h-3.5 text-text-tertiary' />
              </ActionButton>
            )
          }
          {
            progress >= 0 && !fileIsUploaded(file) && (
              <ProgressCircle
                percentage={progress}
                size={12}
                className='shrink-0'
              />
            )
          }
          {
            uploadError && (
              <RiReplay5Line
                className='w-4 h-4 text-text-tertiary'
                onClick={() => onReUpload?.(id)}
              />
            )
          }
        </div>
      </div>
      {
        type.split('/')[0] === 'audio' && canPreview && previewUrl && (
          <AudioPreview
            title={name}
            url={previewUrl}
            onCancel={() => setPreviewUrl('')}
          />
        )
      }
      {
        type.split('/')[0] === 'video' && canPreview && previewUrl && (
          <VideoPreview
            title={name}
            url={previewUrl}
            onCancel={() => setPreviewUrl('')}
          />
        )
      }
      {
        type.split('/')[1] === 'pdf' && canPreview && previewUrl && (
          <PdfPreview url={previewUrl} onCancel={() => { setPreviewUrl('') }} />
        )
      }
    </>
  )
}

export default FileItem

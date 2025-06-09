import type { FC } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiCloseLine,
  RiLoader2Line,
} from '@remixicon/react'
import cn from '@/pages/workflowConfig/utils/classnames'
import { RiRefreshLine, RiAlertLine } from '@remixicon/react'
import Tooltip from '@/pages/workflowConfig/components/tooltip'
import type { ImageFile } from '@/pages/workflowConfig/types/app'
import { TransferMethod } from '@/pages/workflowConfig/types/app'
import ImagePreview from '@/pages/workflowConfig/components/image-uploader/image-preview'

type ImageListProps = {
  list: ImageFile[]
  readonly?: boolean
  onRemove?: (imageFileId: string) => void
  onReUpload?: (imageFileId: string) => void
  onImageLinkLoadSuccess?: (imageFileId: string) => void
  onImageLinkLoadError?: (imageFileId: string) => void
}

const ImageList: FC<ImageListProps> = ({
  list,
  readonly,
  onRemove,
  onReUpload,
  onImageLinkLoadSuccess,
  onImageLinkLoadError,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  const handleImageLinkLoadSuccess = (item: ImageFile) => {
    if (
      item.type === TransferMethod.remote_url
      && onImageLinkLoadSuccess
      && item.progress !== -1
    )
      onImageLinkLoadSuccess(item._id)
  }
  const handleImageLinkLoadError = (item: ImageFile) => {
    if (item.type === TransferMethod.remote_url && onImageLinkLoadError)
      onImageLinkLoadError(item._id)
  }

  return (
    <div className="flex flex-wrap">
      {list.map(item => (
        <div
          key={item._id}
          className="group relative mr-1 border-[0.5px] border-black/5 rounded-lg"
        >
          {item.type === TransferMethod.local_file && item.progress !== 100 && (
            <>
              <div
                className="absolute inset-0 flex items-center justify-center z-[1] bg-black/30"
                style={{ left: item.progress > -1 ? `${item.progress}%` : 0 }}
              >
                {item.progress === -1 && (
                  <RiRefreshLine
                    className="w-5 h-5 text-white"
                    onClick={() => onReUpload && onReUpload(item._id)}
                  />
                )}
              </div>
              {item.progress > -1 && (
                <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-sm text-white mix-blend-lighten z-[1]">
                  {item.progress}%
                </span>
              )}
            </>
          )}
          {item.type === TransferMethod.remote_url && item.progress !== 100 && (
            <div
              className={`
                  absolute inset-0 flex items-center justify-center rounded-lg z-[1] border
                  ${item.progress === -1
              ? 'bg-[#FEF0C7] border-[#DC6803]'
              : 'bg-black/[0.16] border-transparent'
            }
                `}
            >
              {item.progress > -1 && (
                <RiLoader2Line className="animate-spin w-5 h-5 text-white" />
              )}
              {item.progress === -1 && (
                <Tooltip
                  popupContent={t('common.imageUploader.pasteImageLinkInvalid')}
                >
                  <RiAlertLine className="w-4 h-4 text-[#DC6803]" />
                </Tooltip>
              )}
            </div>
          )}
          <img
            className="w-16 h-16 rounded-lg object-cover cursor-pointer border-[0.5px] border-black/5"
            alt={item.file?.name}
            onLoad={() => handleImageLinkLoadSuccess(item)}
            onError={() => handleImageLinkLoadError(item)}
            src={
              item.type === TransferMethod.remote_url
                ? item.url
                : item.base64Url
            }
            onClick={() =>
              item.progress === 100
              && setImagePreviewUrl(
                (item.type === TransferMethod.remote_url
                  ? item.url
                  : item.base64Url) as string,
              )
            }
          />
          {!readonly && (
            <button
              type="button"
              className={cn(
                'absolute z-10 -top-[9px] -right-[9px] items-center justify-center w-[18px] h-[18px]',
                'hover:bg-state-base-hover rounded-2xl shadow-lg',
                item.progress === -1 ? 'flex' : 'hidden group-hover:flex',
              )}
              onClick={() => onRemove && onRemove(item._id)}
            >
              <RiCloseLine className="w-3 h-3 text-text-tertiary" />
            </button>
          )}
        </div>
      ))}
      {imagePreviewUrl && (
        <ImagePreview
          url={imagePreviewUrl}
          onCancel={() => setImagePreviewUrl('')}
          title=''
        />
      )}
    </div>
  )
}

export default ImageList

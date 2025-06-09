import type { FC } from 'react'
import React from 'react'
import {
  RiClipboardLine,
  RiDeleteBinLine,
} from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import copy from 'copy-to-clipboard'
import NoData from './no-data'
import cn from '@/pages/workflowConfig/utils/classnames'
import type { SavedMessage } from '@/pages/workflowConfig/models/debug'
import { Markdown } from '@/pages/workflowConfig/components/markdown'
import Toast from '@/pages/workflowConfig/components/toast'
import ActionButton from '@/pages/workflowConfig/components/action-button'
import NewAudioButton from '@/pages/workflowConfig/components/new-audio-button'

export type ISavedItemsProps = {
  className?: string
  isShowTextToSpeech?: boolean
  list: SavedMessage[]
  onRemove: (id: string) => void
  onStartCreateContent: () => void
}

const SavedItems: FC<ISavedItemsProps> = ({
  className,
  isShowTextToSpeech,
  list,
  onRemove,
  onStartCreateContent,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  return (
    <div className={cn('space-y-4', className)}>
      {list.length === 0
        ? (
          <NoData onStartCreateContent={onStartCreateContent} />
        )
        : (<>
          {list.map(({ id, answer }) => (
            <div key={id} className='relative'>
              <div className={cn(
                'p-4 bg-background-section-burn rounded-2xl',
              )}>
                <Markdown content={answer} />
              </div>
              <div className='mt-1 h-4 px-4 text-text-quaternary system-xs-regular'>
                <span>{answer.length} {t('common.unit.char')}</span>
              </div>
              <div className='absolute right-2 bottom-1'>
                <div className='ml-1 flex items-center gap-0.5 p-0.5 rounded-[10px] border-[0.5px] border-components-actionbar-border bg-components-actionbar-bg shadow-md backdrop-blur-sm'>
                  {isShowTextToSpeech && <NewAudioButton value={answer}/>}
                  <ActionButton onClick={() => {
                    copy(answer)
                    Toast.notify({ type: 'success', message: t('common.actionMsg.copySuccessfully') })
                  }}>
                    <RiClipboardLine className='w-4 h-4' />
                  </ActionButton>
                  <ActionButton onClick={() => {
                    onRemove(id)
                  }}>
                    <RiDeleteBinLine className='w-4 h-4' />
                  </ActionButton>
                </div>
              </div>
            </div>
          ))}
        </>)}

    </div>
  )
}
export default React.memo(SavedItems)

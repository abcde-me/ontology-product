import type { FC } from 'react'
import React from 'react'
import { RiEqualizer2Line } from '@remixicon/react'
import cn from '@/pages/workflowConfig/utils/classnames'
import { useTranslation } from 'react-i18next'

type ModelTriggerProps = {
  open: boolean
  className?: string
}
const ModelTrigger: FC<ModelTriggerProps> = ({
  open,
  className,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  return (
    <div
      className={cn(
        'flex items-center p-1 gap-0.5 rounded-lg bg-components-input-bg-normal hover:bg-components-input-bg-hover cursor-pointer', open && 'bg-components-input-bg-hover',
        className,
      )}
    >
      <div className='grow flex items-center'>
        <div
          className='text-[13px] text-text-tertiary truncate'
          title='Configure model'
        >
          {t('plugin.detailPanel.configureModel')}
        </div>
      </div>
      <div className='shrink-0 flex items-center justify-center w-4 h-4'>
        <RiEqualizer2Line className='w-3.5 h-3.5 text-text-tertiary' />
      </div>
    </div>
  )
}

export default ModelTrigger

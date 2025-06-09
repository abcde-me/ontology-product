import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import cn from '@/pages/workflowConfig/utils/classnames'

const Placeholder = ({
  compact,
  value,
  className,
}: {
  compact?: boolean
  value?: string
  className?: string
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  return (
    <div className={cn(
      className,
      'absolute top-0 left-0 h-full w-full text-sm text-components-input-text-placeholder select-none pointer-events-none',
      compact ? 'leading-5 text-[13px]' : 'leading-6 text-sm',
    )}>
      {value || t('common.promptEditor.placeholder')}
    </div>
  )
}

export default memo(Placeholder)

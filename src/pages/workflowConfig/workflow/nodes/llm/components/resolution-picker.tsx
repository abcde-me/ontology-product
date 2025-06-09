
import type { FC } from 'react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import OptionCard from '@/pages/workflowConfig/workflow/nodes/_base/components/option-card'
import { Resolution } from '@/pages/workflowConfig/types/app'

const i18nPrefix = 'workflow.nodes.llm'

type Props = {
  value: Resolution
  onChange: (value: Resolution) => void
}

const ResolutionPicker: FC<Props> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const handleOnChange = useCallback((value: Resolution) => {
    return () => {
      onChange(value)
    }
  }, [onChange])
  return (
    <div className='flex items-center justify-between'>
      <div className='mr-2 text-xs font-medium text-gray-500 uppercase'>{t(`${i18nPrefix}.resolution.name`)}</div>
      <div className='flex items-center space-x-1'>
        <OptionCard
          title={t(`${i18nPrefix}.resolution.high`)}
          onSelect={handleOnChange(Resolution.high)}
          selected={value === Resolution.high}
        />
        <OptionCard
          title={t(`${i18nPrefix}.resolution.low`)}
          onSelect={handleOnChange(Resolution.low)}
          selected={value === Resolution.low}
        />
      </div>
    </div>
  )
}
export default React.memo(ResolutionPicker)

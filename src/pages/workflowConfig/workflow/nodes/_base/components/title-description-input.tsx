import React, {
  memo,
  useCallback,
  useState,
} from 'react'
import Textarea from 'rc-textarea'
import { useTranslation } from 'react-i18next'

type TitleInputProps = {
  value: string
  onBlur: (value: string) => void
  className?: string
}

export const TitleInput = memo(({
  value,
  onBlur,
  className = '',
}: TitleInputProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const [localValue, setLocalValue] = useState(value)

  const handleBlur = () => {
    if (!localValue) {
      setLocalValue(value)
      onBlur(value)
      return
    }

    onBlur(localValue)
  }

  return (
    <input
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      className={`
        grow mr-2 px-1 h-7 text-text-primary system-xl-semibold rounded-md border border-transparent appearance-none outline-none
        focus:shadow-xs min-w-0 text-[#1E293B] ${className}
      `}
      placeholder={t('workflow.common.addTitle') || ''}
      onBlur={handleBlur}
    />
  )
})
TitleInput.displayName = 'TitleInput'

type DescriptionInputProps = {
  value: string
  onChange: (value: string) => void
}
export const DescriptionInput = memo(({
  value,
  onChange,
}: DescriptionInputProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const [focus, setFocus] = useState(false)
  const handleFocus = useCallback(() => {
    setFocus(true)
  }, [])
  const handleBlur = useCallback(() => {
    setFocus(false)
  }, [])

  return (
    <div
      className={`
        group flex py-[5px] max-h-[60px] rounded-lg overflow-y-auto
        leading-0 bg-components-panel-bg
        ${focus && '!shadow-xs'}
      `}
    >
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={1}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full text-xs text-gray-900 leading-[18px] bg-transparent
          appearance-none outline-none resize-none
          placeholder:text-gray-400 caret-[#295EFF]
        `}
        placeholder={t('workflow.common.addDescription') || ''}
        autoSize
      />
    </div>
  )
})
DescriptionInput.displayName = 'DescriptionInput'

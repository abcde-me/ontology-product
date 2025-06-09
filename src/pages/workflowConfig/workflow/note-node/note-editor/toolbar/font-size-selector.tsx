import React, { memo } from 'react'
import { RiFontSize } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { useFontSize } from './hooks'
import cn from '@/pages/workflowConfig/utils/classnames'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/pages/workflowConfig/components/portal-to-follow-elem'
import { RiCheckLine } from '@remixicon/react'

const FontSizeSelector = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const FONT_SIZE_LIST = [
    {
      key: '12px',
      value: t('workflow.nodes.note.editor.small'),
    },
    {
      key: '14px',
      value: t('workflow.nodes.note.editor.medium'),
    },
    {
      key: '16px',
      value: t('workflow.nodes.note.editor.large'),
    },
  ]
  const {
    fontSizeSelectorShow,
    handleOpenFontSizeSelector,
    fontSize,
    handleFontSize,
  } = useFontSize()

  return (
    <PortalToFollowElem
      open={fontSizeSelectorShow}
      onOpenChange={handleOpenFontSizeSelector}
      placement='bottom-start'
      offset={2}
    >
      <PortalToFollowElemTrigger onClick={() => handleOpenFontSizeSelector(!fontSizeSelectorShow)}>
        <div className={cn(
          'flex items-center pl-2 pr-1.5 h-8 rounded-md text-[13px] font-medium text-text-tertiary hover:text-text-secondary cursor-pointer hover:bg-state-base-hover',
          fontSizeSelectorShow && 'bg-state-base-hover text-text-secondary',
        )}>
          <RiFontSize className='mr-1 w-4 h-4' />
          {FONT_SIZE_LIST.find(font => font.key === fontSize)?.value || t('workflow.nodes.note.editor.small')}
        </div>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent>
        <div className='p-1 w-[120px] bg-components-panel-bg-blur border-[0.5px] border-components-panel-border rounded-md shadow-xl text-text-secondary'>
          {
            FONT_SIZE_LIST.map(font => (
              <div
                key={font.key}
                className='flex items-center justify-between pl-3 pr-2 h-8 rounded-md cursor-pointer hover:bg-state-base-hover'
                onClick={(e) => {
                  e.stopPropagation()
                  handleFontSize(font.key)
                  handleOpenFontSizeSelector(false)
                }}
              >
                <div
                  style={{ fontSize: font.key }}
                >
                  {font.value}
                </div>
                {
                  fontSize === font.key && (
                    <RiCheckLine className='w-4 h-4 text-text-accent' />
                  )
                }
              </div>
            ))
          }
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default memo(FontSizeSelector)

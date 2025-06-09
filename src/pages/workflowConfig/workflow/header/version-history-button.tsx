import React, { type FC, useCallback } from 'react'
import { RiHistoryLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { useKeyPress } from 'ahooks'
import Button from '@/pages/workflowConfig/components/button'
import TipPopup from '@/pages/workflowConfig/workflow/operator/tip-popup'
import { getKeyboardKeyCodeBySystem } from '../utils'

type VersionHistoryButtonProps = {
  onClick: () => Promise<unknown> | unknown
  className?: string
}

const VERSION_HISTORY_SHORTCUT = ['⌘', '⇧', 'H']

// const PopupContent = React.memo(() => {
//   const { t } = useTranslation('plugin__console-plugin-appforge')
//   return (
//     <div className='flex items-center gap-x-1'>
//       <div className='text-text-secondary system-xs-medium px-0.5'>
//         {t('workflow.common.versionHistory')}
//       </div>
//       <div className='flex items-center gap-x-0.5'>
//         {VERSION_HISTORY_SHORTCUT.map(key => (
//           <span
//             key={key}
//             className='rounded-[4px] bg-components-kbd-bg-white text-text-tertiary system-kbd px-[1px]'
//           >
//             {key}
//           </span>
//         ))}
//       </div>
//     </div>
//   )
// })

// PopupContent.displayName = 'PopupContent'

const VersionHistoryButton: FC<VersionHistoryButtonProps> = ({
  onClick,
  className,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')

  const handleViewVersionHistory = useCallback(async () => {
    await onClick?.()
  }, [onClick])

  // useKeyPress(`${getKeyboardKeyCodeBySystem('ctrl')}.shift.h`, (e) => {
  //   e.preventDefault()
  //   handleViewVersionHistory()
  // }
  // , { exactMatch: true, useCapture: true })

  return <TipPopup
    title={t('workflow.common.versionHistory')}
  >
    <div className={`op-icon ${className}`} onClick={handleViewVersionHistory}>
      <RiHistoryLine className='size-[16px]' />
    </div>
  </TipPopup>
}

export default VersionHistoryButton

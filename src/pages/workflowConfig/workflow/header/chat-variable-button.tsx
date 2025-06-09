import React, { memo } from 'react'
import Button from '@/pages/workflowConfig/components/button'
import { RiBracesLine } from '@remixicon/react'
import { useStore } from '@/pages/workflowConfig/workflow/store'

const ChatVariableButton = ({ disabled }: { disabled: boolean }) => {
  const setShowChatVariablePanel = useStore(s => s.setShowChatVariablePanel)
  const setShowEnvPanel = useStore(s => s.setShowEnvPanel)
  const setShowDebugAndPreviewPanel = useStore(s => s.setShowDebugAndPreviewPanel)

  const handleClick = () => {
    setShowChatVariablePanel(true)
    setShowEnvPanel(false)
    setShowDebugAndPreviewPanel(false)
  }

  return (
    <Button className='p-2' disabled={disabled} onClick={handleClick}>
      <RiBracesLine className='w-4 h-4 text-components-button-secondary-text' />
    </Button>
  )
}

export default memo(ChatVariableButton)

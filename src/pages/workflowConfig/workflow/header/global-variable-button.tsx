import React, { memo } from 'react'
import Button from '@/pages/workflowConfig/components/button'
import { RiGlobalLine } from '@remixicon/react'
import { useStore } from '@/pages/workflowConfig/workflow/store'

const GlobalVariableButton = ({ disabled }: { disabled: boolean }) => {
  const setShowPanel = useStore(s => s.setShowGlobalVariablePanel)

  const handleClick = () => {
    setShowPanel(true)
  }

  return (
    <Button className='p-2' disabled={disabled} onClick={handleClick}>
      <RiGlobalLine className='w-4 h-4 text-components-button-secondary-text' />
    </Button>
  )
}

export default memo(GlobalVariableButton)

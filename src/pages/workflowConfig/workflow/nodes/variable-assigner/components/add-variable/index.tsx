import React, {
  memo,
  useCallback,
  useState,
} from 'react'
import { useVariableAssigner } from '../../hooks'
import type { VariableAssignerNodeType } from '../../types'
import cn from '@/pages/workflowConfig/utils/classnames'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/pages/workflowConfig/components/portal-to-follow-elem'
import { RiAddLine } from '@remixicon/react'
import AddVariablePopup from '@/pages/workflowConfig/workflow/nodes/_base/components/add-variable-popup'
import type {
  NodeOutPutVar,
  ValueSelector,
  Var,
} from '@/pages/workflowConfig/workflow/types'

export type AddVariableProps = {
  variableAssignerNodeId: string
  variableAssignerNodeData: VariableAssignerNodeType
  availableVars: NodeOutPutVar[]
  handleId?: string
}
const AddVariable = ({
  availableVars,
  variableAssignerNodeId,
  variableAssignerNodeData,
  handleId,
}: AddVariableProps) => {
  const [open, setOpen] = useState(false)
  const { handleAssignVariableValueChange } = useVariableAssigner()

  const handleSelectVariable = useCallback((v: ValueSelector, varDetail: Var) => {
    handleAssignVariableValueChange(
      variableAssignerNodeId,
      v,
      varDetail,
      handleId,
    )
    setOpen(false)
  }, [handleAssignVariableValueChange, variableAssignerNodeId, handleId, setOpen])

  return (
    <div className={cn(
      open && '!flex',
      variableAssignerNodeData.selected && '!flex',
    )}>
      <PortalToFollowElem
        placement={'right'}
        offset={4}
        open={open}
        onOpenChange={setOpen}
      >
        <PortalToFollowElemTrigger
          onClick={() => setOpen(!open)}
        >
          <div
            className={cn(
              'group/addvariable flex items-center justify-center',
              'w-4 h-4 cursor-pointer',
              'hover:rounded-full hover:bg-primary-600',
              open && '!rounded-full !bg-primary-600',
            )}
          >
            <RiAddLine
              className={cn(
                'w-2.5 h-2.5 text-gray-500',
                'group-hover/addvariable:text-white',
                open && '!text-white',
              )}
            />
          </div>
        </PortalToFollowElemTrigger>
        <PortalToFollowElemContent className='z-[1000]'>
          <AddVariablePopup
            onSelect={handleSelectVariable}
            availableVars={availableVars}
          />
        </PortalToFollowElemContent>
      </PortalToFollowElem>
    </div>
  )
}

export default memo(AddVariable)

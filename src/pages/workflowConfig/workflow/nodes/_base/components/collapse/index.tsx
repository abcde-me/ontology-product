import React, { useState } from 'react'
import { RiArrowDropRightLine } from '@remixicon/react'
import cn from '@/pages/workflowConfig/utils/classnames'

export { default as FieldCollapse } from './field-collapse'

type CollapseProps = {
  disabled?: boolean
  trigger: JSX.Element
  children: JSX.Element
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}
const Collapse = ({
  disabled,
  trigger,
  children,
  defaultCollapsed,
  collapsed,
  onCollapse,
}: CollapseProps) => {
  const [collapsedLocal, setCollapsedLocal] = useState(defaultCollapsed ?? true)
  const collapsedMerged = collapsed !== undefined ? collapsed : collapsedLocal

  return (
    <>
      <div
        className='flex items-center'
        onClick={() => {
          if (!disabled) {
            setCollapsedLocal(!collapsedMerged)
            onCollapse?.(!collapsedMerged)
          }
        }}
      >
        <div className='shrink-0 w-4 h-4'>
          {
            !disabled && (
              <RiArrowDropRightLine
                className={cn(
                  'w-4 h-4 text-text-tertiary cursor-pointer',
                  !collapsedMerged && 'transform rotate-90',
                )}
              />
            )
          }
        </div>
        {trigger}
      </div>
      {
        !collapsedMerged && children
      }
    </>
  )
}

export default Collapse

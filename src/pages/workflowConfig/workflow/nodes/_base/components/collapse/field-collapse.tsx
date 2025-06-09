import type { ReactNode } from 'react'
import Collapse from '.'
import React from 'react'

type FieldCollapseProps = {
  title: string
  children: ReactNode
  defaultCollapsed?: boolean
}
const FieldCollapse = ({
  title,
  children,
  defaultCollapsed = true
}: FieldCollapseProps) => {
  return (
    <div className='py-4'>
      <Collapse
        defaultCollapsed={defaultCollapsed}
        trigger={
          <div className='flex items-center h-6 system-sm-semibold-uppercase text-text-secondary cursor-pointer'>{title}</div>
        }
      >
        <div className='px-4'>
          {children}
        </div>
      </Collapse>
    </div>
  )
}

export default FieldCollapse

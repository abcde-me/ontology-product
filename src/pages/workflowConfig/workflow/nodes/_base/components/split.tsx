
import type { FC } from 'react'
import React from 'react'
import cn from '@/pages/workflowConfig/utils/classnames'

interface Props {
  className?: string
}

const Split: FC<Props> = ({
  className,
}) => {
  return (
    <div className={cn(className, 'h-[0.5px] bg-[#E8E9EB]')}>
    </div>
  )
}
export default React.memo(Split)

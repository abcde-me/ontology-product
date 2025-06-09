import type { FC } from 'react'
import React from 'react'
import cn from '@/pages/workflowConfig/utils/classnames'
import { RiAiGenerate, RiAiGenerate2 } from '@remixicon/react'

type ModelIconProps = {
  provider?: any
  modelName?: string
  className?: string
  isDeprecated?: boolean
}
const ModelIcon: FC<ModelIconProps> = ({
  provider,
  className,
  modelName,
  isDeprecated = false,
}) => {
  // console.log('model icon', provider)
  if (provider?.icon_small) {
    return (
      <div className={cn('flex items-center justify-center w-5 h-5', isDeprecated && 'opacity-50', className)}>
        <img alt='model-icon' src={provider.icon_small.zh_Hans}/>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center w-5 h-5', isDeprecated && 'opacity-50', className)}>
      <RiAiGenerate2 className='text-[#007DFA]'/>
    </div>
  )
}

export default ModelIcon

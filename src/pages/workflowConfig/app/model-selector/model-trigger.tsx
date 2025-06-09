import type { FC } from 'react'
import React from 'react'
import { RiArrowDownSLine, RiAlertLine } from '@remixicon/react'
import type {
  Model,
  ModelItem,
} from '@/pages/workflowConfig/models/model'
import {
  MODEL_STATUS_TEXT,
  ModelStatusEnum,
} from '@/pages/workflowConfig/models/model'
// import { useLanguage } from '@/pages/workflowConfig/hooks/use-model'
import ModelIcon from '../model-icon'
// import ModelName from '../model-name'
import Tooltip from '@/pages/workflowConfig/components/tooltip'
import cn from '@/pages/workflowConfig/utils/classnames'

type ModelTriggerProps = {
  open: boolean
  provider: Model
  model: ModelItem
  className?: string
  readonly?: boolean
}
const ModelTrigger: FC<ModelTriggerProps> = ({
  open,
  provider,
  model,
  className,
  readonly,
}) => {
  const language = 'zh_Hans'

  return (
    <div
      className={cn(
        'model-trigger',
        'group flex items-center p-1 h-8 gap-0.5 rounded-[4px] bg-components-input-bg-normal',
        !readonly && 'hover:bg-components-input-bg-hover cursor-pointer',
        open && 'bg-components-input-bg-hover',
        model.status !== ModelStatusEnum.active && 'bg-components-input-bg-disabled hover:bg-components-input-bg-disabled',
        className,
      )}
    >
      <ModelIcon
        className='p-0.5 !size-[16px]'
        provider={provider}
        modelName={model.model}
      />
      <div className='flex px-1 py-[3px] items-center gap-1 grow truncate justify-between'>
        {/* <ModelName
          className='grow'
          modelItem={model}
          showMode={false}
          showFeatures={false}
        /> */}
        {model.label[language] || model.label.en_US}
        {!readonly && (
          <div className='shrink-0 flex items-center justify-center w-4 h-4'>
            {
              model.status !== ModelStatusEnum.active
                ? (
                  <Tooltip popupContent={MODEL_STATUS_TEXT[model.status][language]}>
                    <RiAlertLine className='w-4 h-4 text-text-warning-secondary' />
                  </Tooltip>
                )
                : (
                  <RiArrowDownSLine
                    className={`w-[16px] h-[16px] text-[#334155] transition-transform ${open && 'transform rotate-180'}`}
                  />
                )
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelTrigger

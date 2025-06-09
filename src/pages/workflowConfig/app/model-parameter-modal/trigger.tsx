import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { RiArrowDownSLine } from '@remixicon/react'
import type {
  Model,
  ModelItem,
  ModelProvider,
} from '@/pages/workflowConfig/models/model'
import { MODEL_STATUS_TEXT } from '@/pages/workflowConfig/models/model'
import ModelIcon from '../model-icon'
// import ModelName from '../model-name'
import cn from '@/pages/workflowConfig/utils/classnames'
import { useProviderContext } from '@/pages/workflowConfig/context/provider-context'
import { RiAlertLine } from '@remixicon/react'
import Tooltip from '@/pages/workflowConfig/components/tooltip'

export type TriggerProps = {
  open?: boolean
  disabled?: boolean
  currentProvider?: ModelProvider | Model
  currentModel?: ModelItem
  providerName?: string
  modelId?: string
  hasDeprecated?: boolean
  modelDisabled?: boolean
  isInWorkflow?: boolean
  triggerClassName?: string
  showMode?: boolean
  showFeatures?: boolean
}
const Trigger: FC<TriggerProps> = ({
  triggerClassName,
  disabled,
  currentProvider,
  currentModel,
  providerName,
  modelId,
  hasDeprecated,
  modelDisabled,
  isInWorkflow,
  showMode = true,
  showFeatures = true,
  open,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const language = 'zh_Hans'
  const { modelProviders } = useProviderContext()

  return (
    <div
      className={cn(
        triggerClassName,
        'relative flex items-center px-2 h-8 rounded-[6px] cursor-pointer px-[12px] py-[8px]',
        !isInWorkflow && 'border ring-inset hover:ring-[0.5px]',
        !isInWorkflow && (disabled ? 'border-text-warning ring-text-warning bg-state-warning-hover' : 'border-util-colors-indigo-indigo-600 ring-util-colors-indigo-indigo-600 bg-state-accent-hover'),
        isInWorkflow && 'pr-[30px] bg-[white] border border-[#CBD5E1]',
      )}
    >
      {
        currentProvider && (
          <ModelIcon
            className='mr-[4px] !w-[16px] !h-[16px]'
            provider={currentProvider}
            modelName={currentModel?.model}
          />
        )
      }
      {
        !currentProvider && (
          <ModelIcon
            className='mr-[4px] !w-[16px] !h-[16px]'
            provider={modelProviders.find(item => item.provider === providerName)}
            modelName={modelId}
          />
        )
      }
      {
        currentModel && (
          // <ModelName
          //   className='mr-1.5 text-text-primary'
          //   modelItem={currentModel}
          //   showMode={showMode}
          //   showFeatures={showFeatures}
          // />
          <div className='text-[#1E293B] text-[12px]/[20px]'>{currentModel.label[language] || currentModel.label.en_US}</div>
        )
      }
      {
        !currentModel && (
          <div className='mr-1 text-[13px] font-medium text-text-primary truncate'>
            {modelId}
          </div>
        )
      }
      {
        !isInWorkflow ? (disabled
          ? (
            <Tooltip
              popupContent={
                hasDeprecated
                  ? t('common.modelProvider.deprecated')
                  : (modelDisabled && currentModel)
                    ? MODEL_STATUS_TEXT[currentModel.status as string][language]
                    : ''
              }
            >
              <RiAlertLine className='w-4 h-4 text-[#F79009]' />
            </Tooltip>
          )
          : (
            <RiArrowDownSLine className={cn('text-text-tertiary', 'shrink-0 w-4 h-4')} />
          )) : <></>
      }
      {isInWorkflow && (<RiArrowDownSLine className={`absolute top-[9px] right-2 w-[16px] h-[16px] text-[#334155] transition-transform ${open && 'transform rotate-180'}`} />)}
    </div>
  )
}

export default Trigger

import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiFileTextLine,
  RiFilmAiLine,
  RiImageCircleAiLine,
  RiVoiceAiFill,
} from '@remixicon/react'
import type {
  DefaultModel,
  Model,
  ModelItem,
} from '@/pages/workflowConfig/models/model'
import {
  ModelFeatureEnum,
  ModelFeatureTextEnum,
  ModelTypeEnum,
} from '@/pages/workflowConfig/models/model'
// import {
//   useLanguage,
//   useUpdateModelList,
//   useUpdateModelProviders,
// } from '@/pages/workflowConfig/hooks/use-model'
// import ModelIcon from '../model-icon'
// import ModelName from '../model-name'
import ModelBadge from '../model-badge'
import {
  ConfigurationMethodEnum,
  ModelStatusEnum,
} from '@/pages/workflowConfig/models/model'
import { RiCheckLine } from '@remixicon/react'
// import { useModalContext } from '@/pages/workflowConfig/context/modal-context'
import { useProviderContext } from '@/pages/workflowConfig/context/provider-context'
import Tooltip from '@/pages/workflowConfig/components/tooltip'
import cn from '@/pages/workflowConfig/utils/classnames'

type PopupItemProps = {
  defaultModel?: DefaultModel
  model: Model
  onSelect: (provider: string, model: ModelItem) => void
}


export const sizeFormat = (size: number) => {
  const remainder = Math.floor(size / 1000)
  if (remainder < 1)
    return `${size}`
  else
    return `${remainder}K`
}

export const modelTypeFormat = (modelType: ModelTypeEnum) => {
  if (modelType === ModelTypeEnum.textEmbedding)
    return 'TEXT EMBEDDING'

  return modelType.toLocaleUpperCase()
}

const PopupItem: FC<PopupItemProps> = ({
  defaultModel,
  model,
  onSelect,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const language = 'zh_Hans'
  // const { setShowModelModal } = useModalContext()
  const { modelProviders } = useProviderContext()
  // const updateModelList = useUpdateModelList()
  // const updateModelProviders = useUpdateModelProviders()
  const currentProvider = modelProviders.find(provider => provider.provider === model.provider)!
  const handleSelect = (provider: string, modelItem: ModelItem) => {
    if (modelItem.status !== ModelStatusEnum.active)
      return

    onSelect(provider, modelItem)
  }
  // const handleOpenModelModal = () => {
  //   setShowModelModal({
  //     payload: {
  //       currentProvider,
  //       currentConfigurationMethod: ConfigurationMethodEnum.predefinedModel,
  //     },
  //     onSaveCallback: () => {
  //       updateModelProviders()

  //       const modelType = model.models[0].model_type

  //       if (modelType)
  //         updateModelList(modelType)
  //     },
  //   })
  // }

  return (
    <div className='mb-1'>
      <div className='flex items-center px-3 h-[22px] text-xs font-medium text-text-tertiary'>
        {model.label[language] || model.label.en_US}
      </div>
      {
        model.models.map(modelItem => (
          <Tooltip
            key={modelItem.model}
            position='right'
            popupClassName='p-3 !w-[206px] bg-components-panel-bg-blur backdrop-blur-sm border-[0.5px] border-components-panel-border rounded-xl'
            popupContent={
              <div className='flex flex-col gap-1'>
                <div className='flex flex-col items-start gap-2'>
                  {/* <ModelIcon
                    className={cn('shrink-0 w-5 h-5')}
                    provider={model}
                    modelName={modelItem.model}
                  /> */}
                  <div className='text-text-primary system-md-medium text-wrap break-words'>{modelItem.label[language] || modelItem.label.en_US}</div>
                </div>
                {/* {currentProvider?.description && (
                  <div className='text-text-tertiary system-xs-regular'>{currentProvider?.description?.[language] || currentProvider?.description?.en_US}</div>
                )} */}
                <div className='flex flex-wrap gap-1'>
                  {modelItem.model_type && (
                    <ModelBadge>
                      {modelTypeFormat(modelItem.model_type)}
                    </ModelBadge>
                  )}
                  {modelItem.model_properties.mode && (
                    <ModelBadge>
                      {(modelItem.model_properties.mode as string).toLocaleUpperCase()}
                    </ModelBadge>
                  )}
                  {modelItem.model_properties.context_size && (
                    <ModelBadge>
                      {sizeFormat(modelItem.model_properties.context_size as number)}
                    </ModelBadge>
                  )}
                </div>
                {modelItem.model_type === ModelTypeEnum.textGeneration && modelItem.features?.some(feature => [ModelFeatureEnum.vision, ModelFeatureEnum.audio, ModelFeatureEnum.video, ModelFeatureEnum.document].includes(feature)) && (
                  <div className='pt-2'>
                    <div className='mb-1 text-text-tertiary system-2xs-medium-uppercase'>{t('common.model.capabilities')}</div>
                    <div className='flex flex-wrap gap-1'>
                      {modelItem.features?.includes(ModelFeatureEnum.vision) && (
                        <ModelBadge>
                          <RiImageCircleAiLine className='w-3.5 h-3.5 mr-0.5' />
                          <span>{ModelFeatureTextEnum.vision}</span>
                        </ModelBadge>
                      )}
                      {modelItem.features?.includes(ModelFeatureEnum.audio) && (
                        <ModelBadge>
                          <RiVoiceAiFill className='w-3.5 h-3.5 mr-0.5' />
                          <span>{ModelFeatureTextEnum.audio}</span>
                        </ModelBadge>
                      )}
                      {modelItem.features?.includes(ModelFeatureEnum.video) && (
                        <ModelBadge>
                          <RiFilmAiLine className='w-3.5 h-3.5 mr-0.5' />
                          <span>{ModelFeatureTextEnum.video}</span>
                        </ModelBadge>
                      )}
                      {modelItem.features?.includes(ModelFeatureEnum.document) && (
                        <ModelBadge>
                          <RiFileTextLine className='w-3.5 h-3.5 mr-0.5' />
                          <span>{ModelFeatureTextEnum.document}</span>
                        </ModelBadge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            }
          >
            <div
              key={modelItem.model}
              className={cn('group relative flex items-center px-3 py-1.5 h-8 rounded-lg gap-1', modelItem.status === ModelStatusEnum.active ? 'cursor-pointer hover:bg-state-base-hover' : 'cursor-not-allowed hover:bg-state-base-hover-alt')}
              onClick={() => handleSelect(model.provider, modelItem)}
            >
              <div className='flex items-center gap-2'>
                {/* <ModelIcon
                  className={cn('shrink-0 w-5 h-5')}
                  provider={model}
                  modelName={modelItem.model}
                /> */}
                {/* <ModelName
                  className={cn('text-text-secondary system-sm-medium', modelItem.status !== ModelStatusEnum.active && 'opacity-60')}
                  modelItem={modelItem}
                /> */}
                {modelItem.label[language] || modelItem.label.en_US}
              </div>
              {
                defaultModel?.model === modelItem.model && defaultModel.provider === currentProvider.provider && (
                  <RiCheckLine className='shrink-0 w-4 h-4 text-text-accent' />
                )
              }
              {/* {
                modelItem.status === ModelStatusEnum.noConfigure && (
                  <div
                    className='hidden group-hover:block text-xs font-medium text-text-accent cursor-pointer'
                    onClick={handleOpenModelModal}
                  >
                    {t('common.operation.add').toLocaleUpperCase()}
                  </div>
                )
              } */}
            </div>
          </Tooltip>
        ))
      }
    </div>
  )
}

export default PopupItem

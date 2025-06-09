import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiSearchLine,
} from '@remixicon/react'
import type {
  DefaultModel,
  Model,
  ModelItem,
} from '@/pages/workflowConfig/models/model'
import { ModelFeatureEnum } from '@/pages/workflowConfig/models/model'
// import { useLanguage } from '../hooks'
import PopupItem from './popup-item'
import { RiCloseCircleLine } from '@remixicon/react'
// import { useModalContext } from '@/pages/workflowConfig/context/modal-context'

type PopupProps = {
  defaultModel?: DefaultModel
  modelList: Model[]
  onSelect: (provider: string, model: ModelItem) => void
  scopeFeatures?: string[]
  onHide: () => void
}
const Popup: FC<PopupProps> = ({
  defaultModel,
  modelList,
  onSelect,
  scopeFeatures = [],
  onHide,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const language = 'zh_Hans'
  const [searchText, setSearchText] = useState('')
  // const { setShowAccountSettingModal } = useModalContext()

  const filteredModelList = useMemo(() => {
    return modelList.map((model) => {
      const filteredModels = model.models
        .filter((modelItem) => {
          if (modelItem.label[language] !== undefined)
            return modelItem.label[language].toLowerCase().includes(searchText.toLowerCase())
          return Object.values(modelItem.label).some(label =>
            label.toLowerCase().includes(searchText.toLowerCase()),
          )
        })
        .filter((modelItem) => {
          if (scopeFeatures.length === 0)
            return true
          return scopeFeatures.every((feature) => {
            if (feature === ModelFeatureEnum.toolCall)
              return modelItem.features?.some(featureItem => featureItem === ModelFeatureEnum.toolCall || featureItem === ModelFeatureEnum.multiToolCall)
            return modelItem.features?.some(featureItem => featureItem === feature)
          })
        })
      return { ...model, models: filteredModels }
    }).filter(model => model.models.length > 0)
  }, [language, modelList, scopeFeatures, searchText])

  return (
    <div className='w-[320px] max-h-[480px] rounded-[4px] border-[0.5px] border-components-panel-border bg-components-panel-bg shadow-lg overflow-y-auto'>
      <div className='sticky top-0 pl-3 pt-3 pr-2 pb-1 bg-components-panel-bg z-10'>
        <div className={`
          flex items-center pl-[9px] pr-[10px] h-8 rounded-[4px] border
          ${searchText ? 'bg-components-input-bg-active border-components-input-border-active shadow-xs' : 'bg-components-input-bg-normal border-transparent'}
        `}>
          <RiSearchLine
            className={`
              shrink-0 mr-[7px] w-[14px] h-[14px]
              ${searchText ? 'text-text-tertiary' : 'text-text-quaternary'}
            `}
          />
          <input
            className='block grow h-[18px] text-[13px] text-text-primary appearance-none outline-none bg-transparent rounded-[4px]'
            placeholder='输入名称'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {
            searchText && (
              <RiCloseCircleLine
                className='shrink-0 ml-1.5 w-[14px] h-[14px] text-text-quaternary cursor-pointer'
                onClick={() => setSearchText('')}
              />
            )
          }
        </div>
      </div>
      <div className='p-1'>
        {
          filteredModelList.map(model => (
            <PopupItem
              key={model.provider}
              defaultModel={defaultModel}
              model={model}
              onSelect={onSelect}
            />
          ))
        }
        {
          !filteredModelList.length && (
            <div className='px-3 py-1.5 leading-[18px] text-center text-xs text-text-tertiary break-all'>
              {`No model found for “${searchText}”`}
            </div>
          )
        }
      </div>
      {/* <div className='sticky bottom-0 px-4 py-2 flex items-center border-t border-divider-subtle cursor-pointer text-text-accent-light-mode-only bg-components-panel-bg rounded-b-lg' onClick={() => {
        onHide()
        setShowAccountSettingModal({ payload: 'provider' })
      }}>
        <span className='system-xs-medium'>{t('common.model.settingsLink')}</span>
        <RiArrowRightUpLine className='ml-0.5 w-3 h-3' />
      </div> */}
    </div>
  )
}

export default Popup

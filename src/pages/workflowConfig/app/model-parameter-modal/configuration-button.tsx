import Button from '@/pages/workflowConfig/components/button'
import { ConfigurationMethodEnum } from '@/pages/workflowConfig/models/model'
import { useTranslation } from 'react-i18next'
import React from 'react'

type ConfigurationButtonProps = {
  modelProvider: any
  handleOpenModal: any
}

const ConfigurationButton = ({ modelProvider, handleOpenModal }: ConfigurationButtonProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  return (
    <Button
      size="small"
      className="z-[100]"
      onClick={(e) => {
        e.stopPropagation()
        handleOpenModal(modelProvider, ConfigurationMethodEnum.predefinedModel, undefined)
      }}
    >
      <div className="flex px-[3px] justify-center items-center gap-1">
        {t('workflow.nodes.agent.notAuthorized')}
      </div>
      <div className="flex w-[14px] h-[14px] justify-center items-center">
        <div className="w-2 h-2 shrink-0 rounded-[3px] border border-components-badge-status-light-warning-border-inner
          bg-components-badge-status-light-warning-bg shadow-components-badge-status-light-warning-halo" />
      </div>
    </Button>
  )
}

export default ConfigurationButton

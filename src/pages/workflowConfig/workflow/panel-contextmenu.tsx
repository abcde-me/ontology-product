import React, {
  memo,
  useEffect,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'ahooks'
import Divider from '@/pages/workflowConfig/components/divider'
import ShortcutsName from './shortcuts-name'
import { useStore } from './store'
import {
  useDSL,
  useNodesInteractions,
  usePanelInteractions,
  useWorkflowStartRun,
} from './hooks'
import AddBlock from './operator/add-block'
import { useOperator } from './operator/hooks'
import cn from '@/pages/workflowConfig/utils/classnames'

const PanelContextmenu = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const ref = useRef(null)
  const panelMenu = useStore(s => s.panelMenu)
  const clipboardElements = useStore(s => s.clipboardElements)
  const setShowImportDSLModal = useStore(s => s.setShowImportDSLModal)
  const { handleNodesPaste } = useNodesInteractions()
  const { handlePaneContextmenuCancel, handleNodeContextmenuCancel } = usePanelInteractions()
  const { handleStartWorkflowRun } = useWorkflowStartRun()
  const { handleAddNote } = useOperator()
  const { exportCheck } = useDSL()

  useEffect(() => {
    if (panelMenu)
      handleNodeContextmenuCancel()
  }, [panelMenu, handleNodeContextmenuCancel])

  useClickAway(() => {
    handlePaneContextmenuCancel()
  }, ref)

  const renderTrigger = () => {
    return (
      <div
        className='flex items-center justify-between px-[12px] pt-[5px] pb-[7px] h-[32px] text-[14px]/[20px] text-[#151B26] rounded-none cursor-pointer hover:bg-[#D9EAFF]'
      >
        {t('workflow.common.addBlock')}
      </div>
    )
  }

  if (!panelMenu)
    return null

  return (
    <div
      className='app-workflow-page-panel-contextmenu absolute w-[200px] rounded-[4px] border-[0.5px] border-components-panel-border bg-components-panel-bg-blur shadow-lg z-[9]'
      style={{
        left: panelMenu.left,
        top: panelMenu.top,
      }}
      ref={ref}
    >
      <div className='py-[4px]'>
        <AddBlock
          renderTrigger={renderTrigger}
          offset={{
            mainAxis: -36,
            crossAxis: -4,
          }}
        />
        <div
          className='flex items-center justify-between px-[12px] pt-[5px] pb-[7px] h-[32px] text-[14px]/[20px] text-[#151B26] rounded-none cursor-pointer hover:bg-[#D9EAFF]'
          onClick={(e) => {
            e.stopPropagation()
            handleAddNote()
            handlePaneContextmenuCancel()
          }}
        >
          {t('workflow.nodes.note.addNote')}
        </div>
        <div
          className='flex items-center justify-between px-[12px] pt-[5px] pb-[7px] h-[32px] text-[14px]/[20px] text-[#151B26] rounded-none cursor-pointer hover:bg-[#D9EAFF]'
          onClick={() => {
            handleStartWorkflowRun()
            handlePaneContextmenuCancel()
          }}
        >
          {t('workflow.common.run')}
          {/* <ShortcutsName keys={['alt', 'r']} /> */}
        </div>
      </div>
      {/* <Divider className='m-0' />
      <div className='p-1'>
        <div
          className={cn(
            'flex items-center justify-between px-3 h-8 text-sm text-text-secondary rounded-lg cursor-pointer',
            !clipboardElements.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-state-base-hover',
          )}
          onClick={() => {
            if (clipboardElements.length) {
              handleNodesPaste()
              handlePaneContextmenuCancel()
            }
          }}
        >
          {t('workflow.common.pasteHere')}
          <ShortcutsName keys={['ctrl', 'v']} />
        </div>
      </div>
      <Divider className='m-0' />
      <div className='p-1'>
        <div
          className='flex items-center justify-between px-3 h-8 text-sm text-text-secondary rounded-lg cursor-pointer hover:bg-state-base-hover'
          onClick={() => exportCheck()}
        >
          {t('app.export')}
        </div>
        <div
          className='flex items-center justify-between px-3 h-8 text-sm text-text-secondary rounded-lg cursor-pointer hover:bg-state-base-hover'
          onClick={() => setShowImportDSLModal(true)}
        >
          {t('workflow.common.importDSL')}
        </div>
      </div> */}
    </div>
  )
}

export default memo(PanelContextmenu)

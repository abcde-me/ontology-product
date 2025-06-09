import type {
  FC,
  ReactElement,
} from 'react'
import React, {
  cloneElement,
  memo,
  useCallback,
} from 'react'
import {
  RiCloseLine,
  RiPlayLargeLine,
} from '@remixicon/react'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'
// import NextStep from './components/next-step'
// import PanelOperator from './components/panel-operator'
// import HelpLink from './components/help-link'
import {
  DescriptionInput,
  TitleInput,
} from './components/title-description-input'
// import ErrorHandleOnPanel from './components/error-handle/error-handle-on-panel'
// import RetryOnPanel from './components/retry/retry-on-panel'
import { useResizePanel } from './hooks/use-resize-panel'
import cn from '@/pages/workflowConfig/utils/classnames'
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon'
// import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split'
import {
  WorkflowHistoryEvent,
  useAvailableBlocks,
  useNodeDataUpdate,
  useNodesInteractions,
  useNodesReadOnly,
  useNodesSyncDraft,
  useToolIcon,
  useWorkflow,
  useWorkflowHistory,
} from '@/pages/workflowConfig/workflow/hooks'
// import {
//   canRunBySingle,
//   hasErrorHandleNode,
//   hasRetryNode,
// } from '@/pages/workflowConfig/workflow/utils'
// import Tooltip from '@/pages/workflowConfig/components/tooltip'
import type { Node } from '@/pages/workflowConfig/workflow/types'
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store'
import { useStore } from '@/pages/workflowConfig/workflow/store'

type BasePanelProps = {
  children: ReactElement
} & Node

const BasePanel: FC<BasePanelProps> = ({
  id,
  data,
  children,
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge')
  const { showMessageLogModal } = useAppStore(useShallow(state => ({
    showMessageLogModal: state.showMessageLogModal,
  })))
  const showSingleRunPanel = useStore(s => s.showSingleRunPanel)
  const panelWidth = localStorage.getItem('workflow-node-panel-width') ? Number.parseFloat(localStorage.getItem('workflow-node-panel-width')!) : 400
  const {
    setPanelWidth,
  } = useWorkflow()
  const { handleNodeSelect } = useNodesInteractions()
  const { handleSyncWorkflowDraft } = useNodesSyncDraft()
  const { nodesReadOnly } = useNodesReadOnly()
  const { availableNextBlocks } = useAvailableBlocks(data.type, data.isInIteration, data.isInLoop)
  const toolIcon = useToolIcon(data)

  const handleResize = useCallback((width: number) => {
    setPanelWidth(width)
  }, [setPanelWidth])

  const {
    triggerRef,
    containerRef,
  } = useResizePanel({
    direction: 'horizontal',
    triggerDirection: 'left',
    minWidth: 420,
    maxWidth: 720,
    onResize: handleResize,
  })

  const { saveStateToHistory } = useWorkflowHistory()

  const {
    handleNodeDataUpdate,
    handleNodeDataUpdateWithSyncDraft,
  } = useNodeDataUpdate()

  const handleTitleBlur = useCallback((title: string) => {
    handleNodeDataUpdateWithSyncDraft({ id, data: { title } })
    saveStateToHistory(WorkflowHistoryEvent.NodeTitleChange)
  }, [handleNodeDataUpdateWithSyncDraft, id, saveStateToHistory])
  const handleDescriptionChange = useCallback((desc: string) => {
    handleNodeDataUpdateWithSyncDraft({ id, data: { desc } })
    saveStateToHistory(WorkflowHistoryEvent.NodeDescriptionChange)
  }, [handleNodeDataUpdateWithSyncDraft, id, saveStateToHistory])

  return (
    <div className={cn(
      'relative mr-0 h-full wk-node-config-panel-wrapper',
      showMessageLogModal && '!absolute !mr-0 w-[384px] overflow-hidden -top-[5px] right-[416px] z-0 shadow-lg border-[0.5px] border-components-panel-border rounded-2xl transition-all',
    )}>
      {/* <div
        ref={triggerRef}
        className='expand-dragger absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-6 cursor-col-resize resize-x'>
        <div className='w-1 h-6 bg-divider-regular rounded-sm'></div>
      </div> */}
      <div
        ref={containerRef}
        className={cn('wk-node-panel-content-scroller-container h-full bg-components-panel-bg shadow-lg border-components-panel-border rounded-[12px]', showSingleRunPanel ? 'overflow-hidden' : 'overflow-y-auto')}
        style={{
          width: `${panelWidth}px`,
        }}
      >
        <div className='sticky top-0 bg-components-panel-bg z-10'>
          <div className='flex items-center px-[16px] pt-[20px] pb-[8px] title-wrapper'>
            <BlockIcon
              className='shrink-0 mr-[12px] size-[20px]'
              type={data.type}
              toolIcon={toolIcon}
              size='md'
            />
            <TitleInput
              value={data.title || ''}
              onBlur={handleTitleBlur}
              className="title-input"
            />
            <div className='shrink-0 flex items-center text-gray-500'>
              {/* {
                canRunBySingle(data.type) && !nodesReadOnly && (
                  <Tooltip
                    popupContent={t('workflow.panel.runThisStep')}
                    popupClassName='mr-1'
                  >
                    <div
                      className='flex items-center justify-center mr-1 w-6 h-6 rounded-md hover:bg-black/5 cursor-pointer'
                      onClick={() => {
                        handleNodeDataUpdate({ id, data: { _isSingleRun: true } })
                        handleSyncWorkflowDraft(true)
                      }}
                    >
                      <RiPlayLargeLine className='w-4 h-4 text-text-tertiary' />
                    </div>
                  </Tooltip>
                )
              }
              <HelpLink nodeType={data.type} />
              <PanelOperator id={id} data={data} showHelpLink={false} />
              <div className='mx-3 w-[1px] h-3.5 bg-divider-regular' /> */}
              <div
                className='flex items-center justify-center w-6 h-6 cursor-pointer'
                onClick={() => handleNodeSelect(id, true)}
              >
                <RiCloseLine className='w-[16px] h-[16px]' />
              </div>
            </div>
          </div>
          <div className='p-2 px-[16px] '>
            <DescriptionInput
              value={data.desc || ''}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className='mx-[16px] border-b-[0.5px] border-[#E8E9EB]'></div>
        </div>
        <div className='wk-node-panel-content-wrapper'>
          {cloneElement(children, { id, data })}
        </div>
        {/* <Split />
        {
          hasRetryNode(data.type) && (
            <RetryOnPanel
              id={id}
              data={data}
            />
          )
        }
        {
          hasErrorHandleNode(data.type) && (
            <ErrorHandleOnPanel
              id={id}
              data={data}
            />
          )
        } */}
        {/* {
          !!availableNextBlocks.length && (
            <div className='p-4 border-t-[0.5px] border-t-black/5'>
              <div className='flex items-center mb-1 system-sm-semibold-uppercase text-text-secondary'>
                {t('workflow.panel.nextStep').toLocaleUpperCase()}
              </div>
              <div className='mb-2 system-xs-regular text-text-tertiary'>
                {t('workflow.panel.addNextStep')}
              </div>
              <NextStep selectedNode={{ id, data } as Node} />
            </div>
          )
        } */}
      </div>
    </div>
  )
}

export default memo(BasePanel)

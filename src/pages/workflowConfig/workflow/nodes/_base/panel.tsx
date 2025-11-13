import type { FC, ReactElement } from 'react';
import React, { cloneElement, memo, useCallback } from 'react';
import { RiCloseLine } from '@remixicon/react';
import { useShallow } from 'zustand/react/shallow';
import {
  DescriptionInput,
  TitleInput
} from './components/title-description-input';
import { useResizePanel } from './hooks/use-resize-panel';
import cn from '@/pages/workflowConfig/utils/classnames';
import BlockIcon from '@/pages/workflowConfig/workflow/block-icon';
import {
  WorkflowHistoryEvent,
  useNodeDataUpdate,
  useNodesInteractions,
  // useToolIcon,
  useWorkflow,
  useWorkflowHistory
} from '@/pages/workflowConfig/workflow/hooks';
// import {
//   canRunBySingle,
//   hasErrorHandleNode,
//   hasRetryNode,
// } from '@/pages/workflowConfig/workflow/utils'
// import Tooltip from '@/pages/workflowConfig/components/tooltip'
import type { Node } from '@/pages/workflowConfig/workflow/types';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useStore } from '@/pages/workflowConfig/workflow/store';

type BasePanelProps = {
  children: ReactElement;
} & Node;

const BasePanel: FC<BasePanelProps> = ({ id, data, children }) => {
  const { showMessageLogModal } = useTaskStore(
    useShallow((state) => ({
      showMessageLogModal: state.showMessageLogModal
    }))
  );
  const showSingleRunPanel = useStore((s) => s.showSingleRunPanel);
  const panelWidth = localStorage.getItem('workflow-node-panel-width')
    ? Number.parseFloat(localStorage.getItem('workflow-node-panel-width')!)
    : 600;
  const { setPanelWidth } = useWorkflow();
  const { handleNodeSelect } = useNodesInteractions();
  // const toolIcon = useToolIcon(data);

  const handleResize = useCallback(
    (width: number) => {
      setPanelWidth(width);
    },
    [setPanelWidth]
  );

  const { containerRef } = useResizePanel({
    direction: 'horizontal',
    triggerDirection: 'left',
    minWidth: 420,
    maxWidth: 720,
    onResize: handleResize
  });

  const { saveStateToHistory } = useWorkflowHistory();

  const { handleNodeDataUpdateWithSyncDraft } =
    useNodeDataUpdate();

  const handleTitleBlur = useCallback(
    (title: string) => {
      handleNodeDataUpdateWithSyncDraft({ id, data: { title } });
      saveStateToHistory(WorkflowHistoryEvent.NodeTitleChange);
    },
    [handleNodeDataUpdateWithSyncDraft, id, saveStateToHistory]
  );
  const handleDescriptionChange = useCallback(
    (desc: string) => {
      handleNodeDataUpdateWithSyncDraft({ id, data: { desc } });
      saveStateToHistory(WorkflowHistoryEvent.NodeDescriptionChange);
    },
    [handleNodeDataUpdateWithSyncDraft, id, saveStateToHistory]
  );

  return (
    <div
      className={cn(
        'wk-node-config-panel-wrapper relative mr-0 h-full',
        showMessageLogModal &&
        '!absolute -top-[5px] right-[416px] z-0 !mr-0 w-[384px] overflow-hidden rounded-2xl border-[0.5px] border-components-panel-border shadow-lg transition-all'
      )}
    >
      {/* <div
        ref={triggerRef}
        className='expand-dragger absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-6 cursor-col-resize resize-x'>
        <div className='w-1 h-6 bg-divider-regular rounded-sm'></div>
      </div> */}
      <div
        ref={containerRef}
        className={cn(
          'wk-node-panel-content-scroller-container h-full rounded-[12px] border-components-panel-border bg-components-panel-bg shadow-lg',
          showSingleRunPanel ? 'overflow-hidden' : 'overflow-y-auto'
        )}
        style={{
          width: `${panelWidth}px`
        }}
      >
        <div className="sticky top-0 z-10 bg-components-panel-bg">
          <div className="title-wrapper flex items-center px-[16px] pb-[8px] pt-[20px]">
            <BlockIcon
              className="mr-[8px] size-[20px] shrink-0"
              type={data.type}
              // toolIcon={toolIcon}
              size="md"
            />
            <TitleInput
              value={data.title || ''}
              onBlur={handleTitleBlur}
              className="title-input"
            />
            <div className="flex shrink-0 items-center text-gray-500">
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
                className="flex h-6 w-6 cursor-pointer items-center justify-center"
                onClick={() => handleNodeSelect(id, true)}
              >
                <RiCloseLine className="h-[16px] w-[16px]" />
              </div>
            </div>
          </div>
          <div className="p-2 px-[16px] ">
            <DescriptionInput
              value={data.desc || ''}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className="mx-[16px] border-b-[0.5px] border-[#E8E9EB]"></div>
        </div>
        <div className="wk-node-panel-content-wrapper">
          {cloneElement(children, { id, data, parentRef: containerRef })}
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
  );
};

export default memo(BasePanel);

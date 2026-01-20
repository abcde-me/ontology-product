import React, { memo, useState } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiAlertLine,
  RiPlayCircleLine,
  RiPauseCircleLine
} from '@remixicon/react';
import {
  useIsChatMode,
  useNodesInteractions,
  useWorkflow,
  useWorkflowInteractions,
  useWorkflowRun
} from '../hooks';
import { ControlMode, WorkflowRunningStatus } from '../types';
import cn from '@/pages/workflowConfig/utils/classnames';
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger
} from '@/pages/workflowConfig/components/portal-to-follow-elem';
import Tooltip from '@/pages/workflowConfig/components/tooltip';
// import { useStore as useAppStore } from '@/pages/workflowConfig/app/store'
// import {
//   fetchChatRunHistory,
//   fetchWorkflowRunHistory,
// } from '@/service/workflow'
import Loading from '@/pages/workflowConfig/components/loading';
import {
  useStore,
  useWorkflowStore
} from '@/pages/workflowConfig/workflow/store';
import { RiHistoryLine } from '@remixicon/react';

type ViewHistoryProps = {
  withText?: boolean;
};
const ViewHistory = ({ withText }: ViewHistoryProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const isChatMode = useIsChatMode();
  const [open, setOpen] = useState(false);
  const { formatTimeFromNow } = useWorkflow();
  const { handleNodesCancelSelected } = useNodesInteractions();
  const { handleCancelDebugAndPreviewPanel } = useWorkflowInteractions();
  const workflowStore = useWorkflowStore();
  const setControlMode = useStore((s) => s.setControlMode);
  // const { appDetail, setCurrentLogItem, setShowMessageLogModal } = useAppStore(useShallow(state => ({
  //   appDetail: state.appDetail,
  //   setCurrentLogItem: state.setCurrentLogItem,
  //   setShowMessageLogModal: state.setShowMessageLogModal,
  // })))
  const appDetail = null as any;
  const setCurrentLogItem = () => {};
  const setShowMessageLogModal = () => {};
  const historyWorkflowData = useStore((s) => s.historyWorkflowData);
  const { handleBackupDraft } = useWorkflowRun();

  console.warn(
    'API NOT IMPLEMENTED',
    'fetchChatRunHistory',
    'fetchWorkflowRunHistory'
  );
  // const { data: runList, isLoading: runListLoading } = useSWR((appDetail && !isChatMode && open) ? `/apps/${appDetail.id}/workflow-runs` : null, fetchWorkflowRunHistory)
  // const { data: chatList, isLoading: chatListLoading } = useSWR((appDetail && isChatMode && open) ? `/apps/${appDetail.id}/advanced-chat/workflow-runs` : null, fetchChatRunHistory)
  const runList = [] as any;
  const runListLoading = false;
  const chatList = [] as any;
  const chatListLoading = false;

  const data = isChatMode ? chatList : runList;
  const isLoading = isChatMode ? chatListLoading : runListLoading;

  return (
    <PortalToFollowElem
      placement={withText ? 'bottom-start' : 'bottom-end'}
      offset={{
        mainAxis: 4,
        crossAxis: withText ? -8 : 10
      }}
      open={open}
      onOpenChange={setOpen}
    >
      <PortalToFollowElemTrigger onClick={() => setOpen((v) => !v)}>
        {withText && (
          <div
            className={cn(
              'flex h-8 items-center rounded-lg border-[0.5px] border-gray-200 bg-white px-3 shadow-xs',
              'cursor-pointer text-[13px] font-medium text-primary-600',
              open && '!bg-primary-50'
            )}
          >
            <RiPlayCircleLine className={'mr-1 h-4 w-4'} />
            {t('workflow.common.showRunHistory')}
          </div>
        )}
        {!withText && (
          <Tooltip popupContent={t('workflow.common.viewRunHistory')}>
            <div
              className={cn(
                'group flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-state-accent-hover',
                open && 'bg-state-accent-hover'
              )}
              onClick={() => {
                setCurrentLogItem();
                setShowMessageLogModal(false);
              }}
            >
              <RiPlayCircleLine
                className={cn(
                  'h-4 w-4 group-hover:text-components-button-secondary-accent-text',
                  open
                    ? 'text-components-button-secondary-accent-text'
                    : 'text-components-button-ghost-text'
                )}
              />
            </div>
          </Tooltip>
        )}
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className="z-[12]">
        <div
          className="ml-2 flex w-[240px] flex-col overflow-y-auto rounded-xl border-[0.5px] border-gray-200 bg-white shadow-xl"
          style={{
            maxHeight: 'calc(2 / 3 * 100vh)'
          }}
        >
          <div className="sticky top-0 flex items-center justify-between bg-white px-4 pt-3 text-base font-semibold text-gray-900">
            <div className="grow">{t('workflow.common.runHistory')}</div>
            <div
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center"
              onClick={() => {
                setCurrentLogItem();
                setShowMessageLogModal(false);
                setOpen(false);
              }}
            >
              <RiCloseLine className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          {isLoading && (
            <div className="flex h-10 items-center justify-center">
              <Loading />
            </div>
          )}
          {!isLoading && (
            <div className="p-2">
              {!data?.data.length && (
                <div className="py-12">
                  <RiPauseCircleLine className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <div className="text-center text-[13px] text-gray-400">
                    {t('workflow.common.notRunning')}
                  </div>
                </div>
              )}
              {data?.data.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'mb-0.5 flex cursor-pointer rounded-lg px-2 py-[7px] hover:bg-primary-50',
                    item.id === historyWorkflowData?.id && 'bg-primary-50'
                  )}
                  onClick={() => {
                    workflowStore.setState({
                      historyWorkflowData: item,
                      showInputsPanel: false,
                      showEnvPanel: false
                    });
                    handleBackupDraft();
                    setOpen(false);
                    handleNodesCancelSelected();
                    handleCancelDebugAndPreviewPanel();
                    setControlMode(ControlMode.Hand);
                  }}
                >
                  {!isChatMode &&
                    item.status === WorkflowRunningStatus.Stopped && (
                      <RiAlertLine className="mr-1.5 mt-0.5 h-3.5 w-3.5 text-[#F79009]" />
                    )}
                  {!isChatMode &&
                    item.status === WorkflowRunningStatus.Failed && (
                      <RiErrorWarningLine className="mr-1.5 mt-0.5 h-3.5 w-3.5 text-[#F04438]" />
                    )}
                  {!isChatMode &&
                    item.status === WorkflowRunningStatus.Succeeded && (
                      <RiCheckboxCircleLine className="mr-1.5 mt-0.5 h-3.5 w-3.5 text-[#12B76A]" />
                    )}
                  <div>
                    <div
                      className={cn(
                        'flex items-center text-[13px] font-medium leading-[18px]',
                        item.id === historyWorkflowData?.id &&
                          'text-primary-600'
                      )}
                    >
                      {`Test ${isChatMode ? 'Chat' : 'Run'}#${item.sequence_number}`}
                    </div>
                    <div className="flex items-center text-xs leading-[18px] text-gray-500">
                      {item.created_by_account?.name} ·{' '}
                      {formatTimeFromNow(
                        (item.finished_at || item.created_at) * 1000
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  );
};

export default memo(ViewHistory);

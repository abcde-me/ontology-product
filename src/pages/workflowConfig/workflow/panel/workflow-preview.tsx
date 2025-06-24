import React, { memo, useEffect, useState } from 'react';
import { RiClipboardLine, RiCloseLine } from '@remixicon/react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import ResultText from '../run/result-text';
import ResultPanel from '../run/result-panel';
import TracingPanel from '../run/tracing-panel';
import { useWorkflowInteractions } from '../hooks';
import { useStore } from '../store';
import { WorkflowRunningStatus } from '../types';
import Toast from '@/pages/workflowConfig/components/toast';
import InputsPanel from './inputs-panel';
import cn from '@/pages/workflowConfig/utils/classnames';
import Loading from '@/pages/workflowConfig/components/loading';
import Button from '@/pages/workflowConfig/components/button';

const WorkflowPreview = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { handleCancelDebugAndPreviewPanel } = useWorkflowInteractions();
  const workflowRunningData = useStore((s) => s.workflowRunningData);
  const showInputsPanel = useStore((s) => s.showInputsPanel);
  const showDebugAndPreviewPanel = useStore((s) => s.showDebugAndPreviewPanel);
  const [currentTab, setCurrentTab] = useState<string>(
    showInputsPanel ? 'INPUT' : 'TRACING'
  );

  const switchTab = (tab: string) => {
    setCurrentTab(tab);
  };

  useEffect(() => {
    if (showDebugAndPreviewPanel && showInputsPanel) setCurrentTab('INPUT');
  }, [showDebugAndPreviewPanel, showInputsPanel]);

  // useEffect(() => {
  //   if ((workflowRunningData?.result.status === WorkflowRunningStatus.Succeeded || workflowRunningData?.result.status === WorkflowRunningStatus.Failed) && !workflowRunningData.resultText && !workflowRunningData.result.files?.length)
  //     switchTab('DETAIL')
  // }, [workflowRunningData])

  return (
    <div
      className={`workflow-preview-panel flex h-full w-[400px] flex-col rounded-[12px] bg-white`}
    >
      <div className="flex items-center justify-between px-[16px] py-[20px] text-[16px]/[24px] font-semibold text-[#1E293B]">
        {`运行测试${!workflowRunningData?.result.sequence_number ? '' : `_${workflowRunningData?.result.sequence_number}`}`}
        <div
          className="cursor-pointer p-1"
          onClick={() => handleCancelDebugAndPreviewPanel()}
        >
          <RiCloseLine className="h-4 w-4 text-gray-500" />
        </div>
      </div>
      <div className="relative flex grow flex-col">
        <div className="mx-[16px] mb-[16px] flex shrink-0 items-center border-b-[1px] border-[#E8E9EB]">
          {showInputsPanel && (
            <div
              className={cn(
                'mr-[24px] cursor-pointer border-b-2 border-transparent pb-[3px] text-[14px] font-semibold leading-[24px] text-[#1E293B]',
                currentTab === 'INPUT' && '!border-[#007DFA]'
              )}
              onClick={() => switchTab('INPUT')}
            >
              输入/输出
            </div>
          )}
          {/* <div
            className={cn(
              'mr-6 py-3 border-b-2 border-transparent text-[13px] font-semibold leading-[18px] text-gray-400 cursor-pointer',
              currentTab === 'RESULT' && '!border-[rgb(21,94,239)] text-gray-700',
              !workflowRunningData && 'opacity-30 !cursor-not-allowed',
            )}
            onClick={() => {
              if (!workflowRunningData)
                return
              switchTab('RESULT')
            }}
          >{t('runLog.result')}</div>
          <div
            className={cn(
              'mr-6 py-3 border-b-2 border-transparent text-[13px] font-semibold leading-[18px] text-gray-400 cursor-pointer',
              currentTab === 'DETAIL' && '!border-[rgb(21,94,239)] text-gray-700',
              !workflowRunningData && 'opacity-30 !cursor-not-allowed',
            )}
            onClick={() => {
              if (!workflowRunningData)
                return
              switchTab('DETAIL')
            }}
          >{t('runLog.detail')}</div> */}
          <div
            className={cn(
              'cursor-pointer border-b-2 border-transparent pb-[3px] text-[14px] font-semibold leading-[24px] text-[#1E293B]',
              currentTab === 'TRACING' && '!border-[#007DFA]',
              !workflowRunningData && '!cursor-not-allowed opacity-30'
            )}
            onClick={() => {
              if (!workflowRunningData) return;
              switchTab('TRACING');
            }}
          >
            运行详情
          </div>
        </div>
        <div
          className={cn(
            'h-0 grow overflow-y-auto rounded-b-[12px] bg-components-panel-bg',
            (currentTab === 'RESULT' || currentTab === 'TRACING') &&
              '!bg-[white]'
          )}
        >
          {currentTab === 'INPUT' && showInputsPanel && (
            <InputsPanel onRun={() => switchTab('RESULT')} />
          )}
          {/* {currentTab === 'RESULT' && (
            <>
              <ResultText
                isRunning={workflowRunningData?.result?.status === WorkflowRunningStatus.Running || !workflowRunningData?.result}
                outputs={workflowRunningData?.resultText}
                allFiles={workflowRunningData?.result?.files as any}
                error={workflowRunningData?.result?.error}
                onClick={() => switchTab('DETAIL')}
              />
              {(workflowRunningData?.result.status === WorkflowRunningStatus.Succeeded && workflowRunningData?.resultText && typeof workflowRunningData?.resultText === 'string') && (
                <Button
                  className={cn('ml-4 mb-4 space-x-1')}
                  onClick={() => {
                    const content = workflowRunningData?.resultText
                    if (typeof content === 'string')
                      copy(content)
                    else
                      copy(JSON.stringify(content))
                    Toast.notify({ type: 'success', message: t('common.actionMsg.copySuccessfully') })
                  }}>
                  <RiClipboardLine className='w-3.5 h-3.5' />
                  <div>{t('common.operation.copy')}</div>
                </Button>
              )}
            </>
          )}
          {currentTab === 'DETAIL' && (
            <ResultPanel
              inputs={workflowRunningData?.result?.inputs}
              outputs={workflowRunningData?.result?.outputs}
              status={workflowRunningData?.result?.status || ''}
              error={workflowRunningData?.result?.error}
              elapsed_time={workflowRunningData?.result?.elapsed_time}
              total_tokens={workflowRunningData?.result?.total_tokens}
              created_at={workflowRunningData?.result?.created_at}
              created_by={(workflowRunningData?.result?.created_by as any)?.name}
              steps={workflowRunningData?.result?.total_steps}
              exceptionCounts={workflowRunningData?.result?.exceptions_count}
            />
          )}
          {currentTab === 'DETAIL' && !workflowRunningData?.result && (
            <div className='flex h-full items-center justify-center bg-components-panel-bg'>
              <Loading />
            </div>
          )} */}
          {currentTab === 'TRACING' && (
            <TracingPanel
              className="bg-[white]"
              list={workflowRunningData?.tracing || []}
            />
          )}
          {currentTab === 'TRACING' &&
            !workflowRunningData?.tracing?.length && (
              <div className="flex h-full items-center justify-center !bg-background-section-burn">
                <Loading />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default memo(WorkflowPreview);

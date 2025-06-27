import { FC, useState } from 'react';
import React, { memo, useCallback, useMemo } from 'react';
import { RiPlayFill, RiStopFill } from '@remixicon/react';
import { useNodes } from 'reactflow';
import { useTranslation } from 'react-i18next';
import { useContext, useContextSelector } from 'use-context-selector';
import { useStore, useWorkflowStore } from '../store';
import { BlockEnum, InputVarType } from '../types';
import type { StartNodeType } from '../nodes/start/types';
import {
  useChecklistBeforePublish,
  useIsChatMode,
  useNodesInteractions,
  useNodesReadOnly,
  useNodesSyncDraft,
  useWorkflowMode,
  useWorkflowRun
} from '../hooks';
import Toast, { ToastContext } from '@/pages/workflowConfig/components/toast';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import AppContext from '@/pages/workflowConfig/context/app-context';
import { useWorkflowStartRun } from '../hooks';
import { WorkflowRunningStatus } from '../types';
import cn from '@/pages/workflowConfig/utils/classnames';
import Checklist from './checklist';
import ZoomInOut from './zoom-in-out';
import AddBlock from './add-block';
import UndoRedo from './undo-redo';

export type HeaderProps = {
  handleUndo: () => void;
  handleRedo: () => void;
};

const Header: FC<HeaderProps> = (props) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const workflowStore = useWorkflowStore();
  const appDetail = useTaskStore((s) => s.workflowDetail);
  const setAppDetail = useTaskStore((s) => s.setWorkflowDetail);
  const systemFeatures = useContextSelector(
    AppContext,
    (state) => state.systemFeatures
  );
  const appID = appDetail?.workflow_uuid;
  const isChatMode = useIsChatMode();
  const { nodesReadOnly, getNodesReadOnly } = useNodesReadOnly();
  const { handleNodeSelect } = useNodesInteractions();
  const publishedAt = useStore((s) => s.publishedAt);
  const draftUpdatedAt = useStore((s) => s.draftUpdatedAt);
  const toolPublished = useStore((s) => s.toolPublished);
  const currentVersion = useStore((s) => s.currentVersion);
  const setShowWorkflowVersionHistoryPanel = useStore(
    (s) => s.setShowWorkflowVersionHistoryPanel
  );
  const setShowEnvPanel = useStore((s) => s.setShowEnvPanel);
  const setShowDebugAndPreviewPanel = useStore(
    (s) => s.setShowDebugAndPreviewPanel
  );
  const nodes = useNodes<StartNodeType>();
  const startNode = nodes.find((node) => node.data.type === BlockEnum.Start);

  const { handleLoadBackupDraft, handleBackupDraft } = useWorkflowRun();
  const { handleCheckBeforePublish } = useChecklistBeforePublish();
  const { handleSyncWorkflowDraft } = useNodesSyncDraft();
  const { notify } = useContext(ToastContext);
  const { normal, restoring, viewHistory } = useWorkflowMode();

  const RunMode = memo(() => {
    const { t } = useTranslation('plugin__console-plugin-appforge');
    const { handleWorkflowStartRunInWorkflow } = useWorkflowStartRun();
    const { handleStopRun } = useWorkflowRun();
    const workflowRunningData = useStore((s) => s.workflowRunningData);
    const isRunning =
      workflowRunningData?.result.status === WorkflowRunningStatus.Running;

    return (
      <>
        <div
          className={cn('run-action-btn', isRunning ? 'is-running' : '')}
          onClick={() =>
            isRunning
              ? handleStopRun(workflowRunningData?.task_id || '')
              : handleWorkflowStartRunInWorkflow()
          }
        >
          {isRunning ? (
            <RiStopFill className="play-icon" />
          ) : (
            <RiPlayFill className="play-icon" />
          )}
          <span className="text-[12px]/[20px]">
            {isRunning ? '停止' : '运行'}
          </span>
        </div>
      </>
    );
  });
  RunMode.displayName = 'RunMode';

  return (
    <div className="app-workflow-page-sub-header absolute left-0 top-0 z-10 flex items-center">
      <AddBlock />
      <div className="separator" />
      <ZoomInOut />
      <div className="separator" />
      <UndoRedo handleUndo={props.handleUndo} handleRedo={props.handleRedo} />
      <div className="separator" />
      <Checklist disabled={nodesReadOnly} />
      <RunMode />
    </div>
  );
};

export default memo(Header);

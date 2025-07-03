import { FC, useRef, useState } from 'react';
import React, { memo, useCallback, useMemo } from 'react';
import { useNodes } from 'reactflow';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useContext, useContextSelector } from 'use-context-selector';
import { useStore, useWorkflowStore } from '../store';
import { BlockEnum, InputVarType } from '../types';
import type { StartNodeType } from '../nodes/start/types';
import { useUserInfo } from '@/store/userInfoStore';
import {
  useChecklistBeforePublish,
  useIsChatMode,
  useNodesInteractions,
  useNodesReadOnly,
  useNodesSyncDraft,
  useWorkflowMode,
  useWorkflowRun,
  useWorkflowTemplate
} from '../hooks';
import TaskOperation from '@/pages/workflowConfig/workflow/header/components/task-operation';
import { ToastContext } from '@/pages/workflowConfig/components/toast';
import EditingTitle from './editing-title';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import type { PublishWorkflowParams } from '@/pages/workflowConfig/types/workflow';
import AppContext from '@/pages/workflowConfig/context/app-context';
import { getAppDetail } from '@/api/appsV2';
import { operateWorkflow } from '@/api/workflow';
import BackIcon from '@/pages/workflowConfig/styles/images/op-icons/back.svg';
import { IsOnline, WorkflowOperation } from '@/types/workflowApi';
import {
  Button,
  Input,
  Modal,
  Popover,
  Space,
  Typography
} from '@arco-design/web-react';
import { RiCheckboxCircleFill } from '@remixicon/react';
import './index.scss';
import { createWorkflowDraft } from '@/api/workflowV2';
import { version } from 'os';

const SuccessModal = ({ visible, onClose }) => {
  return (
    <Modal
      title={null}
      visible={visible}
      footer={null}
      closable={false}
      style={{ textAlign: 'start' }}
    >
      <Space style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
        <RiCheckboxCircleFill
          className="h-5 w-5 text-text-success"
          aria-hidden="true"
        />

        <Typography.Title heading={6} style={{ marginTop: 0, marginBottom: 0 }}>
          已成功提交运行
        </Typography.Title>
      </Space>

      <Typography.Text
        type="secondary"
        style={{ margin: '4px 0 16px', lineHeight: '22px', display: 'block' }}
      >
        运行详情请到作业（job_123）中查看。
      </Typography.Text>

      <Space
        size="medium"
        style={{ marginBottom: 20, justifyContent: 'end', width: '100%' }}
      >
        <Button onClick={onClose}>关闭</Button>
        <Button type="primary" onClick={onClose}>
          去查看
        </Button>
      </Space>
    </Modal>
  );
};

const Header: FC = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const history = useHistory();
  const [showRuningModal, setShowRuningModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  const workflowStore = useWorkflowStore();
  const userInfo = useUserInfo();
  const appDetail = useTaskStore((s) => s.workflowDetail);
  const setAppDetail = useTaskStore((s) => s.setWorkflowDetail);
  const workflowUuid = appDetail?.workflow_uuid ?? '';
  const dsWorkflowId = appDetail?.ds_workflow_id ?? 0;
  const workflowStatus = appDetail?.is_online ?? IsOnline.online;
  const cycleText = appDetail?.cycle_text ?? {
    minute: '',
    hour: '',
    date: '',
    month: '',
    week: ''
  };
  const { nodesReadOnly, getNodesReadOnly } = useNodesReadOnly();
  const { handleNodeSelect } = useNodesInteractions();
  const publishedAt = useStore((s) => s.publishedAt);
  const draftUpdatedAt = useStore((s) => s.draftUpdatedAt);
  const toolPublished = useStore((s) => s.toolPublished);
  const setShowWorkflowVersionHistoryPanel = useStore(
    (s) => s.setShowWorkflowVersionHistoryPanel
  );
  const setShowEnvPanel = useStore((s) => s.setShowEnvPanel);
  const setShowDebugAndPreviewPanel = useStore(
    (s) => s.setShowDebugAndPreviewPanel
  );
  const nodes = useNodes<StartNodeType>();
  const startNode = nodes.find((node) => node.data.type === BlockEnum.Start);
  const selectedNode = nodes.find((node) => node.data.selected);
  const startVariables = startNode?.data.variables;
  const fileSettings = {} as any;
  const variables = useMemo(() => {
    const data = startVariables || [];
    if (fileSettings?.image?.enabled) {
      return [
        ...data,
        {
          type: InputVarType.files,
          variable: '__image',
          required: false,
          label: 'files'
        }
      ];
    }

    return data;
  }, [fileSettings?.image?.enabled, startVariables]);

  const { handleLoadBackupDraft, handleBackupDraft } = useWorkflowRun();
  const { handleCheckBeforePublish } = useChecklistBeforePublish();
  const { handleSyncWorkflowDraft } = useNodesSyncDraft();
  const { notify } = useContext(ToastContext);
  const { normal, restoring, viewHistory } = useWorkflowMode();

  console.warn('API NOT IMPLEMENTED ', 'resetWorkflowVersionHistory');
  const resetWorkflowVersionHistory = () => {}; // 这里是重新查询version history，暂时无用

  const updateAppDetail = useCallback(async () => {
    try {
      const result = await getAppDetail(workflowUuid);
      const res = result.data;
      setAppDetail({ ...res });
    } catch (error) {
      console.error(error);
    }
  }, [workflowUuid, setAppDetail]);

  const onOperate = useCallback(
    async (op: WorkflowOperation, params?: PublishWorkflowParams) => {
      // if (!handleCheckBeforePublish()) {
      //   throw new Error('Checklist failed');
      // }

      if (op === WorkflowOperation.ONLINE) {
        handleSyncWorkflowDraft(
          true,
          true,
          {
            onSuccess: async () => {
              const workflowRes = await operateWorkflow(workflowUuid ?? '', {
                uid: userInfo?.id ?? '',
                ds_workflow_id: dsWorkflowId ?? 0,
                op,
                // @ts-expect-error
                cycle_text: params?.cycleText ?? {}
              });

              if (workflowRes?.data) {
                notify({ type: 'success', message: '上线成功' });
              } else {
                notify({
                  type: 'error',
                  message: workflowRes?.message ?? '上线失败'
                });
              }
            },
            onError: () => {
              notify({
                type: 'error',
                message: '上线失败'
              });
            }
          },
          {
            version: 'publish'
          }
        );

        return;
      }

      const workflowRes = await operateWorkflow(workflowUuid ?? '', {
        uid: userInfo?.id ?? '',
        ds_workflow_id: dsWorkflowId ?? 0,
        op,
        // TODO: ts错误
        // @ts-expect-error
        cycle_text: params?.cycleText
      });

      if (op === WorkflowOperation.OFFLINE) {
        if (workflowRes?.data) {
          notify({ type: 'success', message: '下线成功', duration: 100000 });
        } else {
          notify({
            type: 'error',
            message: workflowRes?.message ?? '下线失败'
          });
        }
      } else if (op === WorkflowOperation.RUNNING) {
        if (workflowRes?.data) {
          setShowRuningModal(true);
        } else {
          notify({
            type: 'error',
            message: workflowRes?.message ?? '运行失败'
          });
        }
      } else if (op === WorkflowOperation.CRON_RUNNING) {
        if (workflowRes?.data) {
          setShowRuningModal(true);
        } else {
          notify({
            type: 'error',
            message: workflowRes?.message ?? '运行失败'
          });
        }
      }
    },
    [
      workflowUuid,
      handleCheckBeforePublish,
      notify,
      t,
      workflowStore,
      resetWorkflowVersionHistory,
      updateAppDetail
    ]
  );

  const onPublisherToggle = useCallback(
    (state: boolean) => {
      if (state) handleSyncWorkflowDraft(true);
    },
    [handleSyncWorkflowDraft]
  );

  const handleToolConfigureUpdate = useCallback(() => {
    workflowStore.setState({ toolPublished: true });
  }, [workflowStore]);

  const handleWorkflowNameChange = (workflow_name: string) => {
    appDetail &&
      setAppDetail({
        ...appDetail,
        workflow_name
      });
  };

  const handleEdit = () => {
    setEditing(true);
    // @ts-expect-error
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    setEditing(false);
    // 这里可以添加保存逻辑
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="app-workflow-page-header absolute left-0 top-0 z-10 flex h-14 w-full items-center justify-between bg-mask-top2bottom-gray-50-to-transparent px-3">
      <div className="left-part">
        <div
          className="back-icon"
          onClick={() => history.push('/tenant/compute/modaforge/workflowList')}
        >
          <BackIcon className="size-[16px]" />
        </div>
        <div className="app-info">
          {editing ? (
            <Input
              className="app-name--editing"
              ref={inputRef}
              value={appDetail?.workflow_name}
              onChange={handleWorkflowNameChange}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              style={{ width: 200 }}
            />
          ) : (
            <div className="app-name">
              <span className="txt">{appDetail?.workflow_name}</span>
              <Popover trigger="hover" title="编辑">
                <div className="eidt-icon" onClick={handleEdit}></div>
              </Popover>
            </div>
          )}
          {normal && <EditingTitle />}
        </div>
      </div>
      <div className="right-part">
        <TaskOperation
          {...{
            workflowStatus,
            cycleText,
            publishedAt,
            draftUpdatedAt,
            disabled: nodesReadOnly,
            toolPublished,
            inputs: variables,
            onRefreshData: handleToolConfigureUpdate,
            onOperate,
            onToggle: onPublisherToggle,
            crossAxisOffset: 4
          }}
        />
      </div>
      <SuccessModal
        visible={showRuningModal}
        onClose={() => setShowRuningModal(false)}
      />
    </div>
  );
};

export default memo(Header);

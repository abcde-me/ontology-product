import { FC, useRef, useState } from 'react';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useContext } from 'use-context-selector';
import { useWorkflowStore } from '../store';
import { useUserInfo } from '@/store/userInfoStore';
import {
  useChecklistBeforePublish,
  useNodesInteractions,
  useNodesSyncDraft
} from '../hooks';
import TaskOperation from '@/pages/workflowConfig/workflow/header/components/task-operation';
import { ToastContext } from '@/pages/workflowConfig/components/toast';
import EditingTitle from './editing-title';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { getAppDetail } from '@/api/appsV2';
import {
  editWorkflow,
  getWorkflowDetail,
  operateWorkflow
} from '@/api/workflow';
import BackIcon from '@/pages/workflowConfig/styles/images/op-icons/back.svg';
import {
  IsOnline,
  WorkflowOperation,
  WorkflowOperationParams
} from '@/types/workflowApi';
import {
  Button,
  Input,
  Message,
  Modal,
  Popover,
  Space,
  Typography
} from '@arco-design/web-react';
import { RiCheckboxCircleFill } from '@remixicon/react';
import './index.scss';
import { useShallow } from 'zustand/react/shallow';
import { getQueryParams, useParams } from '@/utils/url';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { validateName } from '@/utils/valiate';
import { WORKFLOW_DETAIL_PERMISSIONS } from '@/config/permissions';

const SuccessModal = ({ visible, params, onClose }) => {
  const { workflow_uuid, ds_workflow_id, workflow_version, job_id } =
    params ?? {};
  const history = useHistory();
  const handleClick = () => {
    const jumpUrl = `/tenant/compute/modaforge/workflowTaskDetail?id=${job_id}&workflow_uuid=${workflow_uuid}&ds_workflow_id=${ds_workflow_id}&workflow_version=${workflow_version}`;
    history.push(jumpUrl);
  };

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
        {`运行详情请到作业（${job_id}）中查看。`}
      </Typography.Text>

      <Space
        size="medium"
        style={{ marginBottom: 20, justifyContent: 'end', width: '100%' }}
      >
        <Button onClick={onClose}>关闭</Button>
        <Button type="primary" onClick={handleClick}>
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
  const [workflowOperationRes, setWorkflowOperationRes] = useState();
  const inputRef = useRef<RefInputType>(null);
  const workflowUuid = useParams('workflow_uuid') ?? '';
  const workflowVersion = useParams('workflow_version');
  const { handleNodeSelect } = useNodesInteractions();

  const { setWorkflowDetail } = useTaskStore(
    useShallow((state) => ({
      setWorkflowDetail: state.setWorkflowDetail
    }))
  );

  const updateWorkFlowStatus = async () => {
    const workflowDetailRes = await getWorkflowDetail(workflowUuid, {
      workflow_version: workflowVersion
    });

    if (workflowDetailRes?.data) {
      setWorkflowDetail(workflowDetailRes.data);
    }
  };

  const workflowStore = useWorkflowStore();
  const userInfo = useUserInfo();
  const appDetail = useTaskStore((s) => s.workflowDetail);
  const setAppDetail = useTaskStore((s) => s.setWorkflowDetail);
  const [workflowName, setWorkflowName] = useState(
    appDetail?.workflow_name ?? ''
  );
  const cycleText = appDetail?.cycle_text ?? {
    minute: '',
    hour: '',
    date: '',
    month: '',
    week: ''
  };
  const workflowPerms = appDetail?.perms ?? [];
  // url上携带版本，隐藏上下线、运行、工作流名称编辑操作，主要场景：作业详情跳转到工作流详情
  const headerOperationDisplay = !workflowVersion;

  const { handleCheckBeforePublish } = useChecklistBeforePublish();
  const { handleSyncWorkflowDraft } = useNodesSyncDraft();
  const { notify } = useContext(ToastContext);

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
    async (op: WorkflowOperation, params?: WorkflowOperationParams) => {
      if (op !== WorkflowOperation.OFFLINE) {
        if (!handleCheckBeforePublish()) {
          throw new Error('Checklist failed');
        }
      }

      if (op === WorkflowOperation.ONLINE) {
        handleNodeSelect('', false);
        // 上线前，保存画布最新信息
        handleSyncWorkflowDraft(
          true,
          true,
          {
            onSuccess: async () => {
              const ds_workflow_id =
                getQueryParams(history, 'ds_workflow_id') ?? '';
              const workflowRes = await operateWorkflow(workflowUuid ?? '', {
                uid: userInfo?.id ?? '',
                ds_workflow_id: Number(ds_workflow_id),
                op
              });

              if (workflowRes?.status === 200) {
                Message.success('上线成功');
                updateWorkFlowStatus();
              } else {
                Message.error(workflowRes?.message ?? '上线失败');
              }
            },
            onError: () => {
              Message.error('上线失败');
            }
          },
          {
            version: 'publish'
          }
        );

        return;
      }

      const ds_workflow_id = getQueryParams(history, 'ds_workflow_id') ?? '';
      const workflowRes = await operateWorkflow(workflowUuid ?? '', {
        uid: userInfo?.id ?? '',
        ds_workflow_id: Number(ds_workflow_id),
        op,
        cycle_text: params?.cycle_text
      });

      if (op === WorkflowOperation.OFFLINE) {
        if (workflowRes?.status === 200) {
          Message.success('下线成功');
          updateWorkFlowStatus();
        } else {
          Message.error(workflowRes?.message ?? '下线失败');
        }
      } else if (op === WorkflowOperation.RUNNING) {
        if (workflowRes?.data) {
          setWorkflowOperationRes(workflowRes.data);
          setShowRuningModal(true);
        } else {
          Message.error(workflowRes?.message ?? '运行失败');
        }
      } else if (op === WorkflowOperation.CRON_RUNNING) {
        if (workflowRes?.status === 200) {
          Message.success('定时任务设置成功');
        } else {
          Message.error(workflowRes?.message ?? '定时任务设置失败');
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

  const handleWorkflowNameChange = (workflow_name: string) => {
    setWorkflowName(workflow_name);
  };

  const handleEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = async (workflow_name: string) => {
    setEditing(false);

    if (workflowName === appDetail?.workflow_name) {
      return;
    }

    // 这里可以添加保存逻辑
    const workflowRes = await editWorkflow(workflowUuid ?? '', {
      workflow_name
    });

    if (workflowRes?.status === 200) {
      appDetail &&
        setAppDetail({
          ...appDetail,
          workflow_name
        });
      Message.success('修改工作流名称成功');
    } else {
      setWorkflowName(appDetail?.workflow_name ?? '');
      Message.error(workflowRes?.message ?? '修改工作流名称失败');
    }
  };

  const handlePressEnter = (workflow_name: string) => {
    const validateResult = validateName(workflowName);
    if (!validateResult.isValid && validateResult.errorMessage) {
      Message.error(validateResult.errorMessage);
      setEditing(false);
      setWorkflowName(appDetail?.workflow_name ?? '');
      return;
    }

    handleSave(workflow_name);
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
              value={workflowName}
              onChange={handleWorkflowNameChange}
              onBlur={() => handleSave(workflowName)}
              onPressEnter={() => handlePressEnter(workflowName)}
            />
          ) : (
            <div className="app-name">
              <Typography.Paragraph
                className="app-name-text"
                style={{ maxWidth: '700px' }}
                ellipsis={{ cssEllipsis: true, rows: 1, showTooltip: true }}
              >
                {appDetail?.workflow_name}
              </Typography.Paragraph>
              {headerOperationDisplay &&
                workflowPerms.includes(
                  WORKFLOW_DETAIL_PERMISSIONS.CAN_UPDATE
                ) && (
                  <Popover trigger="hover" content="编辑">
                    <div className="eidt-icon" onClick={handleEdit}></div>
                  </Popover>
                )}
            </div>
          )}
          <EditingTitle />
        </div>
      </div>
      {headerOperationDisplay &&
        workflowPerms.includes(WORKFLOW_DETAIL_PERMISSIONS.CAN_OPERATION) && (
          <>
            <div className="right-part">
              <TaskOperation
                {...{
                  workflowStatus: appDetail?.is_online ?? IsOnline.offline,
                  cycleText,
                  onOperate
                }}
              />
            </div>
            <SuccessModal
              visible={showRuningModal}
              onClose={() => setShowRuningModal(false)}
              params={workflowOperationRes}
            />
          </>
        )}
    </div>
  );
};

export default memo(Header);

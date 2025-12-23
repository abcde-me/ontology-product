import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  IconCaretRight,
  IconLoading,
  IconRecordStop
} from '@arco-design/web-react/icon';
import { Button, Drawer, Tooltip, Typography } from '@arco-design/web-react';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';
import { useNodesInteractions } from '@/pages/workflowConfig/workflow/hooks';
import { TaskStatus } from '@/pages/workflowConfig/types/workflow';
import styles from './index.module.scss';
import { useRequest } from 'ahooks';
import { getWorkflowTaskLogs } from '@/api/workflowV2';

export default memo(function TestNode(props: {
  id: React.Key;
  showLog?: boolean;
}) {
  const { showLog = false, id: nodeId } = props;
  const [drawerLog, setDrawerLog] = useState(false);
  const { handleTestNode, handleStopTestNode } = useNodesInteractions();
  const logCache = useRef<string>();

  const { nodesProcessDetail } = useTaskStore(
    useShallow((state) => ({
      nodesProcessDetail: state.nodesProcessDetail
    }))
  );

  const nodeProcessStatus = useMemo(() => {
    return nodesProcessDetail?.find(({ task_code }) => {
      return task_code.toString() === nodeId.toString();
    });
  }, [nodeId, nodesProcessDetail]);

  const {
    data: logs,
    loading: logLoading,
    cancel
  } = useRequest(
    async () => {
      if (!drawerLog || !nodeProcessStatus) return;
      return await getWorkflowTaskLogs(nodeProcessStatus.id);
    },
    {
      refreshDeps: [nodeProcessStatus, drawerLog],
      ready: drawerLog,
      pollingInterval: 2000,
      onSuccess(logs?: string) {
        if (!logs) return;
        if (logs !== logCache.current) {
          logCache.current = logs;
          return;
        }
        cancel();
      }
    }
  );

  const handleStop = useCallback(() => {
    if (!nodeProcessStatus) return;
    const { process_instance_id } = nodeProcessStatus;
    handleStopTestNode(process_instance_id);
  }, [nodeProcessStatus]);

  const badgeColor = useMemo(() => {
    const state = nodeProcessStatus?.state;
    if (state === TaskStatus.FAILURE) return '#EF4444';
    if (state === TaskStatus.SUCCESS) return '#10B981';
    return '#007DFA';
  }, [nodeProcessStatus]);

  console.log(123, nodesProcessDetail);

  return (
    <div className={'flex flex-1 items-center justify-end gap-2'}>
      {showLog && nodeProcessStatus && (
        <div className={'flex flex-1 flex-shrink-0 items-center gap-1'}>
          <div
            className={`h-2 w-2 rounded-[8px]`}
            style={{ background: badgeColor }}
          />

          {nodeProcessStatus?.state_name && (
            <Typography.Text>{nodeProcessStatus.state_name}</Typography.Text>
          )}
          {nodeProcessStatus?.duration && (
            <Typography.Text>
              {`(${nodeProcessStatus.duration})`}
            </Typography.Text>
          )}
          <Button
            type={'text'}
            className={'p-0'}
            onClick={() => setDrawerLog(true)}
          >
            查看日志
          </Button>
        </div>
      )}
      <Tooltip
        content={
          nodeProcessStatus?.state === TaskStatus.RUNNING_EXECUTION
            ? '暂停'
            : '运行'
        }
      >
        {nodeProcessStatus?.state === TaskStatus.RUNNING_EXECUTION ? (
          <Tooltip content={''}>
            <IconRecordStop
              className={
                'h-4 w-4 cursor-pointer text-[#007DFA] text-text-tertiary'
              }
              onClick={handleStop}
            />
          </Tooltip>
        ) : (
          <IconCaretRight
            className={'h-4 w-4 cursor-pointer text-text-tertiary'}
            onClick={() => handleTestNode(nodeId as string)}
          />
        )}
      </Tooltip>
      <Drawer
        title={'日志'}
        visible={drawerLog}
        mask={false}
        maskClosable={false}
        onCancel={() => setDrawerLog(false)}
        footer={null}
        placement={'bottom'}
        className={styles['task-log-drawer']}
        getPopupContainer={() => {
          return (
            document.querySelector('#workFlowNodeConfigPanel') || document.body
          );
        }}
      >
        <div className={`${styles['log-content']}`}>
          {logs}
          {logLoading && <IconLoading />}
        </div>
      </Drawer>
    </div>
  );
});

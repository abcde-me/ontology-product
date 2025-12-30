import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  IconCaretRight,
  IconLoading,
  IconRecordStop
} from '@arco-design/web-react/icon';
import {
  Button,
  Drawer,
  Message,
  Tooltip,
  Typography
} from '@arco-design/web-react';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';
import { useNodesInteractions } from '@/pages/workflowConfig/workflow/hooks';
import styles from './index.module.scss';
import { useDebounceFn, useRequest } from 'ahooks';
import { getWorkflowTaskLogs } from '@/api/workflowV2';
import { TASK_NODE_RUN_STATUS_MAP } from '@/pages/workflowTask/common/constants';
import { TaskNodeStatus } from '@/types/workflowTaskApi';
import { nodeIsRunning } from '@/pages/workflowConfig/workflow/nodes/utils';
import { isNil } from 'lodash-es';

export default memo(function TestNode(props: {
  id: React.Key;
  showLog?: boolean;
}) {
  const { showLog = false, id: nodeId } = props;
  const [drawerLog, setDrawerLog] = useState(false);
  const { handleTestNode, handleStopTestNode } = useNodesInteractions();
  const logSet = useRef<Set<string>>(new Set<string>());
  const startNum = useRef(0);

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
    data: logsData,
    loading: logLoading,
    cancel
  } = useRequest(
    async () => {
      // 无运行状态或者抽屉没打开时不发起请求
      if (!drawerLog || !nodeProcessStatus) {
        cancel();
        return;
      }
      const res = await getWorkflowTaskLogs(
        nodeProcessStatus.id,
        startNum.current
      );
      if (!res.data) {
        Message.error('获取日志失败');
        cancel();
        return {
          logs: Array.from(logSet.current),
          skip_line_num: 0
        };
      }
      const { message, skip_line_num } = res.data;
      if (!logSet.current.has(message)) {
        logSet.current.add(message);
      }
      startNum.current += 100;
      if (!message) {
        cancel();
        startNum.current = 0;
      }
      return {
        logs: Array.from(logSet.current),
        skip_line_num
      };
    },
    {
      refreshDeps: [nodeProcessStatus, drawerLog],
      ready: drawerLog,
      pollingInterval: 2000
    }
  );

  const handleStop = useCallback(() => {
    if (!nodeProcessStatus?.process_instance_id) return;
    const { process_instance_id } = nodeProcessStatus;
    handleStopTestNode(process_instance_id);
  }, [nodeProcessStatus]);

  const badgeColor = useMemo(() => {
    const defaultColor = '#666';
    if (!nodeProcessStatus?.state) return defaultColor;
    return (
      TASK_NODE_RUN_STATUS_MAP[nodeProcessStatus.state]?.color || defaultColor
    );
  }, [nodeProcessStatus]);

  useEffect(() => {
    if (!showLog) return;
    if (nodeProcessStatus?.state === TaskNodeStatus.SUCCESS) {
      setDrawerLog(true);
    }
  }, [nodeProcessStatus?.state]);
  const startNodeTest = useCallback(() => {
    handleTestNode(nodeId.toString());
  }, [nodeId]);

  const { run: operateNode } = useDebounceFn(
    (type: 'test' | 'stop') => {
      if (type === 'test') return startNodeTest();
      return handleStop();
    },
    { wait: 200 }
  );

  return (
    <div className={'flex flex-1 flex-shrink-0 items-center justify-end gap-2'}>
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
          {!isNil(nodeProcessStatus?.id) && (
            <Button
              type={'text'}
              className={'p-0'}
              onClick={() => setDrawerLog(true)}
            >
              查看日志
            </Button>
          )}
        </div>
      )}
      <Tooltip
        content={
          nodeIsRunning(nodeProcessStatus?.state) ? '暂停测试' : '测试该节点'
        }
      >
        {nodeIsRunning(nodeProcessStatus?.state) ? (
          <Tooltip content={''}>
            <IconRecordStop
              className={`h-4 w-4 ${styles['node-operator']}`}
              onClick={() => operateNode('stop')}
            />
          </Tooltip>
        ) : (
          <IconCaretRight
            className={`h-4 w-4 ${styles['node-operator']}`}
            onClick={() => operateNode('test')}
          />
        )}
      </Tooltip>
      <Drawer
        title={'日志'}
        visible={drawerLog && showLog}
        mask={false}
        maskClosable={false}
        onCancel={() => {
          startNum.current = 0;
          logSet.current.clear();
          setDrawerLog(false);
        }}
        closable
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
          {logsData?.logs.map((log, index, arr) => {
            return (
              <div key={index}>
                {log}
                {logLoading && index === arr.length - 1 && <IconLoading />}
              </div>
            );
          })}
        </div>
      </Drawer>
    </div>
  );
});

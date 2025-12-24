import { useEffect, useRef } from 'react';
import { useParams as useSearchParam } from '@/utils/url';
import { useRequest } from 'ahooks';
import { getWorkflowLastTask, getWorkflowNodeTask } from '@/api/workflowV2';
import { TaskStatus } from '@/pages/workflowConfig/types/workflow';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';
import { isNil } from 'lodash-es';
import { WorkflowTaskStatus } from '@/types/workflowTaskApi';

export default function useInitFlowTestTask(manual = false) {
  const ds_workflow_id = useSearchParam('ds_workflow_id');
  const jobCache = useRef<number>();
  const { setNodesProcessDetail } = useTaskStore(
    useShallow((state) => ({
      setNodesProcessDetail: state.setNodesProcessDetail
    }))
  );
  const {
    data: lastFlowTask,
    run: initFlowTestTask,
    cancel: cancelQueryTask
  } = useRequest(
    async (job_id?: number) => {
      if (ds_workflow_id && ds_workflow_id !== '0') {
        jobCache.current = job_id;
        return await getWorkflowLastTask({
          process_definition_code: +ds_workflow_id,
          trigger_code: job_id
        });
      }
    },
    {
      refreshDeps: [ds_workflow_id],
      manual,
      ready: !!ds_workflow_id,
      pollingInterval: 500,
      pollingWhenHidden: false,
      onSuccess(flowTask) {
        if (isNil(jobCache.current)) {
          cancelQueryTask();
        }
        if (!flowTask) return;
        const id = flowTask?.id;
        cancelQueryTask();
        getNodesProcessData(id)
          .then(setNodesProcessDetail)
          .catch(console.error);
      }
    }
  );
  const { cancel } = useRequest(
    () => {
      if (!lastFlowTask) return Promise.resolve([]);
      const { id } = lastFlowTask;
      return getNodesProcessData(id);
    },
    {
      pollingInterval: 5000,
      ready: !!lastFlowTask,
      onSuccess(res) {
        if (!res.length) return cancel();
        const taskIsRunning = res.some((nodeProcess) => {
          const { state } = nodeProcess;
          return [
            /** 正在运行 */
            WorkflowTaskStatus.RUNNING_EXECUTION,
            /** 提交成功 */
            WorkflowTaskStatus.SUBMITTED_SUCCESS,
            /** 等待执行 */
            WorkflowTaskStatus.WAIT_TO_RUN,
            /** 延迟执行 */
            WorkflowTaskStatus.DELAY_EXECUTION,
            /** 串行等待 */
            WorkflowTaskStatus.SERIAL_WAIT,
            /** 准备阻塞 */
            WorkflowTaskStatus.READY_BLOCK,
            /** 运行阻塞 */
            WorkflowTaskStatus.BLOCK
          ].includes(state as WorkflowTaskStatus);
        });
        if (!taskIsRunning) {
          cancel();
        }
        setNodesProcessDetail(res);
      }
    }
  );

  const getNodesProcessData = async (task_id) => {
    const nodesProcessData = await getWorkflowNodeTask(task_id);
    return nodesProcessData;
  };

  const stopQueryProcess = () => {
    cancel();
    cancelQueryTask();
  };

  useEffect(() => {
    return stopQueryProcess;
  }, []);

  return [initFlowTestTask, stopQueryProcess];
}

import { useEffect, useRef } from 'react';
import { useParams as useSearchParam } from '@/utils/url';
import { useRequest } from 'ahooks';
import { getWorkflowLastTask, getWorkflowNodeTask } from '@/api/workflowV2';
import { TaskStatus } from '@/pages/workflowConfig/types/workflow';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';
import { isNil } from 'lodash-es';

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
          return state === TaskStatus.RUNNING_EXECUTION;
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

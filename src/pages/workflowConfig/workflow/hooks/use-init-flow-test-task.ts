import { useEffect } from 'react';
import { useParams as useSearchParam } from '@/utils/url';
import { useWorkflowStore } from '@/pages/workflowConfig/workflow/store';
import { useRequest } from 'ahooks';
import { getWorkflowLastTask, getWorkflowNodeTask } from '@/api/workflowV2';
import { TaskStatus } from '@/pages/workflowConfig/types/workflow';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';

export default function useInitFlowTestTask(manual = false) {
  const ds_workflow_id = useSearchParam('ds_workflow_id');
  const { setNodesProcessDetail } = useTaskStore(
    useShallow((state) => ({
      setNodesProcessDetail: state.setNodesProcessDetail
    }))
  );
  const { data: lastFlowTask, run: initFlowTestTask } = useRequest(
    async () => {
      if (ds_workflow_id && ds_workflow_id !== '0')
        return await getWorkflowLastTask(+ds_workflow_id);
    },
    {
      refreshDeps: [ds_workflow_id],
      manual,
      ready: !!ds_workflow_id,
      onSuccess(flowTask) {
        if (!flowTask) return;
        const id = flowTask?.id;
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
          return;
        }
        setNodesProcessDetail(res);
      }
    }
  );

  const getNodesProcessData = async (task_id) => {
    const nodesProcessData = await getWorkflowNodeTask(task_id);
    return nodesProcessData;
  };

  useEffect(() => {
    return cancel;
  }, []);

  return [initFlowTestTask];
}

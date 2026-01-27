import { useEffect, useRef } from 'react';
import { useParams as useSearchParam } from '@/utils/url';
import { useRequest } from 'ahooks';
import { getWorkflowLastTask, getWorkflowNodeTask } from '@/api/workflowV2';
import { TaskStatus } from '@/pages/workflowConfig/types/workflow';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';
import { isNil } from 'lodash-es';
import { TaskNodeStatus, WorkflowTaskStatus } from '@/types/workflowTaskApi';
import { nodeIsRunning } from '@/pages/workflowConfig/workflow/nodes/utils';
import { useNodesReadOnly } from '@/pages/workflowConfig/workflow/hooks/use-workflow';

export default function useInitFlowTestTask() {
  const ds_workflow_id = useSearchParam('ds_workflow_id');
  // 记录当前轮询的作业
  const jobCache = useRef<number>();

  const { nodesReadOnly } = useNodesReadOnly();
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
      if (ds_workflow_id && ds_workflow_id !== '0' && !nodesReadOnly) {
        jobCache.current = job_id;
        // 运行记录不是实时产生的，需要拿着jobID去轮询查找，
        // 只要有这个jobid就一定会查到数据，只是时间问题，后端如是说
        return await getWorkflowLastTask({
          process_definition_code: +ds_workflow_id,
          trigger_code: job_id
        });
      }
    },
    {
      refreshDeps: [ds_workflow_id],
      manual: true,
      ready: !!ds_workflow_id,
      pollingInterval: 500,
      pollingWhenHidden: false,
      onSuccess(flowTask) {
        // 当前作业为空时不再轮询
        if (isNil(jobCache.current)) {
          cancelQueryTask();
        }
        if (!flowTask) return;
        cancelQueryTask();
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
      pollingWhenHidden: false,
      refreshDeps: [lastFlowTask],
      onSuccess(res) {
        if (!res.length) return cancel();
        setNodesProcessDetail(res);
        const taskIsRunning = res.some((nodeProcess) => {
          const { state } = nodeProcess;
          return nodeIsRunning(state);
        });
        if (!taskIsRunning) {
          cancel();
        }
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

  return [initFlowTestTask, stopQueryProcess];
}

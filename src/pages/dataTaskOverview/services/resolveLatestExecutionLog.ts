import { getMockLogsByTaskId } from '@/pages/dataTask/executionLog/mocks/mockData';
import { fetchExecutionLogList } from '@/pages/dataTask/executionLog/services/api';
import { RunStatus } from '@/pages/dataTask/executionLog/types';
import type { ExecutionLogItem } from '@/pages/dataTask/executionLog/types';
import { USE_MOCK } from '@/pages/dataTask/mocks';
import { ExecutionStatus } from '@/pages/dataTask/types';

const executionStatusToRunStatus = (status: ExecutionStatus): RunStatus => {
  switch (status) {
    case ExecutionStatus.RUNNING:
      return RunStatus.RUNNING;
    case ExecutionStatus.SUCCESS:
      return RunStatus.SUCCESS;
    case ExecutionStatus.FAILED:
      return RunStatus.FAILED;
    default:
      return RunStatus.RUNNING;
  }
};

export const resolveLatestExecutionLog = async (
  taskId: string,
  executionStatus: ExecutionStatus
): Promise<ExecutionLogItem | null> => {
  const targetStatus = executionStatusToRunStatus(executionStatus);

  if (USE_MOCK) {
    const logs = getMockLogsByTaskId(taskId);
    return logs.find((log) => log.status === targetStatus) || logs[0] || null;
  }

  const result = await fetchExecutionLogList({
    taskId,
    pageNo: 1,
    pageSize: 20
  });

  const items = result.items || [];
  return items.find((log) => log.status === targetStatus) || items[0] || null;
};

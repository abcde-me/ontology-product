import { TaskNodeStatus } from '@/types/workflowTaskApi';

export const findVariableNameById = (
  id: string | number,
  dataSource: Array<any>,
  name: any
) => {
  const variable = dataSource?.find((item: any) => item?.id === id);
  return variable?.[name];
};

export const nodeIsRunning = (state?: TaskNodeStatus) => {
  if (!state) return false;
  return [
    /** 正在运行 */
    TaskNodeStatus.RUNNING_EXECUTION,
    /** 提交成功 */
    TaskNodeStatus.SUBMITTED_SUCCESS,
    /** 延迟执行 */
    TaskNodeStatus.DELAY_EXECUTION,
    /** 分配中 */
    TaskNodeStatus.DISPATCH,
    /** 需要容错 */
    TaskNodeStatus.NEED_FAULT_TOLERANCE,
    /** 延迟执行 */
    TaskNodeStatus.DELAY_EXECUTION
  ].includes(state);
};

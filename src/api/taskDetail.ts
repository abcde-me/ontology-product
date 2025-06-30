import UAPI from '@/api';

// 作业列表
export async function getTaskDetail(task_id: number | string) {
  return await UAPI.RES.taskDetail({ task_id }).get().inRegion().do();
}

import UAPI from '@/api';

// 作业列表
export async function getTaskList(params: {
  uid: string | number;
  job_id: string;
  page: number;
  page_size: number;
}) {
  return await UAPI.RES.taskList({}).get(params).inRegion().do();
}

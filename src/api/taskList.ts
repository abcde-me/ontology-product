import UAPI from '@/api';

// 作业列表
export async function getTaskList(params: {
  uid: string | number;
  search_value: string;
  page: number;
  page_size: number;
  status: string;
  sort: string;
  sort_by: string;
}) {
  return await UAPI.RES.taskList({}).get(params).inRegion().do();
}

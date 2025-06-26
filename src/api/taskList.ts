import UAPI from '@/api';

// 作业列表
export async function getTaskList(
  params: any[] | Record<string | number, any> | undefined
) {
  return await UAPI.RES.taskList({}).get(params).inRegion().do();
}

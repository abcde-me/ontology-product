import UAPI from '@/api';

// 作业详情
export async function getTaskDetail(task_id: string) {
  return await UAPI.RES.taskDetail({ task_id }).get().inRegion().do();
}

// 作业详情节点
export async function getTaskDetailNode(params: {
  id: string;
  task_type: string;
  search_key?: string;
  page?: number;
  page_size?: number;
}) {
  return await UAPI.RES.taskDetailNode({}).get(params).inRegion().do();
}

// 作业重跑
export async function taskRerun(params: { id: string; uid: string }) {
  return await UAPI.RES.taskRerun({}).post(params).inRegion().do();
}

// 作业停止
export async function taskStop(params: { id: string; uid: string }) {
  return await UAPI.RES.taskStop({}).post(params).inRegion().do();
}

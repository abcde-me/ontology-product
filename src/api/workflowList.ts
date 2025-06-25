import UAPI from '@/api';

export async function getWorkflowList(
  params: any[] | Record<string | number, any> | undefined
) {
  return await UAPI.RES.workflowList({}).get(params).inRegion().do();
}

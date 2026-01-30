import { getOntologyTopology } from '@/api/ontologyScene/graph';
import type { GetWorkflowResponse } from '@ceai-front/workflow';
import { buildWorkflowFromTopology } from './topologyWorkflowAdapter';

type ApiResult<T> = {
  code?: string | number;
  status?: string | number;
  message?: string;
  data: T;
};

let currentWorkflow: GetWorkflowResponse | null = null;

export async function getWorkflow() {
  console.log('--------getWorkflow---------');
  if (!currentWorkflow) {
    const res = await getOntologyTopology({});
    currentWorkflow = buildWorkflowFromTopology(res.data);
  }

  console.log('-------getWorkflow1111--------', currentWorkflow);

  return Promise.resolve({
    code: 'ResourceNotFound',
    data: null,
    message: '资源不存在'
  });
}

export async function createWorkflow(
  params: Record<string, any>
): Promise<ApiResult<GetWorkflowResponse>> {
  console.log('--------createWorkflow---------');
  if (!currentWorkflow) {
    const res = await getOntologyTopology({});
    currentWorkflow = buildWorkflowFromTopology(res.data);
  }
  currentWorkflow = {
    ...currentWorkflow,
    ...params
  } as GetWorkflowResponse;

  return {
    code: 0,
    status: 200,
    message: 'created',
    data: currentWorkflow
  };
}

export function updateWorkflow(params: Record<string, any>): Promise<{
  code: number;
  status: number;
  message: string;
  data: any;
}> {
  console.log('--------updateWorkflow---------');
  const now = Math.ceil(Date.now() / 1000);
  const payload = {
    ...(currentWorkflow ?? {}),
    ...params,
    hash: String(now),
    updated_at: now
  };
  currentWorkflow = payload as GetWorkflowResponse;

  return Promise.resolve({
    code: 0,
    status: 200,
    message: 'updated',
    data: {}
  });
}

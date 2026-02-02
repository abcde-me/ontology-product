import { getOntologyTopology } from '@/api/ontologyScene/graph';
import type { GetWorkflowResponse } from '@ceai-front/workflow';

type ApiResult<T> = {
  code?: string | number;
  status?: string | number;
  message?: string;
  data: T;
};

const currentWorkflow: GetWorkflowResponse | null = null;

let draft = {};

const computeHashSync = (jsonObject: any) => {
  // 将对象序列化为标准JSON字符串
  const jsonString = JSON.stringify(jsonObject);

  let hash = 0;

  // 简单的哈希算法实现
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }

  // 转换为32位无符号整数，然后转为十六进制
  const unsignedHash = hash >>> 0;
  return unsignedHash.toString(16).padStart(8, '0');
};

export async function getWorkflow() {
  return Promise.resolve({ data: draft as any });
}

export function createWorkflow(params: Record<string, any>) {
  draft = {
    ...params,
    hash: computeHashSync(draft),
    updated_at: Math.ceil(Date.now() / 1000)
  };
  console.log('createWorkflow', draft);
  return Promise.resolve({ data: draft as any });
}

export function updateWorkflow(params: Record<string, any>): Promise<{
  code: number;
  status: number;
  message: string;
  data: any;
}> {
  return Promise.resolve({
    code: 0,
    status: 200,
    message: 'updated',
    data: {}
  });
}

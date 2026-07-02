import { getFunctionDetail } from '@/api/ontologySceneLibrary/ontologyFunction';
import type { OntologyFunctionVersionSnapshot } from '@/types/ontologyFunctionVersion';

export async function captureFunctionSnapshot(
  functionId: number
): Promise<OntologyFunctionVersionSnapshot> {
  const detail = await getFunctionDetail(functionId);

  if (!detail) {
    throw new Error('获取函数详情失败');
  }

  return {
    name: detail.name || '',
    code: detail.code || '',
    description: detail.description || '',
    content: detail.content || '',
    params: detail.params || []
  };
}

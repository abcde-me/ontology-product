import UAPI from '@/api';
import { Get, Post } from '@/utils/request';
import { PythonListRes, PythonListParams } from '@/types/pythonApi';

// 获取数据目录列表
export async function getCatalogList(
  id: string,
  params: PythonListParams
): Promise<ApiRes<PythonListRes>> {
  return await UAPI.RES.pythonListApi({ id }).post(params).inRegion().do();
}

import UAPI from '@/api';
import { Get, Post } from '@/utils/request';

// 获取数据目录列表
export async function getCatalogList(id: string, params: any = {}) {
  return await UAPI.RES.pythonListApi({ id }).post(params).inRegion().do();
}

import UAPI from '@/api';
import { SetStateAction } from 'react';

export interface MetadataMenuItem {
  datasourceType: string;
  datasourceName: string;
}

// 数据API
// 获取数据API列表
export async function openDataList(params: Record<string | number, any>) {
  return await UAPI.RES.openDataListApi({}).post(params).inRegion().do();
}

// 查看数据API文档
export async function openDataGetApiDoc(params: Record<string | number, any>) {
  return await UAPI.RES.openDataGetApiDocApi({}).post(params).inRegion().do();
}

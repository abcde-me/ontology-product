import UAPI from '@/api';
import {
  CreateDevelopScriptParams,
  CreateDevelopScriptResponse,
  EditDevelopScriptParams,
  EditDevelopScriptResponse,
  GetDevelopScriptInfoParams,
  GetDevelopScriptInfoResponse,
  ListDevelopScriptParams,
  ListDevelopScriptResponse
} from '@/types/sqlDevelopApi';

/**
 * 获取开发SQL脚本列表
 */
export const listDevelopScript = (
  params: ListDevelopScriptParams
): Promise<ApiRes<ListDevelopScriptResponse>> => {
  return UAPI.RES.listDevelopScriptApi({}).post(params).inRegion().do();
};

/**
 * 创建开发SQL脚本
 */
export const createDevelopScript = (
  params: CreateDevelopScriptParams
): Promise<ApiRes<CreateDevelopScriptResponse>> => {
  return UAPI.RES.createDevelopScriptApi({}).post(params).inRegion().do();
};

/**
 * 保存开发SQL脚本
 */
export const editDevelopScript = (
  params: EditDevelopScriptParams
): Promise<ApiRes<EditDevelopScriptResponse>> => {
  return UAPI.RES.editDevelopScriptApi({}).post(params).inRegion().do();
};

/**
 * 获取开发SQL脚本详情
 */
export const getDevelopScriptInfo = (
  params: GetDevelopScriptInfoParams
): Promise<ApiRes<GetDevelopScriptInfoResponse>> => {
  return UAPI.RES.getDevelopScriptInfoApi({}).post(params).inRegion().do();
};

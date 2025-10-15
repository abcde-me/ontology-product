import UAPI from '@/api';

// 列出项目
export function GetProjOrg(params) {
  return UAPI.RES.GetProjOrg({}).post(params).inRegion().do();
}

// 项目下的资源权限
export function ResourcePermissionActions(params) {
  return UAPI.RES.ResourcePermissionActions({}).post(params).inRegion().do();
}

import UAPI from '@/api';

// /api/auth/v1/organization/tree
// 部门列表树内容
export async function getDepartmentTreeList() {
  return await UAPI.RES.getDepartmentTreeListApi({}).post({}).inRegion().do();
}
// 获取个人列表
export async function getIndividualList(params) {
  return await UAPI.RES.getIndividualTreeListApi({})
    .post(params)
    .inRegion()
    .do();
}

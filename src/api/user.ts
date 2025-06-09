import UAPI from '@/api';

// 登录
export function login(params) {
  return UAPI.RES.login({}).post(params).inRegion().do();
}
// 获取成员
export async function getUsers(params: any = {}) {
  return await UAPI.RES.users({}).get(params).inRegion().do();
}
// 获取组织树
export async function getOrganizationTree() {
  return await UAPI.RES.organizationTree({}).get().inRegion().do();
}
// 新增成员
export async function createUser(params: Record<string, any>) {
  return await UAPI.RES.user({}).post(params).inRegion().do();
}
// 更新成员
/**
 * Updates user information with the given parameters.
 * @param params - Key-value pairs of user attributes to update.
 * @returns Promise containing the updated user data.
 */
export async function updateUser( params: Record<string, any>) {
  return await UAPI.RES.user({  }).put(params).inRegion().do();
}
// 删除成员
export async function deleteUser(id: string) {
  return await UAPI.RES.user({ id }).delete().inRegion().do();
}
// 停用成员
export async function pauseUser(id: string) {
  return await UAPI.RES.user({ id }).post({ action: 'pause' }).inRegion().do();
}
// 启用成员
export async function resumeUser(id: string) {
  return await UAPI.RES.user({ id }).post({ action: 'resume' }).inRegion().do();
}
// 续约token
export async function renew() {
  return await UAPI.RES.renew({}).put().inRegion().do();
}

// 用户启用/停用
export async function banUser(params: Record<string, any>) {
  return await UAPI.RES.ban({}).put(params).inRegion().do();
}

// 创建组织
export async function createOrganization(params: Record<string, any>) {
  return await UAPI.RES.organization({}).post(params).inRegion().do();
}
// 更新组织
export async function updateOrganizationg(params: Record<string, any>) {
  return await UAPI.RES.organization({}).put(params).inRegion().do();
}
// 删除组织
export async function deleteOrganization(id: string) {
  return await UAPI.RES.organization({ id }).delete().inRegion().do();
}

// 角色

export async function getRoleData() {
  return await UAPI.RES.role({}).get().inRegion().do();
}

// 修改密码
export async function updatePassword(params: Record<string, any>) {
  return await UAPI.RES.password({}).put(params).inRegion().do();
}

// 获取自己信息 
/**
 * Fetches the current authenticated user's data.
 * @returns Promise containing the self user information.
 */
export async function getMe() {
  return await UAPI.RES.selfUser({}).get().inRegion().do();
}
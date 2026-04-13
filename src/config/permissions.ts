/**
 * 权限常量定义
 * 统一管理所有权限标识符，避免硬编码
 */

// 本体权限
export const ONTOLOGY_PERMISSIONS = {
  LIST: 'aimdp-manager:ontology_model:read:list', // 菜单权限
  GET: 'aimdp-manager:ontology_model:read:get',
  CREATE: 'aimdp-manager:ontology_model:manage:create',
  DELETE: 'aimdp-manager:ontology_model:manage:delete',
  MODIFY: 'aimdp-manager:ontology_model:manage:modify'
} as const;

// 业务自动化权限
export const AUTOMATION_PERMISSIONS = {
  LIST: 'aimdp-manager:rule:read:list',
  GET: 'aimdp-manager:rule:read:get',
  CREATE: 'aimdp-manager:rule:manage:create',
  MODIFY: 'aimdp-manager:rule:manage:modify',
  DELETE: 'aimdp-manager:rule:manage:delete'
};

// 需求管理权限
export const REQUIREMENT_PERMISSIONS = {
  LIST: 'aimdp-manager:label_req_manager:read:get_req_list', // 菜单权限
  GET: 'aimdp-manager:label_req_manager:read:get_req',
  CREATE: 'aimdp-manager:label_req_manager:manage:create',
  DOWNLOAD: 'aimdp-manager:label_req_manager:manage:req_result_download'
} as const;

// 组织管理
export const ORGANIZATION_PERMISSIONS = {
  MENU: 'aisocket:organization:read:menu'
} as const;

// 用户管理
export const USER_PERMISSIONS = {
  MENU: 'aisocket:user:read:menu'
} as const;

// 用户组管理
export const USER_GROUP_PERMISSIONS = {
  MENU: 'aisocket:usergroup:read:menu'
} as const;

// 角色管理
export const ROLE_PERMISSIONS = {
  MENU: 'aisocket:role:read:menu'
} as const;

// 项目管理
export const PROJECT_PERMISSIONS = {
  MENU: 'aisocket:project:read:menu'
} as const;

// API KEY管理
export const API_KEY_PERMISSIONS = {
  MENU: 'common:apikey:read:list'
} as const;

//标签管理
export const TAG_PERMISSIONS = {
  LIST: 'common:tag:read:listtag',
  GET: 'common:tag:read:gettag',
  CREATE: 'common:tag:manage:createtag',
  DELETE: 'common:tag:manage:deletetag',
  UPDATE: 'common:tag:manage:fullupdatetag'
} as const;

// 聚合所有权限
export const ALL_PERMISSIONS = {
  USER: USER_PERMISSIONS,
  ORGANIZATION: ORGANIZATION_PERMISSIONS,
  REQUIREMENT: REQUIREMENT_PERMISSIONS
} as const;

// 权限检查辅助函数
export const PermissionUtils = {
  /**
   * 检查权限是否属于某个模块
   * TODO: 补充对应多模态各模块
   */
  isUserPermission: (permission: string) => permission.startsWith('user:'),
  isOrgPermission: (permission: string) =>
    permission.startsWith('organizations:'),
  /**
   * 获取权限的模块名
   */
  getPermissionModule: (permission: string) => permission.split(':')[0],

  /**
   * 获取权限的操作名
   */
  getPermissionAction: (permission: string) => permission.split(':')[1]
};

export default ALL_PERMISSIONS;

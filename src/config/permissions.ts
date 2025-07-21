/**
 * 权限常量定义
 * 统一管理所有权限标识符，避免硬编码
 */

// 用户管理相关权限
export const USER_PERMISSIONS = {
  // 基础权限
  CAN_VIEW: 'user:can_view',
  CAN_SEARCH: 'user:can_search',
  CAN_CREATE: 'user:can_create',
  CAN_EDIT: 'user:can_edit',
  CAN_DELETE: 'user:can_delete',

  // 高级权限
  CAN_MANAGE: 'user:can_manage',
  CAN_RESET_PASSWORD: 'user:can_reset_password',
  CAN_CHANGE_ROLE: 'user:can_change_role',
  CAN_BATCH_IMPORT: 'user:can_batch_import',
  CAN_EXPORT: 'user:can_export',
  CAN_EXPORT_SENSITIVE: 'user:can_export_sensitive',

  // 状态管理
  CAN_ENABLE: 'user:can_enable',
  CAN_DISABLE: 'user:can_disable',
  CAN_BAN: 'user:can_ban'
} as const;

// 组织管理相关权限
export const ORGANIZATION_PERMISSIONS = {
  CAN_VIEW: 'organizations:can_view',
  CAN_SEARCH: 'organizations:can_search',
  CAN_CREATE: 'organizations:can_create',
  CAN_EDIT: 'organizations:can_edit',
  CAN_DELETE: 'organizations:can_delete',
  CAN_MANAGE: 'organizations:can_manage'
} as const;

// 连接器相关权限
export const CONNECTION_PERMISSIONS = {
  CAN_CREATE: '',
  CAN_DELETE: ''
} as const;

// 数据载入相关权限
export const DATA_LOAD_PERMISSIONS = {
  CAN_CREATE: ''
} as const;

// 工作流列表权限
export const WORKFLOW_LIST_PERMISSIONS = {} as const;

// 工作流详情权限
export const WORKFLOW_DETAIL_PERMISSIONS = {} as const;

// 作业列表相关权限
export const WORKFLOW_TASK_PERMISSIONS = {} as const;

// 数据目录相关权限
export const DATA_CATALOG_PERMISSIONS = {} as const;

// 数据集管理权限
export const DATA_MANAGEMENT_PERMISSIONS = {} as const;

// 聚合所有权限
export const ALL_PERMISSIONS = {
  USER: USER_PERMISSIONS,
  ORGANIZATION: ORGANIZATION_PERMISSIONS,
  CONNECTION: CONNECTION_PERMISSIONS,
  DATA_LOAD: DATA_LOAD_PERMISSIONS,
  WORKFLOW_LIST: WORKFLOW_LIST_PERMISSIONS,
  WORKFLOW_DETAIL: WORKFLOW_DETAIL_PERMISSIONS,
  WORKFLOW_TASK: WORKFLOW_TASK_PERMISSIONS,
  DATA_CATALOG: DATA_CATALOG_PERMISSIONS,
  DATA_MANAGEMENT: DATA_MANAGEMENT_PERMISSIONS
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
  // isAppPermission: (permission: string) => permission.startsWith('app:'),
  // isKbPermission: (permission: string) => permission.startsWith('kb:'),
  // isToolPermission: (permission: string) => permission.startsWith('tool:'),
  // isWorkflowPermission: (permission: string) => permission.startsWith('workflow:'),
  // isAdminPermission: (permission: string) => permission.startsWith('admin:'),

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

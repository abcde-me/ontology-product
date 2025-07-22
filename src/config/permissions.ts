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
export const WORKFLOW_LIST_PERMISSIONS = {
  CAN_CREATE: 'workflow:can_create',
  CAN_GET: 'workflow:can_get',
  CAN_COPY: 'workflow:can_copy',
  CAN_DELETE: 'workflow:can_delete'
} as const;

// 工作流详情权限
export const WORKFLOW_DETAIL_PERMISSIONS = {} as const;

// 作业列表相关权限
export const WORKFLOW_TASK_PERMISSIONS = {} as const;

// 数据目录相关权限
export const DATA_CATALOG_PERMISSIONS = {
  CAN_CREATE_CATALOG: 'directory:can_create_catalog',
  CAN_CREATE_VOLUME: 'directory:can_create_volume',
  CAN_DELETE_DIRS: 'directory:can_delete_dirs',
  CAN_UPDATE_DIRS: 'directory:can_update_dirs',
  CAN_DELETE_BATCH: 'source_dir:can_delete_batch',
  CAN_DELETE_DST_FILE: 'directory:can_delete_dst_file',
  CAN_SEARCH: 'connectors:can_search',
  CAN_SEARCH_DIR: 'source_dir:can_search',
  CAN_DELETE: 'source_dir:can_delete'
} as const;

// 数据集管理权限
export const DATA_MANAGEMENT_PERMISSIONS = {
  CAN_CREATE: 'datasets:can_create', //创建数据集
  CAN_SEARCH_BATCH: 'connectors:can_search', //批量导出
  CAN_DELETE_BATCH: 'datasets:can_delete_batch', //批量删除
  CAN_SEARCH: 'datasets:can_search', //导出
  CAN_DELETE: 'datasets:can_delete', //删除
  CAN_UPDATE_VERSION_RETRY: 'datasets:can_update_version_retry', //重试
  CAN_UPDATE: 'datasets:can_update', //编辑
  CAN_UPDATE_VERSION_DATA: 'datasets:can_update_version_data' //编辑数据内容
} as const;

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

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
  LIST: 'aimdp-manager:connector:read:list', // 菜单权限
  GET: 'aimdp-manager:connector:read:get',
  CREATE: 'aimdp-manager:connector:manage:create',
  DELETE: 'aimdp-manager:connector:manage:delete',
  MODIFY: 'aimdp-manager:connector:manage:modify'
} as const;

// 数据载入相关权限
export const DATA_LOAD_PERMISSIONS = {
  LIST: 'aimdp-manager:data_loader:read:list', // 菜单权限
  GET: 'aimdp-manager:data_loader:read:get',
  CREATE: 'aimdp-manager:data_loader:manage:create',
  DELETE: 'aimdp-manager:data_loader:manage:delete',
  MODIFY: 'aimdp-manager:data_loader:manage:modify',
  RUN: 'aimdp-manager:data_loader:manage:run'
} as const;

// 工作流列表权限
export const WORKFLOW_LIST_PERMISSIONS = {
  LIST: 'aimdp-manager:workflow:read:list', // 菜单权限
  GET: 'aimdp-manager:workflow:read:get',
  CREATE: 'aimdp-manager:workflow:manage:create',
  DELETE: 'aimdp-manager:workflow:manage:delete',
  MODIFY: 'aimdp-manager:workflow:manage:modify',
  RUN: 'aimdp-manager:workflow:manage:run'
} as const;

// 工作流详情权限
export const WORKFLOW_DETAIL_PERMISSIONS = {
  CAN_UPDATE_DAG: 'workflow:can_update_dag', // 编辑保存画布
  CAN_OPERATION: 'workflow:can_operation', // 工作流操作（上下线、运行）
  CAN_UPDATE: 'workflow:can_update' // 工作流名称修改
} as const;

// 作业列表相关权限
export const WORKFLOW_TASK_PERMISSIONS = {
  LIST: 'aimdp-manager:workflow:read:list' // 菜单权限（与工作流共用）
} as const;

// 数据目录相关权限
export const DATA_CATALOG_PERMISSIONS = {
  LIST: 'aimdp-manager:directory:read:list', // 菜单权限
  GET: 'aimdp-manager:directory:read:get',
  CREATE: 'aimdp-manager:directory:manage:create',
  DELETE: 'aimdp-manager:directory:manage:delete',
  MODIFY: 'aimdp-manager:directory:manage:modify'
} as const;

// 数据集管理权限
export const DATA_MANAGEMENT_PERMISSIONS = {
  LIST: 'aimdp-manager:dataset:read:list', // 菜单权限
  GET: 'aimdp-manager:dataset:read:get',
  CREATE: 'aimdp-manager:dataset:manage:create',
  DELETE: 'aimdp-manager:dataset:manage:delete',
  MODIFY: 'aimdp-manager:dataset:manage:modify'
} as const;

// 新工作流与作业
export const NEW_WORKFLOW_PERMISSIONS = {
  LIST: 'aimdp-manager:workflow:read:list', // 菜单权限
  GET: 'aimdp-manager:workflow:read:get',
  CREATE: 'aimdp-manager:workflow:manage:create',
  DELETE: 'aimdp-manager:workflow:manage:delete',
  MODIFY: 'aimdp-manager:workflow:manage:modify',
  RUN: 'aimdp-manager:workflow:manage:run'
} as const;

// PySpark权限
export const PYSPARK_PERMISSIONS = {
  LIST: 'aimdp-manager:pyspark:read:list', // 菜单权限
  GET: 'aimdp-manager:pyspark:read:get',
  CREATE: 'aimdp-manager:pyspark:manage:create',
  DELETE: 'aimdp-manager:pyspark:manage:delete',
  MODIFY: 'aimdp-manager:pyspark:manage:modify',
  RUN: 'aimdp-manager:pyspark:manage:run',
  EXPORT: 'aimdp-manager:pyspark:manage:export'
} as const;

// SQL权限
export const SQL_PERMISSIONS = {
  LIST: 'aimdp-manager:sql_script:read:list', // 菜单权限
  GET: 'aimdp-manager:sql_script:read:get',
  CREATE: 'aimdp-manager:sql_script:manage:create',
  DELETE: 'aimdp-manager:sql_script:manage:delete',
  MODIFY: 'aimdp-manager:sql_script:manage:modify',
  RUN: 'aimdp-manager:sql_script:manage:run',
  EXPORT: 'aimdp-manager:sql_script:manage:export'
} as const;

// 需求管理权限
export const REQUIREMENT_PERMISSIONS = {
  LIST: 'aimdp-manager:label_req_manager:read:get_req_list', // 菜单权限
  GET: 'aimdp-manager:label_req_manager:read:get_req',
  CREATE: 'aimdp-manager:label_req_manager:manage:create',
  DOWNLOAD: 'aimdp-manager:label_req_manager:manage:req_result_download'
} as const;

// 标注任务权限
export const ANNOTATION_TASK_PERMISSIONS = {
  LIST: 'aimdp-manager:label_task:read:get_task_list', // 菜单权限
  GET_RESULT: 'aimdp-manager:label_task:read:get_task_result', // 获取标注结果任务
  GET_LABEL: 'aimdp-manager:label_task:read:get_label', // 获取标注信息
  GET_ID_TASK: 'aimdp-manager:label_task:read:get_task_by_id', // 获取某标注任务详情
  GET: 'aimdp-manager:label_task:read:get_task', // 获取一个标注任务
  SAVE: 'aimdp-manager:label_task:manage:save_task_result' // 保存和提交标注任务
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
  DATA_MANAGEMENT: DATA_MANAGEMENT_PERMISSIONS,
  PYSPARK: PYSPARK_PERMISSIONS,
  SQL: SQL_PERMISSIONS,
  REQUIREMENT: REQUIREMENT_PERMISSIONS,
  ANNOTATION_TASK: ANNOTATION_TASK_PERMISSIONS
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

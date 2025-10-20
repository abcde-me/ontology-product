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
  CAN_CREATE: 'aimdp-manager:connector:manage:create',
  CAN_DELETE: 'aimdp-manager:connector:manage:delete',
  CAN_UPDATE: 'aimdp-manager:connector:manage:modify',
  CAN_GET: 'aimdp-manager:connector:read:get',

  LIST: 'aimdp-manager:connector:read:list', // 菜单权限
  MODIFY: 'aimdp-manager:connector:manage:modify'
} as const;

// 数据载入相关权限
export const DATA_LOAD_PERMISSIONS = {
  CAN_CREATE: 'aimdp-manager:data_loader:manage:create',
  CAN_DETELE: 'dataloader:can_delete',
  CAN_UPDATE: 'dataloader:can_update',
  CAN_GET: 'dataloader:can_get',
  CAN_START: 'dataloader:can_start',
  CAN_STOP: 'dataloader:can_stop',

  LIST: 'aimdp-manager:data_loader:read:list', // 菜单权限
  GET: 'aimdp-manager:data_loader:read:get',
  CREATE: 'aimdp-manager:data_loader:manage:create',
  DELETE: 'aimdp-manager:data_loader:manage:delete',
  MODIFY: 'aimdp-manager:data_loader:manage:modify',
  RUN: 'aimdp-manager:data_loader:manage:run'
} as const;

// 工作流列表权限
export const WORKFLOW_LIST_PERMISSIONS = {
  CAN_CREATE: 'workflow:can_create',
  CAN_GET: 'workflow:can_get',
  CAN_COPY: 'workflow:can_copy',
  CAN_DELETE: 'workflow:can_delete',

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
  CAN_UPDATE: 'workflow:can_update',
  LIST: 'aimdp-manager:workflow:read:list' // 菜单权限（与工作流共用）
} as const;

// 数据目录相关权限
export const DATA_CATALOG_PERMISSIONS = {
  CAN_CREATE_CATALOG: 'aimdp-manager:directory:manage:create', // 新建树
  CAN_CREATE_VOLUME: 'aimdp-manager:directory:manage:create', // 新建数据集
  CAN_DELETE_DIRS: 'aimdp-manager:directory:manage:delete', // 删除树
  CAN_UPDATE_DIRS: 'aimdp-manager:directory:manage:modify', // 更新树
  CAN_DELETE_BATCH: 'aimdp-manager:directory:manage:delete', // 源目录文件批量删除
  CAN_DELETE_DST_FILE: 'aimdp-manager:directory:manage:delete', // 目标目录文件删除
  CAN_SEARCH: 'aimdp-manager:connector:read:get', // 批量导出
  CAN_SEARCH_DIR: 'aimdp-manager:connector:read:get', // 导出 - 源目录
  CAN_DELETE: 'aimdp-manager:directory:manage:delete', //  删除 - 源目录
  CAN_EXPORT_LIST_FILE: 'aimdp-manager:connector:read:get', // 导出 - 目标目录文件
  CAN_DELETE_LIST_FILE: 'aimdp-manager:directory:manage:delete', // 删除 - 目标目录文件

  LIST: 'aimdp-manager:directory:read:list', // 菜单权限
  GET: 'aimdp-manager:directory:read:get',
  CREATE: 'aimdp-manager:directory:manage:create',
  DELETE: 'aimdp-manager:directory:manage:delete',
  MODIFY: 'aimdp-manager:directory:manage:modify'
} as const;

// 数据集管理权限
export const DATA_MANAGEMENT_PERMISSIONS = {
  CAN_CREATE: 'datasets:can_create', //创建数据集
  CAN_SEARCH_BATCH: 'connectors:can_output', //批量导出
  CAN_DELETE_BATCH: 'datasets:can_delete_batch', //批量删除
  CAN_SEARCH: 'datasets:can_search', //导出
  CAN_DELETE: 'datasets:can_delete', //删除
  CAN_UPDATE_VERSION_RETRY: 'datasets:can_update_version_retry', //重试
  CAN_UPDATE: 'datasets:can_update', //编辑
  CAN_UPDATE_VERSION_DATA: 'datasets:can_update_version_data', //编辑数据内容

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
  CAN_SEARCH: 'pyspark:can_search', // 菜单权限
  CAN_DELETE: 'pyspark:can_delete', // 删除
  CAN_UPDATE: 'pyspark:can_update', // 编辑
  CAN_COPY: 'pyspark:can_copy', // 复制
  CAN_RENAME: 'pyspark:can_rename', // 重命名
  CAN_RUN: 'pyspark:can_run', // 运行
  CAN_CANCEL_RUN: 'pyspark:can_cancel_run', // 停止运行
  CAN_EXPORT: 'pyspark:can_export_dataset', // 导出数据集按钮
  CAN_SEARCH_EXPORTS: 'pyspark:can_search_exports', // 导出列表
  CAN_EXPORT_STOP: 'pyspark:can_export_stop', // 导出停止
  CAN_EXPORT_RETRY: 'pyspark:can_export_retry', // 导出重试
  CAN_EXPORT_PREVIEW: 'pyspark:can_export_preview', // 导出预览
  CAN_DIRECTORY: 'directory:can_search_dirs', // 数据目录
  CAN_DATASETS_SEARCH: 'datasets:can_search', // 数据集列表
  CAN_RETRIEVE_OPERATOR: 'directory:can_retrieve_operator', // 算子库

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
  CAN_CREATE: 'sql_script:can_create', // 创建
  CAN_DELETE: 'sql_script:can_delete', // 删除
  CAN_UPDATE: 'sql_script:can_update', // 编辑
  CAN_COPY: 'sql_script:can_copy', // 复制
  CAN_RENAME: 'sql_script:can_rename', // 重命名
  CAN_SEARCH: 'sql_script:can_search', // 菜单权限
  CAN_GET: 'sql_script:can_get', // 详情
  CAN_RUN: 'sql_script:can_run', // 运行
  CAN_CANCEL_RUN: 'sql_script:can_cancel_run', // 取消运行
  CAN_GET_RUN_RESULT: 'sql_script:can_get_run_result', // 获取运行结果
  CAN_EXPORT_RESULT: 'sql_script:can_export_result', // 导出结果
  CAN_EXPORT_VERSION_UPDATE: 'sql_script:can_export_version_update', // 导出版本更新
  CAN_EXPORT_TASK_LIST: 'sql_script:can_export_task_list', // 导出任务列表
  CAN_EXPORT_TASK_STOP: 'sql_script:can_export_task_stop', // 导出任务停止
  CAN_EXPORT_TASK_RETRY: 'sql_script:can_export_task_retry', // 导出任务重试
  CAN_EXPORT_GET_SQL_INFO: 'sql_script:can_export_get_sql_info', // 导出任务对应的SQL详情

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

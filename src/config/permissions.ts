/**
 * 权限常量定义
 * 统一管理所有权限标识符，避免硬编码
 */

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
  CAN_DETELE: 'aimdp-manager:data_loader:manage:delete',
  CAN_UPDATE: 'aimdp-manager:data_loader:manage:modify',
  CAN_GET: 'aimdp-manager:data_loader:read:get',
  CAN_START: 'aimdp-manager:data_loader:manage:run',
  CAN_STOP: 'aimdp-manager:data_loader:manage:run',

  LIST: 'aimdp-manager:data_loader:read:list', // 菜单权限
  GET: 'aimdp-manager:data_loader:read:get',
  CREATE: 'aimdp-manager:data_loader:manage:create',
  DELETE: 'aimdp-manager:data_loader:manage:delete',
  MODIFY: 'aimdp-manager:data_loader:manage:modify',
  RUN: 'aimdp-manager:data_loader:manage:run'
} as const;

// 工作流列表权限
export const WORKFLOW_LIST_PERMISSIONS = {
  CAN_CREATE: 'aimdp-manager:workflow:manage:create',
  CAN_GET: 'aimdp-manager:workflow:read:list',
  CAN_COPY: 'aimdp-manager:workflow:manage:create',
  CAN_DELETE: 'aimdp-manager:workflow:manage:delete',
  CAN_READE: 'aimdp-manager:workflow:read:get',

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
  CAN_UPDATE: 'workflow:can_update', // 工作流名称修改

  UPDATE_DAG: 'aimdp-manager:workflow:manage:modify', // 编辑保存画布
  OPERATION: 'aimdp-manager:workflow:manage:run', // 工作流操作（上下线、运行）
  UPDATE: 'aimdp-manager:workflow:manage:modify', // 工作流名称修改
  GET: 'aimdp-manager:workflow:read:get'
} as const;

// 作业列表相关权限
export const WORKFLOW_TASK_PERMISSIONS = {
  CAN_UPDATE: 'aimdp-manager:workflow:read:get',
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
  CAN_SEARCH: 'aimdp-manager:directory:read:get', // 批量导出
  CAN_SEARCH_DIR: 'aimdp-manager:directory:read:get', // 导出 - 源目录
  CAN_DELETE: 'aimdp-manager:directory:manage:delete', //  删除 - 源目录
  CAN_EXPORT_LIST_FILE: 'aimdp-manager:directory:read:get', // 导出 - 目标目录文件
  CAN_DELETE_LIST_FILE: 'aimdp-manager:directory:manage:delete', // 删除 - 目标目录文件

  LIST: 'aimdp-manager:directory:read:list', // 菜单权限
  GET: 'aimdp-manager:directory:read:get',
  CREATE: 'aimdp-manager:directory:manage:create',
  DELETE: 'aimdp-manager:directory:manage:delete',
  MODIFY: 'aimdp-manager:directory:manage:modify'
} as const;

// 数据集管理权限
export const DATA_MANAGEMENT_PERMISSIONS = {
  CAN_CREATE: 'aimdp-manager:dataset:manage:create', //创建数据集
  CAN_SEARCH_BATCH: 'aimdp-manager:dataset:read:get', //批量导出
  CAN_DELETE_BATCH: 'aimdp-manager:dataset:manage:delete', //批量删除
  CAN_SEARCH: 'aimdp-manager:dataset:read:get', //导出
  CAN_DELETE: 'aimdp-manager:dataset:manage:delete', //删除
  CAN_UPDATE_VERSION_RETRY: 'aimdp-manager:dataset:manage:modify', //重试
  CAN_UPDATE: 'aimdp-manager:dataset:manage:modify', //编辑
  CAN_UPDATE_VERSION_DATA: 'aimdp-manager:dataset:manage:modify', //编辑数据内容
  CAN_MOVE: 'aimdp-manager:dataset:manage:modify', //移动场景分类
  CAN_RUN: 'aimdp-manager:dataset:manage:run', // 运行

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
  CAN_SEARCH_EXPORTS: 'aimdp-manager:pyspark:manage:export', // 导出列表
  CAN_DIRECTORY: 'aimdp-manager:directory:read:list', // 数据目录
  CAN_DATASETS_SEARCH: 'aimdp-manager:dataset:read:list', // 数据集列表
  CAN_RETRIEVE_OPERATOR: 'aimdp-manager:pyspark:read:list', // 算子库

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

// 数据资产
export const DATA_ASSET_PERMISSIONS = {
  LIST: 'aimdp-manager:data_asset:read:list_data', // 菜单权限
  DELETE: 'aimdp-manager:data_asset:manage:delete_asset',
  MODIFY_TAG: 'aimdp-manager:data_asset:manage:modify_tag',
  MODIFY_ASSET: 'aimdp-manager:data_asset:manage:modify_asset',
  MODIFY_TABLE: 'aimdp-manager:data_asset:manage:modify_table',
  CREATE_TABLE: 'aimdp-manager:data_asset:manage:create_table',
  GET_TABLE: 'aimdp-manager:data_asset:read:get_table'
} as const;

// 元数据管理
export const METADATA_MANAGEMENT_PERMISSIONS = {
  LIST: 'aimdp-manager:dataset:read:list' // 菜单权限 （todo：临时使用数据集权限待替换）
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

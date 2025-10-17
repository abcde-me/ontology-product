/**
 * 新权限配置文件
 * 基于接口返回的权限点格式：aimdp-manager:module:action:operation
 */

// 权限点枚举 - 基于接口返回的实际权限点
export const PERMISSIONS = {
  // 连接器相关权限
  CONNECTOR: {
    LIST: 'aimdp-manager:connector:read:list', // 列表
    GET: 'aimdp-manager:connector:read:get', // 详情
    CREATE: 'aimdp-manager:connector:manage:create', // 创建
    MODIFY: 'aimdp-manager:connector:manage:modify', // 修改
    DELETE: 'aimdp-manager:connector:manage:delete' // 删除
  },

  // 数据载入相关权限
  DATA_LOADER: {
    LIST: 'aimdp-manager:data_loader:read:list', // 列表
    GET: 'aimdp-manager:data_loader:read:get', // 详情
    CREATE: 'aimdp-manager:data_loader:manage:create', // 创建
    MODIFY: 'aimdp-manager:data_loader:manage:modify', // 修改
    DELETE: 'aimdp-manager:data_loader:manage:delete', // 删除
    RUN: 'aimdp-manager:data_loader:manage:run' // 运行
  },

  // SQL脚本相关权限
  SQL_SCRIPT: {
    LIST: 'aimdp-manager:sql_script:read:list', // 列表
    GET: 'aimdp-manager:sql_script:read:get', // 详情
    CREATE: 'aimdp-manager:sql_script:manage:create', // 创建
    MODIFY: 'aimdp-manager:sql_script:manage:modify', // 修改
    DELETE: 'aimdp-manager:sql_script:manage:delete', // 删除
    RUN: 'aimdp-manager:sql_script:manage:run', // 运行
    EXPORT: 'aimdp-manager:sql_script:manage:export' // 导出
  },

  // 工作流相关权限
  WORKFLOW: {
    LIST: 'aimdp-manager:workflow:read:list', // 列表
    GET: 'aimdp-manager:workflow:read:get', // 详情
    CREATE: 'aimdp-manager:workflow:manage:create', // 创建
    MODIFY: 'aimdp-manager:workflow:manage:modify', // 修改
    DELETE: 'aimdp-manager:workflow:manage:delete', // 删除
    RUN: 'aimdp-manager:workflow:manage:run' // 运行
  },

  // PySpark相关权限
  PYSPARK: {
    LIST: 'aimdp-manager:pyspark:read:list', // 列表
    GET: 'aimdp-manager:pyspark:read:get', // 详情
    CREATE: 'aimdp-manager:pyspark:manage:create', // 创建
    MODIFY: 'aimdp-manager:pyspark:manage:modify', // 修改
    DELETE: 'aimdp-manager:pyspark:manage:delete', // 删除
    RUN: 'aimdp-manager:pyspark:manage:run', // 运行
    EXPORT: 'aimdp-manager:pyspark:manage:export' // 导出
  },

  // 数据集相关权限
  DATASET: {
    LIST: 'aimdp-manager:dataset:read:list', // 列表
    GET: 'aimdp-manager:dataset:read:get', // 详情
    CREATE: 'aimdp-manager:dataset:manage:create', // 创建
    MODIFY: 'aimdp-manager:dataset:manage:modify', // 修改
    DELETE: 'aimdp-manager:dataset:manage:delete' // 删除
  },

  // 数据目录相关权限
  DIRECTORY: {
    LIST: 'aimdp-manager:directory:read:list', // 列表
    GET: 'aimdp-manager:directory:read:get', // 详情
    CREATE: 'aimdp-manager:directory:manage:create', // 创建
    MODIFY: 'aimdp-manager:directory:manage:modify', // 修改
    DELETE: 'aimdp-manager:directory:manage:delete' // 删除
  },

  // 标签相关权限
  TAG: {
    LIST: 'aimdp-manager:tag:read:list', // 列表
    GET: 'aimdp-manager:tag:read:get', // 详情
    CREATE: 'aimdp-manager:tag:manage:create', // 创建
    MODIFY: 'aimdp-manager:tag:manage:modify', // 修改
    DELETE: 'aimdp-manager:tag:manage:delete' // 删除
  },

  // 标注-需求管理相关权限
  REQUIREMENT: {
    LIST: 'aimdp-manager:label_req_manager:read:get_req_list', // 列表
    GET: 'aimdp-manager:label_req_manager:read:get_req', // 详情
    CREATE: 'aimdp-manager:label_req_manager:manage:create', // 创建
    DOWNLOAD: 'aimdp-manager:label_req_manager:manage:req_result_download' // 下载
  },

  // 标注任务相关权限
  ANNOTATION_TASK: {
    LIST: 'aimdp-manager:label_task:read:get_task_list', // 列表
    GET: 'aimdp-manager:label_task:read:get_task_by_id', // 标注任务详情
    RESULT: 'aimdp-manager:label_task:read:get_task_result', // 标注任务结果
    LABEL: 'aimdp-manager:label_task:read:get_label', // 获取标签
    TASK: 'aimdp-manager:label_task:read:get_task', // 获取一个标注任务
    SAVE: 'aimdp-manager:label_task:manage:save_task_result' // 保存任务
  },

  // 组织管理相关权限
  ORGANIZATION: {
    LIST: 'aimdp-manager:organization:read:list',
    GET: 'aimdp-manager:organization:read:get',
    CREATE: 'aimdp-manager:organization:manage:create',
    MODIFY: 'aimdp-manager:organization:manage:modify',
    DELETE: 'aimdp-manager:organization:manage:delete'
  },

  // 用户管理相关权限
  USER: {
    LIST: 'aimdp-manager:user:read:list',
    GET: 'aimdp-manager:user:read:get',
    CREATE: 'aimdp-manager:user:manage:create',
    MODIFY: 'aimdp-manager:user:manage:modify',
    DELETE: 'aimdp-manager:user:manage:delete'
  }
} as const;

// 路由权限映射 - 将路由名称映射到对应的权限点
export const ROUTE_PERMISSIONS = {
  // 连接器
  connection: PERMISSIONS.CONNECTOR.LIST,

  // 数据载入
  dataLoad: PERMISSIONS.DATA_LOADER.LIST,
  dataLoadList: PERMISSIONS.DATA_LOADER.LIST,
  dataLoadDetail: PERMISSIONS.DATA_LOADER.GET,
  accessLodaDetail: PERMISSIONS.DATA_LOADER.GET,

  // SQL开发
  sql: PERMISSIONS.SQL_SCRIPT.LIST,

  // 工作流
  workflowList: PERMISSIONS.WORKFLOW.LIST,
  workflowConfig: PERMISSIONS.WORKFLOW.CREATE,
  workflowTask: PERMISSIONS.WORKFLOW.LIST,
  taskDetail: PERMISSIONS.WORKFLOW.GET,

  // Pyspark
  pyspark: PERMISSIONS.PYSPARK.LIST,

  // 数据集管理
  datasetManagement: PERMISSIONS.DATASET.LIST,
  datasetDetail: PERMISSIONS.DATASET.GET,

  // 数据目录
  dataCatalog: PERMISSIONS.DIRECTORY.LIST,

  // 标注相关
  requirement: PERMISSIONS.REQUIREMENT.LIST,
  requirementDetail: PERMISSIONS.REQUIREMENT.GET,
  taskList: PERMISSIONS.ANNOTATION_TASK.LIST,
  labelEditor: PERMISSIONS.ANNOTATION_TASK.MODIFY,

  // 管理相关
  apiKey: null, // API密钥管理可能不需要特殊权限
  organization: PERMISSIONS.ORGANIZATION.LIST,
  member: PERMISSIONS.USER.LIST,
  operationCenter: null, // 运营中心可能包含多种权限

  // 系统页面 (不需要权限)
  login: null,
  userinfo: null
} as const;

// 权限检查工具函数
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string | null
): boolean => {
  if (!requiredPermission) return true;
  return userPermissions.includes(requiredPermission);
};

// 批量权限检查
export const hasAnyPermission = (
  userPermissions: string[],
  requiredPermissions: string[]
): boolean => {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
};

// 检查是否有某个模块的任意权限
export const hasModulePermission = (
  userPermissions: string[],
  module: keyof typeof PERMISSIONS
): boolean => {
  const modulePermissions = Object.values(PERMISSIONS[module]);
  return hasAnyPermission(userPermissions, modulePermissions);
};

// 从权限点数组中过滤出菜单权限 (以 :read:list 结尾的权限)
export const getMenuPermissions = (permissions: string[]): string[] => {
  return permissions.filter((permission) => permission.endsWith(':read:list'));
};

// 权限点解析工具
export const parsePermission = (permission: string) => {
  const parts = permission.split(':');
  return {
    platform: parts[0], // aimdp-manager
    module: parts[1], // connector, workflow 等
    action: parts[2], // read, manage
    operation: parts[3] // list, get, create 等
  };
};

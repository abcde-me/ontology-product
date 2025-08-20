// API端点声明

/**
 * 资源端点声明
 * 资源端点，指按照REST方式API命名风格，根据各种操作使用不同的HTTP调用方式，路径内可能涵盖URI参数
 * 注意不要修改该变量名（用于代码提示）
 */

// const Prefix = '/dify';
const Prefix = '/api/appforge/v1';

export const ResourceEndpoints = {
  // 在该对象内添加资源端点声明
  // 知识库
  knowledgeBase: Prefix + '/console/api/datasets',
  knowledgeBaseInit: Prefix + '/console/api/datasets/init',
  knowledgeId: Prefix + '/console/api/datasets/{knowledgeId}',
  knowledgeAction: Prefix + '/console/api/datasets/{action}',
  knowledgeIdAction: Prefix + '/console/api/datasets/{knowledgeId}/{action}',
  documentsList: Prefix + '/console/api/datasets/{knowledgeId}/documents',
  documentsId:
    Prefix + '/console/api/datasets/{knowledgeId}/documents/{documentId}',
  documentsIdAction:
    Prefix +
    '/console/api/datasets/{knowledgeId}/documents/{documentId}/{action}',
  batchIdAction:
    Prefix + '/console/api/datasets/{knowledgeId}/batch/{batchId}/{action}',
  //大模型列表
  llmList: Prefix + '/console/api/workspaces/current/models/model-types/llm',
  //大模型参数
  llmParams:
    Prefix +
    '/console/api/workspaces/current/model-providers/{provider}/models/parameter-rules',
  //应用列表
  appList: Prefix + '/console/api/apps',
  //删除应用
  deleteApp: Prefix + '/console/api/apps/{appId}',
  //创建应用
  createApp: Prefix + '/console/api/apps',
  //修改应用的标题，描述
  modifyAppInfo: Prefix + `/console/api/apps/{appId}/site`,
  //app详情
  appDetail: Prefix + `/console/api/apps/{appId}`,
  //发布app
  publishApp: Prefix + `/console/api/apps/{appId}/model-config`,
  //保存app
  saveApp: Prefix + '/console/api/apps/{appId}/save/model-config',
  //停止聊天
  stopChat: Prefix + `/console/api/apps/{appId}/chat-messages/{taskId}/stop`,
  //发送聊天消息
  sendChatMsg: Prefix + `/console/api/apps/{appId}/chat-messages`,
  //获取聊天信息
  chatMsgs: Prefix + `/console/api/apps/{appId}/chat-messages`,
  //聊天推荐问题
  chatSuggestedQuestions:
    Prefix +
    `/console/api/apps/{appId}/chat-messages/{responseItemId}/suggested-questions`,
  //内置工具集的工具列表
  builtIntoolsList:
    Prefix +
    '/console/api/workspaces/current/tool-provider/builtin/{provider}/tools',
  //自定义工具集的工具列表
  customToolsList:
    Prefix +
    '/console/api/workspaces/current/tool-provider/api/tools?provider={provider}',
  //工具商店列表
  toolsProviders: Prefix + '/console/api/workspaces/current/tool-providers',
  //我的工具列表
  myToolsProviders:
    Prefix + '/console/api/workspaces/current/owner/tool-providers',
  //添加工具
  addTool: Prefix + '/console/api/workspaces/current/tool-provider/api/add',
  //工具集详情
  collectionDetail:
    Prefix + '/console/api/workspaces/current/tool-provider/api/get',
  //修改工具
  updateTool:
    Prefix + '/console/api/workspaces/current/tool-provider/api/update',
  //调试工具
  debugTool:
    Prefix + '/console/api/workspaces/current/tool-provider/api/test/pre',
  // 删除工具
  deleteTool:
    Prefix + '/console/api/workspaces/current/tool-provider/api/delete',
  // 工具授权配置schema
  toolCredentialSchema:
    Prefix +
    '/console/api/workspaces/current/tool-provider/builtin/{collectionName}/credentials_schema',
  //工具授权删除
  toolCredentialDelete:
    Prefix +
    '/console/api/workspaces/current/tool-provider/builtin/{collectionName}/delete',
  // 更新工具授权
  toolCredentialUpdate:
    Prefix +
    '/console/api/workspaces/current/tool-provider/builtin/{collectionName}/update',
  //发布工具
  toolPublish:
    Prefix + '/console/api/workspaces/current/tool-provider/api/publish',
  //删除聊天会话
  deleteConvension:
    Prefix +
    '/console/api/installed-apps/{appId}/conversations/{conversationId}',
  //重命名会话
  renameConvension:
    Prefix +
    '/console/api/installed-apps/{appId}/conversations/{conversationId}/name',
  /**获取应用商店的app */
  installedAppList: Prefix + '/console/api/installed-apps',
  /**应用商店app详情 */
  installedApp: Prefix + '/console/api/installed-apps/{appId}',
  /**根据个人空间appid查询installedApp */
  installedAppBasedId: Prefix + '/console/api/installed-apps/app-id/{id}',
  /**文生图 */
  imageGenerate: Prefix + '/console/api/apps/icon-gen',
  /**客户化信息 */
  logoInfo: '/api/menu/v1/ex/logo/info'
};
// todo 以下为临时联调硬编码方案，环境部署上线需要为正式环境

// 研发环境部署
export const PrefixV2 = '/api/aiap/v1'; // '/api/aiap/v1';
export const PrefixAuth = '/api/auth/v1';
export const PrefixV1 = '/api/v1';
export const PrefixAimdp = '/api/aimdp/v1';
export const ResourceEndpointsV2 = {
  knowledgeBaseRoot: PrefixV2 + '/dataset_contents',
  knowledgeBaseCreate: PrefixV2 + '/datasets/init',
  knowledgeBaseList: PrefixV2 + '/datasets',
  documentList: PrefixV2 + '/datasets/{dataset_id}/documents',
  docSegmentation:
    PrefixV2 + '/datasets/{dataset_id}/documents/{document_id}/segments',
  docSwitch:
    PrefixV2 +
    '/datasets/{dataset_id}/documents/status/{action}/batch?document_id={document_id}',
  docSwitchSegmentation:
    PrefixV2 +
    '/datasets/{dataset_id}/documents/{document_id}/segments/{action}?segment_id={segment_id}',
  docEditList: PrefixV2 + '/datasets/{dataset_id}/documents',
  docdeleteList:
    PrefixV2 + '/datasets/{dataset_id}/documents?document_id={document_id}',
  doxdetailData: PrefixV2 + '/datasets/{dataset_id}/documents/{document_id}',
  docIndex:
    PrefixV2 + `/datasets/{dataset_id}/documents/{document_id}/indexing-status`,
  hitTestapi: PrefixV2 + `/datasets/{dataset_id}/hit-testing`,
  docDeleteSublevel:
    PrefixV2 +
    `/datasets/{dataset_id}/documents/{document_id}/segments?segment_id={segment_id}`,
  docAddSublevel:
    PrefixV2 + `/datasets/{dataset_id}/documents/{document_id}/segment`,
  docEditSublevel:
    PrefixV2 +
    `/datasets/{dataset_id}/documents/{document_id}/segments/{segment_id}`,
  HitRecordList: PrefixV2 + `/datasets/{dataset_id}/queries`,
  docContent: PrefixV2 + `/files/browser/{file_id}`,

  // 文件下载端点
  fileDownloadApi: PrefixV2 + `/files/download/{file_id}`,
  //删除文件的端点
  fileDeleteApi: Prefix + `/files/delete/{file_id}`,
  dataCatalogListApi: Prefix + `load_tasks/files{file_id}`,

  // 数据目录
  catalogListApi: PrefixAimdp + '/directory', //获取数据目录列表
  catalogAddApi: PrefixAimdp + '/directory/catalog', //添加目录
  volumeAddApi: PrefixAimdp + '/directory/volume', //新建卷
  volumeDeleteApi: PrefixAimdp + '/directory', //删除数据卷
  catalogRenameApi: PrefixAimdp + `/directory/{catalogId}/rename`, //重命名目录
  targetDataFileListApi: PrefixAimdp + '/directory/dst/file', //查询目标数据文件列表
  targetFileTypeListApi: PrefixAimdp + '/constants', //查询目标数据文件类型列表
  sourceFileTypeListApi:
    PrefixAimdp + '/load_tasks/source_dir/file_types/{file_id}', //查询源数据文件类型列表
  targetDataFileDeleteApi: PrefixAimdp + '/directory/dst', //删除目标数据文件
  sourceDataFileListApi: PrefixAimdp + '/load_tasks/source_dir/files_page', //查询源数据文件列表
  sourceDataFileDeleteApi:
    PrefixAimdp + '/load_tasks/source_dir/files/{file_id}', //删除源数据文件
  sourceDataFileDeleteBatcheApi:
    PrefixAimdp + '/load_tasks/source_dir/files/delete', //批量删除源数据文件

  CatalogCreateApi: Prefix + `/catalogs`,
  fileExportApi: PrefixAimdp + `/connectors/files/output`,
  connectorListAPI: Prefix + `/connectors`,

  apiKeyList: PrefixV2 + `/api-keys`,

  apps: PrefixV2 + '/apps',
  appDetailV2: PrefixV2 + '/apps/{appId}',
  models: PrefixV2 + '/model-providers/models',
  providers: PrefixV2 + '/model-providers',
  aiGenerate: PrefixV2 + '/apps/ai-generate',
  updateApp: PrefixV2 + '/apps/{appId}',
  updateAppConfig: PrefixV2 + '/apps/{appId}/model-config',

  // 应用广场列表
  appStoreV2: PrefixV2 + '/published-apps',

  // 登录
  login: PrefixAuth + '/login',
  // 成员查询
  users: PrefixAuth + '/user/search',
  // 组织树
  organizationTree: PrefixAuth + '/organization/tree',
  // 成员crud
  user: PrefixAuth + '/user',
  // token 续约
  renew: PrefixAuth + '/renew',
  // 用户启用/停用
  ban: PrefixAuth + '/user/ban',
  // 组织
  organization: PrefixAuth + '/organization',
  // 角色
  role: PrefixAuth + '/role/search',
  // 根据组织查用户
  searchUsers: PrefixAuth + '/user/search',
  // 修改密码
  password: PrefixAuth + '/user/passwd',
  // 获取用户信息
  selfUser: PrefixAuth + '/user/self',
  // 删除组织/用户前判断
  preDelOrg: PrefixAuth + '/organization/authorize_delete/{orgId}',
  preDelUser: PrefixAuth + '/user/authorize_delete/{userId}',
  // 用户管理搜索
  memberSearch: PrefixAuth + '/user/organization/search',

  // workflowDraft: PrefixV2 + '/apps/{appId}/workflows/draft',
  workflowPublish: PrefixV2 + '/apps/{appId}/workflows/publish',
  workflowPublishHistory: PrefixV2 + '/apps/{appId}/workflows',
  workflowBlockConfig:
    PrefixV2 + '/apps/{appId}/workflows/default-workflow-block-configs',
  workflowPublishDetail: PrefixV2 + '/apps/{appId}/workflows/{workflowId}',
  workflowPublishParam: PrefixV2 + '/apps/{appId}/workflows/publish/parameters'
};

// 多模态数据治理平台接口
// TODO: 代替换接口
export const ModaForgeResourceEndpoints = {
  // 新建工作流
  createWorkflow: PrefixAimdp + '/workflow/info',
  // 编辑工作流
  editWorkflow: PrefixAimdp + '/workflow/info/{workflow_uuid}',
  // 工作流详情
  workflowDetail: PrefixAimdp + '/workflow/info/{workflow_uuid}',
  // 工作流列表
  workflowList: PrefixAimdp + '/workflow/list',
  // 工作流操作
  workflowOperation: PrefixAimdp + '/workflow/operation/{workflow_uuid}',
  // 工作流删除
  workflowDelete: PrefixAimdp + '/workflow/{workflow_uuid}/{workflow_version}',
  // 工作流复制
  workflowCopy: PrefixAimdp + '/workflow/copy/{workflow_uuid}',
  // 工作流 - 结束节点目标目录
  workflowTargetPath: PrefixAimdp + '/directory',
  workflowDraft:
    PrefixAimdp +
    '/workflow/draft/{workflow_uuid}/{ds_workflow_id}/{workflow_version}',
  // 工作流-脚本类型
  scriptingType: PrefixAimdp + '/workflow/scripting/types',
  // 工作流-脚本执行器列表
  scriptingEngine: PrefixAimdp + '/workflow/scripting/engine/{script_type}',
  // 工作流-脚本模板
  scriptingTemplate:
    PrefixAimdp + '/workflow/scripting/template/{workflow_uuid}/{node_id}',
  // 工作流-脚本执行
  scriptingBench:
    PrefixAimdp + '/workflow/bench/{workflow_uuid}/{session_id}/{node_id}',

  // 作业列表
  taskList: PrefixAimdp + '/workflow_instance/list',
  // 作业详情
  taskDetail: PrefixAimdp + '/workflow_instance/{task_id}',
  // 作业详情节点
  taskDetailNode: PrefixAimdp + '/workflow_instance/task_detail',
  // 作业重跑
  taskRerun: PrefixAimdp + '/workflow_instance/task_rerun',
  // 作业停用
  taskStop: PrefixAimdp + '/workflow_instance/task_stop',

  modelGet: PrefixAimdp + '/model/model_list',

  //数据目录
  //获取数据目录
  catalogListApi: PrefixAimdp + '/directory',
  //查询指定目录下加载成功的文件信息
  fileListApi: PrefixAimdp + '/path/files',
  //预览/搜索数据集
  catalogPreviewApi: PrefixAimdp + '/datasets/preview', //数据集管理在用

  //数据集
  //获取数据集列表
  datasetsApi: PrefixAimdp + '/datasets/list',
  //获取数据集详情
  datasetDetailApi: PrefixV1 + '/dataset/{id}',
  //创建数据集
  createDatasetApi: PrefixAimdp + '/datasets',
  //获取标签列表
  tagListApi: PrefixAimdp + '/tags',
  //删除数据集
  deleteDataset: PrefixV1 + '/dataset/{id}',
  //查询连接器信息列表
  connectorListApi: PrefixAimdp + '/connectors',
  //查询指定连接器加载成功的文件信息
  connectorFileListApi: PrefixAimdp + '/connectors/{connector_id}/files',
  //修改数据集
  updateDatasetApi: PrefixAimdp + '/datasets/{dataset_id}',
  //获取数据集详细信息
  datasetDetailPageApi: PrefixAimdp + '/datasets/{dataset_id}',
  //删除数据集
  deleteDatasetApi: PrefixAimdp + '/datasets/{dataset_id}',
  //批量删除数据集
  batchDeleteDatasetApi: PrefixAimdp + '/datasets/batch-delete',
  //查询数据集详细信息的数据内容和
  datasetContentsApi: PrefixAimdp + '/datasets/version/data',
  //编辑数据集版本数据
  editDatasetVersionApi: PrefixAimdp + '/datasets/version/data',
  //获取数据集版本列表
  datasetVersionListApi: PrefixAimdp + '/datasets/version',
  //版本重新生成
  datasetVersionRebuildApi: PrefixAimdp + '/datasets/version/retry',

  // 连接器接口

  // 获取连接器数据列表
  getConnection: PrefixAimdp + '/connectors',
  // 新建连接器数据
  addconnection: PrefixAimdp + '/connectors',
  // 删除连接器数据
  delconnection: PrefixAimdp + '/connectors/{connector_id}',
  // 修改连接器数据
  editconnection: PrefixAimdp + '/connectors/{connector_id}',
  // 查看连接器详情数据
  getconnection: PrefixAimdp + '/connectors/{connector_id}',

  // 数据载入接口

  // 获取数据载入列表
  getLoadListApi: PrefixAimdp + '/load_tasks_page',
  // 创建单个载入任务
  addLoadApi: PrefixAimdp + '/load_tasks',
  // 删除指定载入任务
  delLoadApi: PrefixAimdp + '/load_tasks/{task_id}',
  // 修改单个载入任务
  editLoadApi: PrefixAimdp + '/load_tasks/{task_id}',
  // 查看单个载入任务详情
  getLoadApi: PrefixAimdp + '/load_tasks/{task_id}',
  // 启停单个载入任务
  startAndStopeLoadApi: PrefixAimdp + '/load_tasks/cron/release',
  // 立即运行指定载入任务
  runLoadApi: PrefixAimdp + '/load_tasks/new_start',
  // 删除指定文件
  delFileApi: PrefixAimdp + '/load_tasks/files',
  // 查询载入任务详情的列表
  getdetailListApi: PrefixAimdp + '/load_tasks/records/page',
  // 查询单个载入任务的执行记录
  getLoadRecordApi: PrefixAimdp + '/load_tasks/record/{task_id}',
  // 查询单个载入任务已加载文件信息
  getLoadFileApi: PrefixAimdp + '/load_tasks/files/{task_id}',
  // 查询目录卷路径关联的载入任务
  // getLoadTaskApi: PrefixAimdp + '/load_tasks/load_tasks/files',
  getLoadTaskFiles: PrefixAimdp + '/load_tasks/source_dir/files_page',
  // 停止单个载入任务
  stopLoadApi: PrefixAimdp + '/load_tasks/records/stop',
  // 查询个人载入记录列表
  getLoadRecordListApi: PrefixAimdp + '/load_tasks/records/files/page',
  // 查询任务单个执行记录详情
  getLoadRecordDetailApi: PrefixAimdp + '/load_tasks/records/{task_id}'
};

/**
 * 动作端点声明
 * 动作端点，指按照语义式API命名风格，统一HTTP调用方式为POST，直接将API作用名称称之为API路径，路径内不出现URI参数
 * 注意不要修改该变量名（用于代码提示）
 */
export const ActionEndpoints = {
  // 在该对象内添加动作端点声明
};

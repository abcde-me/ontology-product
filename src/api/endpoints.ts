// API端点声明

/**
 * 资源端点声明
 * 资源端点，指按照REST方式API命名风格，根据各种操作使用不同的HTTP调用方式，路径内可能涵盖URI参数
 * 注意不要修改该变量名（用于代码提示）
 */

// const Prefix = '/dify';
const Prefix = '/api/appforge/v1';

// todo 以下为临时联调硬编码方案，环境部署上线需要为正式环境
const API_PREFIX = '/ceai';
// 研发环境部署
export const PrefixV2 = '/api/aiap/v1'; // '/api/aiap/v1';
export const PrefixAuth = '/api/auth/v1';
export const PrefixV1 = '/api/v1';
export const PrefixAimdp = API_PREFIX + '/aimdp-manager/api/v1';
export const PrefixLabelService = API_PREFIX + '/label-service/api/v1';
export const PrefixUserCenter = API_PREFIX + '/user-space/api/v1';
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

  CatalogCreateApi: Prefix + `/catalogs`,

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

export const PrefixUserSpace = API_PREFIX + '/user-space/api/v1';
export const PrefixAuthCenter = API_PREFIX + '/auth-center/api/v1';

// RAG
export const PrefixRag = API_PREFIX + '/dataset-service/internal/v1';
export const PrefixRagV2 = '/aimdp-manager/api/v1';

// 引擎
export const PrefixEngine = '/metadata-service/api/v1';

// 多模态数据治理平台接口
export const ModaForgeResourceEndpoints = {
  // 登录
  Login: PrefixUserSpace + '/Login',
  Logout: PrefixUserSpace + '/Logout',
  GetUser: PrefixUserSpace + '/GetUser',
  GetProjOrg: PrefixUserSpace + '/GetProjOrg',
  UpdateMyselfInformation: PrefixUserSpace + '/UpdateMyselfInformation',

  // 引擎相关
  // 获取文件二进制数据 (参数通过 query string 传递: bucket, path)
  GetFileBinaryData: PrefixAimdp + '/DownloadFile',
  // RAG相关
  // 查询知识库文件详情
  GetKnowledgeDocument: PrefixAimdp + '/GetKnowledgeDocument',
  // 预览图片
  PreviewUrl: PrefixAimdp + '/PreviewUrl',
  // 查询知识库文件列表
  ListKnowledgeDocuments: PrefixRag + '/ListKnowledgeDocuments',
  // 批量删除知识库文件列表
  BatchDeleteKnowledgeDocument: PrefixAimdp + '/BatchDeleteKnowledgeDocument',
  // 查询知识库文件目录层级
  ListKnowledgeDocumentCatalogs: PrefixAimdp + '/ListKnowledgeDocumentData',
  // 查询知识库分块列表
  ListKnowledgeChunks: PrefixAimdp + '/ListKnowledgeChunks',
  // 查询分块详情
  GetKnowledgeChunk: PrefixAimdp + '/GetKnowledgeChunk',
  // 编辑分块内容
  UpdateKnowledgeChunk: PrefixAimdp + '/UpdateKnowledgeChunk',
  // 编辑分块元素信息
  UpdateKnowledgeChunkMaterials: PrefixAimdp + '/UpdateKnowledgeChunkMaterials',
  // 编辑分块增强信息
  UpdateKnowledgeChunkEnhancement:
    PrefixRag + '/UpdateKnowledgeChunkEnhancement',
  // 查询分块溯源日志
  GetKnowledgeChunkTraceLog: PrefixAimdp + '/GetKnowledgeChunkTrace',
  // 运行命中测试
  RunKnowledgeHitTesting: PrefixAimdp + '/RunKnowledgeHitTesting',
  // 查询命中测试历史记录
  ListKnowledgeHitTestingRecords: PrefixAimdp + '/ListKnowledgeHitTesting',

  ResourcePermissionActions: PrefixAuthCenter + '/GetResourcePermissionActions',
  // 新建工作流
  createWorkflow: PrefixAimdp + '/CreateWorkFlow',
  // 编辑工作流
  editWorkflow: PrefixAimdp + '/EditWorkFlow',
  // 工作流详情
  workflowDetail: PrefixAimdp + '/GetWorkFlowInfo',
  // 工作流列表
  workflowList: PrefixAimdp + '/ListWorkFlows',
  // 工作流列表_结构化
  workflowListNew: PrefixAimdp + '/ListProcessPage',
  // 获取工作流运行状态枚举
  getProcessRunState: PrefixAimdp + '/GetProcessRunState',
  // 工作流操作
  workflowOperation: PrefixAimdp + '/ManageWorkFlow',
  // 工作流删除
  workflowDelete: PrefixAimdp + '/DeleteWorkFlow',
  // 工作流删除
  workflowDeleteNew: PrefixAimdp + '/DeleteProcess',
  // 工作流复制
  workflowCopy: PrefixAimdp + '/CopyWorkFlow',
  // 工作流 - 结束节点目标目录
  workflowTargetPath: PrefixAimdp + '/ListDirectory',
  // 工作流-获取工作流DAG信息
  workflowDraft: PrefixAimdp + '/GetWorkFlowDAGInfo',
  // 工作流-编辑工作流DAG信息
  editWorkFlowDraft: PrefixAimdp + '/EditWorkFlowDraft',
  // 工作流-编辑工作流-SQL节点获取所有发版的SQL
  getSQLListInSQLNode: PrefixAimdp + '/ListDevelopScript',
  // 工作流-编辑工作流-SQL节点获取SQL的所有版本
  getSQLVersionInSQLNode: PrefixAimdp + '/GetDevelopScriptLogByScriptId',
  // 工作流-脚本类型
  scriptingType: PrefixAimdp + '/ListWorkFlowScriptTypes',
  // 工作流-脚本执行器列表
  scriptingEngine: PrefixAimdp + '/ListWorkFlowScriptEngineTypes',
  // 工作流-脚本模板
  scriptingTemplate: PrefixAimdp + '/GetWorkFlowScriptTemplate',
  // 工作流-脚本执行
  scriptingBench: PrefixAimdp + '/RunWorkFlowScript',
  // 工作流-脚本执行结果
  scriptingBenchResult: PrefixAimdp + '/GetWorkFlowScriptResult',
  // 工作流-知识库名称校验
  knowledgeBaseNameCheck:
    API_PREFIX + '/query-service/api/v1/validKnowledgeName',

  // 作业列表
  taskList: PrefixAimdp + '/ListWorkflowInstances',
  // 作业详情
  taskDetail: PrefixAimdp + '/GetWorkflowInstanceInfo',
  // 作业详情节点
  taskDetailNode: PrefixAimdp + '/GetWorkflowInstanceFiles',
  // 作业重跑
  taskRerun: PrefixAimdp + '/RerunWorkflowInstance',
  // 作业停用
  taskStop: PrefixAimdp + '/StopWorkflowInstance',

  modelGet: PrefixAimdp + '/ListWorkFlowModel',

  //数据目录
  //获取数据目录
  catalogListApi: PrefixAimdp + '/ListDirectory',
  //查询指定目录下加载成功的文件信息
  fileListApi: PrefixAimdp + '/path/files',
  //预览/搜索数据集
  catalogPreviewApi: PrefixAimdp + '/PreviewDatasetsByDst', //数据集管理在用
  catalogAddApi: PrefixAimdp + '/CreateDirCatalog', //添加目录
  volumeAddApi: PrefixAimdp + '/CreateDirVolume', //新建卷
  dbAddApi: PrefixAimdp + '/CreateDirDatabase', //新建数据库
  volumeDeleteApi: PrefixAimdp + '/DeleteDirectory', //删除数据卷
  tableDeleteApi: PrefixAimdp + '/DeleteDirDatabaseTable', //删除数据库表
  catalogRenameApi: PrefixAimdp + `/RenameDirectory`, //重命名目录
  targetDataFileListApi: PrefixAimdp + '/ListDstDirFiles', //查询目标数据文件列表
  targetFileTypeListApi: PrefixAimdp + '/ListDirConstants', //查询目标数据文件类型列表
  sourceFileTypeListApi: PrefixAimdp + '/ListSourceDirTypes', //查询源数据文件类型列表
  targetDataFileDeleteApi: PrefixAimdp + '/DeleteDstDirFiles', //删除目标数据文件
  sourceDataFileListApi: PrefixAimdp + '/ListSourceDirFiles', //查询源数据文件列表
  sourceDataFileDeleteApi: PrefixAimdp + '/DeleteSourceDirFile', //删除源数据文件
  sourceDataFileDeleteBatcheApi: PrefixAimdp + '/DeleteSourceDirFiles', //批量删除源数据文件
  dbItemListApi: PrefixAimdp + '/ListDirDatabaseTables', //获取数据库表列表
  dbItemDetailApi: PrefixAimdp + '/GetDirDatabaseTableInfo', //查询源库下的表详情
  createMetaDataDefinition: PrefixAimdp + '/CreateMetaDataDefinition', // 创建元数据目录
  fileExportApi: PrefixAimdp + `/OutputToConnector`,
  listMetaData: PrefixAimdp + '/ListMetaData', // 查询元数据列表
  refreshMetaDataList: PrefixAimdp + '/RefreshMetaDataList', // 刷新元数据列表
  createDirMetaData: PrefixAimdp + '/CreateDirMetaData', // 创建元数据目录
  checkSqlApi: PrefixAimdp + '/CheckSQL', // 校验SQL

  //数据集
  //获取数据集列表
  datasetsApi: PrefixAimdp + '/ListDatasets',
  //获取数据集详情
  // datasetDetailApi: PrefixV1 + '/dataset/{id}',
  //创建数据集
  createDatasetApi: PrefixAimdp + '/CreateDataset',
  //获取标签列表
  tagListApi: PrefixAimdp + '/ListTags',
  //删除数据集
  // deleteDataset: PrefixV1 + '/dataset/{id}',
  //查询连接器信息列表
  connectorListApi: PrefixAimdp + '/ListConnectors',
  //查询指定连接器加载成功的文件信息
  connectorFileListApi: PrefixAimdp + '/ListConnectorLoadedFiles',
  //修改数据集
  updateDatasetApi: PrefixAimdp + '/EditDataset',
  //获取数据集详细信息
  datasetDetailPageApi: PrefixAimdp + '/GetDatasetInfo',
  //删除数据集
  deleteDatasetApi: PrefixAimdp + '/DeleteDataset',
  //批量删除数据集
  batchDeleteDatasetApi: PrefixAimdp + '/DeleteDatasets',
  //查询数据集详细信息的数据内容和
  datasetContentsApi: PrefixAimdp + '/GetDatasetTargetVersion',
  //编辑数据集版本数据
  editDatasetVersionApi: PrefixAimdp + '/UpdateJsonLData',
  //获取数据集版本列表
  datasetVersionListApi: PrefixAimdp + '/ListDatasetChangeLogs',
  //版本重新生成
  datasetVersionRebuildApi: PrefixAimdp + '/RetryDataset',
  //数据内容文件表
  dataContentFileList: PrefixAimdp + '/ListDatasetData',
  // Pyspark获取数据集文件列表
  listDatasetFiles: PrefixAimdp + '/ListDatasetFiles',
  //数据内容数据库表
  dataContentTableList: PrefixAimdp + '/GetDatasetTableTargetVersion',
  // 数据集场景分类列表
  datasetSceneListApi: PrefixAimdp + '/ListScenes',
  // 数据集场景分类批量更新
  datasetBatchUpdateSceneApi: PrefixAimdp + '/BatchUpdateScene',

  // 连接器接口

  // 获取连接器数据列表
  getConnection: PrefixAimdp + '/ListConnectors',
  // 新建连接器数据
  addconnection: PrefixAimdp + '/CreateConnector',
  // 删除连接器数据
  delconnection: PrefixAimdp + '/DeleteConnector',
  // 修改连接器数据
  editconnection: PrefixAimdp + '/EditConnector',
  // 查看连接器详情数据
  getconnection: PrefixAimdp + '/GetConnector',

  // 数据载入接口

  // 获取数据载入列表
  getLoadListApi: PrefixAimdp + '/ListLoadTasks',
  // 创建单个载入任务
  addLoadApi: PrefixAimdp + '/CreateLoadTask',
  //数据载入上传文件
  uploadApi: PrefixAimdp + '/load_tasks/upload', // 没调用过
  // 删除指定载入任务
  delLoadApi: PrefixAimdp + '/DeleteLoadTask',
  // 修改单个载入任务
  editLoadApi: PrefixAimdp + '/EditLoadTask',
  // 查看单个载入任务详情
  getLoadApi: PrefixAimdp + '/GetLoadTask',
  // 启停单个载入任务
  startAndStopeLoadApi: PrefixAimdp + '/ControlLoadTaskCron',
  // 立即运行指定载入任务
  runLoadApi: PrefixAimdp + '/CreateLoadTaskInstance',
  // 删除指定文件
  delFileApi: PrefixAimdp + '/load_tasks/files', // 没搜到
  // 查询载入任务详情的列表
  getdetailListApi: PrefixAimdp + '/ListLoadTaskInstances',
  // 查询单个载入任务的执行记录
  getLoadRecordApi: PrefixAimdp + '/load_tasks/record/{task_id}', // 前端没调用
  // 查询单个载入任务已加载文件信息
  getLoadFileApi: PrefixAimdp + '/load_tasks/files/{task_id}', // 没搜到
  // 查询目录卷路径关联的载入任务
  // getLoadTaskApi: PrefixAimdp + '/load_tasks/load_tasks/files',
  getLoadTaskFiles: PrefixAimdp + '/ListSourceDirFiles',
  // 停止单个载入任务
  stopLoadApi: PrefixAimdp + '/StopLoadTaskInstance',
  // 查询个人载入记录列表
  getLoadRecordListApi: PrefixAimdp + '/ListLoadTaskInstanceFiles',
  // 查询任务单个执行记录详情
  getLoadRecordDetailApi: PrefixAimdp + '/GetLoadTaskInstanceInfo',
  // 重试载入任务
  reTryLoadApi: PrefixAimdp + '/RetryLoadTaskInstance',
  //载入获取表名
  getTableNameApi: PrefixAimdp + '/GenerateDBName',
  // 校验SQL语句
  checkSQLApi: PrefixAimdp + '/CheckSQL',
  // 连接器预览数据
  PreviewConnectorSampleDataApi: PrefixAimdp + '/PreviewConnectorSampleData',

  // 数据标注接口
  // 数据标注配置 发布
  publishRequirementApi: PrefixLabelService + '/createRequirement',
  // 需求详情查看
  getRequirementDetailApi: PrefixLabelService + '/queryRequirement',
  // 获取数据标注列表
  getAnnotationListApi: PrefixLabelService + '/listRequirement',
  // 标注下载结果
  getAnnotationDownloadApi: PrefixLabelService + '/resultDownloadRequirement',
  // 获取数据标注 - 任务列表
  getAnnotationTaskListApi: PrefixLabelService + '/taskList',
  // 获取部门列表树内容
  getDepartmentTreeListApi: PrefixUserCenter + '/GetOrgTree',
  // 获取个人列表树内容
  getIndividualTreeListApi: PrefixUserCenter + '/ListUser',
  //  查询标注数据表格内容
  getAnnotationTabledDataApi: PrefixAimdp + '/ListSourceDirLoadTaskInstances',
  // 获取模型列表
  getModelList: PrefixLabelService + '/modelList',
  // 获取模型标签信息
  getModelLabelList: PrefixLabelService + '/modelLabelList',
  // 编辑需求
  editRequirementApi: PrefixLabelService + '/EditRequirement',
  // 需求进度
  getProgressRequirement: PrefixLabelService + '/ProgressRequirement',
  // 需求明细
  detailRequirement: PrefixLabelService + '/DetailRequirement',
  // 生成纪录
  downloadRecord: PrefixLabelService + '/DownloadRecord',
  // 质检任务列表
  listQualityControlTasks: PrefixLabelService + '/ListQualityControlTasks',
  // 设置抽检任务
  manageQCTaskBatch: PrefixLabelService + '/ManageQCTaskBatch',
  // 获取质检任务包统计数据
  getQualityControlTaskStatistics:
    PrefixLabelService + '/GetQualityControlTaskStatistics',
  // 批量处理抽检
  batchManageQCTaskBatch: PrefixLabelService + '/BatchManageQCTaskBatch',
  // 批量管理抽检包任务
  manageQCTaskSampledBatch: PrefixLabelService + '/ManageQCTaskSampledBatch',
  // 抽检任务列表
  listQualityControlTaskSamples:
    PrefixLabelService + '/ListQualityControlTaskSamples',

  // python开发
  // 获取python列表
  pythonListApi: PrefixAimdp + '/ListPysparkFiles',
  // 创建python
  pythonCreateApi: PrefixAimdp + '/CreatePysparkFile',
  // 重命名python
  pythonRenameApi: PrefixAimdp + '/RenamePysparkFile',
  // 删除python
  pythonDeleteApi: PrefixAimdp + '/DeletePysparkFile',
  // 复制python
  pythonCopyApi: PrefixAimdp + '/CopyPysparkFile',
  // 打开python
  pythonOpenApi: PrefixAimdp + '/OpenPysparkFile',
  // 修改python
  pythonSaveApi: PrefixAimdp + '/UpdatePysparkFile',
  // 运行python
  pythonRunApi: PrefixAimdp + '/RunPysparkFile',
  // 停止运行python
  pythonRunCancelApi: PrefixAimdp + '/StopPysparkFile',
  // 获取运行结果
  pythonRunResultApi: PrefixAimdp + '/GetPysparkFileRunResult',
  // 获取运行日志
  pythonRunLogApi: PrefixAimdp + '/GetPysparkFileRunLog',
  // 获取导出数据集列表
  pythonExportDatasetListApi: PrefixAimdp + '/ListPysparkExportTasks',
  // 停止导出数据集
  pythonExportDatasetStopApi: PrefixAimdp + '/StopPysparkExportTask',
  // 重试导出数据集
  pythonExportDatasetRetryApi: PrefixAimdp + '/RetryPysparkExportTask',
  // 获取算子
  pythonOperatorApi: PrefixAimdp + '/GetOperatorDemo',
  // 导出数据集
  pythonExportDatasetApi: PrefixAimdp + '/CreatePysparkExportTask',
  // 获取导出文件列表
  pythonExportFileApi: PrefixAimdp + '/ListPysparkExportFiles',
  // 获取导出预览数据
  pythonExportPreviewApi: PrefixAimdp + '/PreviewPysparkExportData',

  // SQL开发
  sqlListApi: PrefixAimdp + '/ListSqlFile',
  sqlCreateApi: PrefixAimdp + '/CreateSqlFile',
  sqlRenameApi: PrefixAimdp + '/RenameSqlFile',
  sqlDeleteApi: PrefixAimdp + '/DeleteSqlFile',
  sqlCopyApi: PrefixAimdp + '/CopySqlFile',
  // sqlOpenApi: PrefixAimdp + '/GetSqlFile',
  sqlOpenApi: PrefixAimdp + '/GetDevelopScriptInfo',
  sqlSaveApi: PrefixAimdp + '/EditSqlFile',
  sqlRunApi: PrefixAimdp + '/RunSqlFile',
  sqlRunCancelApi: PrefixAimdp + '/StopSqlFile',
  sqlRunResultApi: PrefixAimdp + '/GetSqlFileRunResult',
  sqlRunLogApi: PrefixAimdp + '/GetSqlFileRunLog',
  sqlExportDataset: PrefixAimdp + '/CreateSqlExportTask',
  sqlExportDatasetVersion: PrefixAimdp + '/EditDataset',
  sqlExportDatasetList: PrefixAimdp + '/ListSqlExportTask',
  sqlExportDatasetStopApi: PrefixAimdp + '/StopSqlExportTask',
  sqlExportDatasetRetryApi: PrefixAimdp + '/RetrySqlExportTask',
  sqlExportDatasetDetailApi: PrefixAimdp + '/GetSqlExportTaskInfo',
  datasetsOptionsApi: PrefixAimdp + '/ListDatasets',

  // 数据加工SQL开发脚本接口
  // 开发SQL脚本列表
  listDevelopScriptApi: PrefixAimdp + '/ListDevelopScript',
  // 开发SQL脚本创建
  createDevelopScriptApi: PrefixAimdp + '/CreateDevelopScript',
  // 开发SQL脚本保存
  editDevelopScriptApi: PrefixAimdp + '/EditDevelopScript',
  // 获取开发SQL脚本详情
  getDevelopScriptInfoApi: PrefixAimdp + '/GetDevelopScriptInfo',

  leGetTask: PrefixLabelService + '/getTask',
  leGetTaskById: PrefixLabelService + '/getTaskById',
  leGetLabels: PrefixLabelService + '/getLabels',
  leSaveTask: PrefixLabelService + '/saveTask',
  leGetTaskReuslt: PrefixLabelService + '/getTaskResult',
  leGetQualityControlTask: PrefixLabelService + '/GetQualityControlTask',
  leGetQualityControlTaskById:
    PrefixLabelService + '/GetQualityControlTaskById',
  leSaveQualityControlTask: PrefixLabelService + '/SaveQualityControlTask',
  leCreateQualityControlTaskComment:
    PrefixLabelService + '/CreateQualityControlTaskComment',
  leModifyQualityControlTaskComment:
    PrefixLabelService + '/ModifyQualityControlTaskComment',
  leDeleteQualityControlTaskComment:
    PrefixLabelService + '/DeleteQualityControlTaskComment',

  // 获取加工脚本列表
  ListDevelopScriptApi: PrefixAimdp + '/ListDevelopScript',
  // 加工脚本下载
  DownloadDevelopScriptApi: PrefixAimdp + '/DownloadDevelopScript',
  // 获取加工脚本历史版本
  GetDevelopScriptLogByScriptIdApi:
    PrefixAimdp + '/GetDevelopScriptLogByScriptId',
  // 历史版本复制
  OldGetDevelopScriptLogByVersionApi:
    PrefixAimdp + '/GetDevelopScriptLogByVersion',
  // 历史版本删除
  DeleteDevelopScriptLogApi: PrefixAimdp + '/DeleteDevelopScript',
  // 删除加工脚本
  DeleteDevelopScriptApi: PrefixAimdp + '/DeleteDevelopScript',
  // 锁定加工脚本
  LockDevelopScriptApi: PrefixAimdp + '/LockDevelopScript',
  // 解锁加工脚本
  UnlockDevelopScriptApi: PrefixAimdp + '/UnlockDevelopScript',
  // 获取加工脚本卡片内容
  ListDevelopScriptLogByKeyApi: PrefixAimdp + '/ListDevelopScriptLogByKey',
  // 内容卡片 - 删除卡片内容
  DeleteDevelopScriptLogByVersionApi:
    PrefixAimdp + '/DeleteDevelopScriptLogByVersion',
  // 脚本内容搜索 - 查询
  GetDevelopScriptLogByVersionApi:
    PrefixAimdp + '/GetDevelopScriptLogByVersion',
  // 获取脚本详情
  GetSQLInfoByIDAndVersion: PrefixAimdp + '/GetDevelopScriptLogByVersion',
  // 查询脚本列表
  ListSqlFileApi: PrefixAimdp + '/ListSqlFile',
  // 查询脚本删除
  DeleteSqlFileApi: PrefixAimdp + '/DeleteSqlFile',
  // 参数列表表格
  ListDevelopSystemParamApi: PrefixAimdp + '/ListDevelopSystemParam',
  // 开发规范查看
  GetDevelopStandardsApi: PrefixAimdp + '/GetDevelopStandards',
  // 开发规范保存
  UpdateDevelopSystemParamApi: PrefixAimdp + '/UpdateDevelopStandards',
  // 加工脚本新建
  CreateDevelopScriptApi: PrefixAimdp + '/CreateDevelopScript',
  // 重命名加工脚本列表  - 重命名
  RenameDevelopScriptApi: PrefixAimdp + '/RenameDevelopScript',
  // 复制加工脚本列表  - 复制
  CopyDevelopScriptApi: PrefixAimdp + '/CopyDevelopScript',
  // 发布加工脚本
  NewVersionDevelopScriptApi: PrefixAimdp + '/NewVersionDevelopScript',
  // 开发SQL脚本运行
  RunDevelopScriptApi: PrefixAimdp + '/RunDevelopScript',
  // 开发SQL脚本日志
  GetDevelopScriptRunLogApi: PrefixAimdp + '/GetDevelopScriptRunLog',

  // 数据资产接口
  // 查询数据资产表字段和映射关系
  getDataAssetMapping: PrefixAimdp + '/GetDataAssetMapping',
  // 自动映射
  autoMapDataAssetFieldAndSource:
    PrefixAimdp + '/AutoMapDataAssetFieldAndSource',
  // 获取数据资产列表
  listDataAssetData: PrefixAimdp + '/ListDataAssetData',
  // 查询数据来源
  listDataAssetSource: PrefixAimdp + '/ListDataAssetSources',
  // 删除数据资产
  dataAssetDelete: PrefixAimdp + '/DeleteDataAsset',
  // 解析数据资产字段文件
  analyzeDataAssetFieldsFile: PrefixAimdp + '/AnalyzeDataAssetFieldsFile',
  // 查询支持的字段类型
  listDataAssetFieldTypes: PrefixAimdp + '/ListDataAssetFieldTypes',
  // 数据资产字段自动映射
  editDataAssetColumnMap: PrefixAimdp + '/EditDataAssetColumnMap',
  // 创建数据资产和映射关系
  createDataAssetAndMapping: PrefixAimdp + '/CreateDataAssetAndMapping',
  // 修改数据资产和映射关系
  editDataAssetAndMapping: PrefixAimdp + '/EditDataAssetAndMapping',
  // 修改数据资产表列设置（前端展示）
  editDataAssetFieldsDisplay: PrefixAimdp + '/EditDataAssetFieldsDisplay',
  // 查询数据资产表列设置（前端展示）
  getDataAssetFieldsDisplay: PrefixAimdp + '/GetDataAssetFieldsDisplay',
  // 查询指定字段去重后的数量
  getDataAssetTableDistinctFieldCount:
    PrefixAimdp + '/GetDataAssetTableDistinctFieldCount',
  // 批量修改数据资产表中的数据信息
  editDataAssetDataBatch: PrefixAimdp + '/EditDataAssetDataBatch',
  // 获取标签列表
  listBaseTags: PrefixAimdp + '/ListBaseTags',
  // 批量删除数据资产表中的数据信息
  deleteDataAssetDataBatch: PrefixAimdp + '/DeleteDataAssetDataBatch',
  // 批量修改数据资产表中的标签信息
  editDataAssetDataTagsBatch: PrefixAimdp + '/EditDataAssetDataTagsBatch',
  // 下载数据资产字段模板
  downloadDataAssetFieldsTemplate:
    PrefixAimdp + '/DownloadDataAssetFieldsTemplate'
};

/**
 * 动作端点声明
 * 动作端点，指按照语义式API命名风格，统一HTTP调用方式为POST，直接将API作用名称称之为API路径，路径内不出现URI参数
 * 注意不要修改该变量名（用于代码提示）
 */
export const ActionEndpoints = {
  // 在该对象内添加动作端点声明
};

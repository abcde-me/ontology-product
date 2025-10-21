// API端点声明

/**
 * 资源端点声明
 * 资源端点，指按照REST方式API命名风格，根据各种操作使用不同的HTTP调用方式，路径内可能涵盖URI参数
 * 注意不要修改该变量名（用于代码提示）
 */

const API_PREFIX = '/ceai';
// 研发环境部署
export const PrefixAuth = '/api/auth/v1';
export const PrefixAimdp = API_PREFIX + '/aimdp-manager/api/v1';
export const PrefixLabelService = API_PREFIX + '/label-service/api/v1/';

export const PrefixUserSpace = API_PREFIX + '/user-space/api/v1';
export const PrefixAuthCenter = API_PREFIX + '/auth-center/api/v1';
// 多模态数据治理平台接口
// TODO: 代替换接口
export const ModaForgeResourceEndpoints = {
  // 登录
  Login: PrefixUserSpace + '/Login',
  Logout: PrefixUserSpace + '/Logout',
  GetUser: PrefixUserSpace + '/GetUser',
  GetProjOrg: PrefixUserSpace + '/GetProjOrg',

  ResourcePermissionActions: PrefixAuthCenter + '/GetResourcePermissionActions',
  // 新建工作流
  createWorkflow: PrefixAimdp + '/CreateWorkFlow',
  // 编辑工作流
  editWorkflow: PrefixAimdp + '/EditWorkFlow',
  // 工作流详情
  workflowDetail: PrefixAimdp + '/GetWorkFlowInfo',
  // 工作流列表
  workflowList: PrefixAimdp + '/ListWorkFlows',
  // 工作流操作
  workflowOperation: PrefixAimdp + '/ManageWorkFlow',
  // 工作流删除
  workflowDelete: PrefixAimdp + '/DeleteWorkFlow',
  // 工作流复制
  workflowCopy: PrefixAimdp + '/CopyWorkFlow',
  // 工作流 - 结束节点目标目录
  workflowTargetPath: PrefixAimdp + '/ListDirectory',
  // 工作流-获取工作流DAG信息
  workflowDraft: PrefixAimdp + '/GetWorkFlowDAGInfo',
  // 工作流-编辑工作流DAG信息
  editWorkFlowDraft: PrefixAimdp + '/EditWorkFlowDraft',
  // 工作流-脚本类型
  scriptingType: PrefixAimdp + '/ListWorkFlowScriptTypes',
  // 工作流-脚本执行器列表
  scriptingEngine: PrefixAimdp + '/ListWorkFlowScriptEngineTypes',
  // 工作流-脚本模板
  scriptingTemplate: PrefixAimdp + '/GetWorkFlowScriptTemplate',
  // 工作流-脚本执行
  scriptingBench: PrefixAimdp + '/RunWorkFlowScript',
  // 工作流-脚本执行结果
  scriptingBenchResult: PrefixAimdp + '/GETWorkFlowScriptResult',
  // 工作流-知识库名称校验
  knowledgeBaseNameCheck:
    PrefixAimdp + '/query-service/api/knowledge/validKnowledgeName',

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
  // 工作流-获取工作流模型列表
  modelGet: PrefixAimdp + '/ListWorkFlowModel',

  //数据目录
  //获取数据目录
  catalogListApi: PrefixAimdp + '/ListDirectory',
  //查询指定目录下加载成功的文件信息
  fileListApi: PrefixAimdp + '/path/files',
  //预览/搜索数据集
  catalogPreviewApi: PrefixAimdp + '/PreviewDatasetsByDst', //数据集管理在用

  //数据集
  //获取数据集列表
  datasetsApi: PrefixAimdp + '/ListDatasets',
  //创建数据集
  createDatasetApi: PrefixAimdp + '/CreateDataset',
  //获取标签列表
  tagListApi: PrefixAimdp + '/ListTags',
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
  editDatasetVersionApi: PrefixAimdp + '/EditDatasetTargetVersion',
  //获取数据集版本列表
  datasetVersionListApi: PrefixAimdp + '/ListDatasetVersion',
  //版本重新生成
  datasetVersionRebuildApi: PrefixAimdp + '/RenewDatasetTargetVersion',
  //数据内容文件表
  dataContentFileList: PrefixAimdp + '/GetDatasetFilesTargetVersion',
  //数据内容数据库表
  dataContentTableList: PrefixAimdp + '/GetDatasetTableTargetVersion',

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

  // 数据标注接口
  // 数据标注配置 发布
  publishRequirementApi: PrefixLabelService + '/createRequirement',
  // 需求详情查看
  getRequirementDetailApi: PrefixLabelService + '/queryRequirement',
  // 获取数据标注列表
  getAnnotationListApi: PrefixLabelService + '/listRequirement',
  // 标注下载结果
  getAnnotationDownloadApi: PrefixLabelService + '/resultDownlaodRequirement',
  // 获取数据标注 - 任务列表
  getAnnotationTaskListApi: PrefixLabelService + '/taskList',
  // 获取部门列表树内容
  getDepartmentTreeListApi: PrefixAuth + '/organization/tree',
  // 获取个人列表树内容
  getIndividualTreeListApi: PrefixAuth + '/user/organization/search',
  //  查询标注数据表格内容
  getAnnotationTabledDataApi:
    PrefixAimdp + '/load_tasks/source_dir/files/statistics_page',

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
  sqlOpenApi: PrefixAimdp + '/GetSqlFile',
  sqlSaveApi: PrefixAimdp + '/EditSqlFile',
  sqlRunApi: PrefixAimdp + '/RunSqlFile',
  sqlRunCancelApi: PrefixAimdp + '/StopSqlFile',
  sqlRunResultApi: PrefixAimdp + '/GetSqlFileRunResultt',
  sqlRunLogApi: PrefixAimdp + '/GetSqlFileRunLog',
  sqlExportDataset: PrefixAimdp + '/CreateSqlExportTask',
  sqlExportDatasetVersion: PrefixAimdp + '/UpdateSqlExportTaskVersion',
  sqlExportDatasetList: PrefixAimdp + '/ListSqlExportTask',
  sqlExportDatasetStopApi: PrefixAimdp + '/StopSqlExportTask',
  sqlExportDatasetRetryApi: PrefixAimdp + '/RetrySqlExportTask',
  sqlExportDatasetDetailApi: PrefixAimdp + '/GetSqlExportTaskInfo',
  datasetsOptionsApi: PrefixAimdp + '/ListDatasets',

  leGetTask: PrefixLabelService + '/getTask',
  leGetTaskById: PrefixLabelService + '/getTaskById',
  leGetLabels: PrefixLabelService + '/getLabels',
  leSaveTask: PrefixLabelService + '/saveTask',
  leGetTaskReuslt: PrefixLabelService + '/getTaskResult'
};

/**
 * 动作端点声明
 * 动作端点，指按照语义式API命名风格，统一HTTP调用方式为POST，直接将API作用名称称之为API路径，路径内不出现URI参数
 * 注意不要修改该变量名（用于代码提示）
 */
export const ActionEndpoints = {
  // 在该对象内添加动作端点声明
};

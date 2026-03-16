// API端点声明

/**
 * 资源端点声明
 * 资源端点，指按照REST方式API命名风格，根据各种操作使用不同的HTTP调用方式，路径内可能涵盖URI参数
 * 注意不要修改该变量名（用于代码提示）
 */

// todo 以下为临时联调硬编码方案，环境部署上线需要为正式环境
const API_PREFIX = '/ceai';
export const PrefixAimdp = API_PREFIX + '/aimdp-manager/api/v1';
export const PrefixUserSpace = API_PREFIX + '/user-space/api/v1';
export const PrefixAuthCenter = API_PREFIX + '/auth-center/api/v1';

// 本体行为服务
export const PrefixOntology = API_PREFIX + '/ontology-action/api/v1';

// 多模态数据治理平台接口 - 本体相关
export const NotoResourceEndpoints = {
  // 登录相关
  Login: PrefixUserSpace + '/Login',
  Logout: PrefixUserSpace + '/Logout',
  GetUser: PrefixUserSpace + '/GetUser',
  GetProjOrg: PrefixUserSpace + '/GetProjOrg',
  UpdateMyselfInformation: PrefixUserSpace + '/UpdateMyselfInformation',

  // 权限相关
  ResourcePermissionActions: PrefixAuthCenter + '/GetResourcePermissionActions',

  // 🆕 行为测试相关端点
  // 获取行为列表
  behaviorList: PrefixAimdp + '/ListBehaviors',
  // 执行行为测试
  behaviorTest: PrefixAimdp + '/ExecuteBehaviorTest',
  // 保存编排方案（可选）
  behaviorOrchestration: PrefixAimdp + '/SaveBehaviorOrchestration',
  // 获取历史记录（可选）
  behaviorHistory: PrefixAimdp + '/ListBehaviorHistory',
  // 执行记录
  PageExecuteTestLog: PrefixAimdp + '/PageExecuteTestLog',
  // 执行记录详情
  GetExecuteTestLog: PrefixAimdp + '/GetExecuteTestLog',

  // 本体拓扑
  // 获取本体拓扑
  GetOntologyTopologyApi: PrefixAimdp + '/GetOntologyTopology',
  // 分页查询对象类型实例数据
  ListOntologyObjectTypeDataApi: PrefixAimdp + '/ListOntologyObjectTypeData',
  // 获取物理属性列表
  ListOntologyPhysicalPropertiesApi:
    PrefixAimdp + '/ListOntologyPhysicalProperties',
  // 获取链接类型列表
  ListOntologyLinkTypeApi: PrefixAimdp + '/ListOntologyLinkType',

  // 本体场景
  // 获取本体场景列表
  ListOntologyModelApi: PrefixAimdp + '/ListOntologyModel',
  // 创建本体场景
  CreateOntologyModelApi: PrefixAimdp + '/CreateOntologyModel',
  // 更新本体场景
  UpdateOntologyModelApi: PrefixAimdp + '/UpdateOntologyModel',
  // 删除本体场景
  DeleteOntologyModelApi: PrefixAimdp + '/DeleteOntologyModel',
  // 获取本体场景详情
  GetOntologyModelDetailApi: PrefixAimdp + '/GetOntologyModelDetail',

  // 对象类型
  // 获取对象类型列表
  ListOntologyObjectTypeApi: PrefixAimdp + '/ListOntologyObjectType',
  // 创建对象类型
  CreateOntologyObjectTypeApi: PrefixAimdp + '/CreateOntologyObjectType',
  // 更新对象类型
  UpdateOntologyObjectTypeApi: PrefixAimdp + '/UpdateOntologyObjectType',
  // 删除对象类型
  DeleteOntologyObjectTypeApi: PrefixAimdp + '/DeleteOntologyObjectType',
  // 获取对象类型详情
  GetOntologyObjectTypeApi: PrefixAimdp + '/GetOntologyObjectType',
  // 上传CSV文件并解析
  UploadOntologyEntityDataFileApi:
    PrefixAimdp + '/UploadOntologyEntityDataFile',
  // 本体查询iceberg表的字段信息
  ListMetadataIcebergTiDBTableApi: PrefixAimdp + '/ListMetadataIcebergTiDB',
  // 下载标准模版
  GetTemplateFileApi: PrefixAimdp + '/GetTemplateFile',
  // 获取对象类型同步日志
  GetObjectTypeSyncTaskLogApi: PrefixAimdp + '/GetObjectTypeSyncTaskLog',
  // 同步对象类型任务
  SyncObjectTypeTaskApi: PrefixAimdp + '/SyncObjectTypeTask',

  //属性
  // 获取公共属性列表
  ListOntologyPublicPropertiesApi:
    PrefixAimdp + '/ListOntologyPublicProperties',
  // 创建公共属性
  CreateOntologyPublicPropertiesApi:
    PrefixAimdp + '/CreateOntologyPublicProperties',
  // 删除公共属性
  DeleteOntologyPublicPropertiesApi:
    PrefixAimdp + '/DeleteOntologyPublicProperties',
  // 更新公共属性
  UpdateOntologyPublicPropertiesApi:
    PrefixAimdp + '/UpdateOntologyPublicProperties',

  // 链接
  // 获取链接的属性列表
  ListOntologyLinkTypeColumnApi: PrefixAimdp + '/ListOntologyLinkTypeColumn',
  // 获取链接的实例列表
  ListOntologyLinkDataApi: PrefixAimdp + '/ListOntologyLinkData',
  // 创建链接类型
  CreateOntologyLinkTypeApi: PrefixAimdp + '/CreateOntologyLinkType',
  // 更新链接类型
  UpdateOntologyLinkTypeApi: PrefixAimdp + '/UpdateOntologyLinkType',
  // 获取链接类型详细信息
  GetOntologyLinkTypeApi: PrefixAimdp + '/GetOntologyLinkType',
  // 删除链接类型
  DeleteOntologyLinkTypeApi: PrefixAimdp + '/DeleteOntologyLinkType',
  // 获取链接类型同步日志
  GetLinkTypeSyncTaskLogApi: PrefixAimdp + '/GetLinkTypeSyncTaskLog',
  // 同步链接类型任务
  SyncLinkTypeTaskApi: PrefixAimdp + '/SyncLinkTypeTask',

  // ===================== 本体函数相关 =====================
  // 函数列表
  GetOntologyFunctionListApi: PrefixAimdp + '/ListOntologyFunction',
  // 函数测试
  ExecuteFunctionTestAPi: PrefixAimdp + '/ExecuteTest',
  // 停止函数测试
  StopFunctionTestAPi: PrefixAimdp + '/StopTest',
  // 函数详情
  GetOntologyFunctionDetailApi: PrefixAimdp + '/GetOntologyFunction',
  // 创建函数
  CreateOntologyFunctionApi: PrefixAimdp + '/CreateOntologyFunction',
  // 更新函数
  UpdateOntologyFunctionApi: PrefixAimdp + '/UpdateOntologyFunction',
  // 删除函数
  DeleteOntologyFunctionListApi: PrefixAimdp + '/DeleteOntologyFunction',
  // 本体函数SDK
  GetOntologyFunctionSDKDocApi: PrefixAimdp + '/GetOntologyFunctionSDKDoc',
  // 本体函数文件上传
  UploadOntologyActionDataFileApi:
    PrefixAimdp + '/UploadOntologyActionDataFile',

  // 本体行为
  // ===================== 本体行为相关 =====================
  // 创建本体行为
  CreateOntologyActionApi: PrefixAimdp + '/CreateOntologyAction',
  // 获取本体行为列表
  GetListOntologyActionApi: PrefixAimdp + '/ListOntologyAction',
  // 获取本体行为详情
  GetOntologyActionApi: PrefixAimdp + '/GetOntologyAction',
  // 删除本体行为
  DeleteOntologyActionApi: PrefixAimdp + '/DeleteOntologyAction',
  // 更新本体行为
  UpdateOntologyActionApi: PrefixAimdp + '/UpdateOntologyAction'
};

/**
 * 动作端点声明
 * 动作端点，指按照语义式API命名风格，统一HTTP调用方式为POST，直接将API作用名称称之为API路径，路径内不出现URI参数
 * 注意不要修改该变量名（用于代码提示）
 */
export const ActionEndpoints = {
  // 在该对象内添加动作端点声明
};

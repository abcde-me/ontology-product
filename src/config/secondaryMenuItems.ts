/** 侧栏二级菜单名称，与 admin/layout/menus.tsx 中 children 保持一致 */
export const SECONDARY_MENU_ITEMS = {
  home: '首页',
  ontologyOverview: '本体概览',
  OntologySceneLibrary: '本体场景库',
  ontologyElements: '本体要素',
  ontologyPermission: '本体权限',
  ontologyMonitor: '本体监控',
  AIOntoWorkbench: 'AI建本体',
  OntologyQuery: '本体查询',
  ObjectBrowse: '对象浏览',
  RelationInsight: '关系探查',
  ImplicitRelation: '关系挖掘',
  InferenceAnalysis: '推理分析',
  AutomationRuleManagement: '规则管理',
  AutomationRuleRunLog: '执行日志',
  ApplicationScenario: '应用场景',
  ComponentManagement: '组件管理',
  IntelligenceAnalysis: '情报分析',
  CounterEspionage: '反间谍',
  SituationalAwareness: '态势感知',
  JointOperations: '跨域协同',
  LogisticsSupport: '后勤保障',
  ModelResearch: '型号研究',
  SimulationComparison: '仿真对比',
  SimulationDeduction: '仿真推演',
  KnowledgeBase: '知识库',
  SemanticMapping: '语义映射',
  DomainAxiom: '领域公理',
  DataSourceManagement: '数据源管理',
  DataResourceManagement: '数据资源',
  DataTaskManagement: '任务执行',
  DataTaskManagement2: '数据任务',
  apiManagement: 'API管理',
  modelManagement: '模型管理',
  sdkManagement: 'SDK管理'
} as const;

export type SecondaryMenuKey = keyof typeof SECONDARY_MENU_ITEMS;

export const getSecondaryMenuTitle = (key: SecondaryMenuKey | string): string =>
  SECONDARY_MENU_ITEMS[key as SecondaryMenuKey] ?? key;

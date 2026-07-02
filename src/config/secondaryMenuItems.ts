/** 侧栏二级菜单名称，与 admin/layout/menus.tsx 中 children 保持一致 */
export const SECONDARY_MENU_ITEMS = {
  home: '首页',
  ontologyOverview: '本体概览',
  OntologySceneLibrary: '本体场景库',
  ontologyElements: '本体要素',
  AIOntoWorkbench: 'AI本体工作台',
  OntologyQuery: '本体查询',
  ObjectBrowse: '对象浏览',
  RelationInsight: '关系洞察',
  ImplicitRelation: '隐性关系',
  AutomationRuleManagement: '规则管理',
  AutomationRuleRunLog: '执行日志',
  ApplicationScenario: '应用场景',
  IntelligenceAnalysis: '情报分析',
  JointOperations: '跨域火力协同',
  DataSourceManagement: '数据源管理',
  DataResourceManagement: '数据资源',
  DataTaskManagement: '任务执行',
  DataTaskManagement2: '数据任务',
  apiManagement: 'API管理',
  modelManagement: '模型管理'
} as const;

export type SecondaryMenuKey = keyof typeof SECONDARY_MENU_ITEMS;

export const getSecondaryMenuTitle = (key: SecondaryMenuKey | string): string =>
  SECONDARY_MENU_ITEMS[key as SecondaryMenuKey] ?? key;

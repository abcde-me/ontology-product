// 菜单分组 key
export const ONTOLOGY_SCENE_MENU_GROUP_KEYS = {
  ENTITIES: 'entities', // 实体与关系
  LOGIC: 'logic', // 逻辑与行为
  DEBUG: 'debug' // 运行与调试
} as const;

// 菜单项 key
export const ONTOLOGY_SCENE_MENU_ITEM_KEYS = {
  GRAPH: 'graph', // 本体图谱
  OBJECT_TYPE: 'objectType', // 对象类型
  ATTRIBUTES: 'attributes', // 属性
  LINKS: 'links', // 链接
  BEHAVIOR_ACTIONS: 'behaviorActions', // 行为动作
  FUNCTIONS: 'functions', // 函数
  BEHAVIOR_LOG: 'behaviorLog' // 行为日志
} as const;

// 本体场景菜单 key
export const ONTOLOGY_SCENE_MENU_KEYS = {
  ...ONTOLOGY_SCENE_MENU_GROUP_KEYS,
  ...ONTOLOGY_SCENE_MENU_ITEM_KEYS
} as const;

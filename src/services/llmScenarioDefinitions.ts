import {
  getSecondaryMenuTitle,
  type SecondaryMenuKey
} from '@/config/secondaryMenuItems';

/** 大模型环节元信息（不含运行时配置） */
export interface LlmScenarioDefinition {
  /** 环节唯一编码，建议使用 snake_case */
  code: string;
  /** 环节名称 */
  name: string;
  /** 关联侧栏二级菜单 key，与 menus.tsx 中 children.key 一致 */
  menuKey: SecondaryMenuKey;
  /** 环节说明 */
  description: string;
  /** 列表排序，数值越小越靠前 */
  order?: number;
}

export const resolveLlmScenarioModule = (definition: LlmScenarioDefinition) =>
  getSecondaryMenuTitle(definition.menuKey);

/** 内置大模型环节（静态定义，避免微前端多 bundle 下注册表丢失） */
export const BUILTIN_LLM_SCENARIOS: readonly LlmScenarioDefinition[] = [
  {
    code: 'ai_workbench_chat',
    name: 'AI本体工作台对话',
    menuKey: 'AIOntoWorkbench',
    description: '工作台中的智能对话与本体辅助构建',
    order: 10
  },
  {
    code: 'ontology_agent_create',
    name: '本体Agent创建',
    menuKey: 'AIOntoWorkbench',
    description: '创建本体场景 Agent 时使用的大模型参数',
    order: 20
  },
  {
    code: 'scene_version_summary',
    name: '版本差异总结',
    menuKey: 'OntologySceneLibrary',
    description: '本体场景版本差异的 AI 智能总结',
    order: 30
  },
  {
    code: 'object_type_template',
    name: 'CSV 数据生成',
    menuKey: 'OntologySceneLibrary',
    description: '根据对象类型名称与描述自动生成 CSV 导入模板',
    order: 40
  },
  {
    code: 'ontology_field_vectorization',
    name: '本体字段向量化',
    menuKey: 'OntologySceneLibrary',
    description:
      '对象类型字段开启向量化时，使用 DeepSeek Embedding 模型将文本转为向量；相似性查询基于语义向量匹配',
    order: 45
  },
  {
    code: 'object_browse_semantic_query',
    name: '对象浏览语义查询',
    menuKey: 'ObjectBrowse',
    description: '根据自然语言问题描述解析查询意图并生成 SQL',
    order: 50
  },
  {
    code: 'ontology_function_name_gen',
    name: '函数名称智能生成',
    menuKey: 'OntologySceneLibrary',
    description: '根据函数显示名称自动生成函数名称(id)',
    order: 54
  },
  {
    code: 'ontology_object_type_id_gen',
    name: '对象类型ID智能生成',
    menuKey: 'OntologySceneLibrary',
    description: '根据对象类型名称自动生成对象类型 id',
    order: 53
  },
  {
    code: 'ontology_function_codegen',
    name: '函数代码智能生成',
    menuKey: 'OntologySceneLibrary',
    description: '根据函数描述说明与 SDK 开发文档自动生成 Python 函数代码',
    order: 55
  },
  {
    code: 'ontology_smart_link',
    name: '智能创建链接',
    menuKey: 'OntologySceneLibrary',
    description: '从数据资源创建对象类型时，根据场景与字段信息智能推理链接关系',
    order: 56
  },
  {
    code: 'ontology_behavior_function_recommend',
    name: '行为函数智能推荐',
    menuKey: 'OntologySceneLibrary',
    description: '创建行为时，根据行为名称与描述智能推荐场景内可绑定的函数',
    order: 57
  },
  {
    code: 'instance_sync_column_mapping',
    name: '实例同步字段映射',
    menuKey: 'ontologyElements',
    description:
      '对象类型实例同步时，根据属性名称与源表字段注释智能匹配映射关系',
    order: 58
  },
  {
    code: 'kafka_jsonpath_rule_gen',
    name: 'Kafka JSONPath 规则生成',
    menuKey: 'ontologyElements',
    description:
      'Kafka 实例同步时，根据原始消息样本智能生成 JSONPath 解析规则或路径映射',
    order: 59
  },
  {
    code: 'implicit_relation_rule_gen',
    name: '隐性关系推理规则生成',
    menuKey: 'ImplicitRelation',
    description: '将自然语言描述智能转换为隐性关系推理规则、图算法或常识提示词',
    order: 60
  }
];

export const AI_WORKBENCH_CHAT_SCENARIO = BUILTIN_LLM_SCENARIOS[0];
export const ONTOLOGY_AGENT_CREATE_SCENARIO = BUILTIN_LLM_SCENARIOS[1];
export const SCENE_VERSION_SUMMARY_SCENARIO = BUILTIN_LLM_SCENARIOS[2];
export const OBJECT_TYPE_TEMPLATE_SCENARIO = BUILTIN_LLM_SCENARIOS[3];
export const ONTOLOGY_FIELD_VECTORIZATION_SCENARIO = BUILTIN_LLM_SCENARIOS[4];
export const OBJECT_BROWSE_SEMANTIC_QUERY_SCENARIO = BUILTIN_LLM_SCENARIOS[5];
export const ONTOLOGY_FUNCTION_NAME_GEN_SCENARIO = BUILTIN_LLM_SCENARIOS[6];
export const ONTOLOGY_OBJECT_TYPE_ID_GEN_SCENARIO = BUILTIN_LLM_SCENARIOS[7];
export const ONTOLOGY_FUNCTION_CODEGEN_SCENARIO = BUILTIN_LLM_SCENARIOS[8];
export const ONTOLOGY_SMART_LINK_SCENARIO = BUILTIN_LLM_SCENARIOS[9];
export const ONTOLOGY_BEHAVIOR_FUNCTION_RECOMMEND_SCENARIO =
  BUILTIN_LLM_SCENARIOS[10];
export const INSTANCE_SYNC_COLUMN_MAPPING_SCENARIO = BUILTIN_LLM_SCENARIOS[11];
export const KAFKA_JSONPATH_RULE_GEN_SCENARIO = BUILTIN_LLM_SCENARIOS[12];
export const IMPLICIT_RELATION_RULE_GEN_SCENARIO = BUILTIN_LLM_SCENARIOS[13];

const scenarioMap = new Map(
  BUILTIN_LLM_SCENARIOS.map((item) => [item.code, item])
);

export const getBuiltinLlmScenario = (code: string) => scenarioMap.get(code);

export const sortLlmScenarioDefinitions = (
  items: LlmScenarioDefinition[]
): LlmScenarioDefinition[] =>
  [...items].sort((a, b) => {
    const orderDiff = (a.order ?? 100) - (b.order ?? 100);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    return a.code.localeCompare(b.code);
  });

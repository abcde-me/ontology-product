import General1Icon from '@/pages/ontologyScene/assets/general-one.png';
import GeneralIcon2 from '@/pages/ontologyScene/assets/general-two.png';
import GeneralIcon3 from '@/pages/ontologyScene/assets/general-three.png';
import GeneralIcon4 from '@/pages/ontologyScene/assets/general-four.png';
import GeneralIcon5 from '@/pages/ontologyScene/assets/general-five.png';
import CombatSceneIcon from '@/pages/ontologyScene/assets/combat-scene.png';
import SupplyChainSceneIcon from '@/pages/ontologyScene/assets/supply-chain-scene.png';
import ReconnaissanceSceneIcon from '@/pages/ontologyScene/assets/reconnaissance-scene.png';
import LogisticsSupportSceneIcon from '@/pages/ontologyScene/assets/logistics-support-scene.png';
import IntelligenceAnalysisSceneIcon from '@/pages/ontologyScene/assets/intelligence-analysis-scene.png';
import ExerciseSceneIcon from '@/pages/ontologyScene/assets/exercise-scene.png';
import OperationsMaintenanceSceneIcon from '@/pages/ontologyScene/assets/operations-maintenance-scene.png';
import InformationSceneIcon from '@/pages/ontologyScene/assets/information-scene.png';
import SecurityDefenseSceneIcon from '@/pages/ontologyScene/assets/security-defense-scene.png';
import CommunicationSceneIcon from '@/pages/ontologyScene/assets/communication-scene.png';
import ObjectTypeIcon1 from '@/pages/ontologyScene/assets/object-type-one.svg';
import ObjectTypeIcon2 from '@/pages/ontologyScene/assets/object-type-two.svg';
import ObjectTypeIcon3 from '@/pages/ontologyScene/assets/object-type-three.svg';
import ObjectTypeIcon4 from '@/pages/ontologyScene/assets/object-type-four.svg';
import ObjectTypeIcon5 from '@/pages/ontologyScene/assets/object-type-five.svg';
import ObjectTypeIcon6 from '@/pages/ontologyScene/assets/object-type-six.svg';
import ObjectTypeFighter from '@/pages/ontologyScene/assets/object-type-fighter.svg';
import ObjectTypeDrone from '@/pages/ontologyScene/assets/object-type-drone.svg';
import ObjectTypeCameraPoint from '@/pages/ontologyScene/assets/object-type-camera-point.svg';
import ObjectTypePerson from '@/pages/ontologyScene/assets/object-type-person.svg';
import ObjectTypeIntelligence from '@/pages/ontologyScene/assets/object-type-intelligence.svg';
import ObjectTypeCivilAviation from '@/pages/ontologyScene/assets/object-type-civil-aviation.svg';
import ObjectTypeCoalMine from '@/pages/ontologyScene/assets/object-type-coal-mine.svg';
import ObjectTypeWarship from '@/pages/ontologyScene/assets/object-type-warship.svg';
import ObjectTypeBuilding from '@/pages/ontologyScene/assets/object-type-building.svg';
import ObjectTypeLocation from '@/pages/ontologyScene/assets/object-type-location.svg';
import ObjectTypeOffice from '@/pages/ontologyScene/assets/object-type-office.svg';
import AttachmentIcon from '@/pages/ontologyScene/assets/attachement-icon.svg'; // 注意文件名拼写
import { SyncStatus } from '@/types/graphApi';

// 本体场景预定义图标选项（15个图标，对应图片中的所有场景）
export const ICON_OPTIONS = [
  { value: 'general-1', icon: General1Icon }, // 通用-1
  { value: 'general-2', icon: GeneralIcon2 }, // 通用-2
  { value: 'general-3', icon: GeneralIcon3 }, // 通用-3
  { value: 'general-4', icon: GeneralIcon4 }, // 通用-4
  { value: 'general-5', icon: GeneralIcon5 }, // 通用-5
  { value: 'combat-scene', icon: CombatSceneIcon }, // 作战场景
  { value: 'supply-chain-scene', icon: SupplyChainSceneIcon }, // 供应链场景
  { value: 'reconnaissance-scene', icon: ReconnaissanceSceneIcon }, // 侦查场景
  { value: 'logistics-support-scene', icon: LogisticsSupportSceneIcon },
  { value: 'intelligence-analysis-scene', icon: IntelligenceAnalysisSceneIcon }, // 情报分析场景
  { value: 'exercise-scene', icon: ExerciseSceneIcon }, // 演习场景
  {
    value: 'operations-maintenance-scene',
    icon: OperationsMaintenanceSceneIcon
  }, // 运维场景
  { value: 'information-scene', icon: InformationSceneIcon }, // 信息场景
  { value: 'security-defense-scene', icon: SecurityDefenseSceneIcon }, // 安全防御场景
  { value: 'communication-scene', icon: CommunicationSceneIcon } // 通讯场景
];

// 对象类型预定义图标选项
export const OBJECT_TYPE_ICON_OPTIONS = [
  { value: 'object-type-1', icon: ObjectTypeIcon1 }, // 通用-1
  { value: 'object-type-2', icon: ObjectTypeIcon2 }, // 通用-2
  { value: 'object-type-3', icon: ObjectTypeIcon3 }, // 通用-3
  { value: 'object-type-4', icon: ObjectTypeIcon4 }, // 通用-4
  { value: 'object-type-5', icon: ObjectTypeIcon5 }, // 通用-5
  { value: 'object-type-6', icon: ObjectTypeIcon6 }, // 通用-6
  { value: 'object-type-fighter', icon: ObjectTypeFighter }, // 战斗机
  { value: 'object-type-drone', icon: ObjectTypeDrone }, // 无人机
  { value: 'object-type-camera-point', icon: ObjectTypeCameraPoint }, // 摄像点位
  { value: 'object-type-person', icon: ObjectTypePerson }, // 人员
  { value: 'object-type-intelligence', icon: ObjectTypeIntelligence }, // 情报
  { value: 'object-type-civil-aviation', icon: ObjectTypeCivilAviation }, // 民航
  { value: 'object-type-coal-mine', icon: ObjectTypeCoalMine }, // 煤矿
  { value: 'object-type-warship', icon: ObjectTypeWarship }, // 军舰
  { value: 'object-type-building', icon: ObjectTypeBuilding }, // 建筑
  { value: 'object-type-location', icon: ObjectTypeLocation }, // 地点
  { value: 'object-type-office', icon: ObjectTypeOffice }, // 办公
  { value: 'attachment-icon', icon: AttachmentIcon } // 附件专用图标
];

// 对象类型同步状态配置
export const OBJECT_TYPE_SYNC_STATUS_CONFIG: Record<
  SyncStatus,
  { text: string; color: string }
> = {
  [SyncStatus.NOT_SYNC]: {
    text: '未同步',
    color: '#86909c'
  },
  [SyncStatus.SYNCING]: {
    text: '同步中',
    color: '#165dff'
  },
  [SyncStatus.SUCCESS]: {
    text: '成功',
    color: '#00b42a'
  },
  [SyncStatus.FAILED]: {
    text: '失败',
    color: '#f53f3f'
  }
};

// 对象类型同步状态筛选选项
export const OBJECT_TYPE_SYNC_STATUS_FILTERS = [
  { text: '未同步', value: SyncStatus.NOT_SYNC },
  { text: '同步中', value: SyncStatus.SYNCING },
  { text: '成功', value: SyncStatus.SUCCESS },
  { text: '失败', value: SyncStatus.FAILED }
];

// 数据源类型枚举
export const DATA_SOURCE_TYPE = {
  /** 手动填写属性，无模板导入 */
  MANUAL_CREATION: 'manual_creation',
  /** 本地CSV导入 */
  LOCAL_CSV: 'local_csv',
  /** 数据目录同步 */
  DATA_DIRECTORY_SYNC: 'data_directory_sync',
  /** 数据资源列表选表 */
  DATA_RESOURCE: 'data_resource'
} as const;

export type DataSourceType =
  (typeof DATA_SOURCE_TYPE)[keyof typeof DATA_SOURCE_TYPE];

/** 实例同步数据源类型 */
export const INSTANCE_SYNC_SOURCE_TYPE = {
  CSV_UPLOAD: 'csv_upload',
  DATABASE: 'database',
  MESSAGE_QUEUE: 'message_queue',
  API_INTERFACE: 'api_interface',
  FILE_PARSE: 'file_parse',
  WORKFLOW: 'workflow'
} as const;

export type InstanceSyncSourceType =
  (typeof INSTANCE_SYNC_SOURCE_TYPE)[keyof typeof INSTANCE_SYNC_SOURCE_TYPE];

/** 实例同步数据源类型展示文案 */
export const INSTANCE_SYNC_SOURCE_TYPE_LABEL: Record<
  InstanceSyncSourceType,
  string
> = {
  [INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD]: 'CSV上传',
  [INSTANCE_SYNC_SOURCE_TYPE.DATABASE]: '数据库',
  [INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE]: '消息队列',
  [INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE]: 'API接口',
  [INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE]: '文件解析',
  [INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW]: '工作流'
};

export const INSTANCE_SYNC_SOURCE_TYPE_OPTIONS: Array<{
  value: InstanceSyncSourceType;
  label: string;
}> = Object.entries(INSTANCE_SYNC_SOURCE_TYPE_LABEL).map(([value, label]) => ({
  value: value as InstanceSyncSourceType,
  label
}));

/** Kafka 消息解析模式 */
export const KAFKA_MESSAGE_PARSE_MODE = {
  NONE: 'none',
  STRUCTURED: 'structured'
} as const;

export type KafkaMessageParseMode =
  (typeof KAFKA_MESSAGE_PARSE_MODE)[keyof typeof KAFKA_MESSAGE_PARSE_MODE];

/** Kafka 消息解析模式选项文案（禁止浏览器自动翻译，避免「结构化」被误译为「构造」） */
export const KAFKA_MESSAGE_PARSE_MODE_LABEL: Record<
  KafkaMessageParseMode,
  string
> = {
  [KAFKA_MESSAGE_PARSE_MODE.NONE]: '不解析',
  [KAFKA_MESSAGE_PARSE_MODE.STRUCTURED]: '解析为结构化字段'
};

/** Kafka 数组处理模式 */
export const KAFKA_ARRAY_HANDLE_MODE = {
  INDEX_FLATTEN: 'index_flatten',
  SPLIT_RECORDS: 'split_records',
  RAW_STRING: 'raw_string'
} as const;

export type KafkaArrayHandleMode =
  (typeof KAFKA_ARRAY_HANDLE_MODE)[keyof typeof KAFKA_ARRAY_HANDLE_MODE];

export const DEFAULT_KAFKA_MAX_FLATTEN_DEPTH = 2;

/** Kafka 专业术语：界面统一展示 Topic，不做中文翻译 */
export const KAFKA_TOPIC_LABEL = 'Topic';
export const KAFKA_TOPIC_SELECT_PLACEHOLDER = '请选择 Topic';
export const KAFKA_TOPIC_REQUIRED_MESSAGE = '请选择 Topic';

/** Kafka 结构化解析规则 */
export const KAFKA_STRUCTURED_PARSE_RULE = {
  DEFAULT: 'default',
  AI_GENERATED: 'ai_generated',
  /** 手动填写 JSONPath 映射 */
  PATH_MANUAL: 'path_manual'
} as const;

export type KafkaStructuredParseRule =
  (typeof KAFKA_STRUCTURED_PARSE_RULE)[keyof typeof KAFKA_STRUCTURED_PARSE_RULE];

/** 默认规则：固定最大展平深度 */
export const DEFAULT_KAFKA_DEFAULT_RULE_MAX_FLATTEN_DEPTH = 1;

export const KAFKA_ARRAY_HANDLE_MODE_LABEL: Record<
  KafkaArrayHandleMode,
  string
> = {
  [KAFKA_ARRAY_HANDLE_MODE.INDEX_FLATTEN]: '下标展平',
  [KAFKA_ARRAY_HANDLE_MODE.SPLIT_RECORDS]: '拆成多条记录',
  [KAFKA_ARRAY_HANDLE_MODE.RAW_STRING]: '原样存字符串'
};

/** Kafka AI 规则生成默认提示词 */
export const DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT = `任务：根据【原始JSON样本】和【目标输出结构】，生成标准化 JSONPath 解析规则。
要求：
1. 输出固定 JSON 格式，不要多余解释、不要 markdown；
2. 规则包含 field_mapping（字段映射）、default_value（默认值，可选）；
3. JSONPath 使用多层级路径，根节点用 $，需兼容 Go 库 github.com/vmware-labs/yaml-jsonpath；
4. 字符串内嵌 JSON 的场景（如 payload 字段）直接写完整路径，例如 $.payload.temperature，不要使用 need_deserialize；
5. 严格对齐目标字段名与类型；
6. 如果是 Canal CDC 数组格式，data 字段是数组，需要设置 array_iterate_path=$.data 并逐条解析。`;

export function resolveKafkaAiRulePrompt(prompt?: string): string {
  const trimmed = prompt?.trim();
  return trimmed || DEFAULT_KAFKA_AI_RULE_GENERATION_PROMPT;
}

/** 详情页：来源类型为手动创建时「数据来源」展示文案 */
export const DETAIL_MANUAL_CREATION_SOURCE_LABEL = '手动创建';

/** 详情页：来源类型为本地 CSV 时「数据来源」展示文案 */
export const DETAIL_LOCAL_CSV_SOURCE_LABEL = '本地CSV导入';

/** 详情页：来源类型为数据库/表 时「数据来源」展示文案 */
export const DETAIL_DATABASE_TABLE_SOURCE_LABEL = '数据库/表';

/** 详情页：来源类型为数据资源选表 时「数据来源」展示文案 */
export const DETAIL_DATA_RESOURCE_SOURCE_LABEL = '数据资源';

export const COLUMN_TYPE_OPTIONS = [
  {
    label: 'tinyint',
    value: 'tinyint'
  },
  {
    label: 'int',
    value: 'int'
  },
  {
    label: 'bigint',
    value: 'bigint'
  },
  {
    label: 'float',
    value: 'float'
  },
  {
    label: 'double',
    value: 'double'
  },
  {
    label: 'varchar(100)',
    value: 'varchar(100)'
  },
  {
    label: 'varchar(500)',
    value: 'varchar(500)'
  },
  {
    label: 'varchar(2000)',
    value: 'varchar(2000)'
  },
  {
    label: 'text',
    value: 'text'
  },
  {
    label: 'json',
    value: 'json'
  }
];

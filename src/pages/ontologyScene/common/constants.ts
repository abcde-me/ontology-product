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
import ObjectTypeIcon1 from '@/pages/ontologyScene/assets/object-type1.svg';
import ObjectTypeIcon2 from '@/pages/ontologyScene/assets/object-type2.svg';
import ObjectTypeIcon3 from '@/pages/ontologyScene/assets/object-type3.svg';
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

// 对象类型预定义图标选项（6个图标，用于2行3列网格布局）
export const OBJECT_TYPE_ICON_OPTIONS = [
  { value: 'object-type-1', icon: ObjectTypeIcon1 },
  { value: 'object-type-2', icon: ObjectTypeIcon2 },
  { value: 'object-type-3', icon: ObjectTypeIcon3 },
  { value: 'object-type-4', icon: ObjectTypeIcon1 },
  { value: 'object-type-5', icon: ObjectTypeIcon2 },
  { value: 'object-type-6', icon: ObjectTypeIcon3 }
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
  /** 本地CSV导入 */
  LOCAL_CSV: 'local_csv',
  /** 数据目录同步 */
  DATA_DIRECTORY_SYNC: 'data_directory_sync'
} as const;

export type DataSourceType =
  (typeof DATA_SOURCE_TYPE)[keyof typeof DATA_SOURCE_TYPE];

// 字段类型选项列表
export const COLUMN_TYPE_OPTIONS = [
  'STRING',
  'DOUBLE',
  'INTEGER',
  'BOOLEAN',
  'TIMESTAMP',
  'DATE',
  'BIGINT',
  'FLOAT',
  'DECIMAL',
  'TEXT'
];

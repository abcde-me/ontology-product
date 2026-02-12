import ObjectTypeCreateIcon from '@/pages/ontologyScene/assets/object-type-create.svg';
import LinkCreateIcon from '@/pages/ontologyScene/assets/link-create.svg';
import BehaviorCreateIcon from '@/pages/ontologyScene/assets/behavior-create.svg';
import TestCreateIcon from '@/pages/ontologyScene/assets/test-create.svg';
import ObjectTypeIcon1 from '@/pages/ontologyScene/assets/object-type1.svg';
import ObjectTypeIcon2 from '@/pages/ontologyScene/assets/object-type2.svg';
import ObjectTypeIcon3 from '@/pages/ontologyScene/assets/object-type3.svg';
import { SyncStatus } from '@/types/graphApi';

// 本体场景预定义图标选项（6个图标，用于2行3列网格布局）
export const ICON_OPTIONS = [
  { value: 'ontology-scene-1', icon: ObjectTypeCreateIcon },
  { value: 'ontology-scene-2', icon: LinkCreateIcon },
  { value: 'ontology-scene-3', icon: BehaviorCreateIcon },
  { value: 'ontology-scene-4', icon: TestCreateIcon },
  { value: 'ontology-scene-5', icon: ObjectTypeCreateIcon },
  { value: 'ontology-scene-6', icon: LinkCreateIcon }
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

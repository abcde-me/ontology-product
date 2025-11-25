/**
 * 树节点类型常量
 */
export const NODE_TYPES = {
  CATALOG: 'catalog',
  DB: 'db',
  DB_ITEM: 'db_item',
  DB_PARENT: 'db_parent',
  DATASOURCE_PARENT: 'datasource_parent',
  DATASOURCE_ITEM: 'datasource_item',
  METADATA_PARENT: 'metadata_parent',
  METADATA: 'metadata',
  VOLUME: 'volume',
  VOLUME_ITEM: 'volume_item'
} as const;

/**
 * 节点类型配置
 */
export type InputNodeType = 'db' | 'datasource' | 'metadata' | 'volumn';

export interface NodeTypeConfig {
  key: InputNodeType;
  label: string;
  suffix: string;
  childType: string;
  parentType: string;
}

/**
 * 节点类型配置映射
 */
export const NODE_TYPE_CONFIGS: Record<string, NodeTypeConfig> = {
  [NODE_TYPES.DB_PARENT]: {
    key: 'db',
    label: '数据库',
    suffix: '-db',
    childType: NODE_TYPES.DB_ITEM,
    parentType: NODE_TYPES.DB_PARENT
  },
  [NODE_TYPES.DATASOURCE_PARENT]: {
    key: 'datasource',
    label: '数据卷',
    suffix: '-datasource',
    childType: NODE_TYPES.DATASOURCE_ITEM,
    parentType: NODE_TYPES.DATASOURCE_PARENT
  },
  [NODE_TYPES.METADATA_PARENT]: {
    key: 'metadata',
    label: '元数据',
    suffix: '-metadata',
    childType: NODE_TYPES.METADATA,
    parentType: NODE_TYPES.METADATA_PARENT
  }
};

/**
 * 可选择的节点类型
 */
export const SELECTABLE_NODE_TYPES = [
  NODE_TYPES.DB,
  NODE_TYPES.DB_ITEM,
  NODE_TYPES.METADATA,
  NODE_TYPES.VOLUME,
  NODE_TYPES.VOLUME_ITEM,
  NODE_TYPES.DATASOURCE_ITEM
] as const;

/**
 * 文件类型数据源（需要显示数据卷节点）
 */
export const FILE_DATA_SOURCE_TYPES = ['local', 'hdfs', 's3'] as const;

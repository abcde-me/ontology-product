import {
  NODE_TYPE_CONFIGS,
  NODE_TYPES,
  FILE_DATA_SOURCE_TYPES
} from '../constants';

/**
 * 获取节点类型配置
 */
export const getNodeTypeConfig = (typeName: string) => {
  return NODE_TYPE_CONFIGS[typeName] || null;
};

/**
 * 生成输入节点key
 */
export const getInputNodeKey = (
  parentId: string | number,
  type: string
): string | null => {
  const config = getNodeTypeConfig(type);
  return config ? `${parentId}${config.suffix}` : null;
};

/**
 * 从key中提取父节点ID
 */
export const extractParentIdFromKey = (
  key: string,
  type: string
): number | null => {
  const config = getNodeTypeConfig(type);
  if (!config) return null;

  const match = key.match(
    new RegExp(`(.+)${config.suffix.replace('-', '\\-')}$`)
  );
  return match ? Number(match[1]) : null;
};

/**
 * 判断是否为文件类型数据源
 */
export const isFileDataSource = (dataSourceType?: string): boolean => {
  if (!dataSourceType) return false;
  return FILE_DATA_SOURCE_TYPES.includes(
    dataSourceType as (typeof FILE_DATA_SOURCE_TYPES)[number]
  );
};

/**
 * 判断是否应该显示数据库节点
 */
export const shouldShowDbNode = (dataSourceType?: string): boolean => {
  return !isFileDataSource(dataSourceType);
};

/**
 * 判断是否应该显示元数据节点
 */
export const shouldShowMetadataNode = (dataSourceType?: string): boolean => {
  return dataSourceType === 'db';
};

/**
 * 判断是否应该显示数据卷节点
 */
export const shouldShowDatasourceNode = (dataSourceType?: string): boolean => {
  return isFileDataSource(dataSourceType);
};

/**
 * 判断节点类型是否为父节点类型（可添加子节点）
 */
export const isParentNodeType = (typeName?: string): boolean => {
  return (
    typeName === NODE_TYPES.DB_PARENT ||
    typeName === NODE_TYPES.DATASOURCE_PARENT ||
    typeName === NODE_TYPES.METADATA_PARENT
  );
};

/**
 * 根据父节点类型获取子节点类型名称
 */
export const getChildTypeName = (
  parentTypeName?: string
): string | undefined => {
  const config = parentTypeName ? getNodeTypeConfig(parentTypeName) : null;
  return config?.childType;
};

import { DataSourceType } from './types';

export type ConnectorCategory = 'sql' | 'api' | 'kafka';

export interface DataSourceTypeMeta {
  label: string;
  connectorType: ConnectorCategory;
  subtype: string;
  color?: string;
}

export const DATA_SOURCE_TYPE_META: Record<DataSourceType, DataSourceTypeMeta> =
  {
    [DataSourceType.MYSQL]: {
      label: 'MySQL',
      connectorType: 'sql',
      subtype: 'mysql',
      color: 'blue'
    },
    [DataSourceType.DAMENG]: {
      label: '达梦数据库',
      connectorType: 'sql',
      subtype: 'dameng',
      color: 'green'
    },
    [DataSourceType.POSTGRES]: {
      label: 'Postgre',
      connectorType: 'sql',
      subtype: 'postgres',
      color: 'purple'
    },
    [DataSourceType.ICEBERG]: {
      label: 'Iceberg',
      connectorType: 'sql',
      subtype: 'iceberg',
      color: 'orange'
    },
    [DataSourceType.API]: {
      label: 'API',
      connectorType: 'api',
      subtype: 'api',
      color: 'cyan'
    },
    [DataSourceType.KAFKA]: {
      label: 'Kafka',
      connectorType: 'kafka',
      subtype: 'kafka',
      color: 'magenta'
    }
  };

export const isSqlDataSourceType = (type: DataSourceType): boolean =>
  DATA_SOURCE_TYPE_META[type].connectorType === 'sql';

export const isApiDataSourceType = (type: DataSourceType): boolean =>
  type === DataSourceType.API;

export const isKafkaDataSourceType = (type: DataSourceType): boolean =>
  type === DataSourceType.KAFKA;

export const getDataSourceTypeLabel = (type: DataSourceType): string =>
  DATA_SOURCE_TYPE_META[type]?.label || type;

export const resolveDataSourceType = (
  connectorType: string,
  subtype: string
): DataSourceType => {
  const matched = Object.entries(DATA_SOURCE_TYPE_META).find(
    ([, meta]) =>
      meta.connectorType === connectorType && meta.subtype === subtype
  );
  if (matched) {
    return matched[0] as DataSourceType;
  }

  if (connectorType === 'api') {
    return DataSourceType.API;
  }
  if (connectorType === 'kafka') {
    return DataSourceType.KAFKA;
  }

  return (subtype as DataSourceType) || DataSourceType.MYSQL;
};

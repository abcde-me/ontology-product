import type {
  ApiConnectorConfigPayload,
  ConnectorConfigPayload,
  KafkaConnectorConfigPayload,
  SqlConnectorConfigPayload
} from '@/api/dataSource/connector';
import { getConnectorMeta } from '@/api/dataSource/connector';
import {
  ApiAuthType,
  ApiHttpMethod,
  ConnectionStatus,
  DataSourceFormData,
  DataSourceItem,
  DataSourceType,
  IcebergWarehouseType,
  OAuth2GrantType,
  type ApiConnectorConfig,
  type ConnectorConfig,
  type IcebergConnectorConfig,
  type KafkaConnectorConfig,
  type SqlConnectorConfig
} from '../types';
import { ConnectionStatusMap } from '@/api/dataSource/connector';
import type { IcebergConnectorConfigPayload } from '@/api/dataSource/connector';
import {
  isApiDataSourceType,
  isIcebergDataSourceType,
  isKafkaDataSourceType,
  isRelationalSqlDataSourceType,
  resolveDataSourceType
} from '../constants';

const isSqlConfig = (config: ConnectorConfig): config is SqlConnectorConfig =>
  'host' in config && 'port' in config && 'user' in config;

const isIcebergConfig = (
  config: ConnectorConfig
): config is IcebergConnectorConfig => 'metastoreUri' in config;

const isApiConfig = (config: ConnectorConfig): config is ApiConnectorConfig =>
  'url' in config && 'method' in config;

const isKafkaConfig = (
  config: ConnectorConfig
): config is KafkaConnectorConfig => 'brokers' in config;

export const parseSqlConnectionInfo = (
  connectionInfo: string
): Pick<SqlConnectorConfig, 'host' | 'port' | 'database'> | null => {
  const match = connectionInfo.match(/^[\w-]+:\/\/([^:/]+):(\d+)(?:\/(.+))?$/);
  if (!match) {
    return null;
  }

  return {
    host: match[1],
    port: match[2],
    database: match[3] || ''
  };
};

export const buildConnectionInfo = (
  dataSourceType: DataSourceType,
  config: ConnectorConfig
): string => {
  if (isIcebergDataSourceType(dataSourceType) && isIcebergConfig(config)) {
    return `iceberg://${config.metastoreUri} | ${config.warehouseUri}`;
  }

  if (isRelationalSqlDataSourceType(dataSourceType) && isSqlConfig(config)) {
    const subtype = getConnectorMeta(dataSourceType).subtype;
    return `${subtype}://${config.host}:${config.port}${config.database ? '/' + config.database : ''}`;
  }

  if (isApiDataSourceType(dataSourceType) && isApiConfig(config)) {
    return `api://${config.method} ${config.url}`;
  }

  if (isKafkaDataSourceType(dataSourceType) && isKafkaConfig(config)) {
    return `kafka://${config.brokers} (${config.consumer_group})`;
  }

  return '-';
};

export const formDataToConnectorConfig = (
  data: DataSourceFormData
): ConnectorConfigPayload => {
  if (isIcebergDataSourceType(data.dataSourceType)) {
    const payload: IcebergConnectorConfigPayload = {
      metastoreUri: data.metastoreUri || '',
      warehouseType: data.warehouseType || IcebergWarehouseType.HDFS,
      warehouseUri: data.warehouseUri || ''
    };

    if (payload.warehouseType === IcebergWarehouseType.MINIO) {
      if (data.s3Region?.trim()) {
        payload.s3Region = data.s3Region.trim();
      }
      payload.s3Endpoint = data.s3Endpoint?.trim() || '';
      payload.s3AccessKey = data.s3AccessKey?.trim() || '';
      payload.s3SecretKey = data.s3SecretKey?.trim() || '';
    }

    if (
      payload.warehouseType === IcebergWarehouseType.HDFS &&
      data.hdfsNameNode?.trim()
    ) {
      payload.hdfsNameNode = data.hdfsNameNode.trim();
    }

    return payload;
  }

  if (isRelationalSqlDataSourceType(data.dataSourceType)) {
    return {
      host: data.host || '',
      port: String(data.port ?? ''),
      user: data.username || '',
      password: data.password || '',
      database: data.database
    } satisfies SqlConnectorConfigPayload;
  }

  if (isApiDataSourceType(data.dataSourceType)) {
    return {
      url: data.apiUrl || '',
      method: data.apiMethod || ApiHttpMethod.GET,
      headers: data.apiHeaders,
      auth_type: data.apiAuthType || ApiAuthType.NONE,
      api_key: data.apiKey,
      api_key_header: data.apiKeyHeader,
      bearer_token: data.bearerToken,
      username: data.username,
      password: data.password,
      oauth2_token_url: data.oauth2TokenUrl,
      oauth2_client_id: data.oauth2ClientId,
      oauth2_client_secret: data.oauth2ClientSecret,
      oauth2_scope: data.oauth2Scope,
      oauth2_grant_type:
        data.oauth2GrantType || OAuth2GrantType.CLIENT_CREDENTIALS,
      request_body: data.requestBody,
      timeout: data.timeout ? String(data.timeout) : undefined,
      data_path: data.dataPath
    } satisfies ApiConnectorConfigPayload;
  }

  return {
    brokers: data.brokers || '',
    consumer_group: data.consumerGroup || '',
    security_protocol: data.securityProtocol,
    sasl_mechanism: data.saslMechanism,
    username: data.username,
    password: data.password
  } satisfies KafkaConnectorConfigPayload;
};

export const connectorConfigToFormData = (
  item: DataSourceItem
): Partial<DataSourceFormData> => {
  const base: Partial<DataSourceFormData> = {
    name: item.name,
    description: item.description,
    dataSourceType: item.dataSourceType
  };

  const config = item.config;
  if (!config) {
    return base;
  }

  if (isIcebergDataSourceType(item.dataSourceType) && isIcebergConfig(config)) {
    return {
      ...base,
      metastoreUri: config.metastoreUri,
      warehouseType:
        (config.warehouseType as IcebergWarehouseType) ||
        IcebergWarehouseType.HDFS,
      warehouseUri: config.warehouseUri,
      s3Region: config.s3Region,
      s3Endpoint: config.s3Endpoint,
      s3AccessKey: config.s3AccessKey ? '******' : '',
      s3SecretKey: config.s3SecretKey ? '******' : '',
      hdfsNameNode: config.hdfsNameNode
    };
  }

  if (
    isRelationalSqlDataSourceType(item.dataSourceType) &&
    isSqlConfig(config)
  ) {
    return {
      ...base,
      host: config.host,
      port: Number(config.port) || undefined,
      database: config.database,
      username: config.user,
      password: config.password ? '******' : ''
    };
  }

  if (isApiDataSourceType(item.dataSourceType) && isApiConfig(config)) {
    return {
      ...base,
      apiUrl: config.url,
      apiMethod: (config.method as ApiHttpMethod) || ApiHttpMethod.GET,
      apiHeaders: config.headers,
      apiAuthType: (config.auth_type as ApiAuthType) || ApiAuthType.NONE,
      apiKey: config.api_key,
      apiKeyHeader: config.api_key_header,
      bearerToken: config.bearer_token,
      username: config.username,
      password: config.password ? '******' : '',
      oauth2TokenUrl: config.oauth2_token_url,
      oauth2ClientId: config.oauth2_client_id,
      oauth2ClientSecret: config.oauth2_client_secret ? '******' : '',
      oauth2Scope: config.oauth2_scope,
      oauth2GrantType:
        (config.oauth2_grant_type as OAuth2GrantType) ||
        OAuth2GrantType.CLIENT_CREDENTIALS,
      requestBody: config.request_body,
      dataPath: config.data_path,
      timeout: config.timeout ? Number(config.timeout) : undefined
    };
  }

  if (isKafkaDataSourceType(item.dataSourceType) && isKafkaConfig(config)) {
    return {
      ...base,
      brokers: config.brokers,
      consumerGroup: config.consumer_group,
      securityProtocol: config.security_protocol,
      saslMechanism: config.sasl_mechanism,
      username: config.username,
      password: config.password ? '******' : ''
    };
  }

  return base;
};

interface BackendDataSourceItem {
  id: number;
  name: string;
  description?: string;
  type: string;
  subtype: string;
  config: ConnectorConfig;
  creator?: string;
  creator_org?: string;
  created_time: string;
  updated_time: string;
  status: string;
}

export const transformBackendItem = (
  item: BackendDataSourceItem
): DataSourceItem => {
  const dataSourceType = resolveDataSourceType(item.type, item.subtype);
  const connectorType = item.type as DataSourceItem['connectorType'];

  return {
    id: String(item.id),
    name: item.name,
    description: item.description || '',
    dataSourceType,
    connectorType,
    connectionInfo: buildConnectionInfo(dataSourceType, item.config),
    connectionStatus:
      ConnectionStatusMap[item.status] ||
      (item.status as ConnectionStatus) ||
      ConnectionStatus.FAILED,
    creator: item.creator,
    creatorOrg: item.creator_org,
    createTime: item.created_time,
    updateTime: item.updated_time,
    config: item.config
  };
};

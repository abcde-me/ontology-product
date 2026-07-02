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
  type ApiConnectorConfig,
  type ConnectorConfig,
  type KafkaConnectorConfig,
  type SqlConnectorConfig
} from '../types';
import { ConnectionStatusMap } from '@/api/dataSource/connector';
import {
  isApiDataSourceType,
  isKafkaDataSourceType,
  isSqlDataSourceType,
  resolveDataSourceType
} from '../constants';

const isSqlConfig = (config: ConnectorConfig): config is SqlConnectorConfig =>
  'host' in config && 'port' in config && 'user' in config;

const isApiConfig = (config: ConnectorConfig): config is ApiConnectorConfig =>
  'url' in config && 'method' in config;

const isKafkaConfig = (
  config: ConnectorConfig
): config is KafkaConnectorConfig => 'brokers' in config;

export const buildConnectionInfo = (
  dataSourceType: DataSourceType,
  config: ConnectorConfig
): string => {
  if (isSqlDataSourceType(dataSourceType) && isSqlConfig(config)) {
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
  if (isSqlDataSourceType(data.dataSourceType)) {
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

  if (isSqlDataSourceType(item.dataSourceType) && isSqlConfig(config)) {
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

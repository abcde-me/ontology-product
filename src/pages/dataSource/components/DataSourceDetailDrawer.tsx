import React from 'react';
import { Drawer, Spin } from '@arco-design/web-react';
import dayjs from 'dayjs';
import { GlobalTooltip } from '@ceai-front/arco-material';
import type { DataSourceItem } from '../types';
import {
  ApiAuthType,
  ApiHttpMethod,
  IcebergWarehouseType,
  OAuth2GrantType
} from '../types';
import {
  getDataSourceTypeLabel,
  isApiDataSourceType,
  isIcebergDataSourceType,
  isKafkaDataSourceType,
  isRelationalSqlDataSourceType
} from '../constants';
import { parseSqlConnectionInfo } from '../services/connectorTransform';
import type {
  ApiConnectorConfig,
  IcebergConnectorConfig,
  KafkaConnectorConfig,
  SqlConnectorConfig
} from '../types';

interface DataSourceDetailDrawerProps {
  visible: boolean;
  loading?: boolean;
  dataSource: DataSourceItem | null;
  onClose: () => void;
}

interface DetailRow {
  label: string;
  value: string;
}

const isSqlConfig = (config: unknown): config is SqlConnectorConfig =>
  typeof config === 'object' &&
  config !== null &&
  'host' in config &&
  'port' in config;

const isIcebergConfig = (config: unknown): config is IcebergConnectorConfig =>
  typeof config === 'object' && config !== null && 'metastoreUri' in config;

const getWarehouseTypeLabel = (warehouseType?: string) => {
  const map: Record<string, string> = {
    [IcebergWarehouseType.MINIO]: 'MinIO',
    [IcebergWarehouseType.HDFS]: 'HDFS'
  };
  return map[warehouseType || ''] || warehouseType || '-';
};

const buildIcebergDetailRows = (
  icebergConfig: IcebergConnectorConfig
): DetailRow[] => {
  const rows: DetailRow[] = [
    { label: 'Metastore URI', value: icebergConfig.metastoreUri },
    {
      label: '仓库类型',
      value: getWarehouseTypeLabel(icebergConfig.warehouseType)
    },
    { label: 'Warehouse URI', value: icebergConfig.warehouseUri }
  ];

  if (icebergConfig.warehouseType === IcebergWarehouseType.MINIO) {
    rows.push(
      {
        label: 'region',
        value: displayOptional(icebergConfig.s3Region)
      },
      {
        label: 'Endpoint',
        value: displayOptional(icebergConfig.s3Endpoint)
      },
      {
        label: 'Access Key',
        value: maskIfPresent(icebergConfig.s3AccessKey)
      },
      {
        label: 'Secret Access Key',
        value: maskIfPresent(icebergConfig.s3SecretKey)
      }
    );
  }

  if (icebergConfig.warehouseType === IcebergWarehouseType.HDFS) {
    rows.push({
      label: 'NameNode 地址',
      value: displayOptional(icebergConfig.hdfsNameNode)
    });
  }

  return rows;
};

const DetailField: React.FC<{ rows: DetailRow[] }> = ({ rows }) => (
  <div className="flex flex-col gap-4">
    {rows.map((row) => (
      <div key={row.label} className="flex items-center gap-1">
        <p className="w-[100px] shrink-0 whitespace-nowrap text-sm leading-[22px] text-[#646c85]">
          {row.label}
        </p>
        <GlobalTooltip.Ellipsis
          text={row.value || '-'}
          className="min-w-0 flex-1 text-sm leading-[22px] text-[#292f42]"
        />
      </div>
    ))}
  </div>
);

const getAuthTypeLabel = (authType?: string) => {
  const map: Record<string, string> = {
    [ApiAuthType.NONE]: '无鉴权',
    [ApiAuthType.API_KEY]: 'API Key',
    [ApiAuthType.BEARER]: 'Bearer Token',
    [ApiAuthType.BASIC]: 'Basic Auth',
    [ApiAuthType.OAUTH2]: 'OAuth2'
  };
  return map[authType || ''] || authType || '-';
};

const getOAuth2GrantTypeLabel = (grantType?: string) => {
  const map: Record<string, string> = {
    [OAuth2GrantType.CLIENT_CREDENTIALS]: 'Client Credentials',
    [OAuth2GrantType.PASSWORD]: 'Password'
  };
  return map[grantType || ''] || grantType || '-';
};

const displayOptional = (value?: string) => (value?.trim() ? value : '-');

const maskIfPresent = (value?: string) => (value ? '******' : '-');

const isApiConfig = (config: unknown): config is ApiConnectorConfig =>
  typeof config === 'object' &&
  config !== null &&
  'url' in config &&
  'method' in config;

const buildApiDetailRows = (apiConfig: ApiConnectorConfig): DetailRow[] => {
  const rows: DetailRow[] = [
    { label: 'API 地址', value: apiConfig.url },
    { label: '请求方法', value: apiConfig.method },
    { label: '请求头', value: displayOptional(apiConfig.headers) },
    { label: '鉴权方式', value: getAuthTypeLabel(apiConfig.auth_type) }
  ];

  switch (apiConfig.auth_type) {
    case ApiAuthType.API_KEY:
      rows.push(
        {
          label: 'Key 请求头',
          value: displayOptional(apiConfig.api_key_header)
        },
        { label: 'API Key', value: maskIfPresent(apiConfig.api_key) }
      );
      break;
    case ApiAuthType.BEARER:
      rows.push({
        label: 'Bearer Token',
        value: maskIfPresent(apiConfig.bearer_token)
      });
      break;
    case ApiAuthType.BASIC:
      rows.push(
        { label: '用户名', value: displayOptional(apiConfig.username) },
        { label: '密码', value: maskIfPresent(apiConfig.password) }
      );
      break;
    case ApiAuthType.OAUTH2:
      rows.push(
        {
          label: 'Token URL',
          value: displayOptional(apiConfig.oauth2_token_url)
        },
        {
          label: 'Client ID',
          value: displayOptional(apiConfig.oauth2_client_id)
        },
        {
          label: 'Client Secret',
          value: maskIfPresent(apiConfig.oauth2_client_secret)
        },
        { label: 'Scope', value: displayOptional(apiConfig.oauth2_scope) },
        {
          label: 'Grant Type',
          value: getOAuth2GrantTypeLabel(apiConfig.oauth2_grant_type)
        }
      );
      break;
    default:
      break;
  }

  const method = String(apiConfig.method).toUpperCase();
  if (method === ApiHttpMethod.POST || method === ApiHttpMethod.PUT) {
    rows.push({
      label: '请求体',
      value: displayOptional(apiConfig.request_body)
    });
  }

  rows.push(
    { label: '数据路径', value: displayOptional(apiConfig.data_path) },
    {
      label: '超时时间',
      value: apiConfig.timeout ? `${apiConfig.timeout} 秒` : '-'
    }
  );

  return rows;
};

export const DataSourceDetailDrawer: React.FC<DataSourceDetailDrawerProps> = ({
  visible,
  loading = false,
  dataSource,
  onClose
}) => {
  const getConnectionRows = (): DetailRow[] => {
    if (!dataSource) {
      return [];
    }

    const config = dataSource.config;

    if (isIcebergDataSourceType(dataSource.dataSourceType)) {
      if (isIcebergConfig(config)) {
        return buildIcebergDetailRows(config);
      }

      return [{ label: '连接信息', value: dataSource.connectionInfo }];
    }

    if (isRelationalSqlDataSourceType(dataSource.dataSourceType)) {
      const sqlConfig = isSqlConfig(config)
        ? config
        : parseSqlConnectionInfo(dataSource.connectionInfo);

      if (sqlConfig) {
        return [
          {
            label: '服务地址',
            value: `${sqlConfig.host}:${sqlConfig.port}`
          },
          { label: '数据库名', value: sqlConfig.database || '-' },
          {
            label: '用户名',
            value: isSqlConfig(config) ? config.user || '-' : '-'
          }
        ];
      }
    }

    if (!config) {
      return [{ label: '连接信息', value: dataSource.connectionInfo }];
    }

    if (isApiDataSourceType(dataSource.dataSourceType)) {
      if (isApiConfig(config)) {
        return buildApiDetailRows(config);
      }

      return [{ label: '连接信息', value: dataSource.connectionInfo }];
    }

    if (isKafkaDataSourceType(dataSource.dataSourceType)) {
      const kafkaConfig = config as KafkaConnectorConfig;
      return [
        { label: 'Broker 地址', value: kafkaConfig.brokers },
        { label: '消费组', value: kafkaConfig.consumer_group },
        {
          label: '安全协议',
          value: kafkaConfig.security_protocol || 'PLAINTEXT'
        }
      ];
    }

    return [{ label: '连接信息', value: dataSource.connectionInfo }];
  };

  return (
    <Drawer
      width={640}
      title="数据源详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Spin loading={loading} className="w-full">
        {dataSource ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex h-8 items-center gap-2">
                <GlobalTooltip.Ellipsis
                  text={dataSource.name}
                  className="text-xl font-semibold leading-[30px] text-[#0f172a]"
                />
                <div
                  className="flex items-center gap-1 rounded border border-solid border-[#dfe2eb] px-2"
                  style={{ borderRadius: '4px' }}
                >
                  <p className="whitespace-nowrap text-xs leading-[18px] text-[#292f42]">
                    {getDataSourceTypeLabel(dataSource.dataSourceType)}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-[#dfe2eb]" />

            <DetailField rows={getConnectionRows()} />

            <div className="h-px w-full bg-[#dfe2eb]" />

            <DetailField
              rows={[
                { label: '创建人', value: dataSource.creator || '-' },
                {
                  label: '更新时间',
                  value: dayjs(dataSource.updateTime).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                }
              ]}
            />
          </div>
        ) : (
          !loading && (
            <div className="py-8 text-center text-[#646c85]">暂无数据</div>
          )
        )}
      </Spin>
    </Drawer>
  );
};

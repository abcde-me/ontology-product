import React from 'react';
import { Drawer } from '@arco-design/web-react';
import dayjs from 'dayjs';
import { GlobalTooltip } from '@ceai-front/arco-material';
import type { DataSourceItem } from '../types';
import { ApiAuthType } from '../types';
import {
  getDataSourceTypeLabel,
  isApiDataSourceType,
  isKafkaDataSourceType,
  isSqlDataSourceType
} from '../constants';
import type {
  ApiConnectorConfig,
  KafkaConnectorConfig,
  SqlConnectorConfig
} from '../types';

interface DataSourceDetailDrawerProps {
  visible: boolean;
  dataSource: DataSourceItem | null;
  onClose: () => void;
}

interface DetailRow {
  label: string;
  value: string;
}

const DetailField: React.FC<{ rows: DetailRow[] }> = ({ rows }) => (
  <div className="flex w-full flex-wrap gap-4">
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-1">
          <p className="whitespace-nowrap text-sm leading-[22px] text-[#646c85]">
            {row.label}
          </p>
        </div>
      ))}
    </div>
    <div className="flex min-w-[386px] flex-1 flex-col gap-4 overflow-clip">
      {rows.map((row) => (
        <div key={row.label} className="flex w-full items-center gap-2">
          <p className="min-w-px flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-[22px] text-[#292f42]">
            {row.value || '-'}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const getAuthTypeLabel = (authType?: string) => {
  const map: Record<string, string> = {
    [ApiAuthType.NONE]: '无鉴权',
    [ApiAuthType.API_KEY]: 'API Key',
    [ApiAuthType.BEARER]: 'Bearer Token',
    [ApiAuthType.BASIC]: 'Basic Auth'
  };
  return map[authType || ''] || authType || '-';
};

export const DataSourceDetailDrawer: React.FC<DataSourceDetailDrawerProps> = ({
  visible,
  dataSource,
  onClose
}) => {
  if (!dataSource) {
    return null;
  }

  const config = dataSource.config;

  const getConnectionRows = (): DetailRow[] => {
    if (!config) {
      return [{ label: '连接信息', value: dataSource.connectionInfo }];
    }

    if (isSqlDataSourceType(dataSource.dataSourceType)) {
      const sqlConfig = config as SqlConnectorConfig;
      return [
        {
          label: '服务地址',
          value: `${sqlConfig.host}:${sqlConfig.port}`
        },
        { label: '数据库名', value: sqlConfig.database || '-' },
        { label: '用户名', value: sqlConfig.user || '-' }
      ];
    }

    if (isApiDataSourceType(dataSource.dataSourceType)) {
      const apiConfig = config as ApiConnectorConfig;
      return [
        { label: 'API 地址', value: apiConfig.url },
        { label: '请求方法', value: apiConfig.method },
        { label: '鉴权方式', value: getAuthTypeLabel(apiConfig.auth_type) },
        { label: '数据路径', value: apiConfig.data_path || '-' },
        {
          label: '超时时间',
          value: apiConfig.timeout ? `${apiConfig.timeout} 秒` : '-'
        }
      ];
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
              value: dayjs(dataSource.updateTime).format('YYYY-MM-DD HH:mm:ss')
            }
          ]}
        />
      </div>
    </Drawer>
  );
};

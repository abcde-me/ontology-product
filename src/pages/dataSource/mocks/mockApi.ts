import {
  DataSourceItem,
  DataSourceFormData,
  DataSourceListResponse,
  GetDataSourceListParams,
  ConnectionStatus
} from '../types';
import { mockDataSource } from './mockData';
import {
  buildConnectionInfo,
  formDataToConnectorConfig
} from '../services/connectorTransform';
import { getConnectorMeta } from '@/api/dataSource/connector';
import { isKafkaDataSourceType } from '../constants';
import { sanitizeKafkaTopicList } from '@/pages/ontologyScene/modules/objectType/services/kafkaTopicNames';
import type { KafkaConnectorConfig } from '../types';

function normalizeKafkaConfigTopics(
  config?: KafkaConnectorConfig
): KafkaConnectorConfig | undefined {
  if (!config?.topic?.trim()) {
    return config;
  }
  const topics = sanitizeKafkaTopicList(
    config.topic
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );
  if (!topics.length) {
    return config;
  }
  return {
    ...config,
    topic: topics.join(',')
  };
}

function normalizeDataSourceItem(item: DataSourceItem): DataSourceItem {
  if (!isKafkaDataSourceType(item.dataSourceType) || !item.config) {
    return item;
  }
  const config = normalizeKafkaConfigTopics(
    item.config as KafkaConnectorConfig
  );
  if (config === item.config) {
    return item;
  }
  return {
    ...item,
    config
  };
}

const dataStore = mockDataSource.map(normalizeDataSourceItem);
let idCounter = 14;

const buildMockItem = (
  data: DataSourceFormData,
  id: string,
  existing?: DataSourceItem
): DataSourceItem => {
  const now = new Date()
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    .replace(/\//g, '-');

  const meta = getConnectorMeta(data.dataSourceType);
  const config = formDataToConnectorConfig(data);

  return {
    id,
    name: data.name,
    description: data.description || '',
    dataSourceType: data.dataSourceType,
    connectorType: meta.connectorType,
    connectionInfo: buildConnectionInfo(data.dataSourceType, config),
    connectionStatus: existing?.connectionStatus || ConnectionStatus.SUCCESS,
    creator: existing?.creator,
    creatorOrg: existing?.creatorOrg,
    createTime: existing?.createTime || now,
    updateTime: now,
    config
  };
};

export const getDataSourceList = async (
  params: GetDataSourceListParams
): Promise<DataSourceListResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const keyword = params.filter?.toLowerCase() || '';
  let filteredData = [...dataStore];

  if (keyword) {
    filteredData = filteredData.filter((item) =>
      item.name.toLowerCase().includes(keyword)
    );
  }

  if (params.dataSourceTypes && params.dataSourceTypes.length > 0) {
    filteredData = filteredData.filter((item) =>
      params.dataSourceTypes!.includes(item.dataSourceType)
    );
  }

  if (params.connectionStatuses && params.connectionStatuses.length > 0) {
    filteredData = filteredData.filter((item) =>
      params.connectionStatuses!.includes(item.connectionStatus)
    );
  }

  filteredData.sort(
    (a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  );

  const pageNo = params.pageNo || 1;
  const pageSize = params.pageSize || 10;
  const start = (pageNo - 1) * pageSize;
  const end = start + pageSize;
  const items = filteredData.slice(start, end);

  return {
    items,
    total: filteredData.length,
    pageNo,
    pageSize
  };
};

export const getDataSourceDetail = async (
  id: string
): Promise<DataSourceItem> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const item = dataStore.find((d) => d.id === id);
  if (!item) {
    throw new Error('数据源不存在');
  }

  const normalized = normalizeDataSourceItem(item);
  const index = dataStore.findIndex((d) => d.id === id);
  if (index >= 0 && normalized !== item) {
    dataStore[index] = normalized;
  }
  return normalized;
};

export const deleteDataSource = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = dataStore.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('数据源不存在');
  }

  dataStore.splice(index, 1);
};

export const addDataSource = async (
  data: DataSourceFormData
): Promise<DataSourceItem> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newItem = buildMockItem(data, String(idCounter++));
  dataStore.push(newItem);
  return newItem;
};

export const updateDataSource = async (
  id: string,
  data: DataSourceFormData
): Promise<DataSourceItem> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = dataStore.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('数据源不存在');
  }

  const updatedItem = buildMockItem(data, id, dataStore[index]);
  dataStore[index] = updatedItem;
  return updatedItem;
};

const mockTestConnectionResult = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (Math.random() > 0.2) {
    return {
      success: true,
      message: '连接成功'
    };
  }

  return {
    success: false,
    message: '连接失败: 连接超时，请检查网络配置'
  };
};

export const testConnection = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const item = dataStore.find((d) => d.id === id);
  if (!item) {
    return {
      success: false,
      message: '数据源不存在'
    };
  }

  return mockTestConnectionResult();
};

export const testConnectionByForm = async (
  _data: DataSourceFormData
): Promise<{ success: boolean; message: string }> => {
  return mockTestConnectionResult();
};

import { DataSourceTypeMap } from '@/api/dataSource/connector';
import {
  getSqlConnectorTableSchemaToTIDB,
  listOntologyConnectors,
  listSqlConnectorDBAndTables
} from '@/api/ontologySceneLibrary/objectType';
import { USE_MOCK } from '@/pages/dataSource/mocks';
import {
  fetchDataSourceList,
  getDataSourceDetail
} from '@/pages/dataSource/services/api';
import {
  isApiDataSourceType,
  isKafkaDataSourceType
} from '@/pages/dataSource/constants';
import {
  ConnectionStatus,
  DataSourceType,
  type KafkaConnectorConfig
} from '@/pages/dataSource/types';
import type {
  GetSqlConnectorTableSchemaToTIDBReq,
  GetSqlConnectorTableSchemaToTIDBRes,
  SqlConnectorDatabaseItem,
  SqlConnectorItem
} from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import {
  GENERIC_KAFKA_TOPICS,
  normalizeKafkaTopicName,
  sanitizeKafkaTopicList,
  SENSOR_KAFKA_TOPICS
} from './kafkaTopicNames';

const SUBTYPE_LABEL: Record<string, string> = {
  mysql: 'MySQL',
  dameng: '达梦数据库',
  postgres: 'Postgre',
  postgresql: 'Postgre',
  iceberg: 'Iceberg'
};

const DEFAULT_MOCK_TABLES = [
  'student_info',
  'course_info',
  'student_score',
  'teacher_info',
  'class_schedule'
];

export function formatSqlConnectorSubtypeLabel(subtype?: string): string {
  if (!subtype?.trim()) {
    return '';
  }
  const key = subtype.trim().toLowerCase();
  return SUBTYPE_LABEL[key] || subtype;
}

/** 下拉展示：数据源名称【数据库类型】 */
export function formatSqlConnectorSelectLabel(
  name: string,
  subtype?: string
): string {
  const typeLabel = formatSqlConnectorSubtypeLabel(subtype);
  return typeLabel ? `${name}【${typeLabel}】` : name;
}

export function normalizeConnectorList(data: unknown): SqlConnectorItem[] {
  if (Array.isArray(data)) {
    return data as SqlConnectorItem[];
  }
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { items?: SqlConnectorItem[] }).items)
  ) {
    return (data as { items: SqlConnectorItem[] }).items;
  }
  return [];
}

function dataSourceTypeToSubtype(type: DataSourceType): string {
  return DataSourceTypeMap[type] || type;
}

function dataSourceItemToSqlConnector(item: {
  id: string;
  name: string;
  dataSourceType: DataSourceType;
}): SqlConnectorItem {
  return {
    id: Number(item.id),
    name: item.name,
    subtype: dataSourceTypeToSubtype(item.dataSourceType)
  };
}

function parseDatabaseNameFromConnectionInfo(connectionInfo?: string): string {
  if (!connectionInfo?.trim()) {
    return 'default_db';
  }
  const withoutQuery = connectionInfo.split('?')[0] || connectionInfo;
  const segments = withoutQuery.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1]?.trim();
  return lastSegment || 'default_db';
}

async function fetchMockConnectors(): Promise<SqlConnectorItem[]> {
  const result = await fetchDataSourceList({
    pageNo: 1,
    pageSize: 1000,
    connectionStatuses: [ConnectionStatus.SUCCESS]
  });
  return result.items.map(dataSourceItemToSqlConnector);
}

async function fetchMockConnectorsByCategory(
  category: 'kafka' | 'api'
): Promise<SqlConnectorItem[]> {
  const result = await fetchDataSourceList({
    pageNo: 1,
    pageSize: 1000,
    connectionStatuses: [ConnectionStatus.SUCCESS]
  });
  return result.items
    .filter((item) =>
      category === 'kafka'
        ? isKafkaDataSourceType(item.dataSourceType)
        : isApiDataSourceType(item.dataSourceType)
    )
    .map(dataSourceItemToSqlConnector);
}

async function fetchOntologyConnectorsByType(
  type: 'kafka' | 'api'
): Promise<SqlConnectorItem[]> {
  if (USE_MOCK) {
    return fetchMockConnectorsByCategory(type);
  }

  const response = await listOntologyConnectors({
    page: 1,
    page_size: 1000,
    type,
    subtype: [type],
    status: ['succeed'],
    sort: 'desc',
    sort_by: 'create_time'
  });

  if (!isOntologyApiSuccess(response)) {
    throw new Error(response.message || '加载数据源连接失败');
  }

  return normalizeConnectorList(response.data);
}

/** 加载消息队列（Kafka）连接器 */
export function fetchOntologyKafkaConnectors(): Promise<SqlConnectorItem[]> {
  return fetchOntologyConnectorsByType('kafka');
}

/** 加载 API 接口连接器 */
export function fetchOntologyApiConnectors(): Promise<SqlConnectorItem[]> {
  return fetchOntologyConnectorsByType('api');
}

export interface KafkaConnectorTopicsResult {
  topics: string[];
  defaultTopic?: string;
}

function parseKafkaTopicsFromConfig(config?: KafkaConnectorConfig): string[] {
  const rawTopic = config?.topic?.trim();
  if (!rawTopic) {
    return [];
  }
  return Array.from(
    new Set(
      rawTopic
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function buildMockKafkaTopicOptions(
  configTopics: string[],
  connectorName?: string
): string[] {
  const normalizedName = connectorName?.trim().toLowerCase() || '';
  if (normalizedName.includes('传感器') || normalizedName.includes('sensor')) {
    return [...SENSOR_KAFKA_TOPICS];
  }

  const normalizedConfigTopics = sanitizeKafkaTopicList(configTopics);
  return sanitizeKafkaTopicList([
    ...normalizedConfigTopics,
    ...GENERIC_KAFKA_TOPICS
  ]);
}

/** 加载 Kafka 连接器可选 Topic，并返回默认 Topic（来自连接器配置） */
export async function fetchKafkaConnectorTopics(
  connectorId: number
): Promise<KafkaConnectorTopicsResult> {
  const normalizedId = Number(connectorId);
  if (!Number.isFinite(normalizedId)) {
    return { topics: [] };
  }

  const detail = await getDataSourceDetail(String(normalizedId));
  const config = detail.config as KafkaConnectorConfig | undefined;
  const configTopics = sanitizeKafkaTopicList(
    parseKafkaTopicsFromConfig(config)
  );
  const defaultTopic = normalizeKafkaTopicName(configTopics[0]);

  if (USE_MOCK) {
    const topics = buildMockKafkaTopicOptions(configTopics, detail.name);
    return {
      topics,
      defaultTopic: defaultTopic || topics[0]
    };
  }

  return {
    topics: configTopics,
    defaultTopic
  };
}

/** 加载数据源管理中已配置且连接成功的 SQL 连接器 */
export async function fetchOntologySqlConnectors(): Promise<
  SqlConnectorItem[]
> {
  if (USE_MOCK) {
    return fetchMockConnectors();
  }

  const response = await listOntologyConnectors({
    page: 1,
    page_size: 1000,
    type: 'sql',
    subtype: ['mysql', 'dameng', 'postgres', 'iceberg'],
    status: ['succeed'],
    sort: 'desc',
    sort_by: 'create_time'
  });

  if (!isOntologyApiSuccess(response)) {
    throw new Error(response.message || '加载数据源连接失败');
  }

  return normalizeConnectorList(response.data);
}

async function fetchMockDatabaseTables(
  connectorId: number
): Promise<SqlConnectorDatabaseItem[]> {
  const connectors = await fetchMockConnectors();
  const connector = connectors.find((item) => Number(item.id) === connectorId);
  if (!connector) {
    return [];
  }

  const dataSources = await fetchDataSourceList({
    pageNo: 1,
    pageSize: 1000,
    connectionStatuses: [ConnectionStatus.SUCCESS]
  });
  const matched = dataSources.items.find(
    (item) => Number(item.id) === connectorId
  );
  const databaseName = parseDatabaseNameFromConnectionInfo(
    matched?.connectionInfo
  );

  return [
    {
      database_name: databaseName,
      tables: DEFAULT_MOCK_TABLES.map((name) => ({ name }))
    }
  ];
}

/** 基于连接器加载可选库表（库 → 表级联） */
export async function fetchSqlConnectorDatabaseTables(input: {
  connectorId: number;
  projectID?: string;
}): Promise<SqlConnectorDatabaseItem[]> {
  const connectorId = Number(input.connectorId);
  if (!Number.isFinite(connectorId)) {
    return [];
  }

  if (USE_MOCK) {
    return fetchMockDatabaseTables(connectorId);
  }

  if (!input.projectID?.trim()) {
    return [];
  }

  const response = await listSqlConnectorDBAndTables({
    id: connectorId,
    projectID: input.projectID.trim()
  });

  if (!isOntologyApiSuccess(response)) {
    throw new Error(response.message || '加载数据库表失败');
  }

  return response.data || [];
}

function buildMockTableSchema(
  tableName: string
): GetSqlConnectorTableSchemaToTIDBRes {
  const normalized = tableName.trim().toLowerCase();
  if (normalized.includes('student') && normalized.includes('score')) {
    return {
      columns: [
        {
          columnName: 'student_id',
          columnComment: '学生ID',
          columnType: 'varchar',
          columnTypeTiDB: 'VARCHAR(64)'
        },
        {
          columnName: 'course_id',
          columnComment: '课程ID',
          columnType: 'varchar',
          columnTypeTiDB: 'VARCHAR(64)'
        },
        {
          columnName: 'score',
          columnComment: '成绩',
          columnType: 'decimal',
          columnTypeTiDB: 'DECIMAL(5,2)'
        }
      ],
      primaryKey: ['student_id', 'course_id']
    };
  }

  if (normalized.includes('course')) {
    return {
      columns: [
        {
          columnName: 'course_id',
          columnComment: '课程ID',
          columnType: 'varchar',
          columnTypeTiDB: 'VARCHAR(64)'
        },
        {
          columnName: 'course_name',
          columnComment: '课程名称',
          columnType: 'varchar',
          columnTypeTiDB: 'VARCHAR(128)'
        },
        {
          columnName: 'credit',
          columnComment: '学分',
          columnType: 'int',
          columnTypeTiDB: 'INT'
        }
      ],
      primaryKey: ['course_id']
    };
  }

  return {
    columns: [
      {
        columnName: 'id',
        columnComment: '主键',
        columnType: 'varchar',
        columnTypeTiDB: 'VARCHAR(64)'
      },
      {
        columnName: 'name',
        columnComment: '名称',
        columnType: 'varchar',
        columnTypeTiDB: 'VARCHAR(128)'
      },
      {
        columnName: 'updated_at',
        columnComment: '更新时间',
        columnType: 'datetime',
        columnTypeTiDB: 'DATETIME'
      }
    ],
    primaryKey: ['id']
  };
}

/** 加载选中表的字段结构（含开发环境 mock） */
export async function fetchSqlConnectorTableSchema(
  params: GetSqlConnectorTableSchemaToTIDBReq
): Promise<ApiRes<GetSqlConnectorTableSchemaToTIDBRes>> {
  if (USE_MOCK) {
    return {
      status: 200,
      code: '',
      message: '',
      data: buildMockTableSchema(params.table_name)
    };
  }

  return getSqlConnectorTableSchemaToTIDB(params);
}

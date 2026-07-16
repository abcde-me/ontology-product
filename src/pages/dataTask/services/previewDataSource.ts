import UAPI from '@/api';
import { PrefixAimdp } from '@/api/endpoints';
import {
  DATA_TASK_SOURCE_TYPE,
  type DataTaskSourceType
} from '@/pages/dataTask/constants/dataSourceTypes';
import { USE_MOCK } from '@/pages/dataTask/mocks';
import type { DataSourceNodeConfig } from '@/pages/dataTask/types';
import type { SourceDataInfo } from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { getLoginToken } from '@/utils/env';

export interface DataSourcePreviewColumn {
  title: string;
  dataIndex: string;
}

export interface DataSourcePreviewResult {
  columns: DataSourcePreviewColumn[];
  rows: Record<string, unknown>[];
  message?: string;
}

const PREVIEW_ROW_LIMIT = 20;

const MOCK_PREVIEW_ROWS: Record<string, unknown>[] = [
  {
    id: '1',
    name: '示例记录 A',
    category: '类型一',
    status: 'active',
    updated_at: '2026-07-16 10:00:00'
  },
  {
    id: '2',
    name: '示例记录 B',
    category: '类型二',
    status: 'inactive',
    updated_at: '2026-07-16 11:30:00'
  },
  {
    id: '3',
    name: '示例记录 C',
    category: '类型一',
    status: 'active',
    updated_at: '2026-07-16 12:15:00'
  }
];

const buildColumnsFromRows = (
  rows: Record<string, unknown>[]
): DataSourcePreviewColumn[] => {
  if (!rows.length) {
    return [];
  }

  return Object.keys(rows[0]).map((key) => ({
    title: key,
    dataIndex: key
  }));
};

const normalizePreviewRows = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => item as Record<string, unknown>);
};

const extractPreviewPayload = (data: unknown): DataSourcePreviewResult => {
  if (!data || typeof data !== 'object') {
    return { columns: [], rows: [] };
  }

  const payload = data as Record<string, unknown>;
  const rawRows =
    payload.rows ??
    payload.data ??
    payload.dataList ??
    payload.sampleData ??
    payload.records;
  const rows = normalizePreviewRows(rawRows).slice(0, PREVIEW_ROW_LIMIT);

  const rawColumns = payload.columns ?? payload.columnList ?? payload.fields;
  if (Array.isArray(rawColumns) && rawColumns.length > 0) {
    const columns = rawColumns
      .map((column) => {
        if (typeof column === 'string') {
          return { title: column, dataIndex: column };
        }
        if (!column || typeof column !== 'object') {
          return null;
        }
        const item = column as Record<string, unknown>;
        const dataIndex = String(
          item.columnName ?? item.fieldName ?? item.name ?? item.dataIndex ?? ''
        ).trim();
        if (!dataIndex) {
          return null;
        }
        const title = String(
          item.columnComment ?? item.fieldComment ?? item.title ?? dataIndex
        ).trim();
        return { title: title || dataIndex, dataIndex };
      })
      .filter(Boolean) as DataSourcePreviewColumn[];

    if (columns.length) {
      return {
        columns,
        rows,
        message:
          typeof payload.message === 'string' ? payload.message : undefined
      };
    }
  }

  return {
    columns: buildColumnsFromRows(rows),
    rows,
    message: typeof payload.message === 'string' ? payload.message : undefined
  };
};

const buildMockPreview = (
  config: DataSourceNodeConfig
): DataSourcePreviewResult => {
  const label =
    config.sourceName?.trim() ||
    config.documentFileName ||
    config.sourceDataInfo?.tableName ||
    config.messageQueueTopic ||
    '数据源';

  const rows = MOCK_PREVIEW_ROWS.map((row, index) => ({
    ...row,
    name: `${label} - ${row.name ?? `记录 ${index + 1}`}`
  }));

  return {
    columns: buildColumnsFromRows(rows),
    rows
  };
};

const isTabularDocument = (fileName?: string, filePath?: string) => {
  const target = (fileName || filePath || '').toLowerCase();
  return /\.(csv|txt)$/i.test(target);
};

export const canPreviewDataSource = (config: DataSourceNodeConfig): boolean => {
  const sourceType = config.sourceType ?? DATA_TASK_SOURCE_TYPE.DATABASE;

  if (sourceType === DATA_TASK_SOURCE_TYPE.DOCUMENT) {
    if (!config.documentFilePath?.trim()) {
      return false;
    }
    return isTabularDocument(config.documentFileName, config.documentFilePath);
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.DATABASE) {
    const sourceDataInfo = config.sourceDataInfo;
    if (!sourceDataInfo?.connectorId) {
      return false;
    }
    if (sourceDataInfo.queryMode === 'sql') {
      return Boolean(sourceDataInfo.sql?.trim());
    }
    return Boolean(
      sourceDataInfo.databaseName?.trim() && sourceDataInfo.tableName?.trim()
    );
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE) {
    return Boolean(
      config.messageQueueConnectorId && config.messageQueueTopic?.trim()
    );
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.API) {
    return Boolean(config.apiConnectorId);
  }

  return false;
};

export const getPreviewDisabledReason = (
  config: DataSourceNodeConfig
): string => {
  const sourceType = config.sourceType ?? DATA_TASK_SOURCE_TYPE.DATABASE;

  if (sourceType === DATA_TASK_SOURCE_TYPE.DOCUMENT) {
    if (!config.documentFilePath?.trim()) {
      return '请先上传文档文件';
    }
    if (!isTabularDocument(config.documentFileName, config.documentFilePath)) {
      return '当前文档格式暂不支持数据预览，仅支持 CSV / TXT';
    }
    return '';
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.DATABASE) {
    if (!config.sourceDataInfo?.connectorId) {
      return '请先选择数据源连接';
    }
    if (config.sourceDataInfo.queryMode === 'sql') {
      return config.sourceDataInfo.sql?.trim() ? '' : '请先输入自定义 SQL';
    }
    if (
      !config.sourceDataInfo.databaseName?.trim() ||
      !config.sourceDataInfo.tableName?.trim()
    ) {
      return '请先选择数据表';
    }
    return '';
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE) {
    if (!config.messageQueueConnectorId) {
      return '请先选择消息队列连接';
    }
    if (!config.messageQueueTopic?.trim()) {
      return '请先选择 Topic';
    }
    return '';
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.API) {
    return config.apiConnectorId ? '' : '请先选择 API 连接';
  }

  return '当前数据源类型暂不支持预览';
};

const buildPreviewRequest = (
  config: DataSourceNodeConfig,
  projectID?: string
): Record<string, unknown> | null => {
  const sourceType = config.sourceType ?? DATA_TASK_SOURCE_TYPE.DATABASE;

  if (sourceType === DATA_TASK_SOURCE_TYPE.DOCUMENT) {
    const filePath = config.documentFilePath?.trim();
    if (!filePath) {
      return null;
    }
    return {
      projectID,
      sourceDataInfo: {
        tableName: filePath,
        queryMode: 'selected'
      },
      limit: PREVIEW_ROW_LIMIT
    };
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.DATABASE) {
    const sourceDataInfo = config.sourceDataInfo;
    if (!sourceDataInfo?.connectorId) {
      return null;
    }
    const payload: SourceDataInfo = {
      connectorId: sourceDataInfo.connectorId,
      databaseName: sourceDataInfo.databaseName,
      tableName: sourceDataInfo.tableName,
      queryMode: sourceDataInfo.queryMode || 'selected',
      sql: sourceDataInfo.sql
    };
    return {
      projectID,
      connectorId: sourceDataInfo.connectorId,
      sourceDataInfo: payload,
      limit: PREVIEW_ROW_LIMIT
    };
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE) {
    if (!config.messageQueueConnectorId || !config.messageQueueTopic?.trim()) {
      return null;
    }
    return {
      projectID,
      connectorId: config.messageQueueConnectorId,
      topic: config.messageQueueTopic.trim(),
      limit: PREVIEW_ROW_LIMIT
    };
  }

  if (sourceType === DATA_TASK_SOURCE_TYPE.API) {
    if (!config.apiConnectorId) {
      return null;
    }
    return {
      projectID,
      connectorId: config.apiConnectorId,
      limit: PREVIEW_ROW_LIMIT
    };
  }

  return null;
};

const parseCsvPreview = (content: string): DataSourcePreviewResult => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { columns: [], rows: [], message: '文件内容为空' };
  }

  const headers = lines[0].split(',').map((item) => item.trim());
  const rows = lines.slice(1, PREVIEW_ROW_LIMIT + 1).map((line) => {
    const values = line.split(',');
    const row: Record<string, unknown> = {};
    headers.forEach((header, columnIndex) => {
      row[header || `column_${columnIndex + 1}`] =
        values[columnIndex]?.trim() ?? '';
    });
    return row;
  });

  return {
    columns: buildColumnsFromRows(rows),
    rows
  };
};

const previewDocumentFile = async (
  config: DataSourceNodeConfig
): Promise<DataSourcePreviewResult> => {
  const filePath = config.documentFilePath?.trim();
  if (!filePath) {
    throw new Error('请先上传文档文件');
  }

  if (!isTabularDocument(config.documentFileName, filePath)) {
    throw new Error('当前文档格式暂不支持数据预览，仅支持 CSV / TXT');
  }

  if (USE_MOCK) {
    return buildMockPreview(config);
  }

  const token = getLoginToken();
  const response = await fetch(`${PrefixAimdp}/DownloadFile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {})
    },
    body: JSON.stringify({ path: filePath })
  });

  if (!response.ok) {
    throw new Error('文档预览失败，请稍后重试');
  }

  const content = await response.text();
  return parseCsvPreview(content);
};

export const previewDataSource = async (
  config: DataSourceNodeConfig,
  projectID?: string
): Promise<DataSourcePreviewResult> => {
  if (!canPreviewDataSource(config)) {
    throw new Error(getPreviewDisabledReason(config) || '当前配置暂不支持预览');
  }

  if (config.sourceType === DATA_TASK_SOURCE_TYPE.DOCUMENT) {
    return previewDocumentFile(config);
  }

  if (USE_MOCK) {
    return buildMockPreview(config);
  }

  const requestBody = buildPreviewRequest(config, projectID);
  if (!requestBody) {
    throw new Error('当前配置暂不支持预览');
  }

  const response = await UAPI.RES.PreviewConnectorSampleDataApi({})
    .post(requestBody)
    .inRegion()
    .do();

  if (!isOntologyApiSuccess(response)) {
    throw new Error(response?.message || '数据预览失败');
  }

  const result = extractPreviewPayload(response.data);
  if (!result.rows.length) {
    return {
      ...result,
      message: result.message || '暂无预览数据'
    };
  }

  return result;
};

export const getPreviewSourceTypeLabel = (
  sourceType?: DataTaskSourceType
): string => {
  switch (sourceType) {
    case DATA_TASK_SOURCE_TYPE.DOCUMENT:
      return '文档';
    case DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE:
      return '消息队列';
    case DATA_TASK_SOURCE_TYPE.API:
      return 'API 接口';
    case DATA_TASK_SOURCE_TYPE.DATABASE:
    default:
      return '数据库';
  }
};

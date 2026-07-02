import { resolveDataResourcePrimaryKeyFields } from '@/pages/ontologyScene/modules/objectType/services/dataResourceMapping';
import type { DataResourceTable } from '../types';
import type { InstanceExtractResult } from '../types/fileExtract';
import { fetchDataResourceDetail } from './api';
import { upsertDataResourceSampleRows } from './sampleData';

export const resolveInstanceExtractRows = (
  result: InstanceExtractResult
): Record<string, string>[] => {
  if (result.rows?.length) {
    return result.rows.map((row) => ({ ...row }));
  }

  return (result.instances || []).map((instance) => ({
    ...(instance.attributes || {}),
    name: instance.name,
    objectType: instance.objectType
  }));
};

export const insertInstanceExtractResultToDataResource = async (params: {
  targetTableId: string;
  result: InstanceExtractResult;
}): Promise<{
  table: DataResourceTable;
  inserted: number;
  skipped: number;
  total: number;
}> => {
  const table = await fetchDataResourceDetail(params.targetTableId);
  if (!table) {
    throw new Error('目标数据资源表不存在');
  }

  const primaryKeyFields = resolveDataResourcePrimaryKeyFields(table);
  if (!primaryKeyFields.length) {
    throw new Error('目标表未配置主键字段，无法去重插入');
  }

  const rows = resolveInstanceExtractRows(params.result);
  if (!rows.length) {
    throw new Error('没有可插入的实例数据');
  }

  const fieldNames = new Set(table.fields.map((field) => field.fieldName));
  const normalizedRows = rows.map((row) => {
    const record: Record<string, unknown> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (fieldNames.has(key)) {
        record[key] = value;
      }
    });
    return record;
  });

  const upsertResult = upsertDataResourceSampleRows({
    tableId: table.id,
    rows: normalizedRows,
    primaryKeyFields
  });

  return {
    table,
    ...upsertResult
  };
};

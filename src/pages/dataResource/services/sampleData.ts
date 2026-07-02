import { DATA_RESOURCE_SAMPLE_DATA } from '../data/sampleData';

const STORAGE_KEY = 'DATA_RESOURCE_SAMPLE_DATA_OVERRIDES';

const readOverrides = (): Record<string, Record<string, unknown>[]> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeOverrides = (
  overrides: Record<string, Record<string, unknown>[]>
) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
};

const resolveTableRows = (tableId: string): Record<string, unknown>[] => {
  const overrides = readOverrides();
  if (overrides[tableId]) {
    return [...overrides[tableId]];
  }
  return [...(DATA_RESOURCE_SAMPLE_DATA[tableId] ?? [])];
};

export const fetchDataResourceSampleData = (
  tableId: string
): Promise<Record<string, unknown>[]> => {
  return Promise.resolve(resolveTableRows(tableId));
};

const buildPrimaryKeySignature = (
  row: Record<string, unknown>,
  primaryKeyFields: string[]
): string => {
  if (!primaryKeyFields.length) {
    return JSON.stringify(row);
  }
  return primaryKeyFields
    .map((field) => String(row[field] ?? '').trim())
    .join('\u0001');
};

export interface UpsertDataResourceRowsResult {
  inserted: number;
  skipped: number;
  total: number;
}

/** 将提取结果插入数据资源表，已存在主键的行跳过（去重） */
export const upsertDataResourceSampleRows = (params: {
  tableId: string;
  rows: Record<string, unknown>[];
  primaryKeyFields: string[];
}): UpsertDataResourceRowsResult => {
  const { tableId, rows, primaryKeyFields } = params;
  const existingRows = resolveTableRows(tableId);
  const existingKeySet = new Set(
    existingRows.map((row) => buildPrimaryKeySignature(row, primaryKeyFields))
  );
  const batchKeySet = new Set<string>();

  const nextRows = [...existingRows];
  let inserted = 0;
  let skipped = 0;

  rows.forEach((row) => {
    const signature = buildPrimaryKeySignature(row, primaryKeyFields);
    const hasPrimaryKeyValue = primaryKeyFields.every(
      (field) => String(row[field] ?? '').trim() !== ''
    );

    if (!hasPrimaryKeyValue) {
      skipped += 1;
      return;
    }

    if (existingKeySet.has(signature) || batchKeySet.has(signature)) {
      skipped += 1;
      return;
    }

    batchKeySet.add(signature);
    existingKeySet.add(signature);
    nextRows.push(row);
    inserted += 1;
  });

  const overrides = readOverrides();
  overrides[tableId] = nextRows;
  writeOverrides(overrides);

  return {
    inserted,
    skipped,
    total: rows.length
  };
};

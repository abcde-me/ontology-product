import {
  ConnectorAnalyseFinkSqlColumnItem,
  CreateOntologyPhysicalProperty,
  OntologyPhysicalPropertiesList
} from '@/types/objectType';
import { INSTANCE_SYNC_SOURCE_TYPE } from '@/pages/ontologyScene/common/constants';
import type { InstanceSyncSourceType } from '@/pages/ontologyScene/common/constants';
import { isStreamParseSettingsConfigured } from './instanceSyncStreamParse';
import {
  AttributeField,
  InstanceSyncMappingField,
  InstanceSyncSourceMappingEntry,
  ObjectTypeAttributeField,
  SourceTableField,
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from './types';

export const INSTANCE_SYNC_SOURCE_UNCONFIGURED_MESSAGE = '请配置实例数据信息';

export function isDatabaseSyncSourceConfigured(
  sourceDataInfo: SqlSourceDataInfo,
  options?: { isDataResource?: boolean }
): boolean {
  const queryMode = sourceDataInfo.queryMode || 'selected';
  if (queryMode === 'sql') {
    if (!String(sourceDataInfo.sql ?? '').trim()) {
      return false;
    }
    return options?.isDataResource ? true : !!sourceDataInfo.connectorId;
  }
  const hasTable = Boolean(
    sourceDataInfo.databaseName?.trim() && sourceDataInfo.tableName?.trim()
  );
  if (!hasTable) {
    return false;
  }
  return options?.isDataResource ? true : !!sourceDataInfo.connectorId;
}

export function isInstanceSyncSourceTypeConfigured(
  strategy: Pick<
    SyncSourceDataStrategyFormState,
    | 'instanceCsvFilePath'
    | 'messageQueueConnectorId'
    | 'messageQueueTopic'
    | 'messageQueueParseMode'
    | 'messageQueueStructuredParseRule'
    | 'messageQueueMaxFlattenDepth'
    | 'messageQueueArrayHandleMode'
    | 'messageQueueAiRuleContent'
    | 'apiConnectorId'
    | 'fileResourceId'
    | 'workflowDataTaskId'
    | 'sourceDataInfo'
  >,
  sourceType: InstanceSyncSourceType,
  options?: { isDataResource?: boolean }
): boolean {
  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD) {
    return !!strategy.instanceCsvFilePath?.trim();
  }

  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE) {
    const hasBasic =
      !!strategy.messageQueueConnectorId &&
      !!strategy.messageQueueTopic?.trim();
    if (!hasBasic) {
      return false;
    }
    return isStreamParseSettingsConfigured(strategy);
  }

  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE) {
    if (!strategy.apiConnectorId) {
      return false;
    }
    return isStreamParseSettingsConfigured(strategy);
  }

  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE) {
    return !!strategy.fileResourceId?.trim();
  }

  if (sourceType === INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW) {
    return !!strategy.workflowDataTaskId?.trim();
  }

  return isDatabaseSyncSourceConfigured(strategy.sourceDataInfo, options);
}

export function isInstanceSyncSourceConfigured(
  strategy: Pick<
    SyncSourceDataStrategyFormState,
    | 'mappingSourceTypes'
    | 'instanceSyncSourceType'
    | 'instanceCsvFilePath'
    | 'messageQueueConnectorId'
    | 'messageQueueTopic'
    | 'messageQueueParseMode'
    | 'messageQueueStructuredParseRule'
    | 'messageQueueMaxFlattenDepth'
    | 'messageQueueArrayHandleMode'
    | 'messageQueueAiRuleContent'
    | 'apiConnectorId'
    | 'fileResourceId'
    | 'workflowDataTaskId'
    | 'sourceDataInfo'
  >,
  options?: { isDataResource?: boolean }
): boolean {
  const sourceTypes = resolvePrimaryMappingSourceTypes(strategy);
  return sourceTypes.every((sourceType) =>
    isInstanceSyncSourceTypeConfigured(strategy, sourceType, options)
  );
}

export function clearInstanceSyncMappingSourceFields(
  mapping: InstanceSyncMappingField
): InstanceSyncMappingField {
  return {
    ...mapping,
    sourceColumnName: undefined,
    sourceColumnComment: undefined,
    sourceColumnType: undefined,
    sourceCoumnOriginName: undefined,
    sourceMappings: undefined
  };
}

export function getMappingEntryForKey(
  field: InstanceSyncMappingField,
  key: string
): InstanceSyncSourceMappingEntry | undefined {
  return field.sourceMappings?.[key];
}

export function getMappingEntryForSourceType(
  field: InstanceSyncMappingField,
  sourceType: InstanceSyncSourceType
): InstanceSyncSourceMappingEntry | undefined {
  return getMappingEntryForKey(field, sourceType);
}

export function hasAnySourceMapping(
  field: InstanceSyncMappingField,
  keys?: string[]
): boolean {
  if (keys?.length) {
    return keys.some((key) => {
      const entry = getMappingEntryForKey(field, key);
      return Boolean(entry?.fieldName?.trim());
    });
  }
  return Boolean(field.sourceColumnName?.trim());
}

export function syncLegacySourceFieldsFromPrimaryKey(
  field: InstanceSyncMappingField,
  primaryKey?: string
): InstanceSyncMappingField {
  if (!primaryKey) {
    return field;
  }
  const entry = getMappingEntryForKey(field, primaryKey);
  if (!entry?.fieldName?.trim()) {
    return {
      ...field,
      sourceColumnName: undefined,
      sourceColumnComment: undefined,
      sourceColumnType: undefined,
      sourceCoumnOriginName: undefined
    };
  }
  return {
    ...field,
    sourceColumnName: entry.fieldName,
    sourceColumnComment: entry.fieldComment,
    sourceColumnType: entry.fieldType,
    sourceCoumnOriginName: entry.fieldOriginName || entry.fieldName
  };
}

export function syncLegacySourceFieldsFromPrimaryType(
  field: InstanceSyncMappingField,
  primaryType?: InstanceSyncSourceType | string
): InstanceSyncMappingField {
  return syncLegacySourceFieldsFromPrimaryKey(field, primaryType);
}

export function applyMappingSourceTypesToFields(
  fields: InstanceSyncMappingField[],
  sourceTypes: InstanceSyncSourceType[],
  removedTypes: InstanceSyncSourceType[] = []
): InstanceSyncMappingField[] {
  return applyMappingKeysToFields(fields, sourceTypes, removedTypes);
}

export function applyMappingKeysToFields(
  fields: InstanceSyncMappingField[],
  keys: string[],
  removedKeys: string[] = []
): InstanceSyncMappingField[] {
  return fields.map((field) => {
    const nextMappings = { ...(field.sourceMappings || {}) };
    removedKeys.forEach((key) => {
      delete nextMappings[key];
    });
    keys.forEach((key) => {
      if (!nextMappings[key]) {
        nextMappings[key] = {};
      }
    });
    return {
      ...field,
      sourceMappings: Object.keys(nextMappings).length
        ? nextMappings
        : undefined
    };
  });
}

export function updateMappingEntryForKey(
  field: InstanceSyncMappingField,
  key: string,
  updates: Partial<InstanceSyncSourceMappingEntry>
): InstanceSyncMappingField {
  const current = field.sourceMappings?.[key] || {};
  const nextEntry = { ...current, ...updates };
  const hasValue = Boolean(
    nextEntry.fieldName?.trim() ||
      nextEntry.fieldComment?.trim() ||
      nextEntry.fieldType?.trim()
  );
  const nextMappings = { ...(field.sourceMappings || {}) };
  if (hasValue) {
    nextMappings[key] = nextEntry;
  } else {
    delete nextMappings[key];
  }
  return {
    ...field,
    sourceMappings: Object.keys(nextMappings).length ? nextMappings : undefined
  };
}

export function updateMappingEntryForSourceType(
  field: InstanceSyncMappingField,
  sourceType: InstanceSyncSourceType,
  updates: Partial<InstanceSyncSourceMappingEntry>
): InstanceSyncMappingField {
  return updateMappingEntryForKey(field, sourceType, updates);
}

export function resolvePrimaryMappingSourceTypes(
  strategy?: Pick<
    SyncSourceDataStrategyFormState,
    'mappingSourceTabs' | 'mappingSourceTypes' | 'instanceSyncSourceType'
  >
): InstanceSyncSourceType[] {
  if (strategy?.mappingSourceTabs?.length) {
    return strategy.mappingSourceTabs.map((tab) => tab.sourceType);
  }
  const selected = strategy?.mappingSourceTypes || [];
  if (selected.length) {
    return selected;
  }
  const fallback =
    strategy?.instanceSyncSourceType || INSTANCE_SYNC_SOURCE_TYPE.DATABASE;
  return fallback ? [fallback] : [];
}

export function buildSyncMappingFieldsFromAttributes(
  attributes: ObjectTypeAttributeField[],
  options?: {
    existingByPropertyID?: Map<string, InstanceSyncMappingField>;
    preserveSourceFields?: boolean;
  }
): InstanceSyncMappingField[] {
  const existing = options?.existingByPropertyID;
  const preserveSource = options?.preserveSourceFields ?? true;
  return attributes.map((attribute) => {
    const base = objectTypeAttributeToSyncMapping(attribute);
    const merged = {
      ...base,
      ...(existing?.get(attribute.propertyID) || {}),
      propertyID: attribute.propertyID,
      propertyComment: attribute.propertyComment,
      propertyType: attribute.propertyType,
      isPrimary: attribute.isPrimary
    };
    return preserveSource
      ? merged
      : clearInstanceSyncMappingSourceFields(merged);
  });
}

/** 向量列表字段 / 属性名称后缀（与后端约定一致） */
export const VECTOR_FIELD_SUFFIX = '_vector';

export function getAttributeRowKey(record: AttributeField): string {
  return String(record.name || record.id || `field-${record.name}`);
}

export function createObjectTypeAttributeKey(prefix = 'attribute'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getObjectTypeAttributeRowKey(
  record: ObjectTypeAttributeField
): string {
  return record.key || record.propertyID || createObjectTypeAttributeKey();
}

export function sourceFieldToObjectTypeAttribute(
  field: SourceTableField,
  index: number,
  isPrimaryOverride?: boolean,
  sourceTableName?: string
): ObjectTypeAttributeField {
  const isPrimary =
    typeof isPrimaryOverride === 'boolean' ? isPrimaryOverride : index === 0;
  const propertyID = field.fieldId;
  const propertyComment = field.fieldComment || field.fieldId;
  const trimmedTable = sourceTableName?.trim();
  return {
    key: createObjectTypeAttributeKey('schema-field'),
    propertyID,
    propertyComment,
    propertyType: normalizeColumnTypeForPrimary(field.fieldType, isPrimary),
    isPrimary: isPrimary ? 1 : 0,
    isStoreAsPublic: 0,
    isInstanceName: isPrimary ? 1 : 0,
    publicPropertyID: 0,
    isVector: 0,
    sourceColumnName: field.fieldId,
    sourceColumnComment: field.fieldComment || field.fieldId,
    sourceColumnType: field.fieldType,
    ...(trimmedTable ? { sourceTableName: trimmedTable } : {}),
    _vectorizationOn: false
  };
}

export function normalizeConnectorAnalyseFinkSqlColumns(
  raw: unknown[]
): ConnectorAnalyseFinkSqlColumnItem[] {
  const out: ConnectorAnalyseFinkSqlColumnItem[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const columnName = item.trim();
      if (columnName) {
        out.push({ columnName, columnType: 'STRING' });
      }
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const columnName = String(o.columnName ?? o.column_name ?? '').trim();
    if (!columnName) continue;
    const origin =
      o.columnOriginName != null
        ? String(o.columnOriginName)
        : o.CoumnOriginName != null
          ? String(o.CoumnOriginName)
          : undefined;
    out.push({
      columnName,
      columnType: String(o.columnType ?? o.column_type ?? 'STRING'),
      columnTable:
        o.columnTable != null
          ? String(o.columnTable)
          : o.column_table != null
            ? String(o.column_table)
            : undefined,
      columnOriginName: origin,
      CoumnOriginName:
        o.CoumnOriginName != null ? String(o.CoumnOriginName) : undefined,
      primaryKey: Array.isArray(o.primaryKey)
        ? (o.primaryKey as unknown[]).map((p) => String(p))
        : undefined
    });
  }
  return out;
}

export function finkSqlParsedColumnToObjectTypeAttribute(
  col: ConnectorAnalyseFinkSqlColumnItem,
  _index: number
): ObjectTypeAttributeField {
  const fieldId = col.columnName;
  const pkList = col.primaryKey ?? [];
  const isPrimary = pkList.includes(fieldId) ? 1 : 0;
  const fieldType = col.columnType || 'STRING';
  const displayComment =
    col.columnOriginName ?? col.CoumnOriginName ?? col.columnName;
  const isPrimaryBool = isPrimary === 1;
  const sqlSourceTable = col.columnTable?.trim();
  return {
    key: createObjectTypeAttributeKey('fink-sql-field'),
    propertyID: fieldId,
    propertyComment: displayComment,
    propertyType: normalizeColumnTypeForPrimary(fieldType, isPrimaryBool),
    isPrimary,
    isStoreAsPublic: 0,
    isInstanceName: isPrimary,
    publicPropertyID: 0,
    isVector: 0,
    sourceColumnName: fieldId,
    sourceColumnComment: displayComment,
    sourceColumnType: fieldType,
    ...(sqlSourceTable ? { sourceTableName: sqlSourceTable } : {}),
    _vectorizationOn: false
  };
}

export function finkSqlParsedColumnsToObjectTypeAttributes(
  columns: ConnectorAnalyseFinkSqlColumnItem[]
): ObjectTypeAttributeField[] {
  return columns.map((col, index) =>
    finkSqlParsedColumnToObjectTypeAttribute(col, index)
  );
}

export function finkSqlParsedColumnsToSourceTableFields(
  columns: ConnectorAnalyseFinkSqlColumnItem[]
): SourceTableField[] {
  return columns.map((col) => ({
    fieldId: col.columnName,
    fieldComment: col.columnOriginName ?? col.CoumnOriginName ?? col.columnName,
    fieldType: col.columnType || 'STRING'
  }));
}

export function objectTypeAttributeToLegacyField(
  field: ObjectTypeAttributeField
): AttributeField {
  return {
    name: field.propertyID,
    comment: field.propertyComment,
    columnType: field.propertyType,
    isPrimary: field.isPrimary,
    isUse: 1,
    isStoreAsPublic: field.isStoreAsPublic,
    isInstanceName: field.isInstanceName,
    publicPropertyID: field.publicPropertyID || 0,
    isVector: field.isVector,
    vectorSourceFieldName: undefined,
    ...(field.sourceTableName?.trim()
      ? { sourceTableName: field.sourceTableName.trim() }
      : {}),
    _tableField: field.sourceColumnName || field.propertyID,
    _attributeName: field.propertyComment,
    _storedPublicPropertyId: field._storedPublicPropertyId,
    _vectorizationOn: field._vectorizationOn,
    _vectorComment: field._vectorComment,
    _vectorPropertyId: field._vectorPropertyId
  };
}

interface LegacyAttributeLike {
  name?: string;
  comment?: string;
  columnType?: string;
  propertyID?: string | number;
  propertyName?: string;
  propertyComment?: string;
  propertyType?: string;
  isPrimary?: number;
  isStoreAsPublic?: number;
  isInstanceName?: number;
  publicPropertyID?: number;
  isVector?: number;
  sourceColumnName?: string;
  sourceColumnComment?: string;
  sourceColumnType?: string;
  sourceCoumnOriginName?: string;
  sourceTableName?: string;
  _storedPublicPropertyId?: number;
  _vectorizationOn?: boolean;
  _vectorComment?: string;
  _vectorPropertyId?: string | number;
}

export function legacyFieldToObjectTypeAttribute(
  field:
    | CreateOntologyPhysicalProperty
    | AttributeField
    | OntologyPhysicalPropertiesList
): ObjectTypeAttributeField {
  const raw: LegacyAttributeLike = field;
  const propertyID =
    raw.propertyName ??
    raw.name ??
    (raw.propertyID != null ? String(raw.propertyID) : '');
  const propertyComment =
    raw.propertyComment ?? raw.comment ?? propertyID ?? '';
  const propertyType = raw.propertyType ?? raw.columnType ?? '';
  const sourceColumnName = raw.sourceColumnName ?? raw.name ?? propertyID;
  const sourceColumnComment =
    raw.sourceColumnComment ?? raw.comment ?? propertyComment ?? '';
  const backendPropertyID = Number(raw.propertyID);
  const legacySourceTable = raw.sourceTableName?.trim();
  const isPrimary = raw.isPrimary === 1 ? 1 : 0;
  const isInstanceName =
    raw.isInstanceName === 1 ? 1 : raw.isInstanceName === 0 ? 0 : isPrimary;
  return {
    key: createObjectTypeAttributeKey('legacy-field'),
    backendPropertyID: Number.isFinite(backendPropertyID)
      ? Math.trunc(backendPropertyID)
      : undefined,
    propertyID,
    propertyComment,
    propertyType,
    isPrimary,
    isStoreAsPublic: raw.isStoreAsPublic === 1 ? 1 : 0,
    isInstanceName,
    publicPropertyID: raw.publicPropertyID || 0,
    isVector: raw.isVector === 1 ? 1 : 0,
    sourceColumnName,
    sourceColumnComment,
    sourceColumnType: raw.sourceColumnType ?? propertyType,
    ...(raw.sourceCoumnOriginName
      ? { sourceCoumnOriginName: raw.sourceCoumnOriginName }
      : {}),
    ...(legacySourceTable ? { sourceTableName: legacySourceTable } : {}),
    _storedPublicPropertyId: raw._storedPublicPropertyId,
    _vectorizationOn: raw._vectorizationOn,
    _vectorComment: raw._vectorComment,
    _vectorPropertyId: raw._vectorPropertyId
  };
}

export function objectTypeAttributeToSyncMapping(
  field: ObjectTypeAttributeField
): InstanceSyncMappingField {
  const name = field.sourceColumnName?.trim();
  return {
    key: createObjectTypeAttributeKey('sync-field'),
    sourceColumnName: name || undefined,
    sourceColumnComment: field.sourceColumnComment,
    sourceColumnType: field.sourceColumnType,
    sourceCoumnOriginName: field.sourceCoumnOriginName,
    propertyID: field.propertyID,
    propertyComment: field.propertyComment,
    propertyType: field.propertyType,
    isPrimary: field.isPrimary,
    isVector: field.isVector === 1 ? 1 : field._vectorizationOn ? 1 : 0,
    _vectorComment: field._vectorComment,
    _vectorPropertyId: field._vectorPropertyId
  };
}

/** 属性映射行：将后端可能以字符串返回的 id 规范为整数 */
export function normalizeAttributeFieldId(
  field: AttributeField
): AttributeField {
  const raw = field.id as unknown;
  if (raw === undefined || raw === null || raw === '') {
    const { id: _omit, ...rest } = field;
    return rest as AttributeField;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    const { id: _omit, ...rest } = field;
    return rest as AttributeField;
  }
  return { ...field, id: Math.trunc(n) };
}

/** 将接口返回的扁平列表合并为表单行：isVector=1 的项挂到 vectorSourceFieldName 对应基字段上 */
export function mergeOntologyPhysicalPropertiesForForm(
  list: CreateOntologyPhysicalProperty[]
): AttributeField[] {
  if (!list?.length) return [];
  const vectorRows = list.filter((p) => p.isVector === 1);
  const baseRows = list.filter((p) => p.isVector !== 1);
  const vectorBySource = new Map(
    vectorRows.map((v) => [String(v.vectorSourceFieldName ?? ''), v])
  );
  return baseRows.map((prop) => {
    const vec = vectorBySource.get(String(prop.name ?? ''));
    return normalizeAttributeFieldId({
      ...prop,
      isVector: 0,
      vectorSourceFieldName: undefined,
      _tableField: prop.name,
      _attributeName: prop.comment,
      _vectorizationOn: Boolean(vec && prop.name),
      _vectorComment: vec?.comment,
      _vectorPropertyId: vec?.id
    });
  });
}

export function mergeOntologyPhysicalPropertiesListForForm(
  list: OntologyPhysicalPropertiesList[]
): ObjectTypeAttributeField[] {
  if (!list?.length) return [];
  const vectorRows = list.filter((p) => p.isVector === 1);
  const baseRows = list.filter((p) => p.isVector !== 1);
  const vectorBySource = new Map(
    vectorRows.map((v) => [String(v.vectorSourceFieldName ?? '').trim(), v])
  );
  return baseRows.map((prop) => {
    const baseName = String(prop.propertyName ?? '').trim();
    const vec = baseName ? vectorBySource.get(baseName) : undefined;
    const base = legacyFieldToObjectTypeAttribute(prop);
    if (vec && baseName) {
      return {
        ...base,
        _vectorizationOn: true,
        _vectorComment: vec.propertyComment,
        _vectorPropertyId: vec.propertyID
      };
    }
    return {
      ...base,
      _vectorizationOn: false
    };
  });
}

/** 表单行拍平为接口列表：向量化配置拆成 isVector=1 的独立项 */
export function flattenOntologyPhysicalPropertiesForSubmit(
  fields: AttributeField[]
): CreateOntologyPhysicalProperty[] {
  const result: CreateOntologyPhysicalProperty[] = [];
  for (const f of fields) {
    const {
      _tableField,
      _attributeName,
      _storedPublicPropertyId,
      _vectorizationOn,
      _vectorComment,
      _vectorPropertyId,
      ...rest
    } = f;
    const base: CreateOntologyPhysicalProperty = {
      ...rest,
      isVector: 0,
      vectorSourceFieldName: undefined
    };
    result.push(base);

    if (_vectorizationOn && f.isUse === 1) {
      const vecName = `${f.name}${VECTOR_FIELD_SUFFIX}`;
      const vecComment =
        _vectorComment ?? `${f.comment ?? ''}${VECTOR_FIELD_SUFFIX}`;
      const vec: CreateOntologyPhysicalProperty = {
        name: vecName,
        comment: vecComment,
        columnType: 'vector',
        isPrimary: 0,
        isUse: 1,
        isStoreAsPublic: 0,
        publicPropertyID: 0,
        isVector: 1,
        vectorSourceFieldName: f.name
      };
      if (_vectorPropertyId !== undefined && _vectorPropertyId !== '') {
        const vid = Number(_vectorPropertyId);
        if (Number.isFinite(vid)) {
          vec.id = Math.trunc(vid);
        }
      }
      result.push(vec);
    }
  }
  return result;
}

/**
 * 字段类型规范化：
 * - 当为主键且类型为 varchar(5000) / char(36) / varchar(500) 时，统一设为 varchar(500)
 * - 当非主键且类型为上述几种之一时，统一设为 varchar(5000)
 */
export function normalizeColumnTypeForPrimary(
  columnType: string,
  isPrimary?: boolean
) {
  const lowerType = columnType.toString().toLowerCase();
  if (
    lowerType === 'varchar(5000)' ||
    lowerType === 'char(36)' ||
    lowerType === 'varchar(500)'
  ) {
    return isPrimary ? 'varchar(500)' : 'varchar(5000)';
  }
  return columnType;
}

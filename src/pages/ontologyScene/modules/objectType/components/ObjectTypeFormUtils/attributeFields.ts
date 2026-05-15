import {
  ConnectorAnalyseFinkSqlColumnItem,
  CreateOntologyPhysicalProperty,
  OntologyPhysicalPropertiesList
} from '@/types/objectType';
import {
  AttributeField,
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField
} from './types';

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
  return {
    key: createObjectTypeAttributeKey('legacy-field'),
    backendPropertyID: Number.isFinite(backendPropertyID)
      ? Math.trunc(backendPropertyID)
      : undefined,
    propertyID,
    propertyComment,
    propertyType,
    isPrimary: raw.isPrimary === 1 ? 1 : 0,
    isStoreAsPublic: raw.isStoreAsPublic === 1 ? 1 : 0,
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
    isVector: field.isVector === 1 ? 1 : field._vectorizationOn ? 1 : 0
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

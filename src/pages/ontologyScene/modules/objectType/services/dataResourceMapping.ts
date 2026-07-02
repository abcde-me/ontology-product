import { DATA_SOURCE_TYPE } from '@/pages/ontologyScene/common/constants';
import { DATA_RESOURCE_CATALOG } from '@/pages/dataResource/data/catalog';
import { DATA_RESOURCE_SAMPLE_DATA } from '@/pages/dataResource/data/sampleData';
import type { DataResourceTable } from '@/pages/dataResource/types';
import {
  CreateOntologyPhysicalProperty,
  OntologyPhysicalPropertiesList,
  SourceType
} from '@/types/objectType';
import type { PhysicalProperties } from '@/types/graphApi';
import { sourceFieldToObjectTypeAttribute } from '../components/ObjectTypeFormUtils/attributeFields';
import type { ObjectTypeAttributeField } from '../components/ObjectTypeFormUtils/types';

const FOREIGN_KEY_HINTS = [
  '_vin',
  '_id',
  'vehicle_',
  'fleet_',
  'parent_',
  'ref_'
];

function looksLikeForeignKey(fieldName: string): boolean {
  const lower = fieldName.toLowerCase();
  if (lower === 'id') {
    return false;
  }
  return FOREIGN_KEY_HINTS.some((hint) => lower.includes(hint));
}

/** 解析数据资源表的主键字段名 */
export function resolveDataResourcePrimaryKeyFields(
  table: DataResourceTable
): string[] {
  if (table.primaryKeyFields?.length) {
    return [...table.primaryKeyFields];
  }

  const explicit = table.fields
    .filter((field) => field.isPrimary)
    .map((field) => field.fieldName);
  if (explicit.length) {
    return explicit;
  }

  const idField = table.fields.find((field) => field.fieldName === 'id');
  if (idField) {
    return [idField.fieldName];
  }

  const codeOrNoField = table.fields.find(
    (field) =>
      /_(no|code)$/i.test(field.fieldName) &&
      !looksLikeForeignKey(field.fieldName)
  );
  if (codeOrNoField) {
    return [codeOrNoField.fieldName];
  }

  const firstField = table.fields[0]?.fieldName;
  return firstField ? [firstField] : [];
}

/** 将数据资源表字段注释拼接为对象类型描述（顿号分隔） */
export function buildDataResourceObjectTypeDescription(
  table: DataResourceTable
): string {
  return table.fields
    .map((field) => field.fieldComment?.trim() || field.fieldName)
    .filter(Boolean)
    .join('、');
}

export function buildDataResourceObjectTypeDescriptionFromTables(
  tables: DataResourceTable[]
): string {
  return tables
    .flatMap((table) => table.fields)
    .map((field) => field.fieldComment?.trim() || field.fieldName)
    .filter(Boolean)
    .join('、');
}

export function dataResourceFieldsToObjectTypeAttributes(
  table: DataResourceTable
): ObjectTypeAttributeField[] {
  const primaryKeys = new Set(resolveDataResourcePrimaryKeyFields(table));

  return table.fields.map((field, index) =>
    sourceFieldToObjectTypeAttribute(
      {
        fieldId: field.fieldName,
        fieldComment: field.fieldComment || field.fieldName,
        fieldType: field.fieldType
      },
      index,
      primaryKeys.has(field.fieldName),
      table.tableName
    )
  );
}

export function dataResourceFieldsToPhysicalProperties(
  table: DataResourceTable
): CreateOntologyPhysicalProperty[] {
  const primaryKeys = resolveDataResourcePrimaryKeyFields(table);

  return table.fields.map((field) => ({
    name: field.fieldName,
    comment: field.fieldComment || field.fieldName,
    columnType: field.fieldType,
    isPrimary: primaryKeys.includes(field.fieldName)
      ? (1 as const)
      : (0 as const),
    publicPropertyID: 0,
    isUse: 1 as const,
    isStoreAsPublic: 0 as const,
    isVector: 0 as const
  }));
}

export function dataResourceFieldsToOntologyPhysicalPropertiesList(
  table: DataResourceTable
): OntologyPhysicalPropertiesList[] {
  const primaryKeys = resolveDataResourcePrimaryKeyFields(table);

  return table.fields.map((field) => ({
    propertyID: 0,
    propertyName: field.fieldName,
    propertyComment: field.fieldComment || field.fieldName,
    propertyType: field.fieldType,
    isPrimary: primaryKeys.includes(field.fieldName)
      ? (1 as const)
      : (0 as const),
    isVector: 0 as const,
    publicPropertyID: 0,
    sourceColumnName: field.fieldName,
    sourceColumnComment: field.fieldComment || field.fieldName,
    sourceColumnType: field.fieldType,
    sourceCoumnOriginName: field.fieldName,
    sourceTableName: table.tableName,
    sourcePrimaryKey: primaryKeys,
    vectorSourceFieldName: ''
  }));
}

type ShellPhysicalPropertyLike = {
  name?: string;
  comment?: string;
  propertyName?: string;
  propertyComment?: string;
};

/** 判断属性是否为导入/同步失败后的空壳记录 */
export function isEmptyOrShellPhysicalProperty(
  property: ShellPhysicalPropertyLike
): boolean {
  const name = String(property.propertyName ?? property.name ?? '').trim();
  const comment = String(
    property.propertyComment ?? property.comment ?? ''
  ).trim();

  if (!name) {
    return true;
  }
  if (/^field_\d+$/i.test(name)) {
    return true;
  }
  return !comment || comment === name;
}

/** 当前属性列表是否需要从数据资源目录补全 */
export function needsPhysicalPropertyRepair(
  current: ShellPhysicalPropertyLike[],
  expectedCount: number
): boolean {
  if (!expectedCount) {
    return false;
  }
  if (!current.length) {
    return true;
  }
  if (current.length < expectedCount) {
    return true;
  }
  return current.some(isEmptyOrShellPhysicalProperty);
}

export function findDataResourceTableForObjectType(input: {
  originalDbName?: string;
  originalTableName?: string;
  name?: string;
  code?: string;
}): DataResourceTable | undefined {
  const bySource = findDataResourceTableBySource(
    input.originalDbName,
    input.originalTableName
  );
  if (bySource) {
    return bySource;
  }

  const normalizedName = input.name?.trim();
  if (normalizedName) {
    const byComment = DATA_RESOURCE_CATALOG.find(
      (table) => table.tableComment?.trim() === normalizedName
    );
    if (byComment) {
      return byComment;
    }
  }

  const normalizedCode = input.code?.trim();
  if (normalizedCode) {
    return DATA_RESOURCE_CATALOG.find(
      (table) => table.tableName === normalizedCode
    );
  }

  return undefined;
}

export function resolveExpectedPhysicalPropertiesForObjectType(input: {
  originalDbName?: string;
  originalTableName?: string;
  name?: string;
  code?: string;
}): OntologyPhysicalPropertiesList[] | null {
  const table = findDataResourceTableForObjectType(input);
  if (!table) {
    return null;
  }
  return dataResourceFieldsToOntologyPhysicalPropertiesList(table);
}

export function toCreatePhysicalPropertiesFromList(
  properties: OntologyPhysicalPropertiesList[]
): CreateOntologyPhysicalProperty[] {
  return properties.map((property) => ({
    name: property.propertyName,
    comment: property.propertyComment || property.propertyName,
    columnType: property.propertyType,
    isPrimary: property.isPrimary === 1 ? (1 as const) : (0 as const),
    publicPropertyID: property.publicPropertyID || 0,
    isUse: 1 as const,
    isStoreAsPublic: 0 as const,
    isVector: property.isVector === 1 ? (1 as const) : (0 as const),
    sourceTableName: property.sourceTableName
  }));
}

export function enrichPhysicalPropertiesFromDataResource(
  properties: PhysicalProperties[],
  objectTypes: Array<{
    id?: number;
    icon?: string;
    originalDbName?: string;
    originalTableName?: string;
    name?: string;
    code?: string;
  }>
): PhysicalProperties[] {
  if (!properties.length || !objectTypes.length) {
    return properties;
  }

  const objectTypeMap = new Map(
    objectTypes
      .filter((item) => item.id != null)
      .map((item) => [Number(item.id), item])
  );

  const grouped = new Map<number, PhysicalProperties[]>();
  properties.forEach((property) => {
    const objectTypeId = Number(
      property.ontologyObjectTypeId ?? property.objectTypeID ?? 0
    );
    if (!objectTypeId) {
      return;
    }
    const bucket = grouped.get(objectTypeId) || [];
    bucket.push(property);
    grouped.set(objectTypeId, bucket);
  });

  const enriched: PhysicalProperties[] = [];

  grouped.forEach((items, objectTypeId) => {
    const objectType = objectTypeMap.get(objectTypeId);
    const expected = objectType
      ? resolveExpectedPhysicalPropertiesForObjectType(objectType)
      : null;

    if (
      !expected?.length ||
      !needsPhysicalPropertyRepair(items, expected.length)
    ) {
      enriched.push(...items);
      return;
    }

    expected.forEach((property, index) => {
      const existing = items[index];
      enriched.push({
        ...(existing || {}),
        id: existing?.id ?? (property.propertyID || index + 1),
        name: property.propertyName,
        comment: property.propertyComment,
        columnType: property.propertyType,
        isPrimary: property.isPrimary === 1 ? 1 : 0,
        isVectorSourceField: property.isVector === 1 ? 1 : 0,
        objectTypeID: objectTypeId,
        ontologyObjectTypeId: objectTypeId,
        ontologyObjectTypeName:
          existing?.ontologyObjectTypeName || objectType?.name,
        ontologyObjectTypeIcon:
          existing?.ontologyObjectTypeIcon || objectType?.icon
      });
    });
  });

  return enriched.length ? enriched : properties;
}

export function findDataResourceTableBySource(
  databaseType?: string,
  tableName?: string
): DataResourceTable | undefined {
  const normalizedTable = tableName?.trim();
  if (!normalizedTable) {
    return undefined;
  }

  const normalizedDb = databaseType?.trim();
  const tableMatches = DATA_RESOURCE_CATALOG.filter(
    (table) => table.tableName === normalizedTable
  );
  if (!tableMatches.length) {
    return undefined;
  }

  if (normalizedDb) {
    const dbMatch = tableMatches.find(
      (table) =>
        table.databaseType === normalizedDb ||
        table.databaseType.toLowerCase() === normalizedDb.toLowerCase()
    );
    if (dbMatch) {
      return dbMatch;
    }
  }

  // 后端 originalDbName 与目录不一致时，表名唯一则仍可识别为数据资源
  return tableMatches.length === 1 ? tableMatches[0] : undefined;
}

export function findDataResourceTableById(
  id?: string
): DataResourceTable | undefined {
  if (!id?.trim()) {
    return undefined;
  }
  return DATA_RESOURCE_CATALOG.find((table) => table.id === id);
}

function resolveDuplicatePropertyId(
  propertyId: string,
  tableName: string,
  usedIds: Set<string>
): string {
  if (!usedIds.has(propertyId)) {
    return propertyId;
  }
  const prefixed = `${tableName}_${propertyId}`;
  if (!usedIds.has(prefixed)) {
    return prefixed;
  }
  let index = 2;
  while (usedIds.has(`${prefixed}_${index}`)) {
    index += 1;
  }
  return `${prefixed}_${index}`;
}

export function dataResourceTablesToObjectTypeAttributes(
  tables: DataResourceTable[]
): ObjectTypeAttributeField[] {
  const usedPropertyIds = new Set<string>();
  const result: ObjectTypeAttributeField[] = [];

  tables.forEach((table) => {
    const tableAttributes = dataResourceFieldsToObjectTypeAttributes(table);
    tableAttributes.forEach((attribute) => {
      const propertyID = resolveDuplicatePropertyId(
        attribute.propertyID,
        table.tableName,
        usedPropertyIds
      );
      usedPropertyIds.add(propertyID);
      result.push({
        ...attribute,
        propertyID,
        sourceColumnName: attribute.sourceColumnName || attribute.propertyID,
        sourceTableName: table.tableName
      });
    });
  });

  return result;
}

export function dataResourceTablesToPhysicalProperties(
  tables: DataResourceTable[]
): CreateOntologyPhysicalProperty[] {
  const usedPropertyIds = new Set<string>();
  const result: CreateOntologyPhysicalProperty[] = [];

  tables.forEach((table) => {
    const primaryKeys = new Set(resolveDataResourcePrimaryKeyFields(table));
    table.fields.forEach((field) => {
      const propertyId = resolveDuplicatePropertyId(
        field.fieldName,
        table.tableName,
        usedPropertyIds
      );
      usedPropertyIds.add(propertyId);
      result.push({
        name: propertyId,
        comment: field.fieldComment || field.fieldName,
        columnType: field.fieldType,
        isPrimary: primaryKeys.has(field.fieldName)
          ? (1 as const)
          : (0 as const),
        publicPropertyID: 0,
        isUse: 1 as const,
        isStoreAsPublic: 0 as const,
        isVector: 0 as const
      });
    });
  });

  return result;
}

export function buildDataResourceDataSourceState(table: DataResourceTable) {
  return buildDataResourceDataSourceStateFromTables([table]);
}

export function buildDataResourceDataSourceStateFromTables(
  tables: DataResourceTable[]
) {
  const primary = tables[0];
  return {
    type: DATA_SOURCE_TYPE.DATA_RESOURCE,
    database: primary?.databaseType,
    table: primary?.tableName,
    dataResourceId: primary?.id,
    dataResourceIds: tables.map((item) => item.id),
    tables: tables.map((item) => item.tableName)
  };
}

type PhysicalPropertyLike =
  | CreateOntologyPhysicalProperty
  | OntologyPhysicalPropertiesList;

function buildFieldToPropertyNameMap(
  table: DataResourceTable,
  physicalProperties?: PhysicalPropertyLike[]
): Map<string, string> {
  const fieldToProperty = new Map<string, string>();

  table.fields.forEach((field) => {
    fieldToProperty.set(field.fieldName, field.fieldName);
  });

  (physicalProperties || []).forEach((property) => {
    const propertyName =
      'propertyName' in property
        ? property.propertyName
        : 'name' in property
          ? property.name
          : '';
    const sourceColumnName =
      'sourceColumnName' in property
        ? String(property.sourceColumnName || '')
        : propertyName;

    if (propertyName) {
      fieldToProperty.set(propertyName, propertyName);
    }
    if (sourceColumnName) {
      fieldToProperty.set(sourceColumnName, propertyName || sourceColumnName);
    }
  });

  return fieldToProperty;
}

function mapSampleRowToInstance(
  row: Record<string, unknown>,
  table: DataResourceTable,
  fieldToProperty: Map<string, string>
): Record<string, unknown> {
  const instance: Record<string, unknown> = {};

  Object.entries(row).forEach(([fieldName, value]) => {
    const propertyName = fieldToProperty.get(fieldName) || fieldName;
    instance[propertyName] = value;
  });

  const primaryKeyField = resolveDataResourcePrimaryKeyFields(table)[0];
  if (primaryKeyField && row[primaryKeyField] != null && instance.id == null) {
    instance.id = row[primaryKeyField];
  }

  return instance;
}

/** 将数据资源表示例数据转换为图谱/列表可用的实例记录 */
export function resolveDataResourceSampleInstances(
  table: DataResourceTable,
  physicalProperties?: PhysicalPropertyLike[]
): Record<string, unknown>[] {
  const samples = DATA_RESOURCE_SAMPLE_DATA[table.id] || [];
  if (!samples.length) {
    return [];
  }

  const fieldToProperty = buildFieldToPropertyNameMap(
    table,
    physicalProperties
  );
  return samples.map((row) =>
    mapSampleRowToInstance(row, table, fieldToProperty)
  );
}

export function resolveDataResourceSampleInstancesFromSource(
  databaseType?: string,
  tableName?: string,
  physicalProperties?: PhysicalPropertyLike[]
): Record<string, unknown>[] {
  const table = findDataResourceTableBySource(databaseType, tableName);
  if (!table) {
    return [];
  }
  return resolveDataResourceSampleInstances(table, physicalProperties);
}

export function resolveDataResourceSampleInstancesFromTables(
  tables: DataResourceTable[],
  physicalProperties?: PhysicalPropertyLike[]
): Record<string, unknown>[] {
  return tables.flatMap((table) =>
    resolveDataResourceSampleInstances(table, physicalProperties)
  );
}

export function objectTypeUsesDataResourceTable(
  objectType: {
    originalDbName?: string;
    originalTableName?: string;
  },
  table: DataResourceTable
): boolean {
  if (
    objectType.originalTableName === table.tableName &&
    objectType.originalDbName === table.databaseType
  ) {
    return true;
  }

  const matched = findDataResourceTableBySource(
    objectType.originalDbName,
    objectType.originalTableName
  );
  return matched?.id === table.id;
}

/** 用于自动建关系的可匹配属性（排除主键字段） */
export interface MatchableAttributeInfo {
  /** 属性 ID（字段英文名） */
  name: string;
  /** 属性中文名称 */
  comment?: string;
}

export function resolveMatchableAttributes(
  table: DataResourceTable
): MatchableAttributeInfo[] {
  const primaryKeys = new Set(resolveDataResourcePrimaryKeyFields(table));
  return table.fields
    .filter((field) => field.fieldName && !primaryKeys.has(field.fieldName))
    .map((field) => ({
      name: field.fieldName,
      comment: field.fieldComment?.trim() || undefined
    }));
}

/** 用于自动建关系的可匹配属性名（排除主键字段） */
export function resolveMatchableAttributeNames(
  table: DataResourceTable
): string[] {
  return resolveMatchableAttributes(table).map((item) => item.name);
}

export function resolveObjectTypeMatchableAttributes(objectType: {
  originalDbName?: string;
  originalTableName?: string;
}): MatchableAttributeInfo[] {
  const table = findDataResourceTableBySource(
    objectType.originalDbName,
    objectType.originalTableName
  );
  if (!table) {
    return [];
  }
  return resolveMatchableAttributes(table);
}

export function resolveObjectTypeMatchableAttributeNames(objectType: {
  originalDbName?: string;
  originalTableName?: string;
}): string[] {
  return resolveObjectTypeMatchableAttributes(objectType).map(
    (item) => item.name
  );
}

export function collectUsedDataResourceTableIds(
  objectTypes: {
    originalDbName?: string;
    originalTableName?: string;
  }[]
): Set<string> {
  const ids = new Set<string>();

  objectTypes.forEach((objectType) => {
    const matched = findDataResourceTableBySource(
      objectType.originalDbName,
      objectType.originalTableName
    );
    if (matched) {
      ids.add(matched.id);
    }
  });

  return ids;
}

export function isDataResourceBackedObjectTypeFromRecord(input: {
  sourceType?: SourceType | number;
  filePath?: string;
  originalDbName?: string;
  originalTableName?: string;
}): boolean {
  return isDataResourceBackedObjectType({
    sourceType: input.sourceType,
    filePath: input.filePath,
    originalDbName: input.originalDbName,
    originalTableName: input.originalTableName,
    sourceDataInfo: undefined
  });
}

export function isDataResourceBackedObjectType(input: {
  sourceType?: SourceType | number;
  filePath?: string;
  originalDbName?: string;
  originalTableName?: string;
  sourceDataInfo?: { connectorId?: number } | null;
}): boolean {
  if (input.filePath?.trim()) {
    return false;
  }
  if (input.sourceDataInfo?.connectorId) {
    return false;
  }
  if (!input.originalTableName?.trim()) {
    return false;
  }
  return (
    input.sourceType === SourceType.ICEBERG &&
    !!findDataResourceTableBySource(
      input.originalDbName,
      input.originalTableName
    )
  );
}

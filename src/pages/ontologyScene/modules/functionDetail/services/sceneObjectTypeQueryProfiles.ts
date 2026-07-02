import type { PhysicalProperties } from '@/types/graphApi';
import type {
  ObjectType,
  OntologyPhysicalPropertiesList
} from '@/types/objectType';

/** 对象类型 code → 查询 select 字段名（物理表列名） */
export type SceneObjectTypeQueryProfiles = Record<string, string[]>;

const MAX_SELECT_FIELDS = 40;

const isVectorProperty = (property: PhysicalProperties) => {
  const columnType = String(property.columnType || '').toLowerCase();
  return columnType === 'vector' || columnType.includes('vector');
};

/** 解析 dataset Query select 应使用的物理列名 */
export const resolvePhysicalColumnName = (
  property: PhysicalProperties
): string | null => {
  if (property.isUse === 0) {
    return null;
  }

  if (isVectorProperty(property)) {
    return null;
  }

  const columnName = property.tableField?.trim() || property.name?.trim();
  return columnName || null;
};

export const buildSceneObjectTypeQueryProfiles = (
  objectTypes: ObjectType[],
  properties: PhysicalProperties[]
): SceneObjectTypeQueryProfiles => {
  const propertiesByObjectTypeId = new Map<number, PhysicalProperties[]>();

  properties.forEach((property) => {
    const objectTypeId = property.ontologyObjectTypeId ?? property.objectTypeID;
    if (!objectTypeId) {
      return;
    }

    const list = propertiesByObjectTypeId.get(objectTypeId) || [];
    list.push(property);
    propertiesByObjectTypeId.set(objectTypeId, list);
  });

  const profiles: SceneObjectTypeQueryProfiles = {};

  objectTypes.forEach((objectType) => {
    const code = objectType.code?.trim();
    if (!code) {
      return;
    }

    const props = propertiesByObjectTypeId.get(objectType.id) || [];
    const primary = props
      .filter((property) => property.isPrimary === 1)
      .map(resolvePhysicalColumnName)
      .filter(Boolean) as string[];
    const others = props
      .filter((property) => property.isPrimary !== 1)
      .map(resolvePhysicalColumnName)
      .filter(Boolean) as string[];

    const fields = [...new Set([...primary, ...others])].slice(
      0,
      MAX_SELECT_FIELDS
    );
    if (fields.length) {
      profiles[code] = fields;
    }
  });

  return profiles;
};

export const resolveQuerySelectFields = (
  profiles: SceneObjectTypeQueryProfiles | undefined,
  objectTypeCode: string
): string[] => {
  const fields = profiles?.[objectTypeCode]?.filter(Boolean) ?? [];
  return fields.length ? fields : [];
};

const resolveColumnFromOntologyProperty = (
  property: OntologyPhysicalPropertiesList
): string | null => {
  if (property.isVector === 1) {
    return null;
  }

  const columnName =
    property.sourceColumnName?.trim() ||
    property.propertyName?.trim() ||
    String(property.propertyID ?? '').trim();

  return columnName || null;
};

/** 从对象类型详情属性列表构建 select 字段（属性服务未就绪时的回退） */
export const buildQueryProfilesFromOntologyPhysicalPropertiesList = (
  code: string,
  properties: OntologyPhysicalPropertiesList[]
): string[] => {
  const primary = properties
    .filter((property) => property.isPrimary === 1)
    .map(resolveColumnFromOntologyProperty)
    .filter(Boolean) as string[];
  const others = properties
    .filter((property) => property.isPrimary !== 1)
    .map(resolveColumnFromOntologyProperty)
    .filter(Boolean) as string[];

  const fields = [...new Set([...primary, ...others])].slice(
    0,
    MAX_SELECT_FIELDS
  );
  return fields.length ? fields : [];
};

export const mergeSceneObjectTypeQueryProfiles = (
  base: SceneObjectTypeQueryProfiles,
  code: string,
  fields: string[]
): SceneObjectTypeQueryProfiles => {
  if (!code || !fields.length || base[code]?.length) {
    return base;
  }

  return {
    ...base,
    [code]: fields
  };
};

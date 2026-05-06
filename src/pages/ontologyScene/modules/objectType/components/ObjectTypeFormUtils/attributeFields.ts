import { CreateOntologyPhysicalProperty } from '@/types/objectType';
import { AttributeField } from './types';

/** 向量列表字段 / 属性名称后缀（与后端约定一致） */
export const VECTOR_FIELD_SUFFIX = '_vector';

export function getAttributeRowKey(record: AttributeField): string {
  return String(record.name || record.id || `field-${record.name}`);
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

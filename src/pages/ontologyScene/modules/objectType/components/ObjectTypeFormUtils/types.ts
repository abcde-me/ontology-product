import {
  CreateOntologyPhysicalProperty,
  OntologyPhysicalPropertiesList,
  SourceType
} from '@/types/objectType';
import { DataSourceType } from '@/pages/ontologyScene/common/constants';

export interface FileData {
  columnList: string[];
  commentList: string[];
  typeList: string[];
  path: string;
}

// 使用接口定义的字段名
export interface AttributeField extends CreateOntologyPhysicalProperty {
  // 为了UI显示，保留一些临时字段
  _tableField?: string; // 用于显示表字段名（对应 name）
  _attributeName?: string; // 用于显示属性名称（对应 comment）
  _storedPublicPropertyId?: number; // 存入公共属性时创建的ID（与publicPropertyID区分，publicPropertyID用于绑定已有公共属性）
  /** 是否开启向量化（仅 UI，提交时展开为 isVector=1 的记录） */
  _vectorizationOn?: boolean;
  /** 向量属性的属性名称（comment），默认基字段 comment + _vector */
  _vectorComment?: string;
  /** 编辑态下后端返回的向量属性 id */
  _vectorPropertyId?: string | number;
}

export interface SqlSourceDataInfo {
  connectorId?: number;
  connectorName?: string;
  connectorSubtype?: string;
  databaseName?: string;
  tableName?: string;
  queryMode: 'selected' | 'sql';
  sql?: string;
}

export interface SourceTableField {
  fieldId: string;
  fieldComment: string;
  fieldType: string;
}

export interface ObjectTypeAttributeField {
  key: string;
  propertyID: string;
  propertyComment: string;
  propertyType: string;
  isPrimary: 1 | 0;
  isStoreAsPublic: 1 | 0;
  publicPropertyID?: number;
  isVector?: 1 | 0;
  sourceColumnName: string;
  sourceColumnComment: string;
  _storedPublicPropertyId?: number;
  _vectorizationOn?: boolean;
  _vectorComment?: string;
  _vectorPropertyId?: string | number;
}

export interface InstanceSyncMappingField {
  key: string;
  sourceColumnName?: string;
  sourceColumnComment?: string;
  sourceColumnType?: string;
  propertyID: string;
  propertyComment: string;
  propertyType: string;
  isPrimary: 1 | 0;
  isVector: 1 | 0;
}

export interface ObjectTypeDataSourceState {
  type: DataSourceType;
  connectorId?: number;
  connectorName?: string;
  connectorSubtype?: string;
  database?: string;
  table?: string;
  file?: any;
  filePath?: string;
  queryMode?: 'selected' | 'sql';
  sql?: string;
}

export interface SyncSourceDataStrategyFormState {
  sourceDataInfo: SqlSourceDataInfo;
  mode: string;
  conflictStrategy: string;
  syncScope: string;
  pollFetchSize: number;
  parallelism: number;
  exceptionStrategy: string;
  jdbcSyncSqlFull?: string;
  jdbcSyncSqlIncrement?: string;
}

export interface ObjectTypeFormData {
  code: string;
  name: string;
  description?: string;
  icon: string;
  ontologyModelID: number;
  filePath?: string;
  originalDbName: string;
  originalTableName: string;
  sourceType?: SourceType;
  ontologyPhysicalPropertiesList?:
    | CreateOntologyPhysicalProperty[]
    | OntologyPhysicalPropertiesList[];
  objectTypeAttributes?: ObjectTypeAttributeField[];
  sourceDataInfo?: SqlSourceDataInfo;
  enableSyncSourceData?: boolean;
  syncSourceDataStrategy?: SyncSourceDataStrategyFormState;
  syncMappingFields?: InstanceSyncMappingField[];
  isReUpload?: boolean;
  // 内部使用的字段
  _dataSource?: ObjectTypeDataSourceState;
}

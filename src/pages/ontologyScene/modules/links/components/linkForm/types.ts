import { LinkDirection, LinkType } from '../../../../types/link';
import {
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';

export type IntermediateTableType = 'local_csv' | 'data_lake_sync';

export interface AttributeField {
  tableField: string;
  isUse: number;
  attributeName: string;
  fieldType: string;
  isPrimary?: boolean;
  sourceColumnName?: string;
  sourceColumnComment?: string;
  sourceColumnType?: string;
  sourceCoumnOriginName?: string;
  sourceTableName?: string;
}

export interface IntermediateTable {
  type: IntermediateTableType;
  file?: any;
  filePath?: string;
  sourceDataInfo?: SqlSourceDataInfo;
  database?: string;
  table?: string;
  sql?: string;
  queryMode?: 'selected' | 'sql';
}

export interface LinkPairFormItem {
  name: string;
  id: string;
  linkDirection: LinkDirection;
  sourceObjectType?: number;
  targetObjectType?: number;
  targetObjectAttribute?: string;
}

export interface LinkCreateFormData {
  linkPairs: LinkPairFormItem[];
}

export interface LinkFormData {
  linkType: LinkType;
  name: string;
  id: string;
  sourceObjectType: number;
  targetObjectType: number;
  targetObjectAttribute?: string;
  intermediateTable?: IntermediateTable;
  sourceAttribute?: string;
  targetAttribute?: string;
  linkTargetColumnName?: string;
  linkSourceColumnName?: string;
  attributeFields: AttributeField[];
  isReUpload?: boolean;
  syncSourceDataStrategy?: SyncSourceDataStrategyFormState;
}

export interface FileData {
  columnList: string[];
  commentList: string[];
  typeList: string[];
  path: string;
}

export interface PrimaryAttribute {
  name: string;
  id: number;
}

export interface CascaderOption {
  label: string;
  value: string;
  children?: Array<{ label: string; value: string; isLeaf?: boolean }>;
  isLeaf?: boolean;
}

export interface LinkFormProps {
  initialValues?: Partial<LinkFormData>;
  onSubmit: (data: LinkFormData | LinkCreateFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  showFooter?: boolean;
  /** 编辑页：已是 N:N 时仅允许修改链接名称，其余区块只读 */
  restrictManyToManyEditToNameOnly?: boolean;
  /** 创建页：无链接类型分类，使用方向 + 链接对 */
  createMode?: boolean;
}

export interface LinkFormRef {
  submit: () => void;
}

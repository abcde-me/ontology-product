import { LinkType } from '../../../../types/link';

export type IntermediateTableType = 'local_csv' | 'data_lake_sync';

export interface AttributeField {
  tableField: string;
  isUse: number;
  attributeName: string;
  fieldType: string;
  isPrimary?: boolean;
}

export interface IntermediateTable {
  type: IntermediateTableType;
  file?: any;
  filePath?: string;
  database?: string;
  table?: string;
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
  onSubmit: (data: LinkFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  showFooter?: boolean;
}

export interface LinkFormRef {
  submit: () => void;
}

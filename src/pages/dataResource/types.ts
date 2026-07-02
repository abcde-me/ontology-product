/** 数据查询权限 */
export enum DataQueryPermission {
  AUTHORIZED = 'authorized',
  UNAUTHORIZED = 'unauthorized'
}

export const DATA_QUERY_PERMISSION_LABEL: Record<DataQueryPermission, string> =
  {
    [DataQueryPermission.AUTHORIZED]: '已授权',
    [DataQueryPermission.UNAUTHORIZED]: '未授权'
  };

export interface DataResourceField {
  fieldName: string;
  fieldComment: string;
  fieldType: string;
  /** 是否为主键字段 */
  isPrimary?: boolean;
}

export interface DataResourceTable {
  id: string;
  databaseType: string;
  tableName: string;
  tableComment: string;
  /** 未配置时按字段规则自动推断 */
  primaryKeyFields?: string[];
  /** 未配置时按表 id 自动推断 */
  sourceSystem?: string;
  /** 未配置时按表 id 自动推断 */
  queryPermission?: DataQueryPermission;
  fields: DataResourceField[];
}

export interface DataResourceListItem {
  id: string;
  databaseType: string;
  tableName: string;
  tableComment: string;
  sourceSystem: string;
  queryPermission: DataQueryPermission;
}

export interface DataResourceListResponse {
  items: DataResourceListItem[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface GetDataResourceListParams {
  pageNo: number;
  pageSize: number;
  filter?: string;
  databaseType?: string;
  sourceSystem?: string;
  queryPermission?: DataQueryPermission;
}

export type FilePreviewMode =
  | 'image'
  | 'pdf'
  | 'text'
  | 'unsupported'
  | 'metadata';

export interface FileResourceListItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileFormat: string;
  uploadTime?: string;
}

export interface FileResourceListResponse {
  items: FileResourceListItem[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface GetFileResourceListParams {
  pageNo: number;
  pageSize: number;
  filter?: string;
}

export interface FileResourcePreviewPayload {
  mode: FilePreviewMode;
  fileName: string;
  fileFormat: string;
  /** 图片 / PDF 等二进制预览地址 */
  url?: string;
  /** 文本类预览内容 */
  text?: string;
  message?: string;
}

/** 文件提取时传给大模型的源内容 */
export interface FileResourceExtractSource {
  fileName: string;
  fileFormat: string;
  fileSize: number;
  /** 是否包含可解析的文本内容 */
  contentType: 'text' | 'binary';
  text?: string;
  note?: string;
}

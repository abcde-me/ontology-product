import { LinkType, SyncStatus } from './graphApi';
import {
  ObjectType,
  SourceDataInfo,
  SyncSourceDataStrategy
} from './objectType';

export interface ListOntologyLinkTypeColumnReq {
  /**
   * 搜索内容
   */
  filter?: string;
  /**
   * 是否使用（1：是，0：否）
   */
  isUse?: number;
  /**
   * 链接类型ID
   */
  linkTypeID?: number;
  /**
   * 排序规则: asc: 升序, desc: 倒序, 默认倒序
   *
   * Example: desc
   */
  order?: 'asc' | 'desc';
  /**
   * 排序依据
   *
   * Example: name
   */
  orderBy?: string;
  /**
   * mongo 排序规则
   *
   * Example: []string{ "{order: desc}", "{id:asc}" }
   */
  orders?: string[];
  /**
   * 页码
   *
   * Example: 1
   */
  pageNo?: number;
  /**
   * 每页的大小
   *
   * Example: 10
   */
  pageSize?: number;
}

export interface LinkTypeAttributeInfo {
  /**
   * 字段类型
   */
  columnType?: string;
  /**
   * 属性名称
   */
  comment?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 创建人
   */
  createUser?: string;
  /**
   * ID,唯一标识
   */
  id?: number;
  /**
   * 删除标识（1：是，0：否）
   */
  isDeleted?: number;
  /**
   * 是否主键（1：是，0：否）
   */
  isPrimary?: number;
  /**
   * 是否选中（1：是，0：否）
   */
  isUse?: number;
  /**
   * 链接类型ID
   */
  linkTypeID?: number;
  /**
   * 表字段
   */
  name?: string;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 修改人
   */
  updateUser?: string;
}

export interface ListOntologyLinkTypeColumnRes {
  /**
   * 当前页结果
   */
  result?: LinkTypeAttributeInfo[];
  /**
   * 总数
   */
  totalCount?: number;
}

export interface ListOntologyLinkTypeDataReq {
  /**
   * 链接类型ID
   */
  id: number;
  /**
   * 页码
   */
  page: number;
  /**
   * 每页大小
   */
  pageSize: number;
}

export interface ListOntologyLinkTypeDataRes {
  /**
   * 当前页结果
   */
  result?: Record<string, any>[];
  /**
   * 总数
   */
  totalCount?: number;
}

export interface GetOntologyLinkTypeRes {
  /**
   * 链接id
   */
  code?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 创建人
   */
  createUser?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 本地文件上传后的存储地址
   */
  filePath?: string;
  /**
   * ID,唯一标识
   */
  id?: number;
  /**
   * 删除标识（1：是，0：否）
   */
  isDeleted?: number;
  /**
   * 数据库名称
   */
  linkDBName?: string;
  /**
   * 链接源属性ID
   */
  linkSourceColumnID?: number;
  /**
   * 链接源属性名称
   */
  linkSourceColumnName?: string;
  /**
   * 来源类型 1 数据湖同步  2 本地CSV导入
   */
  sourceType?: number;
  /**
   * N:N 数据库来源信息
   */
  sourceDataInfo?: SourceDataInfo;
  /**
   * N:N 中间表同步策略
   */
  syncSourceDataStrategy?: SyncSourceDataStrategy;
  /**
   * 数据表名称
   */
  linkTableName?: string;
  /**
   * 链接目标属性ID
   */
  linkTargetColumnID?: number;
  /**
   * 链接目标属性名称
   */
  linkTargetColumnName?: string;
  /**
   * 链接名称
   */
  name?: string;
  /**
   * 根据关系在tidb生成关系表的库
   */
  ontologyDbName?: string;
  /**
   * 属性字段映射列表
   */
  ontologyLinkTypeColumnList?: LinkTypeAttributeInfo[];
  /**
   * 本体模型ID
   */
  ontologyModelID?: number;
  /**
   * 根据关系在tidb生成关系表名
   */
  ontologyTableName?: string;
  /**
   * 源对象类型ID
   */
  sourceObjectTypeID?: number;
  /**
   * 源对象类型名称
   */
  sourceObjectTypeName?: string;
  /**
   * 源对象类型图标
   */
  sourceObjectTypeIcon?: string;
  /**
   * 源对象类型同步状态
   */
  sourceObjectTypeSyncStatus?: SyncStatus;
  /**
   * 源对象类型信息
   */
  sourceObjectTypeInfo?: ObjectType;
  /**
   * 源属性ID
   */
  sourcePropertyID?: number;
  /**
   * 同步状态（0：未同步，1：同步中，2：成功，3：失败）
   */
  syncStatus?: SyncStatus;
  /**
   * 同步时间
   */
  syncTime?: string;
  /**
   * 目标对象类型ID
   */
  targetObjectTypeID?: number;
  /**
   * 目标对象类型名称
   */
  targetObjectTypeName?: string;
  /**
   * 目标对象类型图标
   */
  targetObjectTypeIcon?: string;
  /**
   * 目标对象类型信息
   */
  targetObjectTypeInfo?: ObjectType;
  /**
   * 目标属性ID
   */
  targetPropertyID?: number;
  /**
   * 目标对象类型同步状态
   */
  targetObjectTypeSyncStatus?: SyncStatus;
  /**
   * 链接类型
   */
  type?: LinkType;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 修改人
   */
  updateUser?: string;
}

export interface OntologyLinkTypeColumn {
  /**
   * 字段类型
   */
  columnType: string;
  /**
   * 属性名称
   */
  comment: string;
  /**
   * 是否主键（1：是，0：否）
   */
  isPrimary?: number;
  /**
   * 是否使用（1：是，0：否）
   */
  isUse?: number;
  /**
   * 表字段
   */
  linkTypeID?: string;
  /**
   * 表字段
   */
  name: string;
}

export interface CreateOntologyLinkTypeReq {
  /**
   * 链接id
   */
  code: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 本地文件上传后的存储地址
   */
  filePath?: string;
  /**
   * 数据库名称
   */
  linkDbName?: string;
  /**
   * 源对象类型属性名称
   */
  linkSourceColumnName?: string;
  /**
   * 数据表名称
   */
  linkTableName?: string;
  /**
   * 目标对象类型属性名称
   */
  linkTargetColumnName?: string;
  /**
   * 链接名称
   */
  name: string;
  ontologyDbName?: string;
  /**
   * 属性字段映射列表
   */
  ontologyLinkTypeColumnList?: OntologyLinkTypeColumn[];
  /**
   * 本体模型ID
   */
  ontologyModelID: number;
  ontologyTableName?: string;
  /**
   * 是否启用数据源同步
   */
  enableSyncSourceData?: boolean;
  /**
   * 源对象类型ID
   */
  sourceObjectTypeID: number;
  /**
   * 来源类型 1 来自iceberg  2 文件上传
   */
  sourceType?: number;
  /**
   * N:N 数据库来源信息
   */
  sourceDataInfo?: SourceDataInfo;
  /**
   * N:N 中间表同步策略
   */
  syncSourceDataStrategy?: SyncSourceDataStrategy;
  /**
   * 目标对象类型ID
   */
  targetObjectTypeID: number;
  /**
   * 类型 1对1 2 1对N 3 N对N
   */
  type: number;
}

export interface UpdateOntologyLinkTypeReq extends CreateOntologyLinkTypeReq {
  /**
   * 唯一标识
   */
  id: number;
  /**
   * 是否重新上传（1：是，0：否）
   */
  isReUpload?: number;
}

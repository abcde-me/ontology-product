import { SyncStatus } from './graphApi';

export interface ListOntologyObjectTypeReq {
  /**
   * 搜索内容
   */
  filter?: string;
  /**
   * 本体模型ID
   */
  ontologyModelID?: number;
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
   * Example: []{ {order: "desc"}, {id:"asc"} }
   */
  orders?: Record<string, any>[];
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

export interface ObjectType {
  /**
   * 对象类型id
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
   * 描述说明
   */
  description?: string;
  /**
   * minio 文件地址
   */
  filePath?: string;
  /**
   * 图标类型
   */
  icon?: string;
  /**
   * ID,唯一标识
   */
  id: number;
  /**
   * 删除标识（1：是，0：否）
   */
  isDeleted?: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * TIDB中的库名称
   */
  ontologyDbName?: string;
  /**
   * 本体模型ID
   */
  ontologyModelID?: number;
  /**
   * TIDB中的 表名称
   */
  ontologyTableName?: string;
  /**
   * 原始数据库名称
   */
  originalDbName?: string;
  /**
   * 原始表名称
   */
  originalTableName?: string;
  /**
   * 来源类型 1 来自iceberg  2 文件上传
   */
  sourceType?: number;
  /**
   * 同步状态
   */
  syncStatus: SyncStatus;
  /**
   * 同步时间
   */
  syncTime?: string;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 修改人
   */
  updateUser?: string;
}

export interface ListOntologyObjectTypeRes {
  result: ObjectType[];
  totalCount: number;
}

export interface CreateOntologyPhysicalProperty {
  /**
   * 字段类型
   */
  columnType: string;
  /**
   * 属性名称
   */
  comment: string;
  /**
   * id,唯一标识
   */
  id?: string;
  /**
   * 是否主键
   */
  isPrimary: 1 | 0;
  /**
   * 表字段
   */
  name: string;
  /**
   * 关联公共属性ID
   */
  publicPropertyID: number;
}

export enum SourceType {
  ICEBERG = 1,
  FILE_UPLOAD = 2
}

export interface CreateOntologyObjectTypeReq {
  /**
   * 对象类型id
   */
  code: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 本地CSV导入的文件地址
   */
  filePath?: string;
  /**
   * 图标类型
   */
  icon: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 本体模型ID
   */
  ontologyModelID: number;
  /**
   * 物理属性列表
   */
  ontologyPhysicalPropertiesList?: CreateOntologyPhysicalProperty[];
  /**
   * 数据库名称
   */
  originalDbName: string;
  /**
   * 数据库中的表名称
   */
  originalTableName: string;
  /**
   * 来源类型 1 来自iceberg  2 文件上传
   */
  sourceType?: SourceType;
}

export interface UpdateOntologyObjectTypeReq
  extends CreateOntologyObjectTypeReq {
  /**
   * 对象类型id
   */
  id: number;
}

export interface GetOntologyObjectTypeDetailRes {
  data: ObjectType;
}

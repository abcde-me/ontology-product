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
  /**
   * 同步状态
   */
  syncStatusList?: SyncStatus[];
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
  /**
   * 是否选中
   */
  isUse: 1 | 0;
  /**
   * 是否存入公共属性库
   */
  isStoreAsPublic: 1 | 0;
  /**
   * 是否向量化
   */
  isVector?: 1 | 0;
  /**
   * 向量源字段
   */
  vectorSourceFieldName?: string;
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

export interface GetOntologyObjectTypeDetailRes
  extends CreateOntologyObjectTypeReq {
  id: number;
  /**
   * 同步状态
   */
  syncStatus: SyncStatus;
}

export interface UploadOntologyCSVFileAndParseRes {
  data: {
    columnList: string[];
    path: string;
  };
}

export interface MetadataMenuItem {
  id: number;
  databaseName: string;
}

export interface ListMetadataIcebergDatabaseNameRes {
  data: MetadataMenuItem[];
}

export interface ListMetadataIcebergTableReq {
  pageNum?: number;
  pageSize?: number;
  filters?: {
    databaseId: number;
  };
}

export interface IcebergTableItem {
  /**
   * 表ID
   */
  id: number;
  /**
   * 表名
   */
  tableName: string;
  /**
   * 表中文名/描述
   */
  description: string;
  /**
   * 数据库ID
   */
  databaseId: number;
  /**
   * 数据库名称
   */
  databaseName: string;
  /**
   * 分区字段,多个分区字段的话,英文逗号分隔
   */
  partitionKey: string;
  /**
   * 分区数量
   */
  partitionNum: number;
  /**
   * 存储大小
   */
  storageSize: string;
  /**
   * 文件存储位置
   */
  storageLocation: string;
  /**
   * 表类型
   */
  tableType: string;
  /**
   * 文件数
   */
  fileNum: string;
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * 更新时间
   */
  updataTime: string;
  /**
   * 最近访问时间
   */
  lastTime: string;
  /**
   * 表创建语句
   */
  createSql: string;
}

export interface ListMetadataIcebergTableRes {
  data: {
    /**
     * 总记录数
     */
    total: number;
    /**
     * 当前页码
     */
    pageNum: number;
    /**
     * 每页大小
     */
    pageSize: number;
    /**
     * 当前页记录数
     */
    size: number;
    /**
     * 起始行号
     */
    startRow: number;
    /**
     * 结束行号
     */
    endRow: number;
    /**
     * 总页数
     */
    pages: number;
    /**
     * 上一页页码
     */
    prePage: number;
    /**
     * 下一页页码
     */
    nextPage: number;
    /**
     * 是否第一页
     */
    isFirstPage: boolean;
    /**
     * 是否最后一页
     */
    isLastPage: boolean;
    /**
     * 是否有上一页
     */
    hasPreviousPage: boolean;
    /**
     * 是否有下一页
     */
    hasNextPage: boolean;
    /**
     * 导航页码数
     */
    navigatePages: number;
    /**
     * 导航页码数组
     */
    navigatepageNums: number[];
    /**
     * 导航第一页
     */
    navigateFirstPage: number;
    /**
     * 导航最后一页
     */
    navigateLastPage: number;
    /**
     * 表列表
     */
    list: IcebergTableItem[];
  };
}

export interface ListMetadataIcebergTiDBTableReq {
  pageNum?: number;
  pageSize?: number;
  filters?: {
    tableId: number;
  };
}

export interface TiDBTableFieldItem {
  /**
   * 字段ID
   */
  id: number;
  /**
   * 表字段
   */
  fieldName: string;
  /**
   * 表中文名/描述
   */
  description: string;
  /**
   * 字段类型
   */
  dataType: string;
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * 更新时间
   */
  updataTime: string;
}

export interface ListMetadataIcebergTiDBTableRes {
  data: {
    /**
     * 总记录数
     */
    total: number;
    /**
     * 表字段列表
     */
    list: TiDBTableFieldItem[];
    /**
     * 当前页码
     */
    pageNum: number;
    /**
     * 每页大小
     */
    pageSize: number;
    /**
     * 当前页记录数
     */
    size: number;
    /**
     * 起始行号
     */
    startRow: number;
    /**
     * 结束行号
     */
    endRow: number;
    /**
     * 总页数
     */
    pages: number;
    /**
     * 上一页页码
     */
    prePage: number;
    /**
     * 下一页页码
     */
    nextPage: number;
    /**
     * 是否第一页
     */
    isFirstPage: boolean;
    /**
     * 是否最后一页
     */
    isLastPage: boolean;
    /**
     * 是否有上一页
     */
    hasPreviousPage: boolean;
    /**
     * 是否有下一页
     */
    hasNextPage: boolean;
    /**
     * 导航页码数
     */
    navigatePages: number;
    /**
     * 导航页码数组
     */
    navigatepageNums: number[];
    /**
     * 导航第一页
     */
    navigateFirstPage: number;
    /**
     * 导航最后一页
     */
    navigateLastPage: number;
  };
}

/**
 * ontologymetadataservicev1.GetOntologyTopologyResponse
 */
export interface GetOntologyTopologyResponse {
  /**
   * 边列表
   */
  edges?: Ontologymetadataservicev1TopologyEdge[];
  /**
   * 节点列表
   */
  nodes?: Ontologymetadataservicev1TopologyNode[];
}

/**
 * ontologymetadataservicev1.TopologyEdge
 */
export interface Ontologymetadataservicev1TopologyEdge {
  /**
   * 边代码
   */
  code?: string;
  /**
   * 边描述
   */
  description?: string;
  /**
   * 边ID
   */
  id?: number;
  /**
   * 边名称
   */
  name?: string;
  /**
   * 源节点ID
   */
  sourceId?: number;
  /**
   * 目标节点ID
   */
  targetId?: number;
  /**
   * 边类型
   */
  type?: number;
  /**
   * 同步状态
   */
  syncStatus?: SyncStatus;
}

/**
 * ontologymetadataservicev1.TopologyNode
 */
export interface Ontologymetadataservicev1TopologyNode {
  /**
   * 节点代码
   */
  code?: string;
  /**
   * 节点描述
   */
  description?: string;
  /**
   * 节点ID
   */
  id?: number;
  /**
   * 节点名称
   */
  name?: string;
  /**
   * 节点类型
   */
  type?: string;
  /**
   * 节点图标
   */
  icon?: string;
  /**
   * 节点属性
   */
  ontologyPhysicalPropertiesList?: {
    id: number;
    name: string;
    type: string;
  }[];
  /**
   * 同步状态
   */
  syncStatus?: SyncStatus;
}

export interface ListOntologyObjectTypeDataRes {
  /**
   * 对象类型实例数据列表
   */
  result: Record<string, unknown>[];
  /**
   * 总记录数
   */
  totalCount: number;
}

export enum PublicPropertyRelation {
  ALL = 'all',
  NONE = 'none',
  RELATED = 'related'
}

export interface ListOntologyPhysicalPropertiesReq {
  /**
   * 搜索内容
   */
  filter?: string;
  /**
   * 是否主键
   */
  isPrimary?: 1 | 0;
  /**
   * 是否使用（1：是，0：否）
   */
  isUse?: number;
  /**
   * 对象类型ID
   */
  objectTypeIdList?: number[];
  /**
   * 本体模型ID
   */
  ontologyModelID?: number;
  /**
   * 对象类型名称
   */
  ontologyObjectTypeName?: string;
  /**
   * 公共属性名称
   */
  ontologyPublicPropertyName?: string;
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
  /**
   * 公共属性关联筛选：all(全部), none(未关联), related(有关联)
   */
  publicPropertyRelation?: PublicPropertyRelation;
  // 对象id
  id?: number;
}

/**
 * ontologymetadataservicev1.OntologyPhysicalProperties
 */
export interface PhysicalProperties {
  /**
   * 字段类型
   */
  columnType?: string;
  /**
   * 注释
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
   * 描述
   */
  description?: string;
  /**
   * ID,唯一标识
   */
  id?: number;
  /**
   * 删除标识（1：是，0：否）
   */
  isDeleted?: 1 | 0;
  /**
   * 是否主键（1：是，0：否）
   */
  isPrimary?: 1 | 0;
  /**
   * 是否作为实例名称（1：是，0：否）
   */
  isInstanceName?: 1 | 0;
  /**
   * 是否向量化源字段（1：是，0：否）
   */
  isVectorSourceField?: 1 | 0;
  /**
   * 名称
   */
  name?: string;
  /**
   * 对象类型ID
   */
  objectTypeID?: number;
  /**
   * 本体模型ID
   */
  ontologyModelID?: number;
  /**
   * 对象类型ID
   */
  ontologyObjectTypeId?: number;
  /**
   * 对象类型名称
   */
  ontologyObjectTypeName?: string;
  /**
   * 对象类型图标
   */
  ontologyObjectTypeIcon?: string;
  /**
   * 公共属性ID
   */
  ontologyPublicPropertiesId?: number;
  /**
   * 关联公共属性
   */
  ontologyPublicPropertiesName?: string;
  /**
   * 关联公共属性ID
   */
  publicPropertyID?: number;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 修改人
   */
  updateUser?: string;
  /**
   * 表字段
   */
  tableField?: string;
  /**
   * 数据源名称
   */
  dataSourceName?: string;
}

export interface ListOntologyPhysicalPropertiesRes {
  /**
   * 当前页结果
   */
  result?: PhysicalProperties[];
  /**
   * 总数
   */
  totalCount?: number;
}

export interface ListOntologyLinkTypeReq {
  /**
   * 本体模型ID
   */
  ontologyModelID?: number;
  /**
   * 搜索内容
   */
  filter?: string;
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
  /**
   * 源对象类型列表
   */
  sourceObjectTypeIDList?: number[];
  /**
   * 目标对象类型列表
   */
  targetObjectTypeIDList?: number[];
  /**
   * 同步状态列表
   */
  syncStatusList?: SyncStatus[];
  /**
   * 链接类型列表
   */
  typeList?: LinkType[];
}

export enum SyncStatus {
  /**
   * 未同步
   */
  NOT_SYNC = 0,
  /**
   * 同步中
   */
  SYNCING = 1,
  /**
   * 成功
   */
  SUCCESS = 2,
  /**
   * 失败
   */
  FAILED = 3
}

export enum LinkType {
  /**
   * 1:1 一对一
   */
  ONE_TO_ONE = 1,
  /**
   * 1:N 一对多
   */
  ONE_TO_MANY = 2,
  /**
   * N:N 多对多
   */
  MANY_TO_MANY = 3
}

export interface LinkInfo {
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
   * minio文件地址
   */
  filePath?: string;
  /**
   * ID,唯一标识
   */
  id?: number;
  /**
   * 删除标识（1：是，0：否）
   */
  isDeleted?: 1 | 0;
  /**
   * 链接数据库名称
   */
  linkDBName?: string;
  /**
   * 链接源属性ID
   */
  linkSourceColumnID?: number;
  /**
   * 来源类型 1 来自iceberg  2 文件上传
   */
  linkSourceType?: 1 | 2;
  /**
   * 链接表名称
   */
  linkTableName?: string;
  /**
   * 链接目标属性ID
   */
  linkTargetColumnID?: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 根据关系在tidb生成关系表的库
   */
  ontologyDbName?: string;
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
   * 源对象类型同步状态
   */
  sourceObjectTypeSyncStatus?: SyncStatus;
  /**
   * 源对象类型图标
   */
  sourceObjectTypeIcon?: string;
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
   * 目标对象类型同步状态
   */
  targetObjectTypeSyncStatus?: SyncStatus;
  /**
   * 目标属性ID
   */
  targetPropertyID?: number;
  /**
   * 类型 1 1对1 2 1对N 3 N对N
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
  /**
   * 源对象类型信息
   */
  sourceObjectTypeInfo?: {
    id: number;
    name: string;
    icon: string;
    syncStatus: SyncStatus;
  };
  /**
   * 目标对象类型信息
   */
  targetObjectTypeInfo?: {
    id: number;
    name: string;
    icon: string;
    syncStatus: SyncStatus;
  };
}

export interface ListOntologyLinkTypeRes {
  /**
   * 当前页结果
   */
  result?: LinkInfo[];
  /**
   * 总数
   */
  totalCount?: number;
}

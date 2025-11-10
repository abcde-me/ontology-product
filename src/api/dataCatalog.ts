import UAPI from '@/api';

// 数据目录相关接口

/**
 * 下载文件API接口
 * @param id 文件ID
 * @param params 额外参数
 */

//这个下载接口可以使用，但是不是在这个模块中用的，以后可能会用到
export async function downloadFileById(id: string, params: any = {}) {
  return await UAPI.RES.fileDownloadApi({ file_id: id }) //暂定只传一个id，后面再添加其他参数
    .get(params)
    .inRegion()
    .do();
}

//获取目录列表
// export async function getCatalogList(param: any = {}) {
//   return await UAPI.RES.catalogListApi({})
//     .get(param)
//     // .withConfig({baseURL: 'http://172.27.195.188:8080'})
//     .inRegion()
//     .do({ preCheck: false });
// }

export enum CatalogItemType {
  /**
   * 获取全部
   */
  All = 0,
  /**
   * 获取卷
   */
  Volume = 2,
  /**
   * 获取库
   */
  Database = 3
}

export enum CatalogRootType {
  /**
   * 获取所有数据目录
   */
  All = 0,
  /**
   * 获取源数据目录
   */
  Source = 1,
  /**
   * 获取目标数据目录
   */
  Target = 2
}

export interface GetCatalogListParams {
  /**
   * 文件夹类型，0-> 获取全部，2->仅获取卷，3->仅获取库，默认0
   */
  dir_type?: CatalogItemType;
  /**
   * 获取目录类型，0: 获取所有数据目录，1: 获取源数据目录，2：获取目标数据目录
   */
  root_type: CatalogRootType;
  /**
   * 搜索关键字
   */
  search?: string;
  /**
   * 获取卷大小
   */
  fetch_volume_size?: boolean;
}

export interface PurpleVolume {
  base_dir: string;
  id: number;
  name: string;
  parent_id: number;
  type: number;
  type_name: string;
}

/**
 * 子文件夹
 */
export interface DstChildren {
  /**
   * 卷，固定写死
   */
  volume: PurpleVolume[];
}

export interface DstCatalogItem {
  /**
   * 根目录名
   */
  base_dir?: string;
  /**
   * 子文件夹
   */
  children?: DstChildren;
  /**
   * 目录ID
   */
  id?: number;
  /**
   * 目录名
   */
  name?: string;
  /**
   * 父目录ID
   */
  parent_id?: number;
  /**
   * 本目录的权限点
   */
  perms?: string[];
  /**
   * 类型
   */
  type?: number;
  /**
   * 类型名称
   */
  type_name?: string;
}

export interface Db {
  base_dir?: string;
  children?: { [key: string]: any };
  id?: number;
  name?: string;
  parent_id?: number;
  perms?: string[];
  type?: number;
  type_name?: string;
}

export interface FluffyVolume {
  base_dir?: string;
  id?: number;
  name?: string;
  parent_id?: number;
  type?: number;
  type_name?: string;
  file_name?: string;
  file_id?: number;
  file_uuid?: string;
  extends?: {
    volume_size?: number;
  };
}

export interface SrcChildren {
  /**
   * 数据库，固定写死为db
   */
  db: Db[];
  /**
   * 卷，固定写死为volume
   */
  volume: FluffyVolume[];
}

export interface SrcCatalogItem {
  base_dir?: string;
  children?: SrcChildren;
  id?: number;
  name?: string;
  parent_id?: number;
  perms?: string[];
  type?: number;
  type_name?: string;
}

export interface GetCatalogListRes {
  dst: DstCatalogItem[];
  src: SrcCatalogItem[];
}

// 获取数据目录列表
export async function getCatalogList(
  param: GetCatalogListParams
): Promise<ApiRes<GetCatalogListRes>> {
  // TODO: 联调
  // return await UAPI.RES.catalogListApi({}).post(param).inRegion().do();

  // mock data
  return Promise.resolve({
    code: '0',
    message: 'success',
    requestId: '123',
    status: 200,
    data: {
      src: [
        {
          id: 122,
          parent_id: 0,
          type: 1,
          type_name: 'catalog',
          name: '源目录1',
          base_dir: '/user/xxd',
          children: {
            volume: [
              {
                base_dir: '',
                id: 201,
                name: '目标卷A',
                parent_id: 1,
                type: 2,
                type_name: 'volume'
              }
            ],
            db: [
              {
                id: 101,
                name: '目标数据库A',
                type: 2,
                type_name: 'db',
                base_dir: '/target/volume1/dbA'
              }
            ],
            meta_data: [
              {
                id: 1,
                parent_id: 0,
                name: '元数据1',
                type: 1,
                type_name: 'meta_data',
                children: {
                  item: [
                    {
                      id: 1,
                      name: '元数据1',
                      type: 1,
                      type_name: 'meta_data'
                    }
                  ]
                }
              }
            ]
          }
        }
      ],
      dst: [
        {
          id: 1,
          name: '目标卷1',
          type: 1,
          type_name: 'volume',
          base_dir: '/target/volume1',
          parent_id: 0,
          perms: ['read', 'write'],
          children: {
            volume: [
              {
                base_dir: '',
                id: 201,
                name: '目标卷A',
                parent_id: 1,
                type: 2,
                type_name: 'volume'
              }
            ]
          }
        }
      ]
    }
  });
}

export interface GetSourceCatalogFileListParams {
  /**
   * 页码
   */
  page?: number;
  /**
   * 每页大小
   */
  page_size?: number;
  /**
   * 数据父目录id
   */
  data_path_id: number;
  /**
   * 文件名（可选，用于搜索）
   */
  file_name?: string;
  /**
   * 执行ID
   */
  execution_id?: string;
  /**
   * 开始时间
   */
  start?: string;
  /**
   * 结束时间
   */
  end?: string;
  /**
   * 文件类型数组 "pdf",
   * "ppt",
   * "docx",
   * "txt",
   * "md"
   */
  file_type?: string[];
  /**
   * 排序方式：升序"asc"或降序"desc"
   */
  sort?: 'asc' | 'desc';
}

export interface GetSourceCatalogFileListItem {
  /**
   * 文件ID
   */
  id: number;
  /**
   * 连接器名称
   */
  connector_name: string;
  /**
   * 连接器ID
   */
  connector_id: number;
  /**
   * 文件名
   */
  file_name: string;
  /**
   * 文件类型
   */
  file_type: string;
  /**
   * 文件大小
   */
  file_size: number;
  /**
   * 上传用户
   */
  upload_user: string;
  /**
   * 任务加载开始时间
   */
  task_load_start_time: string;
  /**
   * 数据路径ID
   */
  data_path_id: number;
  /**
   * 绝对数据路径
   */
  abs_data_path: string;
  /**
   * 文件子路径
   */
  file_sub_path: string;
  /**
   * 权限列表
   */
  perms: string[];
}

export interface GetSourceCatalogFileListRes {
  /**
   * 文件列表
   */
  items: GetSourceCatalogFileListItem[];
  /**
   * 总数
   */
  total: number;
  /**
   * 当前页
   */
  page: number;
  /**
   * 每页大小
   */
  page_size: number;
}

// 源数据目录文件列表
export async function getSourceCatalogFileList(
  param: GetSourceCatalogFileListParams
): Promise<ApiRes<GetSourceCatalogFileListRes>> {
  return await UAPI.RES.getLoadTaskFiles({}).post(param).inRegion().do();

  // mock data
  // return Promise.resolve({
  //   code: '0',
  //   message: 'success',
  //   requestId: '123',
  //   status: 200,
  //   data: {
  //     items: [
  //       {
  //         id: 4283,
  //         connector_name: 'hdfs-xiaof2',
  //         connector_id: 406,
  //         file_name: 'etst.txt',
  //         file_type: 'txt',
  //         file_size: 2,
  //         upload_user: '肖峰',
  //         task_load_start_time: '2025-07-30 10:47:09',
  //         data_path_id: 954,
  //         abs_data_path: '/src/xiaof12/volume/xiaof112',
  //         file_sub_path: 'etst.txt',
  //         perms: ['source_dir:can_export', 'source_dir:can_delete']
  //       }
  //     ],
  //     total: 0,
  //     page: 1,
  //     page_size: 100
  //   }
  // });
}

export interface GetTargetCatalogFileListParams {
  /**
   * 结束时间
   */
  end_time?: string;
  /**
   * 文件类型数组
   * "pdf",
   * "ppt",
   * "docx",
   * "txt",
   * "md"
   */
  file_type?: string[];
  /**
   * 文件名search
   */
  search_name?: string;
  /**
   * 完整文件路径
   */
  full_path: string;
  /**
   * 页大小
   */
  limit?: number;
  /**
   * 页码
   */
  page?: number;
  /**
   * 文件所属目录ID，卷ID
   */
  path_id: string;
  /**
   * 搜索数据内容
   */
  search_content?: string;
  search_id?: number;
  sort_field: string;
  sort_order: 'asc' | 'desc';
  /**
   * 开始时间
   */
  start_time?: string;
}

export interface GetTargetCatalogFileListItem {
  /**
   * 文件ID
   */
  id: number;
  /**
   * 生成时间
   */
  generated_at: string;
  /**
   * 文件名
   */
  FileName: string;
  /**
   * 文件名
   */
  file_name: string;
  /**
   * 文件类型
   */
  file_type: string;
  /**
   * 完整文件路径
   */
  full_path: string;
  /**
   * 文件内容摘要
   */
  short_content: string;
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * 更新时间
   */
  updated_at: string;
  /**
   * 删除时间
   */
  deleted_at: string | null;
  /**
   * 额外信息
   */
  extras: {
    /**
     * 数据科学工作流ID
     */
    ds_workflow_id: string;
    /**
     * 文件名
     */
    file_name: string;
    /**
     * 文件大小
     */
    file_size: string;
    /**
     * 工作流UUID
     */
    workflow_uuid: string;
  };
  /**
   * 权限列表
   */
  perms: string[];
}

export interface GetTargetCatalogFileListRes {
  /**
   * 文件列表
   */
  list: GetTargetCatalogFileListItem[];
  /**
   * 总数
   */
  total: number;
  /**
   * 当前页
   */
  page: number;
  /**
   * 每页大小
   */
  page_size: number;
}

//查询源库下的表列表
export interface DbTableListParamss {
  path_id: number;
  search: string;
  page: number;
  limit: number;
  database: string;
}

//查询源库下的表详情
export interface GetDbItemDetailParams {
  detail_type: string;
  database: string;
  table: string;
  path_id: number;
  table_id: number;
}

export async function getTargetCatalogFileList(
  param: GetTargetCatalogFileListParams
): Promise<ApiRes<GetTargetCatalogFileListRes>> {
  // TODO: 联调
  return await UAPI.RES.targetDataFileListApi({})
    .post({ ...param })
    .inRegion()
    .do();

  // mock data
  // return Promise.resolve({
  //   code: '0',
  //   message: 'success',
  //   requestId: '123',
  //   status: 200,
  //   data: {
  //     list: [
  //       {
  //         id: 17228,
  //         generated_at: '2025-08-28T13:43:04+08:00',
  //         file_name: '1504',
  //         file_type: 'jsonl',
  //         full_path: '/dst/zsq数据清洗测试/volume/多轮问答',
  //         short_content: '报考者能否更改已经审核通过的职位',
  //         created_at: '2025-08-28T13:43:06+08:00',
  //         updated_at: '2025-08-28T13:43:06+08:00',
  //         deleted_at: null,
  //         extras: {
  //           ds_workflow_id: '150455535967520',
  //           file_name: '150455535967520.469.1756359557089.augment.jsonl',
  //           file_size: '',
  //           workflow_uuid: '3d117aa8-91ab-430f-b77f-0cfc877ab5e5'
  //         },
  //         perms: ['dst_file:can_export', 'dst_file:can_delete']
  //       }
  //     ],
  //     total: 0,
  //     page: 1,
  //     page_size: 100
  //   }
  // });
}

// 添加目录
export async function addCatalog(data: any) {
  const res = await UAPI.RES.catalogAddApi({}).post(data).inRegion().do();
  return res;
}
// 新建卷
export async function addVolume(data: any) {
  const res = await UAPI.RES.volumeAddApi({}).post(data).inRegion().do();
  return res;
}

//新建数据库
export async function addDb(data: AddDbParams) {
  const res = await UAPI.RES.dbAddApi({}).post(data).inRegion().do();
  return res;
}

// 删除数据卷
export async function deleteVolume(
  id: string,
  params?: { root_type?: string }
) {
  const res = await UAPI.RES.volumeDeleteApi({})
    .post({ ...params, id })
    .inRegion()
    .do();
  return res;
}
// 删除库表
export async function deleteTable(data) {
  const res = await UAPI.RES.tableDeleteApi({})
    .post({ ...data })
    .inRegion()
    .do();
  return res;
}
// 重命名目录
export async function renameCatalog(id: string, params: any) {
  const res = await UAPI.RES.catalogRenameApi({})
    .post({ ...params, catalogId: id })
    .inRegion()
    .do();
  return res;
}

//定义新建库的参数接口
interface AddDbParams {
  parent_id: number;
  name: string;
}

// 定义查询目标数据文件的参数接口
interface TargetDataFileQueryParams {
  page: number;
  full_path: string;
  start_time: string;
  end_time: string;
  search_content: string;
  search_id: number;
  limit: number;
  file_type: Array<string>;
  sort_field?: string;
  sort_order?: string;
}

// 定义删除目标文件的参数接口
interface TargetFileDeleteParams {
  file_ids: Array<number | string>;
  full_path: string;
  path_id: string;
}
//查询源数据文件参数接口
interface SourceDataFileQueryParams {
  page: number;
  page_size: number;
  file_name: string;
  data_path_id: number;
  start: string;
  end: string;
  file_type: Array<string>;
  sort_field?: string;
  sort_order?: string;
}
//查询目标数据文件列表
export async function getTargetDataFileList(params: TargetDataFileQueryParams) {
  const { file_type, ...restParams } = params;
  console.log('params222', params);
  const queryParams = new URLSearchParams();

  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Convert value to string without unnecessary assertion
      queryParams.append(key, String(value));
    }
  });

  if (file_type && Array.isArray(file_type)) {
    file_type.forEach((type) => {
      queryParams.append('file_type', type);
    });
  }
  console.log('queryParams', queryParams);
  return await UAPI.RES.targetDataFileListApi({}).post(params).inRegion().do();
}
//查询目标数据文件类型列表
export async function getTargetFileTypeList() {
  return await UAPI.RES.targetFileTypeListApi({}).post().inRegion().do();
}
//查询源数据文件类型列表
export async function getSourceFileTypeList(params) {
  return await UAPI.RES.sourceFileTypeListApi({})
    .post({ data_path_id: Number(params?.id) })
    .inRegion()
    .do();
}

//删除目标文件
export async function deleteTargetFile(params: TargetFileDeleteParams) {
  // const { file_ids, ...restParams } = params;

  // const queryParams = new URLSearchParams();

  // Object.entries(restParams).forEach(([key, value]) => {
  //   if (value !== undefined && value !== null) {
  //     queryParams.append(key, String(value));
  //   }
  // });

  // file_ids.forEach((id) => {
  //   queryParams.append('file_ids', String(id));
  // });

  return await UAPI.RES.targetDataFileDeleteApi({})
    .post({
      ...params,
      path_id: Number(params.path_id)
    })
    .inRegion()
    .do();
}

//查询源数据文件列表
export async function getSourceDataFileList(params: SourceDataFileQueryParams) {
  return await UAPI.RES.sourceDataFileListApi({})
    .post({ ...params })
    .inRegion()
    .do();
}
//删除源数据目录单个文件
export async function deleteSourceFile(id: string) {
  return await UAPI.RES.sourceDataFileDeleteApi({})
    .post({ id })
    .inRegion()
    .do();
}
//批量删除源数据文件
export async function deleteSourceFileBatch(params: any) {
  return await UAPI.RES.sourceDataFileDeleteBatcheApi({})
    .post({ ...params })
    .inRegion()
    .do();
}

//预览/搜索数据集
export async function getCatalogPreview(param: any = {}) {
  return await UAPI.RES.catalogPreviewApi({}).post(param).inRegion().do();
}

//删除目录文件接口
export async function deleteFileById(id: string, params: any = {}) {
  return await UAPI.RES.fileDeleteApi({}) //暂定只传一个id，后面再添加其他参数
    .post({ ...params, file_id: id })
    .inRegion()
    .do();
}

//查询指定目录下，已加载成功的文件记录
export async function getDataCatalogList(param: any = {}) {
  return await UAPI.RES.dataCatalogListApi({}).post(param).inRegion().do();
}

// 获取数据目录列表

// 创建数据集

export async function createCatalog(data: any) {
  return await UAPI.RES.CatalogCreateApi({}).post(data).inRegion().do();
}
//导出文件
export async function exportFile(params: any = {}) {
  return await UAPI.RES.fileExportApi({}).post(params).inRegion().do();
}

//获取数据库表列表
export async function getDbItemList(params: DbTableListParamss) {
  return await UAPI.RES.dbItemListApi({}).post(params).inRegion().do();
}

export interface GetDbItemDetailRes {
  ddl: Ddl;
  loader: Loader;
  request_params: RequestParams;
  sample: Sample;
}

export interface Ddl {
  columns: Column[];
  tableInfo: string;
}

export interface Column {
  comment: string;
  name: string;
  type: string;
}

export interface Loader {
  connector_id: string;
  connector_name: string;
  created_time: string;
  load_task_id: string;
  load_task_name: string;
  updated_time: string;
  username: string;
}

export interface RequestParams {
  database: string;
  detail_type: string;
  path_id: number;
  table: string;
}

export interface Sample {
  columns: string[];
  data: Record<string, string>[];
}

//查询源库下的表详情
export async function getDbItemDetail(params: GetDbItemDetailParams) {
  return await UAPI.RES.dbItemDetailApi({}).post(params).inRegion().do();
}

export interface GetMetaDataListParams {
  page: number;
  pageSize: number;
  fieldSearch: FieldSearchItem[];
  // 轮询元数据列表时，接口参数中的queryLoadTaskInstance = true
  // 其他情况，queryLoadTaskInstance = false
  queryLoadTaskInstance: boolean;
}

export enum LoadTaskStatus {
  LOADING = 'loading',
  COMPLETED = 'completed'
}

export interface Field {
  nameEn: string;
  nameZh: string;
  type: string;
  default: '';
  required: boolean;
  allowModify: boolean;
  isEnumAble: boolean;
  enumValues: unknown[];
}

export interface RecordItem {
  id: number;
  name: string;
  type: string;
  searchContent: string[];
}

export interface GetMetaDataListRes {
  searchfields: Field[];
  records: RecordItem[];
  total: number;
  size: number;
  current: number;
  loadTaskStatus: LoadTaskStatus;
}

export interface FieldSearchItem {
  nameEn: string;
  type: string;
  searchContent: string[];
}

//查询元数据列表
export async function getMetaDataList(
  params: GetMetaDataListParams
): Promise<ApiRes<GetMetaDataListRes>> {
  return Promise.resolve({
    code: '0',
    message: 'success',
    requestId: '123',
    status: 200,
    data: {
      searchfields: [
        {
          nameEn: 'name',
          nameZh: '名称',
          type: 'string',
          default: '',
          required: false,
          allowModify: true,
          isEnumAble: false,
          enumValues: []
        },
        {
          nameEn: 'type',
          nameZh: '类型',
          type: 'string',
          default: '',
          required: false,
          allowModify: true,
          isEnumAble: false,
          enumValues: []
        },
        {
          nameEn: 'created_at',
          nameZh: '创建时间',
          type: 'string',
          default: '',
          required: false,
          allowModify: true,
          isEnumAble: false,
          enumValues: []
        },
        {
          nameEn: 'updated_at',
          nameZh: '更新时间',
          type: 'string',
          default: '',
          required: false,
          allowModify: true,
          isEnumAble: false,
          enumValues: []
        }
      ],
      records: [
        {
          id: 1,
          name: '井位分布图.map',
          type: '图件',
          searchContent: ['井位分布图.map'],
          created_at: '2024-01-01 12:00:00',
          updated_at: '2024-01-01 12:00:00'
        },
        {
          id: 2,
          name: '储量计算报告.pdf',
          type: '文档',
          searchContent: ['储量计算报告.pdf'],
          created_at: '2024-01-01 12:00:00',
          updated_at: '2024-01-01 12:00:00'
        },
        {
          id: 3,
          name: '试井解释报告.pdf',
          type: '文档',
          searchContent: ['试井解释报告.pdf'],
          created_at: '2024-01-01 12:00:00',
          updated_at: '2024-01-01 12:00:00'
        },
        {
          id: 4,
          name: '射孔数据表.job',
          type: '体数据',
          searchContent: ['射孔数据表.job'],
          created_at: '2024-01-01 12:00:00',
          updated_at: '2024-01-01 12:00:00'
        },
        {
          id: 5,
          name: '井口温度压力实时趋势.realtime',
          type: '体数据',
          searchContent: ['井口温度压力实时趋势.realtime'],
          created_at: '2024-01-01 12:00:00',
          updated_at: '2024-01-01 12:00:00'
        }
      ],
      total: 5,
      size: 10,
      current: 0,
      loadTaskStatus: LoadTaskStatus.COMPLETED
    }
  });
  // return await UAPI.RES.listMetaData({}).post(params).inRegion().do();
}

//新建元数据
export async function addMetaData(params: {
  name: string;
  parent_id: number;
}): Promise<
  ApiRes<{
    id: number;
  }>
> {
  return Promise.resolve({
    code: '0',
    message: 'success',
    requestId: '123',
    status: 200,
    data: {
      id: 1
    }
  });
  // return await UAPI.RES.createDirMetaData({}).post(params).inRegion().do();
}

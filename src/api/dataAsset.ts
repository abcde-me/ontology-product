import UAPI from '@/api';
import {
  AutoMapDataAssetFieldAndSourceReq,
  AutoMapDataAssetFieldAndSourceResItem,
  BaseTag,
  ColumnField,
  CreateDataAssetAndMappingReq,
  CreateDataAssetRes,
  DataAssetField,
  EditDataAssetColumnMapReq,
  EditDataAssetColumnMapResItem,
  EditDataAssetData,
  EditDataAssetFieldsDisplayReq,
  FindDataAssetMappingItemRes,
  ListDataAssetDataReq,
  ListDataAssetDataRes,
  ListDataAssetSourceResItem,
  MappingItem
} from '@/types/dataAssetApi';

// 查询数据资产表字段和映射关系
export async function findDataAssetMapping(): Promise<
  ApiRes<FindDataAssetMappingItemRes[]>
> {
  // return Promise.resolve({
  //   code: 0,
  //   status: 200,
  //   data: [
  //     {
  //       nameZh: '数据集',
  //       nameEn: 'dataset',
  //       type: 'string',
  //       default: '',
  //       required: false,
  //       allowModify: true,
  //       mapping: [
  //         {
  //           type: 'string',
  //           tableName: 'table001',
  //           fieldType: 'varchar(255)',
  //           feildName: 'name'
  //         }
  //       ]
  //     },
  //     {
  //       nameZh: '源数据目录-卷',
  //       nameEn: 'datavolume',
  //       type: 'string',
  //       default: '',
  //       required: false,
  //       allowModify: true,
  //       mapping: [
  //         {
  //           type: 'string',
  //           tableName: 'table002',
  //           fieldType: 'varchar(255)',
  //           feildName: '源数据目录-卷-name1'
  //         },
  //         {
  //           type: 'number',
  //           tableName: 'table002',
  //           fieldType: 'bigint',
  //           feildName: 'id'
  //         }
  //       ]
  //     }
  //   ],
  //   message: 'success',
  //   requestId: ''
  // });
  return await UAPI.RES.getDataAssetMapping({}).post({}).inRegion().do();
}

// 自动映射
export async function autoMapDataAssetFieldAndSource(
  params: AutoMapDataAssetFieldAndSourceReq
): Promise<ApiRes<AutoMapDataAssetFieldAndSourceResItem[]>> {
  return await UAPI.RES.autoMapDataAssetFieldAndSource({})
    .post(params)
    .inRegion()
    .do();
}

// 获取数据资产列表
export async function listDataAssetData(
  params: ListDataAssetDataReq
): Promise<ApiRes<ListDataAssetDataRes>> {
  // Mock 所有数据
  // const allRecords = [
  //   {
  //     id: '1',
  //     name: '井位分布图.map',
  //     tags: ['实体:井'],
  //     source: '数据目录\\图件',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '2',
  //     name: '储量计算报告.pdf',
  //     tags: [],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '3',
  //     name: '试井解释报告.pdf',
  //     tags: ['实体:井'],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '4',
  //     name: '压裂施工设计书.pdf',
  //     tags: [],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '5',
  //     name: '废弃液处理报告.pdf',
  //     tags: [],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '6',
  //     name: '设备维护手册.pdf',
  //     tags: [],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '7',
  //     name: '管道腐蚀检测报告.pdf',
  //     tags: [],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '8',
  //     name: '硫化氢监测报告.pdf',
  //     tags: [],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '9',
  //     name: '井场视频监控.mp4',
  //     tags: ['实体:井'],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '10',
  //     name: '地理底图.shp',
  //     tags: [],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '11',
  //     name: '开发方案多媒体报告.ppt',
  //     tags: [],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '12',
  //     name: '实时功图数据表.dat',
  //     tags: ['代码工具'],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '13',
  //     name: '井下工具工作日志.dat',
  //     tags: ['实体:井', '代码工具'],
  //     source: '数据目录\\文档',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '14',
  //     name: '射孔数据表.job',
  //     tags: [],
  //     source: '数据目录\\体数据',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '15',
  //     name: '井口温度压力实时趋势.realtime',
  //     tags: ['实体:井'],
  //     source: '数据目录\\体数据',
  //     updateTime: '2024-01-01 12:00:00'
  //   },
  //   {
  //     id: '16',
  //     name: '油藏数值模拟输入文件.input',
  //     tags: [],
  //     source: '数据目录\\体数据',
  //     updateTime: '2024-01-01 12:00:00'
  //   }
  // ];

  // // 分页处理
  // const page = params.page || 1;
  // const pageSize = params.pageSize || 10;
  // const startIndex = (page - 1) * pageSize;
  // const endIndex = startIndex + pageSize;
  // const paginatedRecords = allRecords.slice(startIndex, endIndex);

  // return Promise.resolve({
  //   code: 0,
  //   status: 200,
  //   data: {
  //     fields: [
  //       {
  //         nameZh: '数据资产名称',
  //         nameEn: 'name',
  //         type: 'string',
  //         default: '',
  //         isEnumAble: false,
  //         allowModify: true,
  //         displaySort: 1
  //       },
  //       {
  //         nameZh: '资产标签',
  //         nameEn: 'tags',
  //         type: 'string',
  //         default: '',
  //         isEnumAble: false,
  //         allowModify: true,
  //         displaySort: 2
  //       },
  //       {
  //         nameZh: '来源',
  //         nameEn: 'source',
  //         type: 'string',
  //         default: '',
  //         isEnumAble: false,
  //         allowModify: true,
  //         displaySort: 3
  //       },
  //       {
  //         nameZh: '更新时间',
  //         nameEn: 'updateTime',
  //         type: 'date',
  //         default: '',
  //         isEnumAble: false,
  //         allowModify: false,
  //         displaySort: 4
  //       }
  //     ],
  //     records: paginatedRecords,
  //     total: allRecords.length,
  //     page: page,
  //     pageSize: pageSize
  //   },
  //   message: 'success',
  //   requestId: ''
  // });
  return await UAPI.RES.listDataAssetData({}).post(params).inRegion().do();
}

// 修改数据资产
export async function editDataAssetAndMapping(params: {
  fields: CreateDataAssetAndMappingReq;
}) {
  return await UAPI.RES.editDataAssetAndMapping({})
    .post(params)
    .inRegion()
    .do();
}

// 删除数据资产
export async function deleteDataAsset(id: string) {
  return await UAPI.RES.dataAssetDelete({}).post({ id }).inRegion().do();
}

// 分析数据资产字段文件
export async function analyzeDataAssetFieldsFile(params: {
  file: File;
}): Promise<ApiRes<DataAssetField[]>> {
  return Promise.resolve({
    code: 0,
    status: 200,
    data: [
      {
        nameZh: '数据集',
        nameEn: 'dataset',
        type: 'string',
        default: '',
        required: false,
        allowModify: true
      }
    ],
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.analyzeDataAssetFieldsFile({})
  //   .post(params)
  //   .inRegion()
  //   .do();
}

// 查询支持的字段类型
export async function listDataAssetFieldTypes(): Promise<ApiRes<string[]>> {
  // return Promise.resolve({
  //   code: 0,
  //   status: 200,
  //   data: ['string', 'number', 'boolean', 'date', 'object'],
  //   message: 'success',
  //   requestId: ''
  // });
  return await UAPI.RES.listDataAssetFieldTypes({}).post().inRegion().do();
}

// 查询数据来源
export async function listDataAssetSource(): Promise<
  ApiRes<ListDataAssetSourceResItem[]>
> {
  // return Promise.resolve({
  //   message: '',
  //   data: [
  //     {
  //       type: 'dataset',
  //       name: '数据集',
  //       tableName: 'table001',
  //       databaseName: 'database001',
  //       fields: [
  //         {
  //           name: 'id',
  //           type: 'string'
  //         },
  //         {
  //           name: 'name',
  //           type: 'varchar(255)'
  //         }
  //       ]
  //     },
  //     {
  //       type: 'datavolume',
  //       name: '源数据目录-卷',
  //       tableName: 'table002',
  //       databaseName: 'database002',
  //       fields: [
  //         {
  //           name: 'id',
  //           type: 'bigint'
  //         },
  //         {
  //           name: 'name',
  //           type: 'string'
  //         }
  //       ]
  //     },
  //     {
  //       type: 'database',
  //       name: '源数据目录-数据库',
  //       tableName: 'table003',
  //       databaseName: 'database003',
  //       fields: [
  //         {
  //           name: 'id',
  //           type: 'bigint'
  //         },
  //         {
  //           name: 'name',
  //           type: 'varchar(255)'
  //         }
  //       ]
  //     },
  //     {
  //       type: 'metadata',
  //       name: '源数据目录-元数据-目录1',
  //       tableName: 'table004',
  //       databaseName: 'database004',
  //       fields: [
  //         {
  //           name: 'id',
  //           type: 'bigint'
  //         },
  //         {
  //           name: 'name',
  //           type: 'varchar(255)'
  //         }
  //       ]
  //     },
  //     {
  //       type: 'metadata',
  //       name: '源数据目录-元数据-目录2',
  //       tableName: 'table005',
  //       databaseName: 'database005',
  //       fields: [
  //         {
  //           name: 'id',
  //           type: 'bigint'
  //         },
  //         {
  //           name: 'name',
  //           type: 'varchar(255)'
  //         }
  //       ]
  //     }
  //   ],
  //   status: 200,
  //   code: 200,
  //   requestId: ''
  // });
  return await UAPI.RES.listDataAssetSource({}).post().inRegion().do();
}

// 创建数据资产和映射关系
export async function createDataAssetAndMapping(params: {
  fields: CreateDataAssetAndMappingReq;
}) {
  return await UAPI.RES.createDataAssetAndMapping({})
    .post(params)
    .inRegion()
    .do();
}

// 编辑数据资产和映射关系
export async function editDataAssetColumnMap(
  params: any
): Promise<ApiRes<any>> {
  return Promise.resolve({
    code: 0,
    status: 200,
    data: {},
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.editDataAssetColumnMap({}).post(params).inRegion().do();
}

// 数据资产字段自动映射
export async function autoMapDataAssetColumn(
  params: EditDataAssetColumnMapReq
): Promise<ApiRes<EditDataAssetColumnMapResItem[]>> {
  return Promise.resolve({
    code: 0,
    status: 200,
    data: [
      {
        fieldNameEn: 'name',
        mapping: [
          {
            type: 'string',
            tableName: 'table001',
            fieldType: 'varchar(255)',
            feildName: 'name'
          }
        ]
      }
    ],
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.autoMapDataAssetColumn({}).post(params).inRegion().do();
}

// 修改数据资产表列设置（前端展示）
export async function editDataAssetFieldsDisplay(
  params: EditDataAssetFieldsDisplayReq
) {
  // return Promise.resolve({
  //   code: 0,
  //   status: 200,
  //   data: {},
  //   message: 'success',
  //   requestId: ''
  // });
  return await UAPI.RES.editDataAssetFieldsDisplay({})
    .post(params)
    .inRegion()
    .do();
}

// 查询数据资产表列设置（前端展示）
export async function findDataAssetFieldsDisplay(
  params: any
): Promise<ApiRes<ColumnField[]>> {
  // return Promise.resolve({
  //   code: 0,
  //   status: 200,
  //   data: {
  //     fields: [
  //       {
  //         nameZh: '数据资产名称',
  //         nameEn: 'name',
  //         type: 'string',
  //         default: '',
  //         isEnumAble: true,
  //         allowModify: true,
  //         displaySort: 1
  //       },
  //       {
  //         nameZh: '资产标签',
  //         nameEn: 'tags',
  //         type: 'string',
  //         default: '',
  //         isEnumAble: false,
  //         allowModify: true,
  //         displaySort: 2
  //       },
  //       {
  //         nameZh: '来源',
  //         nameEn: 'source',
  //         type: 'string',
  //         default: '',
  //         isEnumAble: false,
  //         allowModify: true,
  //         displaySort: 3
  //       },
  //       {
  //         nameZh: '更新时间',
  //         nameEn: 'updateTime',
  //         type: 'date',
  //         default: '',
  //         isEnumAble: false,
  //         allowModify: false,
  //         displaySort: 4
  //       }
  //     ]
  //   },
  //   message: 'success',
  //   requestId: ''
  // });
  return await UAPI.RES.getDataAssetFieldsDisplay({})
    .post(params)
    .inRegion()
    .do();
}

export async function getDataAssetTableDistinctFieldCount(params: {
  fieldEnName: string;
}): Promise<ApiRes<number>> {
  return Promise.resolve({
    code: 0,
    status: 200,
    data: 10,
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.getDataAssetTableDistinctFieldCount({}).post(params).inRegion().do();
}

export async function editDataAssetDataBatch(params: EditDataAssetData) {
  return Promise.resolve({
    code: 0,
    status: 200,
    data: {},
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.editDataAssetDataBatch({}).post(params).inRegion().do();
}

export async function deleteDataAssetDataBatch(params: { ids: string[] }) {
  // return Promise.resolve({
  //   code: 0,
  //   status: 200,
  //   data: {},
  //   message: 'success',
  //   requestId: ''
  // });
  return await UAPI.RES.deleteDataAssetDataBatch({})
    .post(params)
    .inRegion()
    .do();
}

export async function getTagList(): Promise<ApiRes<BaseTag[]>> {
  return Promise.resolve({
    code: 0,
    status: 200,
    data: [
      {
        id: 'tag-999',
        name: 'test',
        description: 'test',
        valueList: [
          {
            id: 'tagvalue-777',
            tagValue: '1'
          },
          {
            id: 'tagvalue-888',
            tagValue: '2'
          },
          {
            id: 'tagvalue-999',
            tagValue: '3'
          }
        ]
      }
    ],
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.listAssetTags({}).post({}).inRegion().do();
}

import UAPI from '@/api';
import {
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
        allowModify: true,
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
  // return await UAPI.RES.findDataAssetMapping({}).post({}).inRegion().do();
}

// 获取数据资产列表
export async function listDataAssetData(
  params: ListDataAssetDataReq
): Promise<ApiRes<ListDataAssetDataRes>> {
  // Mock 所有数据
  const allRecords = Array.from({ length: 50 }, (_, i) => ({
    id: String(i + 1),
    name: `数据资产${i + 1}`,
    tags: ['标签1', '标签2'],
    source: '来源1',
    updateTime: '2024-01-01 12:00:00'
  }));

  // 分页处理
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = allRecords.slice(startIndex, endIndex);

  return Promise.resolve({
    code: 0,
    status: 200,
    data: {
      fields: [
        {
          nameZh: '数据资产名称',
          nameEn: 'name',
          type: 'string',
          isEnum: false,
          isDisplay: true
        },
        {
          nameZh: '资产标签',
          nameEn: 'tags',
          type: 'string',
          isEnum: false,
          isDisplay: true
        },
        {
          nameZh: '来源',
          nameEn: 'source',
          type: 'string',
          isEnum: false,
          isDisplay: true
        },
        {
          nameZh: '更新时间',
          nameEn: 'updateTime',
          type: 'date',
          isEnum: false,
          isDisplay: true
        }
      ],
      records: paginatedRecords,
      total: allRecords.length,
      page: page,
      pageSize: pageSize
    },
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.listDataAssetData({}).post(params).inRegion().do();
}

// 修改数据资产
export async function editDataAsset(params: CreateDataAssetAndMappingReq) {
  return await UAPI.RES.editDataAsset({}).post(params).inRegion().do();
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
  return Promise.resolve({
    code: 0,
    status: 200,
    data: ['string', 'number', 'boolean', 'date', 'object'],
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.listDataAssetFieldTypes({}).post().inRegion().do();
}

// 查询数据来源
export async function listDataAssetSource(): Promise<
  ApiRes<ListDataAssetSourceResItem[]>
> {
  return Promise.resolve({
    message: '',
    data: [
      {
        type: 'dataset',
        name: '数据集',
        tableName: 'table001',
        fields: [
          {
            name: 'id',
            type: 'bigint'
          },
          {
            name: 'name',
            type: 'varchar(255)'
          }
        ]
      },
      {
        type: 'datavolume',
        name: '源数据目录-卷',
        tableName: 'table002',
        fields: [
          {
            name: 'id',
            type: 'bigint'
          },
          {
            name: 'name',
            type: 'varchar(255)'
          }
        ]
      },
      {
        type: 'database',
        name: '源数据目录-数据库',
        tableName: 'table003',
        fields: [
          {
            name: 'id',
            type: 'bigint'
          },
          {
            name: 'name',
            type: 'varchar(255)'
          }
        ]
      },
      {
        type: 'metadata',
        name: '源数据目录-元数据-目录1',
        tableName: 'table004',
        fields: [
          {
            name: 'id',
            type: 'bigint'
          },
          {
            name: 'name',
            type: 'varchar(255)'
          }
        ]
      },
      {
        type: 'metadata',
        name: '源数据目录-元数据-目录2',
        tableName: 'table005',
        fields: [
          {
            name: 'id',
            type: 'bigint'
          },
          {
            name: 'name',
            type: 'varchar(255)'
          }
        ]
      }
    ],
    status: 0,
    code: 200,
    requestId: ''
  });
  // return await UAPI.RES.listDataAssetSource({}).post().inRegion().do();
}

// 创建数据资产和映射关系
export async function createDataAssetAndMapping(
  params: CreateDataAssetAndMappingReq
) {
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
  return Promise.resolve({
    code: 0,
    status: 200,
    data: {},
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.editDataAssetFieldsDisplay({}).post(params).inRegion().do();
}

// 查询数据资产表列设置（前端展示）
export async function findDataAssetFieldsDisplay(
  params: any
): Promise<ApiRes<EditDataAssetFieldsDisplayReq>> {
  return Promise.resolve({
    code: 0,
    status: 200,
    data: {
      fields: [
        {
          nameZh: '数据资产名称',
          nameEn: 'name',
          type: 'string',
          isEnum: true,
          isDisplay: true
        },
        {
          nameZh: '资产标签',
          nameEn: 'tags',
          type: 'string',
          isEnum: false,
          isDisplay: true
        },
        {
          nameZh: '来源',
          nameEn: 'source',
          type: 'string',
          isEnum: false,
          isDisplay: true
        },
        {
          nameZh: '更新时间',
          nameEn: 'updateTime',
          type: 'date',
          isEnum: false,
          isDisplay: true
        }
      ]
    },
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.findDataAssetFieldsDisplay({}).post(params).inRegion().do();
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
  return Promise.resolve({
    code: 0,
    status: 200,
    data: {},
    message: 'success',
    requestId: ''
  });
  // return await UAPI.RES.deleteDataAssetDataBatch({}).post(params).inRegion().do();
}

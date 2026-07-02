import {
  CreateOntologyPublicPropertiesReq,
  ListOntologyPublicPropertiesReq,
  ListOntologyPublicPropertiesRes,
  UpdateOntologyPublicPropertiesReq
} from '@/types/attributes';
import UAPI from '@/api';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';

const DEV_TIDB_TYPES = [
  'tinyint(1)',
  'int',
  'bigint',
  'float',
  'double',
  'char',
  'varchar',
  'binary',
  'varbinary',
  'varchar(255)',
  'varchar(500)',
  'varchar(2000)',
  'varchar(5000)',
  'char(36)',
  'date',
  'time(6)',
  'datetime(6)',
  'timestamp(6)',
  'text',
  'json',
  'blob',
  'longblob'
];

const buildDevTiDBTypesResponse = (): ApiRes<{ types: string[] }> => ({
  status: 200,
  code: '',
  message: '',
  requestId: '',
  data: { types: DEV_TIDB_TYPES }
});

export const listOntologyPublicProperties = async (
  params: ListOntologyPublicPropertiesReq
): Promise<ApiRes<ListOntologyPublicPropertiesRes>> => {
  return await UAPI.RES.ListOntologyPublicPropertiesApi({})
    .post(params)
    .inRegion()
    .do();
};

export const createOntologyPublicProperties = async (
  params: CreateOntologyPublicPropertiesReq
): Promise<ApiRes<number>> => {
  return await UAPI.RES.CreateOntologyPublicPropertiesApi({})
    .post(params)
    .inRegion()
    .do();
};

export const deleteOntologyPublicProperties = async (params: {
  id: number;
}): Promise<
  ApiRes<{
    data: string;
  }>
> => {
  return await UAPI.RES.DeleteOntologyPublicPropertiesApi({})
    .post(params)
    .inRegion()
    .do();
};

export const updateOntologyPublicProperties = async (
  params: UpdateOntologyPublicPropertiesReq
): Promise<ApiRes<string>> => {
  return await UAPI.RES.UpdateOntologyPublicPropertiesApi({})
    .post(params)
    .inRegion()
    .do();
};

export const listTiDBTypes = async (): Promise<ApiRes<{ types: string[] }>> => {
  try {
    const response = await UAPI.RES.ListTiDBTypesApi({})
      .post({})
      .inRegion()
      .do();

    if (
      isOntologyApiSuccess(response) &&
      Array.isArray(response.data?.types) &&
      response.data.types.length > 0
    ) {
      return response;
    }

    if (isDevBypassEnabled()) {
      console.warn('[dev] TiDB 类型列表接口失败，回退默认类型');
      return buildDevTiDBTypesResponse();
    }

    return response;
  } catch (error) {
    if (isDevBypassEnabled()) {
      console.warn('[dev] TiDB 类型列表接口异常，回退默认类型');
      return buildDevTiDBTypesResponse();
    }

    throw error;
  }
};

export const mapOntologyObjectTypeColumns = async (params: {
  objectTypeColumns: string[];
  sourceTableColumns: string[];
}): Promise<
  ApiRes<{
    mapRelations: {
      objectTypeColumnName: string;
      sourceTableColumnName: string;
    }[];
  }>
> => {
  return await UAPI.RES.MapOntologyObjectTypeColumnsApi({})
    .post(params)
    .inRegion()
    .do();
};

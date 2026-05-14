import {
  CreateOntologyPublicPropertiesReq,
  ListOntologyPublicPropertiesReq,
  ListOntologyPublicPropertiesRes,
  UpdateOntologyPublicPropertiesReq
} from '@/types/attributes';
import UAPI from '@/api';

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
  return await UAPI.RES.ListTiDBTypesApi({}).post({}).inRegion().do();
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

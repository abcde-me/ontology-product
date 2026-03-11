import UAPI from '@/api';
import {
  CreateOntologyModelReq,
  ListOntologyModelReq,
  ListOntologyModelRes,
  UpdateOntologyModelReq,
  OntologScene
} from '@/types/ontologySceneApi';

export const listOntologyModel = async (
  params: ListOntologyModelReq
): Promise<ApiRes<ListOntologyModelRes>> => {
  return await UAPI.RES.ListOntologyModelApi({}).post(params).inRegion().do();
};

export const createOntologyModel = (
  params: CreateOntologyModelReq
): Promise<
  ApiRes<{
    id: number;
  }>
> => {
  return UAPI.RES.CreateOntologyModelApi({}).post(params).inRegion().do();
};

export const updateOntologyModel = (
  params: UpdateOntologyModelReq
): Promise<ApiRes<string>> => {
  return UAPI.RES.UpdateOntologyModelApi({}).post(params).inRegion().do();
};

export const deleteOntologyModel = (params: {
  id: number;
}): Promise<ApiRes<string>> => {
  return UAPI.RES.DeleteOntologyModelApi({}).post(params).inRegion().do();
};

export const getOntologyModelDetail = async (params: {
  id: number;
}): Promise<ApiRes<OntologScene>> => {
  return await UAPI.RES.GetOntologyModelDetailApi({})
    .post(params)
    .inRegion()
    .do();
};

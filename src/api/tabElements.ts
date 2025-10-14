import UAPI from '@/api';
export async function getTagElementList(params: any) {
  return await UAPI.RES.knowGetTagElement({}).post(params).inRegion().do();
}
export async function createTagElementList(params: any) {
  return await UAPI.RES.knowCreateTagElement({}).post(params).inRegion().do();
}
export async function delTagElementList(params: any) {
  return await UAPI.RES.knowDelTagElement({}).post(params).inRegion().do();
}
export async function EditTagElementList(params: any) {
  return await UAPI.RES.knowEditTagElement(params).get().inRegion().do();
}
export async function putTagElementList(params: any) {
  return await UAPI.RES.KnowUploadTagElement({}).post(params).inRegion().do();
}
export async function GetknowGetPolicy(
  dataset_id: string,
  document_id: string
) {
  return await UAPI.RES.knowGetPolicy({ dataset_id, document_id })
    .get()
    .inRegion()
    .do();
}
export async function GetknowGetPolicyElement(params: any) {
  return await UAPI.RES.KnowGetPolicyElement({}).post(params).inRegion().do();
}

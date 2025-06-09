import UAPI from '@/api';
//apiKey列表接口
export async function getApiKeyList(id: string, params: any = {}) {
    return UAPI.RES.apiKeyList({}).get(params).inRegion().do();
}
//创建apiKey
export async function postApiKeyList(id: string, params: any = {}) {
    return UAPI.RES.apiKeyList({}).post(params).inRegion().do();
}
//编辑apiKey
export async function putApiKeyList(id: string, params: any = {}) {
    return UAPI.RES.apiKeyList({ id }).put(params).inRegion().do();
}
//删除apiKey
export async function deleteApiKeyList(id: string, params: any = {}) {
    return UAPI.RES.apiKeyList({ id }).delete().inRegion().do();
}
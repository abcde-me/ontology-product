import UAPI from '@/api';

export async function createApp(params: Record<string, any>) {
  return await UAPI.RES.apps({}).post(params).inRegion().do();
}
export async function deleteApp(id: string) {
  return await UAPI.RES.apps({ id }).delete().inRegion().do();
}
export async function getAppsList(Id?: string, params: any = {}) {
  return await UAPI.RES.apps({}).get(params).inRegion().do();
}

export async function getAppsTableList(params: any = {}) {
  return await UAPI.RES.apps({}).get(params).inRegion().do();
}

export async function getAppDetail(id: string | number) {
  return await UAPI.RES.appDetailV2({ appId: id }).get().inRegion().do();
}

// 获取大模型列表
export async function getModelsList(value: string) {
  return await UAPI.RES.models({}).get({ model_type: value }).inRegion().do();
}

// AI生成
export async function aiGenerate(params: Record<string, any>) {
  return await UAPI.RES.aiGenerate({}).post(params).inRegion().do();
}

// 更新基础信息
export async function updateApp(params: Record<string, any>) {
  return await UAPI.RES.updateApp({ appId: params.id })
    .put(params)
    .inRegion()
    .do();
}

// 更新模型配置
export async function updateAppConfig(id, params: Record<string, any>) {
  return await UAPI.RES.updateAppConfig({ appId: id })
    .post(params)
    .inRegion()
    .do();
}

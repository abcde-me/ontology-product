import UAPI from '@/api';

export function getAppList() {
  return UAPI.RES.appList({}).get({ limit: 100 }).inRegion().do();
}

export function deleteApp(id: string) {
  return UAPI.RES.deleteApp({ appId: id }).delete().inRegion().do();
}

export function createApp(params: { name: string }) {
  const { name } = params;
  return UAPI.RES.createApp({})
    .post({
      icon: '',
      icon_background: '#FFEAD5',
      mode: 'chat',
      name
    })
    .inRegion()
    .do();
}

export function modifyAppInfo(params: {
  id: string;
  title: string;
  des: string;
  /**base64 */
  icon?: string;
}) {
  const { title, des, id, icon } = params;
  return UAPI.RES.modifyAppInfo({ appId: id })
    .post({
      title,
      description: des,
      default_language: 'zh-Hans',
      prompt_public: false,
      copyright: null,
      privacy_policy: null,
      icon: icon || '',
      icon_background: '#FBE8FF'
    })
    .inRegion()
    .do();
}

export function getAppDetail(params: { id: string }) {
  const { id } = params;
  return UAPI.RES.appDetail({ appId: id }).get().inRegion().do();
}

export function publishApp(params: { id: string; data: any }) {
  const { id, data } = params;
  return UAPI.RES.publishApp({ appId: id }).post(data).inRegion().do();
}

export function saveApp(params: { id: string; data: any }) {
  const { id, data } = params;
  return UAPI.RES.saveApp({ appId: id }).post(data).inRegion().do();
}

export function getInstalledAppList() {
  return UAPI.RES.installedAppList({}).get().inRegion().do();
}

export function getInstalledAppDetail(appId: string) {
  return UAPI.RES.installedApp({ appId }).get().inRegion().do();
}
export function getInstalledAppBasedId(id: string) {
  return UAPI.RES.installedAppBasedId({ id }).get().inRegion().do();
}

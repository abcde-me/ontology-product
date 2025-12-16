import useSWR from 'swr';
import {
  Collection,
  CollectionType,
  CustomCollectionBackend,
  DataSet,
  InstalledApp,
  Model,
  Tool
} from './type';
// import { getLLMList, getLLMParams } from '@/api/llm';
import {
  getBuiltInToolList,
  getCustomToolList,
  getToolProviders,
  collectionDetail,
  getMyToolProviders
} from '@/api/tools';
import {
  getAppDetail,
  getInstalledAppDetail,
  getInstalledAppList
} from '@/api/app';
import { getKnowledgeList } from '@/api/knowledgeBase';
import { getLogoInfo } from '@/api/v5';

/**内置工具列表 */
export function useBuiltInToolsList(providerName: string) {
  const res = useSWR<Tool[]>(
    providerName ? '/builtin-tools/' + providerName : null,
    () => getBuiltInToolList(providerName)
  );
  return res;
}

/**自定义工具列表 */
export function useCustomToolsList(providerName: string) {
  const res = useSWR<Tool[]>(
    providerName ? '/custom-tools/' + providerName : null,
    () => getCustomToolList(providerName)
  );
  return res;
}

/**返回插件下的工具列表 */
export function useToolsList(
  providerName: string,
  providerType: CollectionType
) {
  const res1 = useBuiltInToolsList(
    // TODO: ts错误
    // @ts-expect-error
    providerType === CollectionType.builtIn ? providerName : null
  );
  const res2 = useCustomToolsList(
    // TODO: ts错误
    // @ts-expect-error
    providerType === CollectionType.custom ? providerName : null
  );
  return providerType === CollectionType.builtIn ? res1 : res2;
}

//工具集详情
export function useCollectionDetail(provider: string) {
  const res = useSWR<CustomCollectionBackend>(
    provider ? '/custom-tools-detail/' + provider : null,
    () => collectionDetail(provider)
  );
  return res;
}

// 插件商店列表
export function useToolsProviders() {
  const res = useSWR<Collection[]>('/toolsproviders', () => getToolProviders());
  return res;
}

// 我的插件列表
export function useMyToolsProviders() {
  const res = useSWR<Collection[]>('/mytoolsproviders', () =>
    getMyToolProviders()
  );
  return res;
}

/** 我的插件和商店插件的集合(去重已经发布的插件) */
export function useAvailableToolsProviders() {
  const {
    data: d1,
    isLoading: l1,
    error: e1,
    mutate: m1
  } = useToolsProviders();
  const {
    data: d2,
    isLoading: l2,
    error: e2,
    mutate: m2
  } = useMyToolsProviders();
  return {
    data: (d1 || [])
      .filter((i) => !(d2 || []).some((a) => a.id === i.id))
      .concat(d2 || []),
    isLoading: l1 || l2,
    error: e1 || e2,
    mutate: () => {
      m1();
      m2();
    }
  };
}

/**商店应用的列表 */
export function useInstalledApp() {
  const res = useSWR<InstalledApp[]>('/installedapp', () =>
    getInstalledAppList().then((res) => res.installed_apps || [])
  );
  return res;
}

/**商店应用的详情 */
export function useInstalledAppDetail(appId: string) {
  const res = useSWR<InstalledApp>('/installedapp/' + appId, () =>
    getInstalledAppDetail(appId)
  );
  return res;
}

// /**大模型列表 */
// export function useLLMs() {
//   const res = useSWR<Model[]>('/llms', () => getLLMList());
//   return res;
// }
/**大模型参数 */
export function useLLMParams(provider: string, modelId: string) {
  const res = useSWR(
    provider && modelId ? `/params/${provider}/${modelId}` : null,
    () => getLLMParams(provider, modelId)
  );
  return res;
}

/**应用详情 */
export function useAppDetail(appId: string) {
  const res = useSWR<any>(appId ? [appId, '/appdetail'] : null, () => {
    return getAppDetail({ id: appId });
  });
  return res;
}

/**知识库列表 */
export function useKnowledgeList() {
  const res = useSWR<{ data: DataSet[] }>('/knowledgelist', () => {
    return getKnowledgeList({ page: 1, limit: 1000 });
  });
  return res;
}

/**客户化信息 */
export type LogoInfo = {
  docEnName: string;
  docName: string;
  docUrl: string;
  favicon: string;
  logoAboutPic: string;
  logoDarkPic: string;
  logoPic: string;
  logoUrl: string;
};
export function useLogoInfo() {
  return { data: {} as LogoInfo };
  // const res = useSWR<LogoInfo>('/logoinfo', () => {
  //   return getLogoInfo().then((res) => {
  //     return res.data;
  //   });
  // });
  // return res;
}

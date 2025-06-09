import UAPI from '@/api';

// TODO：待定
enum AppType {}

export interface PublishedAppListParams {
  page: number;
  pageSize?: number;
  /** 应用样板 */
  isDemo: boolean;
  /** 我收藏的 */
  favorite: boolean;
  /** 当前集团 */
  organized: boolean;
  /** 应用类型 */
  appTypes: AppType[];
  /** 名称相似过滤 */
  name: string;
}

export function getPublishedAppList(params: PublishedAppListParams) {
  const {
    page = 1,
    pageSize = 10,
    isDemo,
    favorite,
    organized,
    appTypes,
    name
  } = params;

  return UAPI.RES.appStoreV2({})
    .get({
      page,
      limit: pageSize,
      is_demo: isDemo,
      favorite,
      organized,
      app_types: appTypes.join(','),
      name
    })
    .inRegion()
    .do();
}

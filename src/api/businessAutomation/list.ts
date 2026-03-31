import UAPI from '@/api';
import { AutoRuleDetail, AutoRuleItem } from '@/pages/ruleManagement/types';
import { AUTO_RULES } from '@/api/businessAutomation/mock';

/**
 * ListAutoRuleRequest，内嵌 sdk.PagingRequest 字段与业务字段同级
 */
export interface GetRuleListParams {
  /**
   * 模糊搜索 name/description
   */
  filter?: string;
  /**
   * 按本体场景 ID 过滤，对应 ontology_model.id
   */
  modelId?: number;
  order?: Order;
  orderBy?: string;
  orders?: string[];
  pageNo?: number;
  pageSize?: number;
  status?: number;
  triggerType?: number;
}

export enum Order {
  Asc = 'asc',
  Desc = 'desc'
}

// 获取规则列表
// todo 待完善
// eslint-disable-next-line @typescript-eslint/require-await
export const getAutoRuleList = async (params: GetRuleListParams) => {
  // const res = await UAPI.RES.GetAutoRuleListApi({})
  //   .post(params)
  //   .inRegion()
  //   .do();
  return {
    items: AUTO_RULES,
    total: AUTO_RULES.length
  };
  // const { result: items = [], totalCount: total = 0 } = res.data;
  // return {
  //   items: (items ?? []) as AutoRuleItem[],
  //   total: (total ?? 0) as number
  // };
};

// 获取规则详情
export const getAutoRuleDetail = async (id: string | number) => {
  return Promise.resolve(
    (AUTO_RULES.find((item) => item.id === id) as AutoRuleDetail) || null
  );
  // const res = await UAPI.RES.GetAutoRuleDetailApi({})
  //   .post({ id })
  //   .inRegion()
  //   .do();
  // return (res.data as AutoRuleDetail) || null;
};

// 保存规则（新增/更新）
export const saveAutoRule = (data: Partial<AutoRuleDetail>) => {
  const api = data?.id
    ? UAPI.RES.UpdateAutoRuleApi
    : UAPI.RES.CreateAutoRuleApi;
  return api({}).post(data).inRegion().do();
};

// 删除规则
export const deleteAutoRule = (id: string | number) => {
  return UAPI.RES.DelAutoRuleApi({}).post({ id }).inRegion().do();
};

// 上线规则
export const onlineAutoRule = (id: string | number) => {
  return UAPI.RES.ActiveAutoRuleApi({}).post({ id }).inRegion().do();
};

// 下线规则
export const offlineAutoRule = (id: string | number) => {
  return UAPI.RES.PauseAutoRuleApi({}).post({ id }).inRegion().do();
};

// 执行规则
export const executeAutoRule = (id: string | number) => {
  return UAPI.RES.ExecuteAutoRuleApi({}).post({ id }).inRegion().do();
};

import UAPI from '@/api';
import {
  BehaviorActionDetail,
  BehaviorActionItem
} from '@/pages/ontologyScene/types/behaviorActions';

interface IActionListParams {
  /**
   * 搜索关键字，支持按行为名称、编码模糊搜索
   */
  filter?: string;
  /**
   * 本体场景ID
   */
  ontologyModelID?: number | string;
  /**
   * 页码，从1开始
   */
  pageNum?: number;
  /**
   * 每页数量
   */
  pageSize?: number;
}

// 获取行为列表
export const getActionList = async (params: IActionListParams) => {
  const res = await UAPI.RES.GetListOntologyActionApi({})
    .post(params)
    .inRegion()
    .do();
  return res.data;
};

// 获取行为详情
export const getActionDetail = (id: string | number) => {
  // return Promise.resolve(MockList[0]);
  return UAPI.RES.GetOntologyActionApi({}).post({ id }).inRegion().do();
};

// 保存行为（新增/更新）
export const saveBehaviorAction = (data: BehaviorActionDetail) => {
  const api = data?.id
    ? UAPI.RES.UpdateOntologyActionApi
    : UAPI.RES.CreateOntologyActionApi;
  return api({}).post(data).inRegion().do();
};

// 删除行为
export const deleteAction = (id: string | number) => {
  return UAPI.RES.DeleteOntologyActionApi({}).post({ id }).inRegion().do();
};

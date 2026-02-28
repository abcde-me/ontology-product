import UAPI from '@/api';
import {
  InputType,
  OntologyFunctionDetail,
  OntologyFunctionItem,
  ParamType,
  TestFunction
} from '@/pages/ontologyScene/types/ontologyFunction';
import { UploadItem } from '@arco-design/web-react/es/Upload';

// 保存函数（新增/更新）
export const saveFunction = (data: OntologyFunctionDetail) => {
  // 有 id 走更新，无 id 走新增
  const api = data?.id
    ? UAPI.RES.UpdateOntologyFunctionApi
    : UAPI.RES.CreateOntologyFunctionApi;
  return api({}).post(data).inRegion().do();
};

// 删除函数
export const deleteFunction = (id: string | number) => {
  return UAPI.RES.DeleteOntologyFunctionListApi({})
    .post({ id })
    .inRegion()
    .do();
};

// 获取函数详情
export const getFunctionDetail = async (id: string | number) => {
  // return Promise.resolve(MockList.find((item) => item.id === id));
  const res = await UAPI.RES.GetOntologyFunctionDetailApi({})
    .post({ id: +id })
    .inRegion()
    .do();
  return (res.data as OntologyFunctionDetail) || null;
};

// 获取函数列表
export const getFunctionList = async (params: Record<string | number, any>) => {
  const res = await UAPI.RES.GetOntologyFunctionListApi({})
    .post(params)
    .inRegion()
    .do();
  const { result: items = [], totalCount: total = 0 } = res.data || {};
  return {
    items: items ?? [],
    total
  };
};
// 函数测试
export const testFunction = async (params: TestFunction) => {
  const res = await UAPI.RES.ExecuteFunctionTestAPi({})
    .post(params)
    .inRegion()
    .do();
  return res.data?.[0] || null;
};

// 终止函数测试
export const stopTestFunction = async (id?: number) => {
  return await UAPI.RES.StopFunctionTestAPi({}).post({ id }).inRegion().do();
};

// 本体文件上传
export const uploadFunctionFile = async (file: File | UploadItem) => {
  const targetFile =
    (file as UploadItem)?.originFile ?? (file as File | undefined);

  if (!targetFile) {
    return Promise.reject(new Error('无效的文件'));
  }

  const res = await UAPI.RES.UploadOntologyActionDataFileApi({})
    .post({ file: targetFile })
    .inRegion()
    // @ts-ignore
    .withConfig({
      transformRequest: (data, headers) => {
        if (data instanceof FormData) return data;
        const formData = new FormData();
        const payload = data || {};

        Object.keys(payload).forEach((key) => {
          const value = payload[key];
          if (value === undefined || value === null) return;
          if (value instanceof Blob) {
            formData.append(key, value);
            return;
          }
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
            return;
          }
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
            return;
          }
          formData.append(key, String(value));
        });

        if (headers) {
          delete headers['Content-Type'];
          delete headers['content-type'];
        }

        return formData;
      }
    })
    .do();

  return res.data?.path || '';
};

export const getFunctionSDK = async () => {
  const res = await UAPI.RES.GetOntologyFunctionSDKDocApi({})
    .post({})
    .inRegion()
    .do();
  return res.data.data ?? '暂无数据';
};

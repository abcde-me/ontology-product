import UAPI from '@/api';
import {
  InputType,
  OntologyFunctionDetail,
  OntologyFunctionItem,
  ParamType
} from '@/pages/ontologyScene/types/ontologyFunction';

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
  return res.data || null;
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
export const testFunction = (params: Record<string | number, any>) => {
  // return Promise.resolve({
  //   items: MockList,
  //   total: MockList.length
  // });
  // return UAPI.RES.GetOntologyFunctionListApi({}).post(params).inRegion().do();
};

export const getFunctionSDK = () => {
  const content = `
# 用 Python 处理数据并返回结果

在这个示例中，我们演示了一个简单的 Python 函数，用来对输入数据进行处理，并返回最终结果。

## 函数说明

- 函数名：\`process_numbers\`
- 功能：  
  - 过滤掉负数  
  - 对剩余数字求平方  
  - 返回平方和

## Python 示例代码

\`\`\`python
def process_numbers(numbers):
    """
    处理数字列表：
    1. 过滤负数
    2. 对非负数求平方
    3. 返回平方和
    """
    total = 0

    for n in numbers:
        if n < 0:
            continue
        total += n * n

    return total

`;
  return Promise.resolve(content);
};

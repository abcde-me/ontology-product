import UAPI from '@/api';
import {
  InputType,
  OnFunctionDetail,
  OnFunctionItem,
  ParamType
} from '@/pages/ontologyScene/types/osFunction';

const MockList: OnFunctionItem[] = [
  {
    id: 1,
    code: 'entity_extract',
    name: '实体识别',
    description: '从文本中识别实体并返回结构化结果',
    content: `@Action()
def entity_extract(text: str) -> str:
  # 在此编写函数逻辑
  # 这是一条神奇的函数
  result = ""
  return result`,
    createUser: 'admin',
    createdAt: new Date('2024-06-01T09:30:00'),
    updatedAt: new Date('2024-06-10T10:15:00'),
    params: [
      { name: 'text', type: ParamType.String, inputType: InputType.Input },
      { name: 'result', type: ParamType.String, inputType: InputType.Output }
    ]
  },
  {
    id: 2,
    code: 'FUNC_RELATION_INFER',
    name: '关联推理',
    description: '基于输入实体推理关系',
    content: `@Action()
def relation_infer(entity_a: str, entity_b: str) -> str:
  # 在此编写函数逻辑
  result = ""
  return result`,
    createUser: 'admin',
    createdAt: new Date('2024-06-02T14:20:00'),
    updatedAt: new Date('2024-06-11T16:05:00'),
    params: [
      { name: 'entity_a', type: ParamType.String, inputType: InputType.Input },
      { name: 'entity_b', type: ParamType.String, inputType: InputType.Input },
      { name: 'result', type: ParamType.String, inputType: InputType.Output }
    ]
  },
  {
    id: 3,
    code: 'FUNC_THREAT_ASSESS',
    name: '威胁研判',
    description: '对目标威胁等级进行评估',
    content: `@Action()
def threat_assess(target_id: str, score: float) -> str:
  # 在此编写函数逻辑
  result = ""
  return result`,
    createUser: 'admin',
    createdAt: new Date('2024-06-05T11:00:00'),
    updatedAt: new Date('2024-06-12T09:40:00'),
    params: [
      { name: 'target_id', type: ParamType.String, inputType: InputType.Input },
      { name: 'score', type: ParamType.Double, inputType: InputType.Input },
      { name: 'result', type: ParamType.String, inputType: InputType.Output }
    ]
  },
  {
    id: 4,
    code: 'FUNC_ROUTE_PLAN',
    name: '路径规划',
    description: '根据起止点规划最优路径',
    content: `@Action()
def route_plan(start: str, end: str) -> str:
  # 在此编写函数逻辑
  result = ""
  return result`,
    createUser: 'admin',
    createdAt: new Date('2024-06-08T08:45:00'),
    updatedAt: new Date('2024-06-13T13:20:00'),
    params: [
      { name: 'start', type: ParamType.String, inputType: InputType.Input },
      { name: 'end', type: ParamType.String, inputType: InputType.Input },
      { name: 'result', type: ParamType.String, inputType: InputType.Output }
    ]
  }
];

// 保存函数（新增/更新）
export const saveFunction = (data: OnFunctionDetail) => {
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
export const getFunctionDetail = (id: string | number) => {
  return Promise.resolve(MockList[0]);
  // return UAPI.RES.GetOntologyFunctionDetailApi({}).post({ id }).inRegion().do();
};

// 获取函数列表
export const getFunctionList = (params: Record<string | number, any>) => {
  return Promise.resolve({
    items: MockList,
    total: MockList.length
  });
  // return UAPI.RES.GetOntologyFunctionListApi({}).post(params).inRegion().do();
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

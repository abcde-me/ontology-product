import UAPI from '@/api';
import {
  InputType,
  OntologyFunctionDetail,
  OntologyFunctionItem,
  ParamType
} from '@/pages/ontologyScene/types/ontologyFunction';

const MockList: OntologyFunctionItem[] = [
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
      { name: 'score', type: ParamType.Float, inputType: InputType.Input },
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
  },
  {
    id: 5,
    code: 'FUNC_ALL_INPUT_TYPES',
    name: '全入参类型覆盖',
    description: '覆盖所有入参类型，便于验证表单控件',
    content: `@Action()
def full_input_types(
  text: str,
  count: int,
  ratio: float,
  is_active: bool,
  start_date: date,
  event_time: datetime,
  location: GeoPoint,
  profile: ObjectOne,
  attachments: Attachment,
  tags: ObjectSet
) -> dict:
  # 覆盖所有入参类型
  return {
    "text": text,
    "count": count,
    "ratio": ratio,
    "is_active": is_active,
    "start_date": start_date,
    "event_time": event_time,
    "location": location,
    "profile": profile,
    "attachments": attachments,
    "tags": tags
  }`,
    createUser: 'tester',
    createdAt: new Date('2024-06-15T12:00:00'),
    updatedAt: new Date('2024-06-15T12:00:00'),
    params: [
      {
        name: 'text',
        type: ParamType.String,
        inputType: InputType.Input,
        idx: 0
      },
      {
        name: 'count',
        type: ParamType.Integer,
        inputType: InputType.Input,
        idx: 1
      },
      {
        name: 'ratio',
        type: ParamType.Float,
        inputType: InputType.Input,
        idx: 2
      },
      {
        name: 'is_active',
        type: ParamType.Boolean,
        inputType: InputType.Input,
        idx: 3
      },
      {
        name: 'start_date',
        type: ParamType.Date,
        inputType: InputType.Input,
        idx: 4
      },
      {
        name: 'event_time',
        type: ParamType.Timestamp,
        inputType: InputType.Input,
        idx: 5
      },
      {
        name: 'location',
        type: ParamType.Geopoint,
        inputType: InputType.Input,
        idx: 6
      },
      {
        name: 'profile',
        type: ParamType.ObjectOne,
        inputType: InputType.Input,
        idx: 7
      },
      {
        name: 'attachments',
        type: ParamType.Attachment,
        inputType: InputType.Input,
        idx: 8
      },
      {
        name: 'tags',
        type: ParamType.ObjectSet,
        inputType: InputType.Input,
        idx: 9
      },
      {
        name: 'result',
        type: ParamType.ObjectOne,
        inputType: InputType.Output,
        idx: 10
      }
    ]
  }
];

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
export const getFunctionDetail = (id: string | number) => {
  // return Promise.resolve(MockList.find((item) => item.id === id));
  return UAPI.RES.GetOntologyFunctionDetailApi({})
    .post({ id: +id })
    .inRegion()
    .do();
};

// 获取函数列表
export const getFunctionList = async (params: Record<string | number, any>) => {
  const res = await UAPI.RES.GetOntologyFunctionListApi({})
    .post(params)
    .inRegion()
    .do();
  const { result: items = [], totalCount: total = 0 } = res.data || {};
  return {
    items,
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

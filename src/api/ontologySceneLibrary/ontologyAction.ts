import UAPI from '@/api';
import {
  BehaviorActionDetail,
  BehaviorActionItem
} from '@/pages/ontologyScene/types/behaviorActions';
import {
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';

const MockList: BehaviorActionItem[] = [
  {
    id: 1,
    code: 'ACTION_ENTITY_EXTRACT',
    name: '实体识别',
    description: '从文本中识别实体并返回结构化结果',
    functionId: 5,
    functionName: 'entity_extract',
    objectTypeId: 201,
    objectTypeName: '多媒体情报',
    paramCount: 2,
    params: [
      {
        type: 'String',
        name: 'text',
        code: 'text',
        uiType: 'input',
        enabledValidation: true,
        validationRule: {
          ruleName: 'enum_rule',
          failMessage: '4546465',
          ruleConfig: {
            options: ['123132132']
          }
        }
      },
      {
        type: 'Integer',
        name: 'count',
        code: 'count',
        uiType: 'inputNumber',
        enabledValidation: true,
        validationRule: {
          ruleName: 'range_rule',
          failMessage: '45646546',
          ruleConfig: {
            minValue: 1,
            maxValue: 2
          }
        }
      },
      {
        type: 'Float',
        name: 'ratio',
        code: 'ratio',
        uiType: 'inputNumberFloat',
        enabledValidation: true,
        validationRule: {
          ruleName: 'range_rule',
          failMessage: '456465465',
          ruleConfig: {
            minValue: 1,
            maxValue: 2
          }
        }
      },
      {
        type: 'Boolean',
        name: 'is_active',
        code: 'is_active',
        uiType: 'switch',
        enabledValidation: false,
        validationRule: {}
      },
      {
        type: 'Date',
        name: 'start_date',
        code: 'start_date',
        uiType: 'date',
        enabledValidation: false,
        validationRule: {}
      },
      {
        type: 'Timestamp',
        name: 'event_time',
        code: 'event_time',
        uiType: 'dateTime',
        enabledValidation: false,
        validationRule: {}
      },
      {
        type: 'Geopoint',
        name: 'location',
        code: 'location',
        uiType: 'geopoint',
        enabledValidation: false,
        validationRule: {}
      },
      {
        type: 'ObjectOne',
        name: 'profile',
        code: 'profile',
        uiType: 'objectOne',
        enabledValidation: false,
        validationRule: {}
      },
      {
        type: 'Attachment',
        name: 'attachments',
        code: 'attachments',
        uiType: 'upload',
        enabledValidation: false,
        validationRule: {}
      },
      {
        type: 'ObjectSet',
        name: 'tags',
        code: 'tags',
        uiType: 'objectSet',
        enabledValidation: false,
        validationRule: {}
      }
    ],
    createUser: 'admin',
    createdAt: new Date('2024-06-01T09:30:00'),
    updatedAt: new Date('2024-06-10T10:15:00')
  },
  {
    id: 2,
    code: 'ACTION_RELATION_INFER',
    name: '关联推理',
    description: '基于输入实体推理关系',
    functionId: 2,
    functionName: 'relation_infer',
    objectTypeId: 202,
    objectTypeName: '战斗机',
    paramCount: 2,
    params: [
      {
        code: 'entity_a',
        name: '实体A',
        type: ParamType.String,
        uiType: UiType.Input,
        enabledValidation: false
      },
      {
        code: 'entity_b',
        name: '实体B',
        type: ParamType.String,
        uiType: UiType.Input,
        enabledValidation: false
      }
    ],
    createUser: 'admin',
    createdAt: new Date('2024-06-02T14:20:00'),
    updatedAt: new Date('2024-06-11T16:05:00')
  },
  {
    id: 3,
    code: 'ACTION_THREAT_ASSESS',
    name: '威胁研判',
    description: '对目标威胁等级进行评估',
    functionId: 3,
    functionName: 'threat_assess',
    objectTypeId: 203,
    objectTypeName: '无人机',
    paramCount: 3,
    params: [
      {
        code: 'target_id',
        name: '目标ID',
        type: ParamType.String,
        uiType: UiType.Input,
        enabledValidation: false
      },
      {
        code: 'score',
        name: '评估得分',
        type: ParamType.Float,
        uiType: UiType.InputNumber,
        enabledValidation: true
      },
      {
        code: 'level',
        name: '威胁等级',
        type: ParamType.String,
        uiType: UiType.Input,
        enabledValidation: true
      }
    ],
    createUser: 'admin',
    createdAt: new Date('2024-06-05T11:00:00'),
    updatedAt: new Date('2024-06-12T09:40:00')
  },
  {
    id: 4,
    code: 'ACTION_ROUTE_PLAN',
    name: '路径规划',
    description: '根据起止点规划最优路径',
    functionId: 4,
    functionName: 'route_plan',
    objectTypeId: 204,
    objectTypeName: '作战任务',
    paramCount: 2,
    params: [
      {
        code: 'start',
        name: '起点',
        type: ParamType.String,
        uiType: UiType.Input,
        enabledValidation: false
      },
      {
        code: 'end',
        name: '终点',
        type: ParamType.String,
        uiType: UiType.Input,
        enabledValidation: false
      }
    ],
    createUser: 'admin',
    createdAt: new Date('2024-06-08T08:45:00'),
    updatedAt: new Date('2024-06-13T13:20:00')
  }
];

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
  debugger;
  return res.data;
};

// 获取行为详情
export const getActionDetail = (id: string | number) => {
  return Promise.resolve(MockList[0]);
  // return UAPI.RES.GetOntologyActionApi({}).post({ id }).inRegion().do();
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

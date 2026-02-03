import type { GetOntologyTopologyResponse } from '@/types/graphApi';

// 获取本体拓扑（mock 数据）
export function getOntologyTopology(
  params
): Promise<ApiRes<GetOntologyTopologyResponse>> {
  const mockData: GetOntologyTopologyResponse = {
    nodes: [
      {
        id: 1,
        name: '原始情报',
        code: 'RAW_INTELLIGENCE',
        description: '原始情报 - 6项属性',
        type: 'entity'
      },
      {
        id: 2,
        name: '意图研判',
        code: 'INTENT_HYPOTHESIS',
        description: '意图研判 - 4项属性',
        type: 'entity'
      },
      {
        id: 3,
        name: '作战事件',
        code: 'MILITARY_EVENT',
        description: '作战事件 - 6项属性',
        type: 'entity'
      },
      {
        id: 4,
        name: '传感器航迹',
        code: 'SENSOR_TRACK',
        description: '传感器航迹 - 6项属性',
        type: 'entity'
      },
      {
        id: 5,
        name: '行动方案',
        code: 'COURSE_OF_ACTION',
        description: '行动方案 - 5项属性',
        type: 'entity'
      },
      {
        id: 6,
        name: '作战任务',
        code: 'MISSION',
        description: '作战任务 - 3项属性',
        type: 'entity'
      },
      {
        id: 7,
        name: '作战资源',
        code: 'MILITARY_ASSET',
        description: '作战资源 - 10项属性',
        type: 'entity'
      },
      {
        id: 8,
        name: '部队编制',
        code: 'ORGANIZATION',
        description: '部队编制 - 5项属性',
        type: 'entity'
      }
    ],
    edges: [
      {
        id: 101,
        name: '研判支撑',
        code: 'EDGE_RAW_INTELLIGENCE_TO_INTENT_HYPOTHESIS',
        description: '原始情报 -> 意图研判 (研判支撑)',
        sourceId: 1,
        targetId: 2,
        type: 1
      },
      {
        id: 102,
        name: '情报支撑',
        code: 'EDGE_RAW_INTELLIGENCE_TO_MILITARY_EVENT',
        description: '原始情报 -> 作战事件',
        sourceId: 1,
        targetId: 3,
        type: 1
      },
      {
        id: 103,
        name: '研判关联',
        code: 'EDGE_INTENT_HYPOTHESIS_TO_MILITARY_EVENT',
        description: '意图研判 -> 作战事件',
        sourceId: 2,
        targetId: 3,
        type: 1
      },
      {
        id: 104,
        name: '事件追踪',
        code: 'EDGE_MILITARY_EVENT_TO_SENSOR_TRACK',
        description: '原始情报 -> 传感器航迹',
        sourceId: 1,
        targetId: 4,
        type: 1
      },
      {
        id: 105,
        name: '推荐方案',
        code: 'EDGE_MILITARY_EVENT_TO_COURSE_OF_ACTION',
        description: '作战事件 -> 行动方案 (推荐方案)',
        sourceId: 3,
        targetId: 5,
        type: 1
      },
      {
        id: 106,
        name: '航迹关联',
        code: 'EDGE_SENSOR_TRACK_TO_MILITARY_ASSET',
        description: '传感器航迹 -> 作战资源',
        sourceId: 4,
        targetId: 7,
        type: 1
      },
      {
        id: 107,
        name: '方案执行',
        code: 'EDGE_COURSE_OF_ACTION_TO_MISSION',
        description: '行动方案 -> 作战任务',
        sourceId: 5,
        targetId: 6,
        type: 1
      },
      {
        id: 108,
        name: '任务分配',
        code: 'EDGE_MISSION_TO_MILITARY_ASSET',
        description: '作战任务 -> 作战资源',
        sourceId: 6,
        targetId: 7,
        type: 1
      },
      {
        id: 109,
        name: '下',
        code: 'EDGE_MILITARY_ASSET_TO_ORGANIZATION',
        description: '作战资源 -> 部队编制 (下)',
        sourceId: 7,
        targetId: 8,
        type: 1
      }
    ]
  };

  const res: ApiRes<GetOntologyTopologyResponse> = {
    code: 0,
    data: mockData,
    message: 'mock success',
    requestId: 'mock-request-id',
    status: 200
  };

  // 保留 params 参数以避免未使用告警
  void params;

  return Promise.resolve(res);
}

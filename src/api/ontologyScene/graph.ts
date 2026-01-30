import type { GetOntologyTopologyResponse } from '@/types/graphApi';

// 获取本体拓扑（mock 数据）
export function getOntologyTopology(
  params
): Promise<ApiRes<GetOntologyTopologyResponse>> {
  const mockData: GetOntologyTopologyResponse = {
    nodes: [
      {
        id: 1,
        name: '节点A',
        code: 'NODE_A',
        description: '示例节点 A',
        type: 'entity'
      },
      {
        id: 2,
        name: '节点B',
        code: 'NODE_B',
        description: '示例节点 B',
        type: 'entity'
      }
    ],
    edges: [
      {
        id: 101,
        name: '边 A-B',
        code: 'EDGE_A_B',
        description: '从节点 A 指向节点 B 的示例边',
        sourceId: 1,
        targetId: 2,
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

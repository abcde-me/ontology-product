import {
  Position,
  getConnectedEdges,
  getIncomers,
  getOutgoers
} from 'reactflow';
import dagre from '@dagrejs/dagre';
import { v4 as uuid4 } from 'uuid';
import { cloneDeep, groupBy, isEqual, uniqBy } from 'lodash-es';
import type { Edge, Node, ValueSelector } from './types';
import { BlockEnum, NodeRunningStatus } from './types';
import {
  CUSTOM_NODE,
  NODE_WIDTH_X_OFFSET,
  START_INITIAL_POSITION
} from './constants';
import { markerEnd } from '@/pages/workflowConfig/utils/var';

const WHITE = 'WHITE';
const GRAY = 'GRAY';
const BLACK = 'BLACK';

const isCyclicUtil = (
  nodeId: string,
  color: Record<string, string>,
  adjList: Record<string, string[]>,
  stack: string[]
) => {
  color[nodeId] = GRAY;
  stack.push(nodeId);

  for (let i = 0; i < adjList[nodeId].length; ++i) {
    const childId = adjList[nodeId][i];

    if (color[childId] === GRAY) {
      stack.push(childId);
      return true;
    }
    if (
      color[childId] === WHITE &&
      isCyclicUtil(childId, color, adjList, stack)
    )
      return true;
  }
  color[nodeId] = BLACK;
  if (stack.length > 0 && stack[stack.length - 1] === nodeId) stack.pop();
  return false;
};

const getCycleEdges = (nodes: Node[], edges: Edge[]) => {
  const adjList: Record<string, string[]> = {};
  const color: Record<string, string> = {};
  const stack: string[] = [];

  for (const node of nodes) {
    color[node.id] = WHITE;
    adjList[node.id] = [];
  }

  for (const edge of edges) adjList[edge.source]?.push(edge.target);

  for (let i = 0; i < nodes.length; i++) {
    if (color[nodes[i].id] === WHITE)
      isCyclicUtil(nodes[i].id, color, adjList, stack);
  }

  const cycleEdges: Edge[] = [];
  if (stack.length > 0) {
    const cycleNodes = new Set(stack);
    for (const edge of edges) {
      if (cycleNodes.has(edge.source) && cycleNodes.has(edge.target))
        cycleEdges.push(edge);
    }
  }

  return cycleEdges;
};

export function generateNewNode({
  data,
  position,
  id,
  zIndex,
  type,
  ...rest
}: Omit<Node, 'id'> & { id?: string }): {
  newNode: Node;
  newIterationStartNode?: Node;
  newLoopStartNode?: Node;
} {
  const newNode = {
    id: id || `${Date.now()}`,
    type: type || CUSTOM_NODE,
    data,
    position,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    zIndex,
    ...rest
  } as Node;

  return {
    newNode
  };
}

export const preprocessNodesAndEdges = (nodes: Node[], edges: Edge[]) => {
  return {
    nodes,
    edges
  };
};

export const initialNodes = (originNodes: Node[], originEdges: Edge[]) => {
  const { nodes, edges } = preprocessNodesAndEdges(
    cloneDeep(originNodes),
    cloneDeep(originEdges)
  );
  const firstNode = nodes[0];

  if (!firstNode?.position) {
    nodes.forEach((node, index) => {
      node.position = {
        x: START_INITIAL_POSITION.x + index * NODE_WIDTH_X_OFFSET,
        y: START_INITIAL_POSITION.y
      };
    });
  }

  return nodes.map((node) => {
    if (!node.type) node.type = CUSTOM_NODE;

    const connectedEdges = getConnectedEdges([node], edges as any);
    node.data._connectedSourceHandleIds = connectedEdges
      .filter((edge) => edge.source === node.id)
      .map((edge) => edge.sourceHandle || 'source');
    node.data._connectedTargetHandleIds = connectedEdges
      .filter((edge) => edge.target === node.id)
      .map((edge) => edge.targetHandle || 'target');

    return node;
  });
};

export const initialEdges = (originEdges: Edge[], originNodes: Node[]) => {
  const { nodes, edges } = preprocessNodesAndEdges(
    cloneDeep(originNodes),
    cloneDeep(originEdges)
  );
  let selectedNode: Node | null = null;
  const nodesMap = nodes.reduce(
    (acc, node) => {
      acc[node.id] = node;

      if (node.data?.selected) selectedNode = node;

      return acc;
    },
    {} as Record<string, Node>
  );

  const cycleEdges = getCycleEdges(nodes, edges as any);
  return edges
    .filter((edge) => {
      return !cycleEdges.find(
        (cycEdge) =>
          cycEdge.source === edge.source && cycEdge.target === edge.target
      );
    })
    .map((edge) => {
      edge.type = 'custom';

      if (!edge.sourceHandle) edge.sourceHandle = 'source';

      if (!edge.targetHandle) edge.targetHandle = 'target';

      if (!edge.data?.sourceType && edge.source && nodesMap[edge.source]) {
        edge.data = {
          ...edge.data,
          sourceType: nodesMap[edge.source].data.type
        } as any;
      }

      if (!edge.data?.targetType && edge.target && nodesMap[edge.target]) {
        edge.data = {
          ...edge.data,
          targetType: nodesMap[edge.target].data.type
        } as any;
      }

      if (selectedNode) {
        edge.data = {
          ...edge.data,
          _connectedNodeIsSelected:
            edge.source === selectedNode.id || edge.target === selectedNode.id
        } as any;
      }

      edge.markerEnd = markerEnd;

      return edge;
    });
};

export const getLayoutByDagre = (originNodes: Node[], originEdges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodes = cloneDeep(originNodes).filter(
    (node) => !node.parentId && node.type === CUSTOM_NODE
  );
  const edges = cloneDeep(originEdges).filter(
    (edge) => !edge.data?.isInIteration && !edge.data?.isInLoop
  );
  dagreGraph.setGraph({
    rankdir: 'LR',
    align: 'UL',
    nodesep: 40,
    ranksep: 60,
    ranker: 'tight-tree',
    marginx: 30,
    marginy: 200
  });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.width!,
      height: node.height!
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return dagreGraph;
};

export const canRunBySingle = () => {
  return false;
};

type ConnectedSourceOrTargetNodesChange = {
  type: string;
  edge: Edge;
}[];
export const getNodesConnectedSourceOrTargetHandleIdsMap = (
  changes: ConnectedSourceOrTargetNodesChange,
  nodes: Node[]
) => {
  const nodesConnectedSourceOrTargetHandleIdsMap = {} as Record<string, any>;

  changes.forEach((change) => {
    const { edge, type } = change;
    const sourceNode = nodes.find((node) => node.id === edge.source)!;
    if (sourceNode) {
      nodesConnectedSourceOrTargetHandleIdsMap[sourceNode.id] =
        nodesConnectedSourceOrTargetHandleIdsMap[sourceNode.id] || {
          _connectedSourceHandleIds: [
            ...(sourceNode?.data._connectedSourceHandleIds || [])
          ],
          _connectedTargetHandleIds: [
            ...(sourceNode?.data._connectedTargetHandleIds || [])
          ]
        };
    }

    const targetNode = nodes.find((node) => node.id === edge.target)!;
    if (targetNode) {
      nodesConnectedSourceOrTargetHandleIdsMap[targetNode.id] =
        nodesConnectedSourceOrTargetHandleIdsMap[targetNode.id] || {
          _connectedSourceHandleIds: [
            ...(targetNode?.data._connectedSourceHandleIds || [])
          ],
          _connectedTargetHandleIds: [
            ...(targetNode?.data._connectedTargetHandleIds || [])
          ]
        };
    }

    if (sourceNode) {
      if (type === 'remove') {
        const index = nodesConnectedSourceOrTargetHandleIdsMap[
          sourceNode.id
        ]._connectedSourceHandleIds.findIndex(
          (handleId: string) => handleId === edge.sourceHandle
        );
        nodesConnectedSourceOrTargetHandleIdsMap[
          sourceNode.id
        ]._connectedSourceHandleIds.splice(index, 1);
      }

      if (type === 'add')
        nodesConnectedSourceOrTargetHandleIdsMap[
          sourceNode.id
        ]._connectedSourceHandleIds.push(edge.sourceHandle || 'source');
    }

    if (targetNode) {
      if (type === 'remove') {
        const index = nodesConnectedSourceOrTargetHandleIdsMap[
          targetNode.id
        ]._connectedTargetHandleIds.findIndex(
          (handleId: string) => handleId === edge.targetHandle
        );
        nodesConnectedSourceOrTargetHandleIdsMap[
          targetNode.id
        ]._connectedTargetHandleIds.splice(index, 1);
      }

      if (type === 'add')
        nodesConnectedSourceOrTargetHandleIdsMap[
          targetNode.id
        ]._connectedTargetHandleIds.push(edge.targetHandle || 'target');
    }
  });

  return nodesConnectedSourceOrTargetHandleIdsMap;
};

export const genNewNodeTitleFromOld = (oldTitle: string) => {
  const regex = /^(.+?)\s*\((\d+)\)\s*$/;
  const match = oldTitle.match(regex);

  if (match) {
    const title = match[1];
    const num = Number.parseInt(match[2], 10);
    return `${title} (${num + 1})`;
  } else {
    return `${oldTitle} (1)`;
  }
};

export const getValidTreeNodes = (nodes: Node[], edges: Edge[]) => {
  const startNode = nodes.find((node) => node.data.type === BlockEnum.Start);

  if (!startNode) {
    return {
      validNodes: nodes,
      maxDepth: 0
    };
  }

  const list: Node[] = [startNode];
  let maxDepth = 1;

  const traverse = (root: Node, depth: number) => {
    if (depth > maxDepth) maxDepth = depth;

    const outgoers = getOutgoers(root, nodes, edges);

    if (outgoers.length) {
      outgoers.forEach((outgoer) => {
        list.push(outgoer);

        traverse(outgoer, depth + 1);
      });
    } else {
      list.push(root);
    }
  };

  traverse(startNode, maxDepth);

  return {
    validNodes: uniqBy(list, 'id'),
    maxDepth
  };
};

export const changeNodesAndEdgesId = (nodes: Node[], edges: Edge[]) => {
  const idMap = nodes.reduce(
    (acc, node) => {
      acc[node.id] = uuid4();

      return acc;
    },
    {} as Record<string, string>
  );

  const newNodes = nodes.map((node) => {
    return {
      ...node,
      id: idMap[node.id]
    };
  });

  const newEdges = edges.map((edge) => {
    return {
      ...edge,
      source: idMap[edge.source],
      target: idMap[edge.target]
    };
  });

  return [newNodes, newEdges] as [Node[], Edge[]];
};

export const isMac = () => {
  return navigator.userAgent.toUpperCase().includes('MAC');
};

const specialKeysNameMap: Record<string, string | undefined> = {
  ctrl: '⌘',
  alt: '⌥',
  shift: '⇧'
};

export const getKeyboardKeyNameBySystem = (key: string) => {
  if (isMac()) return specialKeysNameMap[key] || key;

  return key;
};

const specialKeysCodeMap: Record<string, string | undefined> = {
  ctrl: 'meta'
};

export const getKeyboardKeyCodeBySystem = (key: string) => {
  if (isMac()) return specialKeysCodeMap[key] || key;

  return key;
};

export const getTopLeftNodePosition = (nodes: Node[]) => {
  let minX = Infinity;
  let minY = Infinity;

  nodes.forEach((node) => {
    if (node.position.x < minX) minX = node.position.x;

    if (node.position.y < minY) minY = node.position.y;
  });

  return {
    x: minX,
    y: minY
  };
};

export const isEventTargetInputArea = (target: HTMLElement) => {
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return true;

  if (target.contentEditable === 'true') return true;
};

export const variableTransformer = (v: ValueSelector | string) => {
  if (typeof v === 'string') return v.replace(/^{{#|#}}$/g, '').split('.');

  return `{{#${v.join('.')}#}}`;
};

type ParallelInfoItem = {
  parallelNodeId: string;
  depth: number;
  isBranch?: boolean;
};
type NodeParallelInfo = {
  parallelNodeId: string;
  edgeHandleId: string;
  depth: number;
};
type NodeHandle = {
  node: Node;
  handle: string;
};
type NodeStreamInfo = {
  upstreamNodes: Set<string>;
  downstreamEdges: Set<string>;
};
export const getParallelInfo = (
  nodes: Node[],
  edges: Edge[],
  parentNodeId?: string
) => {
  let startNode;
  const isStructFlow = nodes.some((node) => node.data.flow_type === 'struct');

  if (parentNodeId) {
    const parentNode = nodes.find((node) => node.id === parentNodeId);
    if (!parentNode) throw new Error('Parent node not found');

    startNode = nodes.find(
      (node) => node.id === (parentNode.data as any).start_node_id
    );
  } else {
    startNode = nodes.find((node) => node.data.type === BlockEnum.Start);
  }
  if (isStructFlow) {
  }

  if (!startNode && !isStructFlow) throw new Error('Start node not found');

  const parallelList = [] as ParallelInfoItem[];
  const nextNodeHandles = [{ node: startNode, handle: 'source' }];
  let hasAbnormalEdges = false;

  const traverse = (firstNodeHandle: NodeHandle) => {
    const nodeEdgesSet = {} as Record<string, Set<string>>;
    const totalEdgesSet = new Set<string>();
    const nextHandles = [firstNodeHandle];
    const streamInfo = {} as Record<string, NodeStreamInfo>;
    const parallelListItem = {
      parallelNodeId: '',
      depth: 0
    } as ParallelInfoItem;
    const nodeParallelInfoMap = {} as Record<string, NodeParallelInfo>;
    nodeParallelInfoMap[firstNodeHandle.node.id] = {
      parallelNodeId: '',
      edgeHandleId: '',
      depth: 0
    };

    while (nextHandles.length) {
      const currentNodeHandle = nextHandles.shift()!;
      const { node: currentNode, handle: currentHandle = 'source' } =
        currentNodeHandle;
      const currentNodeHandleKey = currentNode.id;
      const connectedEdges = edges.filter(
        (edge) =>
          edge.source === currentNode.id && edge.sourceHandle === currentHandle
      );
      const connectedEdgesLength = connectedEdges.length;
      const outgoers = nodes.filter((node) =>
        connectedEdges.some((edge) => edge.target === node.id)
      );
      const incomers = getIncomers(currentNode, nodes, edges);

      if (!streamInfo[currentNodeHandleKey]) {
        streamInfo[currentNodeHandleKey] = {
          upstreamNodes: new Set<string>(),
          downstreamEdges: new Set<string>()
        };
      }

      if (nodeEdgesSet[currentNodeHandleKey]?.size > 0 && incomers.length > 1) {
        const newSet = new Set<string>();
        for (const item of totalEdgesSet) {
          if (!streamInfo[currentNodeHandleKey].downstreamEdges.has(item))
            newSet.add(item);
        }
        if (isEqual(nodeEdgesSet[currentNodeHandleKey], newSet)) {
          parallelListItem.depth = nodeParallelInfoMap[currentNode.id].depth;
          nextNodeHandles.push({ node: currentNode, handle: currentHandle });
          break;
        }
      }

      if (nodeParallelInfoMap[currentNode.id].depth > parallelListItem.depth)
        parallelListItem.depth = nodeParallelInfoMap[currentNode.id].depth;

      outgoers.forEach((outgoer) => {
        const outgoerConnectedEdges = getConnectedEdges(
          [outgoer],
          edges
        ).filter((edge) => edge.source === outgoer.id);
        const sourceEdgesGroup = groupBy(outgoerConnectedEdges, 'sourceHandle');
        const incomers = getIncomers(outgoer, nodes, edges);

        if (outgoers.length > 1 && incomers.length > 1) hasAbnormalEdges = true;

        Object.keys(sourceEdgesGroup).forEach((sourceHandle) => {
          nextHandles.push({ node: outgoer, handle: sourceHandle });
        });
        if (!outgoerConnectedEdges.length)
          nextHandles.push({ node: outgoer, handle: 'source' });

        const outgoerKey = outgoer.id;
        if (!nodeEdgesSet[outgoerKey])
          nodeEdgesSet[outgoerKey] = new Set<string>();

        if (nodeEdgesSet[currentNodeHandleKey]) {
          for (const item of nodeEdgesSet[currentNodeHandleKey])
            nodeEdgesSet[outgoerKey].add(item);
        }

        if (!streamInfo[outgoerKey]) {
          streamInfo[outgoerKey] = {
            upstreamNodes: new Set<string>(),
            downstreamEdges: new Set<string>()
          };
        }

        if (!nodeParallelInfoMap[outgoer.id]) {
          nodeParallelInfoMap[outgoer.id] = {
            ...nodeParallelInfoMap[currentNode.id]
          };
        }

        if (connectedEdgesLength > 1) {
          const edge = connectedEdges.find(
            (edge) => edge.target === outgoer.id
          )!;
          nodeEdgesSet[outgoerKey].add(edge.id);
          totalEdgesSet.add(edge.id);

          streamInfo[currentNodeHandleKey].downstreamEdges.add(edge.id);
          streamInfo[outgoerKey].upstreamNodes.add(currentNodeHandleKey);

          for (const item of streamInfo[currentNodeHandleKey].upstreamNodes)
            streamInfo[item].downstreamEdges.add(edge.id);

          if (!parallelListItem.parallelNodeId)
            parallelListItem.parallelNodeId = currentNode.id;

          const prevDepth = nodeParallelInfoMap[currentNode.id].depth + 1;
          const currentDepth = nodeParallelInfoMap[outgoer.id].depth;

          nodeParallelInfoMap[outgoer.id].depth = Math.max(
            prevDepth,
            currentDepth
          );
        } else {
          for (const item of streamInfo[currentNodeHandleKey].upstreamNodes)
            streamInfo[outgoerKey].upstreamNodes.add(item);

          nodeParallelInfoMap[outgoer.id].depth =
            nodeParallelInfoMap[currentNode.id].depth;
        }
      });
    }

    parallelList.push(parallelListItem);
  };

  while (nextNodeHandles.length) {
    const nodeHandle = nextNodeHandles.shift()!;
    traverse(nodeHandle);
  }

  return {
    parallelList,
    hasAbnormalEdges
  };
};

export const getEdgeColor = (
  nodeRunningStatus?: NodeRunningStatus,
  isFailBranch?: boolean
) => {
  if (nodeRunningStatus === NodeRunningStatus.Succeeded)
    return 'var(--color-workflow-link-line-success-handle)';

  if (nodeRunningStatus === NodeRunningStatus.Failed)
    return 'var(--color-workflow-link-line-error-handle)';

  if (nodeRunningStatus === NodeRunningStatus.Exception)
    return 'var(--color-workflow-link-line-failure-handle)';

  if (nodeRunningStatus === NodeRunningStatus.Running) {
    if (isFailBranch) return 'var(--color-workflow-link-line-failure-handle)';

    return 'var(--color-workflow-link-line-handle)';
  }

  return 'var(--color-workflow-link-line-normal)';
};

export const isExceptionVariable = () => {
  return false;
};

export const flowIsStruct = (nods: Node[]) => {
  return nods.some((node) => node.data.flow_type === 'struct');
};

export const MAX_NODES_NUM = 16;

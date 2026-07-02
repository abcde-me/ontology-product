import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import {
  getOntologyLinkType,
  listOntologyLinkTypeData
} from '@/api/ontologySceneLibrary/links';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import { getInstanceDisplayFields } from '@/pages/exploreAnalysis/objectBrowse/utils/instanceRow';
import { fetchFieldCommentMap } from '@/pages/exploreAnalysis/objectBrowse/services/conditionQuery';
import type { FieldCommentMap } from '@/pages/exploreAnalysis/objectBrowse/utils/fieldDisplayLabel';
import type { InstanceQueryRow } from '@/pages/exploreAnalysis/objectBrowse/types';
import type {
  GraphAlgorithmKey,
  GraphLayoutKey,
  RelationGraphData,
  RelationGraphEdge,
  RelationGraphNode,
  RelationLoadMode,
  SelectedObjectContext
} from '../types';
import { layoutRelationGraph } from '../utils/graphLayout';
import {
  getCategoryColor,
  getNodeSize,
  applyEdgePairNodeColors,
  DEFAULT_EDGE_COLOR
} from '../utils/nodeColors';

const MAX_LINK_ROWS = 100;
const MAX_NEIGHBOR_NODES = 40;

const fieldCommentMapCache = new Map<string, FieldCommentMap>();

const getFieldCommentMap = async (
  sceneId: number,
  objectTypeId: number
): Promise<FieldCommentMap> => {
  const cacheKey = `${sceneId}-${objectTypeId}`;

  if (fieldCommentMapCache.has(cacheKey)) {
    return fieldCommentMapCache.get(cacheKey)!;
  }

  const map = await fetchFieldCommentMap(sceneId, objectTypeId);
  fieldCommentMapCache.set(cacheKey, map);
  return map;
};

const filterTopologyByDepth = (
  topology: GetOntologyTopologyResponse,
  focusNodeId: number,
  algorithm: GraphAlgorithmKey
): GetOntologyTopologyResponse => {
  const nodes = topology.nodes ?? [];
  const edges = topology.edges ?? [];

  if (algorithm === 'connected') {
    const visibleNodeIds = new Set<number>([focusNodeId]);
    let changed = true;

    while (changed) {
      changed = false;
      edges.forEach((edge) => {
        const sourceId = edge.sourceId;
        const targetId = edge.targetId;
        if (sourceId == null || targetId == null) {
          return;
        }

        const sourceVisible = visibleNodeIds.has(sourceId);
        const targetVisible = visibleNodeIds.has(targetId);

        if (sourceVisible && !targetVisible) {
          visibleNodeIds.add(targetId);
          changed = true;
        }
        if (targetVisible && !sourceVisible) {
          visibleNodeIds.add(sourceId);
          changed = true;
        }
      });
    }

    return {
      nodes: nodes.filter(
        (node) => node.id != null && visibleNodeIds.has(node.id)
      ),
      edges: edges.filter(
        (edge) =>
          edge.sourceId != null &&
          edge.targetId != null &&
          visibleNodeIds.has(edge.sourceId) &&
          visibleNodeIds.has(edge.targetId)
      )
    };
  }

  const maxDepth = algorithm === 'neighbor-2' ? 2 : 1;
  const visibleNodeIds = new Set<number>([focusNodeId]);
  let frontier = new Set<number>([focusNodeId]);

  for (let depth = 0; depth < maxDepth; depth += 1) {
    const nextFrontier = new Set<number>();

    edges.forEach((edge) => {
      const sourceId = edge.sourceId;
      const targetId = edge.targetId;
      if (sourceId == null || targetId == null) {
        return;
      }

      if (frontier.has(sourceId) && !visibleNodeIds.has(targetId)) {
        visibleNodeIds.add(targetId);
        nextFrontier.add(targetId);
      }
      if (frontier.has(targetId) && !visibleNodeIds.has(sourceId)) {
        visibleNodeIds.add(sourceId);
        nextFrontier.add(sourceId);
      }
    });

    frontier = nextFrontier;
    if (frontier.size === 0) {
      break;
    }
  }

  return {
    nodes: nodes.filter(
      (node) => node.id != null && visibleNodeIds.has(node.id)
    ),
    edges: edges.filter(
      (edge) =>
        edge.sourceId != null &&
        edge.targetId != null &&
        visibleNodeIds.has(edge.sourceId) &&
        visibleNodeIds.has(edge.targetId)
    )
  };
};

const resolveInstanceLabel = (
  row: Record<string, unknown>,
  fallback: string
): string => {
  const preferredKeys = ['name', 'title', 'label', 'id', 'ID', '_id'];
  for (const key of preferredKeys) {
    const value = row[key];
    if (value != null && value !== '') {
      return String(value);
    }
  }

  const firstEntry = Object.entries(row).find(
    ([key, value]) =>
      !key.startsWith('_') &&
      value != null &&
      value !== '' &&
      typeof value !== 'object'
  );

  return firstEntry ? String(firstEntry[1]) : fallback;
};

const buildNodeId = (
  objectTypeId: number,
  instanceId: string,
  prefix = 'instance'
) => `${prefix}-${objectTypeId}-${instanceId}`;

const createGraphNode = (
  id: string,
  params: {
    label: string;
    subLabel?: string;
    isFocus: boolean;
    objectTypeId: number;
    objectTypeName?: string;
    instanceId?: string;
    sceneId?: number;
    detailFields?: Array<{ label: string; value: string }>;
  }
): RelationGraphNode => ({
  id,
  type: 'knowledgeNode',
  data: {
    label: params.label,
    subLabel: params.subLabel,
    isFocus: params.isFocus,
    objectTypeId: params.objectTypeId,
    objectTypeName: params.objectTypeName ?? params.subLabel,
    instanceId: params.instanceId,
    sceneId: params.sceneId,
    detailFields: params.detailFields,
    color: getCategoryColor(params.objectTypeId, params.isFocus),
    size: getNodeSize(params.isFocus)
  },
  position: { x: 0, y: 0 }
});

const buildDetailFieldsFromRow = async (
  row: Record<string, unknown>,
  sceneId: number,
  objectTypeId: number
): Promise<Array<{ label: string; value: string }>> => {
  const commentMap = await getFieldCommentMap(sceneId, objectTypeId);
  return getInstanceDisplayFields(row as InstanceQueryRow, commentMap);
};

const createGraphEdge = (
  id: string,
  source: string,
  target: string,
  label: string,
  edgeColor: string
): RelationGraphEdge => ({
  id,
  source,
  target,
  label,
  type: 'knowledgeEdge',
  data: { linkName: label, edgeColor }
});

interface GraphAccumulator {
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
  nodeIdSet: Set<string>;
  edgeIdSet: Set<string>;
  neighborCount: number;
}

const createAccumulatorFromGraph = (
  graph?: RelationGraphData
): GraphAccumulator => {
  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];

  return {
    nodes: [...nodes],
    edges: [...edges],
    nodeIdSet: new Set(nodes.map((node) => node.id)),
    edgeIdSet: new Set(edges.map((edge) => edge.id)),
    neighborCount: nodes.filter((node) => !node.data?.isFocus).length
  };
};

const ensureFocusNode = (
  accumulator: GraphAccumulator,
  selectedObject: SelectedObjectContext
) => {
  const focusNodeId = buildNodeId(
    selectedObject.objectTypeId,
    selectedObject.instanceId,
    'focus'
  );

  if (accumulator.nodeIdSet.has(focusNodeId)) {
    return focusNodeId;
  }

  accumulator.nodes.push(
    createGraphNode(focusNodeId, {
      label: selectedObject.instanceLabel || selectedObject.instanceId,
      subLabel: selectedObject.objectTypeName || '当前对象',
      isFocus: true,
      objectTypeId: selectedObject.objectTypeId,
      objectTypeName: selectedObject.objectTypeName,
      instanceId: selectedObject.instanceId,
      sceneId: selectedObject.sceneId,
      detailFields: [
        { label: '对象类型', value: selectedObject.objectTypeName ?? '-' },
        { label: '实例 ID', value: selectedObject.instanceId },
        ...(selectedObject.sceneName
          ? [{ label: '场景库', value: selectedObject.sceneName }]
          : [])
      ]
    })
  );
  accumulator.nodeIdSet.add(focusNodeId);
  return focusNodeId;
};

const appendFocusObjectRelations = async (
  selectedObject: SelectedObjectContext,
  filteredTopology: GetOntologyTopologyResponse,
  edgeColor: string,
  accumulator: GraphAccumulator
) => {
  const typeNodeMap = new Map(
    (filteredTopology.nodes ?? []).map((node) => [node.id!, node])
  );
  const focusNodeId = ensureFocusNode(accumulator, selectedObject);

  const relatedEdges = (filteredTopology.edges ?? []).filter(
    (edge) =>
      edge.sourceId === selectedObject.objectTypeId ||
      edge.targetId === selectedObject.objectTypeId
  );

  for (const topologyEdge of relatedEdges) {
    if (accumulator.neighborCount >= MAX_NEIGHBOR_NODES || !topologyEdge.id) {
      break;
    }

    const isSourceFocus = topologyEdge.sourceId === selectedObject.objectTypeId;
    const neighborTypeId = isSourceFocus
      ? topologyEdge.targetId
      : topologyEdge.sourceId;

    if (neighborTypeId == null) {
      continue;
    }

    const neighborType = typeNodeMap.get(neighborTypeId);
    let linkDetail;

    try {
      const linkRes = await getOntologyLinkType({ id: topologyEdge.id });
      if (linkRes.status === 200 && linkRes.code === '' && linkRes.data) {
        linkDetail = linkRes.data;
      }
    } catch {
      linkDetail = undefined;
    }

    const sourceColumn = linkDetail?.linkSourceColumnName;
    const targetColumn = linkDetail?.linkTargetColumnName;
    const linkLabel = topologyEdge.name || linkDetail?.code || '关联';

    let matchedRows: Record<string, unknown>[] = [];

    if (sourceColumn || targetColumn) {
      try {
        const dataRes = await listOntologyLinkTypeData({
          id: topologyEdge.id,
          page: 1,
          pageSize: MAX_LINK_ROWS
        });

        if (dataRes.status === 200 && dataRes.code === '' && dataRes.data) {
          matchedRows = (dataRes.data.result ?? []).filter((row) => {
            const sourceValue = sourceColumn ? row[sourceColumn] : undefined;
            const targetValue = targetColumn ? row[targetColumn] : undefined;
            const focusId = String(selectedObject.instanceId);

            if (isSourceFocus) {
              return String(sourceValue ?? '') === focusId;
            }

            return String(targetValue ?? '') === focusId;
          });
        }
      } catch {
        matchedRows = [];
      }
    }

    if (matchedRows.length === 0) {
      const placeholderId = buildNodeId(
        neighborTypeId,
        `type-${topologyEdge.id}`,
        'type'
      );

      if (!accumulator.nodeIdSet.has(placeholderId)) {
        accumulator.nodes.push(
          createGraphNode(placeholderId, {
            label: neighborType?.name || `对象类型 ${neighborTypeId}`,
            subLabel: neighborType?.name,
            isFocus: false,
            objectTypeId: neighborTypeId,
            objectTypeName: neighborType?.name
          })
        );
        accumulator.nodeIdSet.add(placeholderId);
        accumulator.neighborCount += 1;
      }

      const edgeId = `edge-${topologyEdge.id}-${focusNodeId}-${placeholderId}`;
      if (!accumulator.edgeIdSet.has(edgeId)) {
        accumulator.edges.push(
          createGraphEdge(
            edgeId,
            isSourceFocus ? focusNodeId : placeholderId,
            isSourceFocus ? placeholderId : focusNodeId,
            linkLabel,
            edgeColor
          )
        );
        accumulator.edgeIdSet.add(edgeId);
      }
      continue;
    }

    for (const row of matchedRows.slice(0, 5)) {
      if (accumulator.neighborCount >= MAX_NEIGHBOR_NODES) {
        break;
      }

      const neighborColumn = isSourceFocus ? targetColumn : sourceColumn;
      const neighborInstanceId = neighborColumn
        ? String(row[neighborColumn] ?? '')
        : resolveInstanceLabel(row, `关联-${accumulator.neighborCount + 1}`);

      if (!neighborInstanceId) {
        continue;
      }

      const neighborNodeId = buildNodeId(neighborTypeId, neighborInstanceId);

      if (!accumulator.nodeIdSet.has(neighborNodeId)) {
        accumulator.nodes.push(
          createGraphNode(neighborNodeId, {
            label: resolveInstanceLabel(row, neighborInstanceId),
            subLabel: neighborType?.name || `对象类型 ${neighborTypeId}`,
            isFocus: false,
            objectTypeId: neighborTypeId,
            objectTypeName: neighborType?.name,
            instanceId: neighborInstanceId,
            sceneId: selectedObject.sceneId,
            detailFields: await buildDetailFieldsFromRow(
              row,
              selectedObject.sceneId,
              neighborTypeId
            )
          })
        );
        accumulator.nodeIdSet.add(neighborNodeId);
        accumulator.neighborCount += 1;
      }

      const edgeId = `edge-${topologyEdge.id}-${focusNodeId}-${neighborNodeId}`;
      if (!accumulator.edgeIdSet.has(edgeId)) {
        accumulator.edges.push(
          createGraphEdge(
            edgeId,
            isSourceFocus ? focusNodeId : neighborNodeId,
            isSourceFocus ? neighborNodeId : focusNodeId,
            linkLabel,
            edgeColor
          )
        );
        accumulator.edgeIdSet.add(edgeId);
      }
    }
  }
};

export const enrichSelectedObjectContext = async (
  context: Pick<
    SelectedObjectContext,
    'sceneId' | 'objectTypeId' | 'instanceId'
  >
): Promise<SelectedObjectContext> => {
  const [sceneRes, objectTypeRes] = await Promise.all([
    listOntologyModel({ pageNo: -1, pageSize: -1, order: 'desc' }),
    listOntologyObjectType({
      ontologyModelID: context.sceneId,
      pageNo: -1,
      pageSize: -1,
      order: 'desc'
    })
  ]);

  const scene = sceneRes.data?.result?.find(
    (item) => item.id === context.sceneId
  );
  const objectType = objectTypeRes.data?.result?.find(
    (item) => item.id === context.objectTypeId
  );

  return {
    sceneId: context.sceneId,
    sceneName: scene?.name,
    objectTypeId: context.objectTypeId,
    objectTypeName: objectType?.name,
    objectTypeCode: objectType?.code,
    instanceId: context.instanceId,
    instanceLabel: context.instanceId
  };
};

export const enrichSelectedObjectContexts = async (
  contexts: Array<
    Pick<SelectedObjectContext, 'sceneId' | 'objectTypeId' | 'instanceId'>
  >
): Promise<SelectedObjectContext[]> => {
  if (contexts.length === 0) {
    return [];
  }

  const sceneId = contexts[0].sceneId;
  const objectTypeId = contexts[0].objectTypeId;

  const [sceneRes, objectTypeRes] = await Promise.all([
    listOntologyModel({ pageNo: -1, pageSize: -1, order: 'desc' }),
    listOntologyObjectType({
      ontologyModelID: sceneId,
      pageNo: -1,
      pageSize: -1,
      order: 'desc'
    })
  ]);

  const scene = sceneRes.data?.result?.find((item) => item.id === sceneId);
  const objectType = objectTypeRes.data?.result?.find(
    (item) => item.id === objectTypeId
  );

  return contexts.map((context) => ({
    sceneId: context.sceneId,
    sceneName: scene?.name,
    objectTypeId: context.objectTypeId,
    objectTypeName: objectType?.name,
    objectTypeCode: objectType?.code,
    instanceId: context.instanceId,
    instanceLabel: context.instanceId
  }));
};

const appendObjectsToGraph = async (params: {
  selectedObjects: SelectedObjectContext[];
  loadMode: RelationLoadMode;
  algorithm: GraphAlgorithmKey;
  topologyRes: { data?: GetOntologyTopologyResponse };
  accumulator: GraphAccumulator;
}) => {
  const { selectedObjects, loadMode, algorithm, topologyRes, accumulator } =
    params;
  const edgeColor = DEFAULT_EDGE_COLOR;
  const topologyCache = new Map<number, GetOntologyTopologyResponse>();
  const getFilteredTopology = (objectTypeId: number) => {
    if (!topologyCache.has(objectTypeId)) {
      topologyCache.set(
        objectTypeId,
        filterTopologyByDepth(
          topologyRes.data ?? { nodes: [], edges: [] },
          objectTypeId,
          algorithm
        )
      );
    }
    return topologyCache.get(objectTypeId)!;
  };

  for (const selectedObject of selectedObjects) {
    ensureFocusNode(accumulator, selectedObject);

    if (loadMode === 'graph') {
      await appendFocusObjectRelations(
        selectedObject,
        getFilteredTopology(selectedObject.objectTypeId),
        edgeColor,
        accumulator
      );
    }
  }
};

export const buildRelationGraph = async (params: {
  selectedObjects: SelectedObjectContext[];
  algorithm: GraphAlgorithmKey;
  layout: GraphLayoutKey;
  loadMode?: RelationLoadMode;
  existingGraph?: RelationGraphData;
}): Promise<RelationGraphData> => {
  const {
    selectedObjects,
    algorithm,
    layout,
    loadMode = 'graph',
    existingGraph
  } = params;

  if (selectedObjects.length === 0 && !existingGraph) {
    return { nodes: [], edges: [] };
  }

  if (selectedObjects.length === 0 && existingGraph) {
    const coloredNodes = applyEdgePairNodeColors(
      existingGraph.nodes,
      existingGraph.edges
    );

    return {
      nodes: layoutRelationGraph(coloredNodes, existingGraph.edges, layout),
      edges: existingGraph.edges
    };
  }

  const sceneId = selectedObjects[0].sceneId;
  const hasSameScene = selectedObjects.every(
    (item) => item.sceneId === sceneId
  );

  if (!hasSameScene) {
    throw new Error('请选择同一场景库下的对象实例');
  }

  const topologyRes = await getOntologyTopology({ id: sceneId });

  if (
    topologyRes.status !== 200 ||
    topologyRes.code !== '' ||
    !topologyRes.data
  ) {
    throw new Error(topologyRes.message || '加载拓扑数据失败');
  }

  const accumulator = createAccumulatorFromGraph(existingGraph);

  await appendObjectsToGraph({
    selectedObjects,
    loadMode,
    algorithm,
    topologyRes,
    accumulator
  });

  return {
    nodes: layoutRelationGraph(
      applyEdgePairNodeColors(accumulator.nodes, accumulator.edges),
      accumulator.edges,
      layout
    ),
    edges: accumulator.edges
  };
};

export const rebuildRelationGraph = async (params: {
  selectedObjects: SelectedObjectContext[];
  algorithm: GraphAlgorithmKey;
  layout: GraphLayoutKey;
}): Promise<RelationGraphData> => {
  const { selectedObjects, algorithm, layout } = params;

  if (selectedObjects.length === 0) {
    return { nodes: [], edges: [] };
  }

  const sceneId = selectedObjects[0].sceneId;
  const hasSameScene = selectedObjects.every(
    (item) => item.sceneId === sceneId
  );

  if (!hasSameScene) {
    throw new Error('请选择同一场景库下的对象实例');
  }

  const topologyRes = await getOntologyTopology({ id: sceneId });

  if (
    topologyRes.status !== 200 ||
    topologyRes.code !== '' ||
    !topologyRes.data
  ) {
    throw new Error(topologyRes.message || '加载拓扑数据失败');
  }

  const accumulator = createAccumulatorFromGraph();
  const edgeColor = DEFAULT_EDGE_COLOR;
  const topologyCache = new Map<number, GetOntologyTopologyResponse>();
  const getFilteredTopology = (objectTypeId: number) => {
    if (!topologyCache.has(objectTypeId)) {
      topologyCache.set(
        objectTypeId,
        filterTopologyByDepth(topologyRes.data, objectTypeId, algorithm)
      );
    }
    return topologyCache.get(objectTypeId)!;
  };

  for (const selectedObject of selectedObjects) {
    ensureFocusNode(accumulator, selectedObject);

    if (selectedObject.loadedAsGraph) {
      await appendFocusObjectRelations(
        selectedObject,
        getFilteredTopology(selectedObject.objectTypeId),
        edgeColor,
        accumulator
      );
    }
  }

  return {
    nodes: layoutRelationGraph(
      applyEdgePairNodeColors(accumulator.nodes, accumulator.edges),
      accumulator.edges,
      layout
    ),
    edges: accumulator.edges
  };
};

import {
  getOntologyTopology,
  listOntologyLinkType,
  listOntologyObjectTypeData
} from '@/api/ontologySceneLibrary/graph';
import {
  getOntologyLinkType,
  listOntologyLinkTypeData
} from '@/api/ontologySceneLibrary/links';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { resolveRowFieldValue } from '@/pages/exploreAnalysis/objectBrowse/services/instanceQuery';
import {
  resolveInstanceId,
  getInstanceDisplayFields
} from '@/pages/exploreAnalysis/objectBrowse/utils/instanceRow';
import type { InstanceQueryRow } from '@/pages/exploreAnalysis/objectBrowse/types';
import type { ImplicitScopeInstance } from '../types';
import { buildInstanceNodeKey } from './scopeInstances';

const MAX_LINK_ROWS = 1000;
const MAX_OBJECT_TYPE_ROWS = 500;
const MAX_GRAPH_NODES = 120;

const JOIN_KEY_ALIASES = [
  'id',
  'ID',
  '_id',
  'pk',
  'instanceId',
  'instance_id',
  'code',
  'Code',
  'primaryKey',
  'primary_key'
];

export interface InstanceGraphNode {
  key: string;
  objectTypeId: number;
  objectTypeName?: string;
  instanceId: string;
  label: string;
  /** 是否为任务直接选中的实例（否则为本体关系扩展的邻居） */
  isSeed?: boolean;
  /** 实例属性字段 */
  attributes?: Array<{ label: string; value: string }>;
}

export interface InstanceGraphEdge {
  id: string;
  sourceKey: string;
  targetKey: string;
  sourceLabel: string;
  targetLabel: string;
  linkName: string;
  linkId?: number;
}

export interface InstanceRelationGraph {
  nodes: InstanceGraphNode[];
  edges: InstanceGraphEdge[];
}

const resolveLabel = (
  row: Record<string, unknown>,
  fallback: string
): string => {
  const preferred = ['name', 'title', 'label', 'Name', 'code', 'Code'];
  for (const key of preferred) {
    if (row[key] != null && String(row[key]).trim()) {
      return String(row[key]);
    }
  }
  return fallback;
};

const normalizeJoinKey = (value: string) =>
  value.toLowerCase().replace(/[··•.\-_\s]/g, '');

const addLookupKey = (
  lookup: Map<string, string>,
  value: unknown,
  nodeKey: string
) => {
  if (value == null) {
    return;
  }
  const text = String(value).trim();
  if (!text) {
    return;
  }
  lookup.set(text, nodeKey);
  lookup.set(text.toLowerCase(), nodeKey);
  lookup.set(normalizeJoinKey(text), nodeKey);
};

const lookupNodeKey = (
  lookup: Map<string, string>,
  value: unknown
): string | undefined => {
  if (value == null) {
    return undefined;
  }
  const text = String(value).trim();
  if (!text) {
    return undefined;
  }
  return (
    lookup.get(text) ||
    lookup.get(text.toLowerCase()) ||
    lookup.get(normalizeJoinKey(text))
  );
};

const collectJoinKeysFromRow = (
  row: Record<string, unknown> | undefined,
  ...columns: Array<string | undefined>
): string[] => {
  const keys = new Set<string>();
  const add = (value: unknown) => {
    if (value == null) {
      return;
    }
    const text = String(value).trim();
    if (text) {
      keys.add(text);
    }
  };

  columns.forEach((column) => {
    if (!column || !row) {
      return;
    }
    add(resolveRowFieldValue(row, column));
  });

  if (row) {
    JOIN_KEY_ALIASES.forEach((field) => {
      add(resolveRowFieldValue(row, field));
    });
    const id = resolveInstanceId(row);
    if (id != null) {
      add(id);
    }
  }

  return Array.from(keys);
};

const readCell = (
  row: Record<string, unknown>,
  column: string | undefined
): unknown => {
  if (column) {
    const valued = resolveRowFieldValue(row, column);
    if (valued != null && String(valued).trim()) {
      return valued;
    }
  }
  for (const alias of JOIN_KEY_ALIASES) {
    const valued = resolveRowFieldValue(row, alias);
    if (valued != null && String(valued).trim()) {
      return valued;
    }
  }
  return undefined;
};

const loadObjectTypeRows = async (
  objectTypeId: number
): Promise<Record<string, unknown>[]> => {
  try {
    const res = await listOntologyObjectTypeData({
      id: objectTypeId,
      page: 1,
      pageSize: MAX_OBJECT_TYPE_ROWS
    });
    if (isOntologyApiSuccess(res) && res.data?.result) {
      return res.data.result;
    }
  } catch {
    // ignore
  }
  return [];
};

type TopologyLink = {
  linkId: number;
  sourceTypeId: number;
  targetTypeId: number;
  linkName: string;
  sourceColumn?: string;
  targetColumn?: string;
};

/**
 * 基于本体拓扑链接，展示选中实例及其关联邻居实例的确认关系。
 */
export const buildInstanceRelationGraph = async (params: {
  sceneId: number;
  instances: ImplicitScopeInstance[];
}): Promise<InstanceRelationGraph> => {
  const { sceneId, instances } = params;
  if (!instances.length) {
    return { nodes: [], edges: [] };
  }

  const topologyRes = await getOntologyTopology({ id: sceneId });
  if (!isOntologyApiSuccess(topologyRes) || !topologyRes.data) {
    throw new Error('加载本体拓扑失败');
  }
  const topology = topologyRes.data;

  const typeNameMap = new Map<number, string>();
  (topology.nodes || []).forEach((node) => {
    if (node.id != null) {
      typeNameMap.set(node.id, node.name || `类型#${node.id}`);
    }
  });

  const nodeMap = new Map<string, InstanceGraphNode>();
  const instanceRowsByType = new Map<number, Record<string, unknown>[]>();
  const rowByNodeKey = new Map<string, Record<string, unknown>>();

  const ensureTypeRows = async (objectTypeId: number) => {
    if (instanceRowsByType.has(objectTypeId)) {
      return instanceRowsByType.get(objectTypeId)!;
    }
    const rows = await loadObjectTypeRows(objectTypeId);
    instanceRowsByType.set(objectTypeId, rows);
    return rows;
  };

  const findRowForInstance = async (
    objectTypeId: number,
    instanceId: string
  ): Promise<Record<string, unknown> | undefined> => {
    const rows = await ensureTypeRows(objectTypeId);
    const target = String(instanceId).trim();
    const targetNorm = normalizeJoinKey(target);

    return rows.find((row) => {
      const id = resolveInstanceId(row);
      if (id != null && String(id).trim() === target) {
        return true;
      }
      return JOIN_KEY_ALIASES.some((field) => {
        const value = resolveRowFieldValue(row, field);
        if (value == null) {
          return false;
        }
        const text = String(value).trim();
        return text === target || normalizeJoinKey(text) === targetNorm;
      });
    });
  };

  const upsertNode = async (
    objectTypeId: number,
    instanceId: string,
    options?: {
      label?: string;
      objectTypeName?: string;
      isSeed?: boolean;
      row?: Record<string, unknown>;
    }
  ): Promise<InstanceGraphNode | null> => {
    const key = buildInstanceNodeKey(objectTypeId, instanceId);
    const existing = nodeMap.get(key);
    if (existing) {
      if (options?.isSeed) {
        existing.isSeed = true;
      }
      if (
        (!existing.attributes || !existing.attributes.length) &&
        options?.row
      ) {
        existing.attributes = getInstanceDisplayFields(
          options.row as InstanceQueryRow
        );
        rowByNodeKey.set(key, options.row);
      }
      return existing;
    }
    if (nodeMap.size >= MAX_GRAPH_NODES && !options?.isSeed) {
      return null;
    }

    let row = options?.row;
    if (!row) {
      row = await findRowForInstance(objectTypeId, instanceId);
    }

    const label =
      options?.label || (row ? resolveLabel(row, instanceId) : instanceId);

    const node: InstanceGraphNode = {
      key,
      objectTypeId,
      objectTypeName: options?.objectTypeName || typeNameMap.get(objectTypeId),
      instanceId,
      label,
      isSeed: options?.isSeed,
      attributes: row
        ? getInstanceDisplayFields(row as InstanceQueryRow)
        : undefined
    };
    nodeMap.set(key, node);
    if (row) {
      rowByNodeKey.set(key, row);
    }
    return node;
  };

  // 种子实例（任务选中）
  for (const item of instances) {
    const row = await findRowForInstance(item.objectTypeId, item.instanceId);
    await upsertNode(item.objectTypeId, item.instanceId, {
      label: item.instanceLabel || item.instanceId,
      objectTypeName: item.objectTypeName,
      isSeed: true,
      row
    });
  }

  const seedTypeIds = new Set(instances.map((item) => item.objectTypeId));

  const topologyLinks: TopologyLink[] = [];

  const pushLink = async (params: {
    linkId: number;
    sourceTypeId: number;
    targetTypeId: number;
    linkName: string;
  }) => {
    let { sourceTypeId, targetTypeId, linkName } = params;
    let sourceColumn: string | undefined;
    let targetColumn: string | undefined;

    try {
      const linkRes = await getOntologyLinkType({ id: params.linkId });
      if (isOntologyApiSuccess(linkRes) && linkRes.data) {
        sourceColumn = linkRes.data.linkSourceColumnName || undefined;
        targetColumn = linkRes.data.linkTargetColumnName || undefined;
        linkName =
          params.linkName ||
          linkRes.data.code ||
          linkRes.data.description ||
          '关联';
        if (linkRes.data.sourceObjectTypeID != null) {
          sourceTypeId = linkRes.data.sourceObjectTypeID;
        }
        if (linkRes.data.targetObjectTypeID != null) {
          targetTypeId = linkRes.data.targetObjectTypeID;
        }
      }
    } catch {
      // keep raw topology/list info
    }

    if (!seedTypeIds.has(sourceTypeId) && !seedTypeIds.has(targetTypeId)) {
      return;
    }

    topologyLinks.push({
      linkId: params.linkId,
      sourceTypeId,
      targetTypeId,
      linkName: linkName || '关联',
      sourceColumn,
      targetColumn
    });
  };

  for (const edge of topology.edges || []) {
    if (edge.id == null || edge.sourceId == null || edge.targetId == null) {
      continue;
    }
    await pushLink({
      linkId: edge.id,
      sourceTypeId: edge.sourceId,
      targetTypeId: edge.targetId,
      linkName: edge.name || edge.code || '关联'
    });
  }

  // 拓扑边为空时，回退到场景链接类型列表
  if (!topologyLinks.length) {
    try {
      const listRes = await listOntologyLinkType({
        ontologyModelID: sceneId,
        pageNo: 1,
        pageSize: 200
      });
      if (isOntologyApiSuccess(listRes) && listRes.data?.result?.length) {
        for (const item of listRes.data.result) {
          if (
            item.id == null ||
            item.sourceObjectTypeID == null ||
            item.targetObjectTypeID == null
          ) {
            continue;
          }
          await pushLink({
            linkId: item.id,
            sourceTypeId: item.sourceObjectTypeID,
            targetTypeId: item.targetObjectTypeID,
            linkName: item.name || item.code || '关联'
          });
        }
      }
    } catch {
      // ignore
    }
  }

  const edgeMap = new Map<string, InstanceGraphEdge>();

  const addEdge = (
    link: TopologyLink,
    sourceKey: string,
    targetKey: string
  ) => {
    if (sourceKey === targetKey) {
      return;
    }
    const sourceNode = nodeMap.get(sourceKey);
    const targetNode = nodeMap.get(targetKey);
    if (!sourceNode || !targetNode) {
      return;
    }
    const undirected = [sourceKey, targetKey].sort().join('|');
    const dedupeKey = `${link.linkId}|${undirected}`;
    if (edgeMap.has(dedupeKey)) {
      return;
    }
    edgeMap.set(dedupeKey, {
      id: `confirmed-${link.linkId}-${sourceKey}-${targetKey}`,
      sourceKey,
      targetKey,
      sourceLabel: sourceNode.label,
      targetLabel: targetNode.label,
      linkName: link.linkName,
      linkId: link.linkId
    });
  };

  const buildLookupFromNodes = async (
    objectTypeId: number,
    preferredColumns: Array<string | undefined>
  ) => {
    const lookup = new Map<string, string>();
    const nodes = Array.from(nodeMap.values()).filter(
      (node) => node.objectTypeId === objectTypeId
    );
    nodes.forEach((node) => {
      addLookupKey(lookup, node.instanceId, node.key);
      const row = rowByNodeKey.get(node.key);
      collectJoinKeysFromRow(row, ...preferredColumns).forEach((key) => {
        addLookupKey(lookup, key, node.key);
      });
    });

    // 预载该类型更多实例，便于把邻居挂进图
    const rows = await ensureTypeRows(objectTypeId);
    rows.forEach((row) => {
      const id = resolveInstanceId(row);
      if (id == null) {
        return;
      }
      const instanceId = String(id);
      const key = buildInstanceNodeKey(objectTypeId, instanceId);
      // 仅索引，未 upsert，真正命中时再 upsert
      addLookupKey(lookup, instanceId, key);
      collectJoinKeysFromRow(row, ...preferredColumns).forEach((joinKey) => {
        addLookupKey(lookup, joinKey, key);
      });
    });

    return { lookup, rows };
  };

  const ensureNodeFromLookupKey = async (
    objectTypeId: number,
    nodeKey: string,
    rows: Record<string, unknown>[]
  ) => {
    if (nodeMap.has(nodeKey)) {
      return nodeMap.get(nodeKey)!;
    }
    const parsedId = nodeKey.includes(':')
      ? nodeKey.slice(nodeKey.indexOf(':') + 1)
      : nodeKey;
    const row =
      rows.find((item) => {
        const id = resolveInstanceId(item);
        return id != null && String(id) === parsedId;
      }) || (await findRowForInstance(objectTypeId, parsedId));

    return upsertNode(objectTypeId, parsedId, {
      row,
      objectTypeName: typeNameMap.get(objectTypeId)
    });
  };

  for (const link of topologyLinks) {
    // 1) 优先：链接表实例数据
    let linkRows: Record<string, unknown>[] = [];
    try {
      const dataRes = await listOntologyLinkTypeData({
        id: link.linkId,
        page: 1,
        pageSize: MAX_LINK_ROWS
      });
      if (isOntologyApiSuccess(dataRes) && dataRes.data?.result?.length) {
        linkRows = dataRes.data.result;
      }
    } catch {
      linkRows = [];
    }

    const sourceSide = await buildLookupFromNodes(link.sourceTypeId, [
      link.sourceColumn,
      link.targetColumn
    ]);
    const targetSide = await buildLookupFromNodes(link.targetTypeId, [
      link.targetColumn,
      link.sourceColumn
    ]);

    if (linkRows.length) {
      // 先把种子实例的 join key 预热进 lookup
      for (const seed of Array.from(nodeMap.values()).filter((n) => n.isSeed)) {
        if (seed.objectTypeId === link.sourceTypeId) {
          addLookupKey(sourceSide.lookup, seed.instanceId, seed.key);
          collectJoinKeysFromRow(
            rowByNodeKey.get(seed.key),
            link.sourceColumn
          ).forEach((key) => addLookupKey(sourceSide.lookup, key, seed.key));
        }
        if (seed.objectTypeId === link.targetTypeId) {
          addLookupKey(targetSide.lookup, seed.instanceId, seed.key);
          collectJoinKeysFromRow(
            rowByNodeKey.get(seed.key),
            link.targetColumn
          ).forEach((key) => addLookupKey(targetSide.lookup, key, seed.key));
        }
      }

      for (const row of linkRows) {
        const sourceValue = readCell(row, link.sourceColumn);
        const targetValue = readCell(row, link.targetColumn);

        const tryPairs: Array<[unknown, unknown]> = [
          [sourceValue, targetValue],
          [targetValue, sourceValue]
        ];

        for (const [left, right] of tryPairs) {
          const sourceHint = lookupNodeKey(sourceSide.lookup, left);
          const targetHint = lookupNodeKey(targetSide.lookup, right);
          if (!sourceHint || !targetHint) {
            continue;
          }

          const sourceNode = await ensureNodeFromLookupKey(
            link.sourceTypeId,
            sourceHint,
            sourceSide.rows
          );
          const targetNode = await ensureNodeFromLookupKey(
            link.targetTypeId,
            targetHint,
            targetSide.rows
          );
          if (!sourceNode || !targetNode) {
            continue;
          }

          const markSeed = (node: InstanceGraphNode) => {
            if (
              instances.some(
                (item) =>
                  item.objectTypeId === node.objectTypeId &&
                  String(item.instanceId) === String(node.instanceId)
              )
            ) {
              node.isSeed = true;
            }
          };
          markSeed(sourceNode);
          markSeed(targetNode);

          if (!sourceNode.isSeed && !targetNode.isSeed) {
            continue;
          }

          addEdge(link, sourceNode.key, targetNode.key);
          break;
        }
      }
    }

    // 2) 回退：无链接表或未命中时，按本体链接列在对象实例间做字段关联
    if (!link.sourceColumn && !link.targetColumn) {
      continue;
    }

    const seedNodes = Array.from(nodeMap.values()).filter(
      (node) =>
        node.isSeed &&
        (node.objectTypeId === link.sourceTypeId ||
          node.objectTypeId === link.targetTypeId)
    );

    for (const seed of seedNodes) {
      const seedRow =
        rowByNodeKey.get(seed.key) ||
        (await findRowForInstance(seed.objectTypeId, seed.instanceId));
      if (seedRow && !rowByNodeKey.has(seed.key)) {
        rowByNodeKey.set(seed.key, seedRow);
      }

      const seedIsSource = seed.objectTypeId === link.sourceTypeId;
      const fromSource =
        seedIsSource || link.sourceTypeId === link.targetTypeId;

      const neighborTypeId = fromSource ? link.targetTypeId : link.sourceTypeId;
      const seedColumn = fromSource ? link.sourceColumn : link.targetColumn;
      const neighborColumn = fromSource ? link.targetColumn : link.sourceColumn;

      const seedKeys = new Set<string>();
      if (seedColumn && seedRow) {
        const valued = resolveRowFieldValue(seedRow, seedColumn);
        if (valued != null && String(valued).trim()) {
          seedKeys.add(String(valued).trim());
        }
      }
      // 链接列指向对方主键时，种子 id 本身也常作为 join 值
      seedKeys.add(seed.instanceId);
      if (!seedKeys.size) {
        continue;
      }

      const neighborRows = await ensureTypeRows(neighborTypeId);
      const matchedNeighbors = neighborRows.filter((row) => {
        const neighborId = resolveInstanceId(row);
        if (
          neighborId != null &&
          seed.objectTypeId === neighborTypeId &&
          String(neighborId) === seed.instanceId
        ) {
          return false;
        }

        const candidateValues: string[] = [];
        if (neighborColumn) {
          const valued = resolveRowFieldValue(row, neighborColumn);
          if (valued != null && String(valued).trim()) {
            candidateValues.push(String(valued).trim());
          }
        }
        if (neighborId != null) {
          candidateValues.push(String(neighborId));
        }

        return Array.from(seedKeys).some((seedKey) =>
          candidateValues.some(
            (candidate) =>
              candidate === seedKey ||
              normalizeJoinKey(candidate) === normalizeJoinKey(seedKey)
          )
        );
      });

      for (const neighborRow of matchedNeighbors.slice(0, 20)) {
        const neighborId = resolveInstanceId(neighborRow);
        if (neighborId == null) {
          continue;
        }
        const neighborNode = await upsertNode(
          neighborTypeId,
          String(neighborId),
          {
            row: neighborRow,
            objectTypeName: typeNameMap.get(neighborTypeId)
          }
        );
        if (!neighborNode) {
          continue;
        }
        if (fromSource) {
          addEdge(link, seed.key, neighborNode.key);
        } else {
          addEdge(link, neighborNode.key, seed.key);
        }
      }
    }
  }

  // 补全属性（邻居节点可能先入图后才拿到行）
  for (const node of nodeMap.values()) {
    if (node.attributes?.length) {
      continue;
    }
    const row =
      rowByNodeKey.get(node.key) ||
      (await findRowForInstance(node.objectTypeId, node.instanceId));
    if (row) {
      rowByNodeKey.set(node.key, row);
      node.attributes = getInstanceDisplayFields(row as InstanceQueryRow);
      if (!node.label || node.label === node.instanceId) {
        node.label = resolveLabel(row, node.instanceId);
      }
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values())
  };
};

/** 预加载某对象类型实例选项（用于选择器） */
export const loadInstanceSelectOptions = async (
  objectTypeId: number,
  objectTypeName?: string
): Promise<ImplicitScopeInstance[]> => {
  const res = await listOntologyObjectTypeData({
    id: objectTypeId,
    page: 1,
    pageSize: 200
  });
  if (!isOntologyApiSuccess(res)) {
    return [];
  }
  return (res.data?.result || [])
    .map((row) => {
      const id = resolveInstanceId(row);
      if (id == null || id === '') {
        return null;
      }
      const instanceId = String(id);
      return {
        objectTypeId,
        objectTypeName,
        instanceId,
        instanceLabel: resolveLabel(row, instanceId)
      } as ImplicitScopeInstance;
    })
    .filter((item): item is ImplicitScopeInstance => Boolean(item));
};

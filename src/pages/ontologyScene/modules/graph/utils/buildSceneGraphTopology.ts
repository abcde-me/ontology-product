import type {
  GetOntologyTopologyResponse,
  LinkInfo,
  Ontologymetadataservicev1TopologyEdge,
  Ontologymetadataservicev1TopologyNode
} from '@/types/graphApi';
import type { ObjectType } from '@/types/objectType';
import { isDevObjectTypeId } from '@/utils/devObjectTypeStore';
import { normalizeOntologyTopology } from './normalizeOntologyTopology';
import {
  buildObjectTypeLookupMaps,
  resolveLinkEndpointObjectTypeId
} from './resolveLinkEndpointObjectType';

const toFiniteId = (value: unknown): number | undefined => {
  const id = Number(value);
  return Number.isFinite(id) ? id : undefined;
};

/** 收集链接端点涉及的对象类型 id（含 sourceObjectTypeInfo / targetObjectTypeInfo） */
const collectLinkEndpointIds = (links: LinkInfo[]): Set<number> => {
  const ids = new Set<number>();
  links.forEach((link) => {
    [
      link.sourceObjectTypeID,
      link.targetObjectTypeID,
      link.sourceObjectTypeInfo?.id,
      link.targetObjectTypeInfo?.id
    ].forEach((id) => {
      const normalizedId = toFiniteId(id);
      if (normalizedId != null) {
        ids.add(normalizedId);
      }
    });
  });
  return ids;
};

const pickCanonicalObjectType = (
  group: ObjectType[],
  linkEndpointIds: Set<number>
): ObjectType => {
  return (
    group.find((item) => {
      const objectTypeId = toFiniteId(item.id);
      return objectTypeId != null && linkEndpointIds.has(objectTypeId);
    }) ||
    group.find((item) => {
      const objectTypeId = toFiniteId(item.id);
      return objectTypeId != null && !isDevObjectTypeId(objectTypeId);
    }) ||
    group[0]
  );
};

const applyCanonicalGroupRemap = (
  group: ObjectType[],
  linkEndpointIds: Set<number>,
  remap: Map<number, number>
) => {
  if (group.length <= 1) {
    return;
  }

  const canonical = pickCanonicalObjectType(group, linkEndpointIds);
  const canonicalId = toFiniteId(canonical.id);
  if (canonicalId == null) {
    return;
  }

  group.forEach((item) => {
    const objectTypeId = toFiniteId(item.id);
    if (objectTypeId != null) {
      remap.set(objectTypeId, canonicalId);
    }
  });
};

const groupObjectTypesBy = (
  objectTypes: ObjectType[],
  pickKey: (objectType: ObjectType) => string | undefined
): Map<string, ObjectType[]> => {
  const groups = new Map<string, ObjectType[]>();

  objectTypes.forEach((objectType) => {
    const objectTypeId = toFiniteId(objectType.id);
    if (objectTypeId == null) {
      return;
    }

    const key = pickKey(objectType);
    if (!key) {
      return;
    }

    const group = groups.get(key) || [];
    group.push({ ...objectType, id: objectTypeId });
    groups.set(key, group);
  });

  return groups;
};

/**
 * 构建「任意 id -> 列表 canonical id」映射：
 * - 同 code 多条对象类型时，优先保留链接引用的 id，其次非 dev id
 * - 拓扑节点 id 按 code 对齐到列表 id
 */
export const buildEndpointIdRemap = (
  objectTypes: ObjectType[],
  links: LinkInfo[],
  topologyNodes: Ontologymetadataservicev1TopologyNode[] = []
): Map<number, number> => {
  const linkEndpointIds = collectLinkEndpointIds(links);
  const remap = new Map<number, number>();

  objectTypes.forEach((objectType) => {
    const objectTypeId = toFiniteId(objectType.id);
    if (objectTypeId == null) {
      return;
    }
    remap.set(objectTypeId, objectTypeId);
  });

  [
    groupObjectTypesBy(objectTypes, (objectType) => objectType.code?.trim()),
    groupObjectTypesBy(objectTypes, (objectType) =>
      objectType.originalTableName?.trim()
    ),
    groupObjectTypesBy(objectTypes, (objectType) => objectType.name?.trim())
  ].forEach((groups) => {
    groups.forEach((group) => {
      applyCanonicalGroupRemap(group, linkEndpointIds, remap);
    });
  });

  const codeToCanonicalId = new Map<string, number>();
  objectTypes.forEach((objectType) => {
    const code = objectType.code?.trim();
    const objectTypeId = toFiniteId(objectType.id);
    if (!code || objectTypeId == null) {
      return;
    }
    const canonicalId = remap.get(objectTypeId) ?? objectTypeId;
    codeToCanonicalId.set(code, canonicalId);
  });

  topologyNodes.forEach((node) => {
    const nodeId = toFiniteId(node.id);
    if (nodeId == null) {
      return;
    }
    const code = node.code?.trim();
    if (code && codeToCanonicalId.has(code)) {
      remap.set(nodeId, codeToCanonicalId.get(code)!);
      return;
    }
    if (!remap.has(nodeId)) {
      remap.set(nodeId, nodeId);
    }
  });

  return remap;
};

/** 同 code 去重后保留列表 canonical 对象类型 */
export const pickCanonicalObjectTypes = (
  objectTypes: ObjectType[],
  idRemap: Map<number, number>
): ObjectType[] => {
  const seen = new Set<number>();
  const result: ObjectType[] = [];

  objectTypes.forEach((objectType) => {
    const objectTypeId = toFiniteId(objectType.id);
    if (objectTypeId == null) {
      return;
    }
    const canonicalId = idRemap.get(objectTypeId) ?? objectTypeId;
    if (seen.has(canonicalId)) {
      return;
    }
    seen.add(canonicalId);
    const canonical =
      objectTypes.find((item) => toFiniteId(item.id) === canonicalId) ??
      objectType;
    result.push({ ...canonical, id: canonicalId });
  });

  return result;
};

/** 画布节点以对象类型列表 id 为准，属性从拓扑节点（按 id/code）合并 */
export const buildCanonicalTopologyNodes = (
  objectTypes: ObjectType[],
  topologyNodes: Ontologymetadataservicev1TopologyNode[] = []
): Ontologymetadataservicev1TopologyNode[] => {
  if (!objectTypes.length) {
    return topologyNodes;
  }

  const topologyById = new Map<number, Ontologymetadataservicev1TopologyNode>();
  const topologyByCode = new Map<
    string,
    Ontologymetadataservicev1TopologyNode
  >();

  topologyNodes.forEach((node) => {
    const nodeId = toFiniteId(node.id);
    if (nodeId != null) {
      topologyById.set(nodeId, node);
    }
    const code = node.code?.trim();
    if (code) {
      topologyByCode.set(code, node);
    }
  });

  return objectTypes
    .map((objectType) => {
      const objectTypeId = toFiniteId(objectType.id);
      if (objectTypeId == null) {
        return null;
      }
      const code = objectType.code?.trim();
      const matched =
        topologyById.get(objectTypeId) ||
        (code ? topologyByCode.get(code) : undefined);

      return {
        id: objectTypeId,
        code: objectType.code ?? matched?.code,
        name: objectType.name ?? matched?.name ?? objectType.code,
        description: objectType.description ?? matched?.description,
        icon: objectType.icon ?? matched?.icon,
        syncStatus: objectType.syncStatus ?? matched?.syncStatus,
        type: 'objectType',
        ontologyPhysicalPropertiesList:
          matched?.ontologyPhysicalPropertiesList ?? []
      };
    })
    .filter(
      (node): node is Ontologymetadataservicev1TopologyNode => node != null
    );
};

const resolveCanonicalEndpointId = (
  endpointIds: unknown[],
  endpointCode: string | undefined,
  endpointName: string | undefined,
  idRemap: Map<number, number>,
  codeToId: Map<string, number>,
  nameToId: Map<string, number>,
  validIds: Set<number>
): number | undefined => {
  for (const endpointId of endpointIds) {
    const normalizedId = toFiniteId(endpointId);
    if (normalizedId == null) {
      continue;
    }

    const canonical = idRemap.get(normalizedId) ?? normalizedId;
    if (validIds.has(canonical)) {
      return canonical;
    }
  }

  const code = endpointCode?.trim();
  if (code && codeToId.has(code)) {
    return codeToId.get(code);
  }

  const name = endpointName?.trim();
  if (name && nameToId.has(name)) {
    return nameToId.get(name);
  }

  return undefined;
};

/** 链接边端点统一映射为列表 canonical id 后输出拓扑边 */
export const mapLinksToTopologyEdges = (
  links: LinkInfo[],
  objectTypes: ObjectType[],
  idRemap: Map<number, number>,
  graphNodes: Ontologymetadataservicev1TopologyNode[] = []
): Ontologymetadataservicev1TopologyEdge[] => {
  const validIds = new Set<number>();
  objectTypes.forEach((item) => {
    const objectTypeId = toFiniteId(item.id);
    if (objectTypeId != null) {
      validIds.add(objectTypeId);
    }
  });
  graphNodes.forEach((node) => {
    const nodeId = toFiniteId(node.id);
    if (nodeId != null) {
      validIds.add(nodeId);
    }
  });

  const lookupMaps = buildObjectTypeLookupMaps(objectTypes);
  const codeToId = new Map<string, number>();
  const nameToId = new Map<string, number>();
  const objectTypeCodeById = new Map<number, string>();

  objectTypes.forEach((objectType) => {
    const objectTypeId = toFiniteId(objectType.id);
    if (objectTypeId == null) {
      return;
    }
    const objectTypeCode = objectType.code?.trim();
    if (objectTypeCode) {
      codeToId.set(objectTypeCode, objectTypeId);
      objectTypeCodeById.set(objectTypeId, objectTypeCode);
    }
    if (objectType.name?.trim()) {
      nameToId.set(objectType.name.trim(), objectTypeId);
    }
  });

  const resolveEndpointCode = (
    endpointId: unknown,
    endpointName: string | undefined
  ) => {
    const normalizedId = toFiniteId(endpointId);
    if (normalizedId != null) {
      const canonical = idRemap.get(normalizedId) ?? normalizedId;
      return objectTypeCodeById.get(canonical);
    }

    const name = endpointName?.trim();
    if (!name) {
      return undefined;
    }

    const matchedId = nameToId.get(name);
    if (matchedId != null) {
      return objectTypeCodeById.get(matchedId);
    }

    return undefined;
  };

  const resolveLinkEndpointId = (
    endpointIds: unknown[],
    endpointCode: string | undefined,
    endpointName: string | undefined,
    endpointInfo: { id?: number; name?: string } | undefined
  ) => {
    const primaryEndpointId = endpointIds
      .map((id) => toFiniteId(id))
      .find((id): id is number => id != null);

    const resolvedByLookup = resolveLinkEndpointObjectTypeId(
      primaryEndpointId,
      endpointName,
      endpointInfo,
      lookupMaps
    );

    const canonicalFromLookup =
      resolvedByLookup != null
        ? (idRemap.get(resolvedByLookup) ?? resolvedByLookup)
        : undefined;
    if (canonicalFromLookup != null && validIds.has(canonicalFromLookup)) {
      return canonicalFromLookup;
    }

    return resolveCanonicalEndpointId(
      endpointIds,
      endpointCode,
      endpointName,
      idRemap,
      codeToId,
      nameToId,
      validIds
    );
  };

  return links
    .map((link) => {
      const sourceName =
        link.sourceObjectTypeName ?? link.sourceObjectTypeInfo?.name;
      const targetName =
        link.targetObjectTypeName ?? link.targetObjectTypeInfo?.name;
      const sourceId = resolveLinkEndpointId(
        [link.sourceObjectTypeID, link.sourceObjectTypeInfo?.id],
        resolveEndpointCode(
          link.sourceObjectTypeID ?? link.sourceObjectTypeInfo?.id,
          sourceName
        ),
        sourceName,
        link.sourceObjectTypeInfo
      );
      const targetId = resolveLinkEndpointId(
        [link.targetObjectTypeID, link.targetObjectTypeInfo?.id],
        resolveEndpointCode(
          link.targetObjectTypeID ?? link.targetObjectTypeInfo?.id,
          targetName
        ),
        targetName,
        link.targetObjectTypeInfo
      );

      if (sourceId == null || targetId == null) {
        return null;
      }

      return {
        id: link.id,
        code: link.code,
        name: link.name,
        description: link.description,
        type: link.type,
        sourceId,
        targetId,
        syncStatus: link.syncStatus
      };
    })
    .filter(
      (edge): edge is Ontologymetadataservicev1TopologyEdge => edge != null
    );
};

/** 以对象类型列表 + 链接列表构建画布拓扑（节点/边 id 与列表一致） */
export const buildSceneGraphTopology = (
  objectTypes: ObjectType[],
  links: LinkInfo[],
  topologyNodes: Ontologymetadataservicev1TopologyNode[] = []
): GetOntologyTopologyResponse => {
  const idRemap = buildEndpointIdRemap(objectTypes, links, topologyNodes);
  const canonicalObjectTypes = pickCanonicalObjectTypes(objectTypes, idRemap);
  const nodes = buildCanonicalTopologyNodes(
    canonicalObjectTypes,
    topologyNodes
  );
  const edges = mapLinksToTopologyEdges(
    links,
    canonicalObjectTypes,
    idRemap,
    nodes
  );

  return normalizeOntologyTopology({ nodes, edges });
};

/**
 * 将关系挖掘发现的隐式关系挂接到实例，供对象浏览「明细」展示。
 */
import type {
  DiscoveredImplicitRelation,
  ImplicitDiscoveryAlgorithm
} from '../types';
import { buildInstanceNodeKey } from './scopeInstances';

const STORAGE_KEY = 'onto_instance_attached_implicit_relations_v1';

export interface AttachedImplicitRelation {
  id: string;
  /** 全局唯一挂接记录 ID */
  attachId: string;
  taskId: string;
  taskName?: string;
  sceneId: number;
  discoveryId: string;
  suggestedName: string;
  confidence: number;
  algorithm: ImplicitDiscoveryAlgorithm;
  /** 当前实例视角 */
  objectTypeId: number;
  objectTypeName?: string;
  instanceId: string;
  instanceLabel?: string;
  /** 对端实例 */
  peerObjectTypeId: number;
  peerObjectTypeName?: string;
  peerInstanceId: string;
  peerInstanceLabel?: string;
  direction: 'out' | 'in';
  evidenceTitles?: string[];
  attachedAt: string;
}

interface StoragePayload {
  items: AttachedImplicitRelation[];
}

const readStorage = (): StoragePayload => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { items: [] };
    }
    const parsed = JSON.parse(raw) as StoragePayload;
    return { items: Array.isArray(parsed?.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
};

const writeStorage = (payload: StoragePayload) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const buildInstanceAttachKey = (
  sceneId: number,
  objectTypeId: number,
  instanceId: string
) => `${sceneId}|${buildInstanceNodeKey(objectTypeId, instanceId)}`;

const attachRecordId = (
  taskId: string,
  discoveryId: string,
  objectTypeId: number,
  instanceId: string,
  peerObjectTypeId: number,
  peerInstanceId: string
) =>
  `${taskId}:${discoveryId}:${objectTypeId}:${instanceId}:${peerObjectTypeId}:${peerInstanceId}`;

export const listAttachedRelationsForInstance = (params: {
  sceneId: number;
  objectTypeId: number;
  instanceId: string;
}): AttachedImplicitRelation[] => {
  const { sceneId, objectTypeId, instanceId } = params;
  return readStorage()
    .items.filter(
      (item) =>
        item.sceneId === sceneId &&
        item.objectTypeId === objectTypeId &&
        String(item.instanceId) === String(instanceId)
    )
    .sort(
      (left, right) =>
        new Date(right.attachedAt).getTime() -
        new Date(left.attachedAt).getTime()
    );
};

export const removeAttachedRelation = (attachId: string) => {
  const payload = readStorage();
  payload.items = payload.items.filter((item) => item.attachId !== attachId);
  writeStorage(payload);
};

export interface AttachDiscoveriesInput {
  taskId: string;
  taskName?: string;
  sceneId: number;
  discoveries: DiscoveredImplicitRelation[];
  /**
   * 指定挂接到哪些端点：
   * - both：两端都挂（默认）
   * - source / target：仅一端
   */
  endpoints?: 'both' | 'source' | 'target';
}

export interface AttachDiscoveriesResult {
  attachedCount: number;
  skippedCount: number;
  instanceCount: number;
}

/**
 * 将选中的挖掘关系挂接到对应实例（按发现边的 source/target）
 */
export const attachDiscoveriesToInstances = (
  input: AttachDiscoveriesInput
): AttachDiscoveriesResult => {
  const endpoints = input.endpoints || 'both';
  const payload = readStorage();
  const existing = new Set(payload.items.map((item) => item.attachId));
  const touchedInstances = new Set<string>();
  let attachedCount = 0;
  let skippedCount = 0;
  const now = new Date().toISOString();

  const pushOne = (
    discovery: DiscoveredImplicitRelation,
    side: 'source' | 'target'
  ) => {
    const isSource = side === 'source';
    const objectTypeId = isSource
      ? discovery.sourceObjectTypeId
      : discovery.targetObjectTypeId;
    const instanceId = isSource
      ? discovery.sourceInstanceId
      : discovery.targetInstanceId;
    const instanceLabel = isSource
      ? discovery.sourceNodeName
      : discovery.targetNodeName;
    const peerObjectTypeId = isSource
      ? discovery.targetObjectTypeId
      : discovery.sourceObjectTypeId;
    const peerInstanceId = isSource
      ? discovery.targetInstanceId
      : discovery.sourceInstanceId;
    const peerInstanceLabel = isSource
      ? discovery.targetNodeName
      : discovery.sourceNodeName;

    if (
      objectTypeId == null ||
      !instanceId ||
      peerObjectTypeId == null ||
      !peerInstanceId
    ) {
      skippedCount += 1;
      return;
    }

    const attachId = attachRecordId(
      input.taskId,
      discovery.id,
      objectTypeId,
      instanceId,
      peerObjectTypeId,
      peerInstanceId
    );
    if (existing.has(attachId)) {
      skippedCount += 1;
      return;
    }

    payload.items.push({
      id: discovery.id,
      attachId,
      taskId: input.taskId,
      taskName: input.taskName,
      sceneId: input.sceneId,
      discoveryId: discovery.id,
      suggestedName: discovery.suggestedName,
      confidence: discovery.confidence,
      algorithm: discovery.algorithm,
      objectTypeId,
      objectTypeName: undefined,
      instanceId,
      instanceLabel,
      peerObjectTypeId,
      peerObjectTypeName: undefined,
      peerInstanceId,
      peerInstanceLabel,
      direction: isSource ? 'out' : 'in',
      evidenceTitles: discovery.evidence?.map((item) => item.title),
      attachedAt: now
    });
    existing.add(attachId);
    attachedCount += 1;
    touchedInstances.add(
      buildInstanceAttachKey(input.sceneId, objectTypeId, instanceId)
    );
  };

  input.discoveries.forEach((discovery) => {
    if (endpoints === 'both' || endpoints === 'source') {
      pushOne(discovery, 'source');
    }
    if (endpoints === 'both' || endpoints === 'target') {
      pushOne(discovery, 'target');
    }
  });

  writeStorage(payload);
  return {
    attachedCount,
    skippedCount,
    instanceCount: touchedInstances.size
  };
};

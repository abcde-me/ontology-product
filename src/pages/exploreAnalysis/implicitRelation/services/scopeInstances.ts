import type {
  ImplicitAnalysisScope,
  ImplicitScopeInstance,
  InstanceScopeMode
} from '../types';
import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';
import { resolveInstanceId } from '@/pages/exploreAnalysis/objectBrowse/utils/instanceRow';
import type { InstanceQueryRow } from '@/pages/exploreAnalysis/objectBrowse/types';

/** 每个对象类型最多载入的实例数（全部模式） */
export const MAX_INSTANCES_PER_TYPE = 100;

export const buildInstanceNodeKey = (
  objectTypeId: number,
  instanceId: string
) => `${objectTypeId}:${instanceId}`;

export const parseInstanceNodeKey = (
  key: string
): { objectTypeId: number; instanceId: string } | null => {
  const idx = key.indexOf(':');
  if (idx <= 0) {
    return null;
  }
  const objectTypeId = Number(key.slice(0, idx));
  const instanceId = key.slice(idx + 1);
  if (!Number.isFinite(objectTypeId) || !instanceId) {
    return null;
  }
  return { objectTypeId, instanceId };
};

const resolveInstanceLabel = (
  row: InstanceQueryRow,
  fallback: string
): string => {
  const preferred = ['name', 'title', 'label', 'Name', 'TITLE'];
  for (const key of preferred) {
    const value = row[key];
    if (value != null && String(value).trim()) {
      return String(value);
    }
  }
  return fallback;
};

export const fetchObjectTypeInstances = async (
  objectTypeId: number,
  objectTypeName?: string,
  pageSize = MAX_INSTANCES_PER_TYPE
): Promise<ImplicitScopeInstance[]> => {
  const res = await listOntologyObjectTypeData({
    id: objectTypeId,
    page: 1,
    pageSize
  });

  if (res.status !== 200 || res.code !== '') {
    throw new Error(`加载对象类型实例失败：${objectTypeName || objectTypeId}`);
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
        instanceLabel: resolveInstanceLabel(row, instanceId)
      } as ImplicitScopeInstance;
    })
    .filter((item): item is ImplicitScopeInstance => Boolean(item));
};

/**
 * 根据任务范围解析最终参与发现的实例列表
 */
export const resolveScopeInstances = async (
  scope: ImplicitAnalysisScope
): Promise<ImplicitScopeInstance[]> => {
  if (!scope.objectTypes.length) {
    throw new Error('请至少选择一个对象类型');
  }

  if (scope.instanceMode === 'selected') {
    if (!scope.instances.length) {
      throw new Error('请选择至少一个实例');
    }
    return scope.instances;
  }

  const batches = await Promise.all(
    scope.objectTypes.map((ot) => fetchObjectTypeInstances(ot.id, ot.name))
  );
  const merged = batches.flat();
  if (!merged.length) {
    throw new Error('所选对象类型下暂无实例数据');
  }
  return merged;
};

export const formatInstanceScopeSummary = (
  mode: InstanceScopeMode,
  instanceCount: number,
  objectTypeCount: number
) => {
  if (mode === 'all') {
    return `全部实例（${objectTypeCount} 个对象类型）`;
  }
  return `指定 ${instanceCount} 个实例`;
};

export const formatObjectTypeSummary = (
  objectTypes: ImplicitAnalysisScope['objectTypes']
) => {
  if (!objectTypes.length) {
    return '未选择';
  }
  if (objectTypes.length <= 2) {
    return objectTypes.map((item) => item.name || `#${item.id}`).join('、');
  }
  return `${objectTypes[0].name || `#${objectTypes[0].id}`} 等 ${objectTypes.length} 个`;
};

export const validateAnalysisScope = (
  scope: Partial<ImplicitAnalysisScope> | undefined
): string | null => {
  if (!scope?.ontologySceneId) {
    return '请选择本体图谱';
  }
  if (!scope.objectTypes?.length) {
    return '请选择对象类型';
  }
  if (scope.instanceMode === 'selected' && !scope.instances?.length) {
    return '请选择至少一个实例';
  }
  return null;
};

import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';
import type { ImplicitAnalysisScope } from '@/pages/exploreAnalysis/implicitRelation/types';
import { resolveScopeInstances } from '@/pages/exploreAnalysis/implicitRelation/services/scopeInstances';
import {
  extractSpatioTemporalFeature,
  haversineKm
} from '@/pages/exploreAnalysis/implicitRelation/services/spatiotemporalFeatures';
import { resolveInstanceId } from '@/pages/exploreAnalysis/objectBrowse/utils/instanceRow';
import { ENTITY_ID_KEYS } from '../constants';
import type { SpatiotemporalDataset, SpatiotemporalPoint } from '../types';

const pickEntityKey = (
  row: Record<string, unknown>,
  instanceId: string
): string => {
  for (const key of ENTITY_ID_KEYS) {
    if (Object.prototype.hasOwnProperty.call(row, key) && row[key] != null) {
      return String(row[key]).trim() || instanceId;
    }
  }
  const entries = Object.entries(row);
  for (const key of ENTITY_ID_KEYS) {
    const lower = key.toLowerCase();
    const found = entries.find(([field]) =>
      field.toLowerCase().includes(lower)
    );
    if (found && found[1] != null) {
      return String(found[1]).trim() || instanceId;
    }
  }
  return instanceId;
};

const buildBounds = (points: SpatiotemporalPoint[]) => {
  const lons = points.map((item) => item.lon);
  const lats = points.map((item) => item.lat);
  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  };
};

export const loadSpatiotemporalDataset = async (
  scope: ImplicitAnalysisScope
): Promise<SpatiotemporalDataset> => {
  const instances = await resolveScopeInstances(scope);
  if (!instances.length) {
    throw new Error('所选范围内暂无实例');
  }

  const byType = new Map<number, typeof instances>();
  instances.forEach((item) => {
    if (!byType.has(item.objectTypeId)) {
      byType.set(item.objectTypeId, []);
    }
    byType.get(item.objectTypeId)!.push(item);
  });

  const points: SpatiotemporalPoint[] = [];

  await Promise.all(
    Array.from(byType.entries()).map(async ([objectTypeId, items]) => {
      const wanted = new Set(items.map((item) => item.instanceId));
      const metaMap = new Map(
        items.map((item) => [item.instanceId, item] as const)
      );

      try {
        const res = await listOntologyObjectTypeData({
          id: objectTypeId,
          page: 1,
          pageSize: Math.max(200, items.length)
        });
        if (res.status !== 200 || res.code !== '') {
          return;
        }

        (res.data?.result || []).forEach((row) => {
          const id = resolveInstanceId(row);
          if (id == null || id === '') {
            return;
          }
          const instanceId = String(id);
          if (!wanted.has(instanceId)) {
            return;
          }

          const feature = extractSpatioTemporalFeature(
            `${objectTypeId}:${instanceId}`,
            metaMap.get(instanceId)?.instanceLabel || instanceId,
            row
          );

          if (
            feature.lon == null ||
            feature.lat == null ||
            feature.timeMs == null
          ) {
            return;
          }

          const meta = metaMap.get(instanceId);
          points.push({
            key: feature.key,
            instanceId,
            objectTypeId,
            objectTypeName: meta?.objectTypeName,
            label: feature.label,
            lon: feature.lon,
            lat: feature.lat,
            timeMs: feature.timeMs,
            entityKey: pickEntityKey(row, instanceId),
            spaceSource: feature.spaceSource,
            timeSource: feature.timeSource
          });
        });
      } catch {
        // ignore single type failure
      }
    })
  );

  if (!points.length) {
    throw new Error(
      '未找到同时具备经纬度与时间字段的有效实例，请检查对象属性是否包含位置与时间信息'
    );
  }

  const times = points.map((item) => item.timeMs);
  const typeMap = new Map<string, number>();
  points.forEach((item) => {
    const name = item.objectTypeName || `类型#${item.objectTypeId}`;
    typeMap.set(name, (typeMap.get(name) || 0) + 1);
  });

  return {
    scope,
    points,
    timeRange: {
      min: Math.min(...times),
      max: Math.max(...times)
    },
    bounds: buildBounds(points),
    quality: {
      requestedInstances: instances.length,
      validPoints: points.length,
      objectTypeCount: byType.size,
      objectTypeBreakdown: Array.from(typeMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      timeSpanHours: Math.max(
        (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60),
        0.01
      )
    }
  };
};

export const pathDistanceKm = (points: SpatiotemporalPoint[]): number => {
  if (points.length < 2) {
    return 0;
  }
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    total += haversineKm(prev.lon, prev.lat, curr.lon, curr.lat);
  }
  return total;
};

export const centroidOf = (
  points: Array<{ lon: number; lat: number }>
): { lon: number; lat: number } => {
  if (!points.length) {
    return { lon: 0, lat: 0 };
  }
  const sum = points.reduce(
    (acc, item) => ({
      lon: acc.lon + item.lon,
      lat: acc.lat + item.lat
    }),
    { lon: 0, lat: 0 }
  );
  return {
    lon: sum.lon / points.length,
    lat: sum.lat / points.length
  };
};

export const spreadRadiusKm = (points: SpatiotemporalPoint[]): number => {
  if (points.length < 2) {
    return 0;
  }
  const center = centroidOf(points);
  const distances = points.map((item) =>
    haversineKm(center.lon, center.lat, item.lon, item.lat)
  );
  return distances.reduce((acc, item) => acc + item, 0) / distances.length;
};

export const formatDurationHours = (ms: number): number =>
  Math.max(ms / (1000 * 60 * 60), 0.01);

export const formatTimeLabel = (ms: number): string => {
  const date = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

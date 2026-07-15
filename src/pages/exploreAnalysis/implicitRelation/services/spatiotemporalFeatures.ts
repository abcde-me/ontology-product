/**
 * 从实例属性中抽取时空特征（经纬度 / 时间戳）
 */
import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';
import { resolveInstanceId } from '@/pages/exploreAnalysis/objectBrowse/utils/instanceRow';
import type { ImplicitScopeInstance } from '../types';
import { buildInstanceNodeKey } from './scopeInstances';

export interface SpatioTemporalFeature {
  key: string;
  label: string;
  lon?: number;
  lat?: number;
  timeMs?: number;
  spaceSource?: string;
  timeSource?: string;
}

const LON_KEYS = [
  'longitude',
  'lon',
  'lng',
  'long',
  'geo_longitude',
  'geoLongitude',
  '经度',
  'Longitude',
  'LON',
  'LNG'
];

const LAT_KEYS = [
  'latitude',
  'lat',
  'geo_latitude',
  'geoLatitude',
  '纬度',
  'Latitude',
  'LAT'
];

const TIME_KEYS = [
  'time',
  'datetime',
  'timestamp',
  'event_time',
  'eventTime',
  'occur_time',
  'occurTime',
  'create_time',
  'createTime',
  'update_time',
  'updateTime',
  'start_time',
  'startTime',
  'end_time',
  'endTime',
  '时间',
  '发生时间',
  '创建时间'
];

const GEO_POINT_KEYS = [
  'geoPoint',
  'geo_point',
  'geopoint',
  'location',
  '坐标'
];

const toFiniteNumber = (value: unknown): number | undefined => {
  if (value == null || value === '') {
    return undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const text = String(value).trim();
  if (!text) {
    return undefined;
  }
  const numeric = Number(text);
  if (Number.isFinite(numeric)) {
    return numeric;
  }
  return undefined;
};

const pickField = (
  row: Record<string, unknown>,
  keys: string[]
): { key: string; value: unknown } | null => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key) && row[key] != null) {
      return { key, value: row[key] };
    }
  }
  // 宽松匹配：字段名包含关键字
  const entries = Object.entries(row);
  for (const key of keys) {
    const lower = key.toLowerCase();
    const found = entries.find(([field]) =>
      field.toLowerCase().includes(lower)
    );
    if (found && found[1] != null) {
      return { key: found[0], value: found[1] };
    }
  }
  return null;
};

const parseGeoPoint = (
  value: unknown
): { lon?: number; lat?: number; source?: string } => {
  if (value == null) {
    return {};
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const lon = toFiniteNumber(obj.longitude ?? obj.lon ?? obj.lng ?? obj.lg);
    const lat = toFiniteNumber(obj.latitude ?? obj.lat);
    if (lon != null && lat != null) {
      return { lon, lat, source: 'geoPoint' };
    }
  }
  const text = String(value).trim();
  // "lng,lat" / "lon lat"
  const parts = text.split(/[,，\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = toFiniteNumber(parts[0]);
    const b = toFiniteNumber(parts[1]);
    if (a != null && b != null) {
      // 粗略判断：经度通常绝对值更大或在 [-180,180]
      if (Math.abs(a) <= 180 && Math.abs(b) <= 90) {
        return { lon: a, lat: b, source: 'geoPoint' };
      }
      if (Math.abs(b) <= 180 && Math.abs(a) <= 90) {
        return { lon: b, lat: a, source: 'geoPoint' };
      }
    }
  }
  return {};
};

const parseTimeMs = (value: unknown): number | undefined => {
  if (value == null || value === '') {
    return undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    // 秒级时间戳兜底
    if (value > 1e11) {
      return value;
    }
    if (value > 1e9) {
      return value * 1000;
    }
    return undefined;
  }
  const text = String(value).trim();
  const asNumber = Number(text);
  if (Number.isFinite(asNumber) && asNumber > 1e9) {
    return asNumber > 1e11 ? asNumber : asNumber * 1000;
  }
  const parsed = Date.parse(text.replace(/年|月/g, '-').replace(/日/g, ''));
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return undefined;
};

export const extractSpatioTemporalFeature = (
  key: string,
  label: string,
  row: Record<string, unknown>
): SpatioTemporalFeature => {
  let lon: number | undefined;
  let lat: number | undefined;
  let spaceSource: string | undefined;

  const lonField = pickField(row, LON_KEYS);
  const latField = pickField(row, LAT_KEYS);
  if (lonField && latField) {
    lon = toFiniteNumber(lonField.value);
    lat = toFiniteNumber(latField.value);
    if (lon != null && lat != null) {
      spaceSource = `${lonField.key}/${latField.key}`;
    }
  }

  if (lon == null || lat == null) {
    const geoField = pickField(row, GEO_POINT_KEYS);
    if (geoField) {
      const point = parseGeoPoint(geoField.value);
      lon = point.lon;
      lat = point.lat;
      if (lon != null && lat != null) {
        spaceSource = geoField.key;
      }
    }
  }

  let timeMs: number | undefined;
  let timeSource: string | undefined;
  const timeField = pickField(row, TIME_KEYS);
  if (timeField) {
    timeMs = parseTimeMs(timeField.value);
    if (timeMs != null) {
      timeSource = timeField.key;
    }
  }

  return {
    key,
    label,
    lon,
    lat,
    timeMs,
    spaceSource,
    timeSource
  };
};

/** Haversine 距离（公里） */
export const haversineKm = (
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * 为参与发现的实例加载时空特征
 */
export const loadSpatioTemporalFeatures = async (
  instances: ImplicitScopeInstance[]
): Promise<Map<string, SpatioTemporalFeature>> => {
  const byType = new Map<number, ImplicitScopeInstance[]>();
  instances.forEach((item) => {
    if (!byType.has(item.objectTypeId)) {
      byType.set(item.objectTypeId, []);
    }
    byType.get(item.objectTypeId)!.push(item);
  });

  const result = new Map<string, SpatioTemporalFeature>();

  await Promise.all(
    Array.from(byType.entries()).map(async ([objectTypeId, items]) => {
      const wanted = new Set(items.map((item) => item.instanceId));
      const labelMap = new Map(
        items.map((item) => [
          item.instanceId,
          item.instanceLabel || item.instanceId
        ])
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
          const key = buildInstanceNodeKey(objectTypeId, instanceId);
          result.set(
            key,
            extractSpatioTemporalFeature(
              key,
              labelMap.get(instanceId) || instanceId,
              row
            )
          );
        });
      } catch {
        // ignore single type failure
      }

      // 未命中数据的实例仍占位，便于统计
      items.forEach((item) => {
        const key = buildInstanceNodeKey(item.objectTypeId, item.instanceId);
        if (!result.has(key)) {
          result.set(key, {
            key,
            label: item.instanceLabel || item.instanceId
          });
        }
      });
    })
  );

  return result;
};

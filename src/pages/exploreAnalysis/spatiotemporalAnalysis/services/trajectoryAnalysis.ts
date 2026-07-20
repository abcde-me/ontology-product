import { STOP_MAX_DISTANCE_KM } from '../constants';
import type {
  SpatiotemporalDataset,
  TrajectoryAnalysisParams,
  TrajectoryAnalysisResult,
  TrajectorySegment,
  TrajectoryStopPoint
} from '../types';
import {
  formatDurationHours,
  formatTimeLabel,
  pathDistanceKm
} from './loadDataset';
import { haversineKm } from '@/pages/exploreAnalysis/implicitRelation/services/spatiotemporalFeatures';

const detectStops = (
  points: TrajectorySegment['points'],
  dwellMinutes: number
): TrajectoryStopPoint[] => {
  const stops: TrajectoryStopPoint[] = [];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const distanceKm = haversineKm(prev.lon, prev.lat, curr.lon, curr.lat);
    const dwell = (curr.timeMs - prev.timeMs) / (1000 * 60);
    if (distanceKm <= STOP_MAX_DISTANCE_KM && dwell >= dwellMinutes) {
      stops.push({
        lon: prev.lon,
        lat: prev.lat,
        dwellMinutes: dwell,
        startMs: prev.timeMs,
        endMs: curr.timeMs,
        label: prev.label
      });
    }
  }
  return stops;
};

const maxLegSpeedKmh = (points: TrajectorySegment['points']): number => {
  let maxSpeed = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const hours = formatDurationHours(curr.timeMs - prev.timeMs);
    const distanceKm = haversineKm(prev.lon, prev.lat, curr.lon, curr.lat);
    maxSpeed = Math.max(maxSpeed, distanceKm / hours);
  }
  return maxSpeed;
};

export const runTrajectoryAnalysis = (
  dataset: SpatiotemporalDataset,
  params: TrajectoryAnalysisParams
): TrajectoryAnalysisResult => {
  const grouped = new Map<string, TrajectorySegment>();

  dataset.points.forEach((point) => {
    const groupKey = `${point.objectTypeId}:${point.entityKey}`;
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        entityKey: point.entityKey,
        entityLabel: point.label,
        objectTypeName: point.objectTypeName,
        points: [],
        distanceKm: 0,
        durationHours: 0,
        avgSpeedKmh: 0,
        maxSpeedKmh: 0,
        stopCount: 0,
        stops: [],
        isSpeedAnomaly: false,
        startTimeMs: point.timeMs,
        endTimeMs: point.timeMs
      });
    }
    grouped.get(groupKey)!.points.push(point);
  });

  const trajectories = Array.from(grouped.values())
    .map((segment) => {
      const sorted = [...segment.points].sort((a, b) => a.timeMs - b.timeMs);
      const distanceKm = pathDistanceKm(sorted);
      const durationHours =
        sorted.length >= 2
          ? formatDurationHours(
              sorted[sorted.length - 1].timeMs - sorted[0].timeMs
            )
          : 0;
      const avgSpeedKmh = durationHours > 0 ? distanceKm / durationHours : 0;
      const maxSpeedKmh = sorted.length >= 2 ? maxLegSpeedKmh(sorted) : 0;
      const stops = detectStops(sorted, params.stopDwellMinutes);

      return {
        ...segment,
        entityLabel: sorted[0]?.label || segment.entityLabel,
        points: sorted,
        distanceKm,
        durationHours,
        avgSpeedKmh,
        maxSpeedKmh,
        stopCount: stops.length,
        stops,
        isSpeedAnomaly: maxSpeedKmh > params.speedAnomalyKmh,
        startTimeMs: sorted[0]?.timeMs || 0,
        endTimeMs: sorted[sorted.length - 1]?.timeMs || 0
      };
    })
    .filter(
      (item) =>
        item.points.length >= params.minPointCount &&
        item.distanceKm >= params.minDistanceKm
    )
    .sort(
      (a, b) => b.distanceKm - a.distanceKm || b.points.length - a.points.length
    );

  const totalDistanceKm = trajectories.reduce(
    (acc, item) => acc + item.distanceKm,
    0
  );

  return {
    trajectories,
    summary: {
      entityCount: trajectories.length,
      pointCount: dataset.points.length,
      totalDistanceKm,
      avgSegmentKm:
        trajectories.length > 0 ? totalDistanceKm / trajectories.length : 0,
      anomalyCount: trajectories.filter((item) => item.isSpeedAnomaly).length,
      totalStopCount: trajectories.reduce(
        (acc, item) => acc + item.stopCount,
        0
      )
    }
  };
};

export const buildTrajectorySummaryText = (
  result: TrajectoryAnalysisResult
): string => {
  const top = result.trajectories[0];
  if (!top) {
    return '当前参数下暂无有效轨迹，可尝试降低「最少点数」或「最短路径」阈值';
  }
  const timeRange = `${formatTimeLabel(top.startTimeMs)} → ${formatTimeLabel(top.endTimeMs)}`;
  const anomalyHint =
    result.summary.anomalyCount > 0
      ? `，其中 ${result.summary.anomalyCount} 条存在速度异常`
      : '';
  const stopHint =
    result.summary.totalStopCount > 0
      ? `，识别驻留点 ${result.summary.totalStopCount} 处`
      : '';
  return `共 ${result.summary.entityCount} 条轨迹、${result.summary.pointCount} 个时空点${stopHint}${anomalyHint}；最长路径「${top.entityLabel}」约 ${top.distanceKm.toFixed(1)} km（${timeRange}）。`;
};

import { DEFAULT_ANALYSIS_PARAMS } from '../constants';
import type {
  EvolutionAnalysisParams,
  EvolutionAnalysisResult,
  EvolutionSnapshot
} from '../types';
import type { SpatiotemporalDataset } from '../types';
import { centroidOf, formatTimeLabel, spreadRadiusKm } from './loadDataset';
import { getRegionIdForPoint, runRegionAnalysis } from './regionAnalysis';

export const runEvolutionAnalysis = (
  dataset: SpatiotemporalDataset,
  params: EvolutionAnalysisParams
): EvolutionAnalysisResult => {
  const bucketCount = params.bucketCount;
  const { min, max } = dataset.timeRange;
  const span = Math.max(max - min, 1);
  const bucketMs = span / bucketCount;
  const regionResult = runRegionAnalysis(
    dataset,
    DEFAULT_ANALYSIS_PARAMS.region
  );

  const snapshots: EvolutionSnapshot[] = [];
  let prevCount = 0;

  for (let i = 0; i < bucketCount; i += 1) {
    const startMs = min + i * bucketMs;
    const endMs = i === bucketCount - 1 ? max : min + (i + 1) * bucketMs;
    const bucketPoints = dataset.points.filter(
      (item) => item.timeMs >= startMs && item.timeMs <= endMs
    );

    if (!bucketPoints.length) {
      snapshots.push({
        bucketIndex: i,
        label: `${formatTimeLabel(startMs)} ~ ${formatTimeLabel(endMs)}`,
        startMs,
        endMs,
        count: 0,
        centerLon: (dataset.bounds.minLon + dataset.bounds.maxLon) / 2,
        centerLat: (dataset.bounds.minLat + dataset.bounds.maxLat) / 2,
        spreadKm: 0,
        hotRegionCount: 0,
        growthRate: prevCount > 0 ? -100 : 0
      });
      continue;
    }

    const center = centroidOf(bucketPoints);
    const regionHits = new Set<string>();
    bucketPoints.forEach((point) => {
      regionHits.add(
        getRegionIdForPoint(point, dataset, regionResult.gridSize)
      );
    });

    const count = bucketPoints.length;
    const growthRate =
      prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 0;
    prevCount = count;

    snapshots.push({
      bucketIndex: i,
      label: `${formatTimeLabel(startMs)} ~ ${formatTimeLabel(endMs)}`,
      startMs,
      endMs,
      count,
      centerLon: center.lon,
      centerLat: center.lat,
      spreadKm: spreadRadiusKm(bucketPoints),
      hotRegionCount: regionHits.size,
      growthRate
    });
  }

  const counts = snapshots.map((item) => item.count);
  const peakCount = Math.max(...counts, 0);
  const peakBucket = snapshots.find((item) => item.count === peakCount);
  const firstSpread = snapshots.find((item) => item.count > 0)?.spreadKm || 0;
  const lastSpread =
    [...snapshots].reverse().find((item) => item.count > 0)?.spreadKm || 0;
  const spreadDelta = lastSpread - firstSpread;

  let trend: EvolutionAnalysisResult['summary']['trend'] = 'stable';
  if (Math.abs(spreadDelta) > 1) {
    trend = spreadDelta > 0 ? 'expanding' : 'contracting';
  }
  const firstCenter = snapshots.find((item) => item.count > 0);
  const lastCenter = [...snapshots].reverse().find((item) => item.count > 0);
  if (
    firstCenter &&
    lastCenter &&
    Math.abs(firstCenter.centerLon - lastCenter.centerLon) +
      Math.abs(firstCenter.centerLat - lastCenter.centerLat) >
      0.05
  ) {
    trend = 'shifted';
  }

  const startCount = counts.find((item) => item > 0) || 0;
  const endCount = [...counts].reverse().find((item) => item > 0) || 0;
  const totalGrowthRate =
    startCount > 0 ? ((endCount - startCount) / startCount) * 100 : 0;

  return {
    snapshots,
    summary: {
      bucketCount,
      peakCount,
      trend,
      totalGrowthRate,
      peakBucketLabel: peakBucket?.label
    }
  };
};

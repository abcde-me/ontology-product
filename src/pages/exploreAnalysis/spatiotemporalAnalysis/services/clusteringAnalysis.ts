import type {
  ClusteringAnalysisParams,
  ClusteringAnalysisResult,
  SpatiotemporalCluster,
  SpatiotemporalDataset,
  SpatiotemporalPoint
} from '../types';
import { centroidOf, formatDurationHours } from './loadDataset';
import { haversineKm } from '@/pages/exploreAnalysis/implicitRelation/services/spatiotemporalFeatures';

const buildIsNeighbor =
  (epsKm: number, timeWindowMs: number) =>
  (a: SpatiotemporalPoint, b: SpatiotemporalPoint): boolean => {
    if (haversineKm(a.lon, a.lat, b.lon, b.lat) > epsKm) {
      return false;
    }
    return Math.abs(a.timeMs - b.timeMs) <= timeWindowMs;
  };

const expandCluster = (
  points: SpatiotemporalPoint[],
  seedIndex: number,
  visited: Set<number>,
  clusterIndices: number[],
  isNeighbor: (a: SpatiotemporalPoint, b: SpatiotemporalPoint) => boolean
) => {
  const queue = [seedIndex];
  visited.add(seedIndex);
  clusterIndices.push(seedIndex);

  while (queue.length) {
    const current = queue.shift()!;
    for (let i = 0; i < points.length; i += 1) {
      if (visited.has(i)) {
        continue;
      }
      if (!isNeighbor(points[current], points[i])) {
        continue;
      }
      visited.add(i);
      clusterIndices.push(i);
      queue.push(i);
    }
  }
};

const resolveRiskLevel = (
  memberCount: number,
  timeSpanHours: number,
  radiusKm: number
): SpatiotemporalCluster['riskLevel'] => {
  const intensity =
    memberCount / Math.max(timeSpanHours, 0.5) / Math.max(radiusKm, 1);
  if (memberCount >= 5 && intensity >= 0.8) {
    return 'high';
  }
  if (memberCount >= 3) {
    return 'medium';
  }
  return 'low';
};

export const runClusteringAnalysis = (
  dataset: SpatiotemporalDataset,
  params: ClusteringAnalysisParams
): ClusteringAnalysisResult => {
  const points = [...dataset.points];
  const visited = new Set<number>();
  const clusters: SpatiotemporalCluster[] = [];
  let noiseCount = 0;
  const timeWindowMs = params.timeWindowHours * 60 * 60 * 1000;
  const isNeighbor = buildIsNeighbor(params.epsKm, timeWindowMs);

  for (let i = 0; i < points.length; i += 1) {
    if (visited.has(i)) {
      continue;
    }

    const neighbors = points
      .map((_, index) => index)
      .filter((index) => index !== i && isNeighbor(points[i], points[index]));

    if (neighbors.length + 1 < params.minPoints) {
      visited.add(i);
      noiseCount += 1;
      continue;
    }

    const clusterIndices: number[] = [];
    expandCluster(points, i, visited, clusterIndices, isNeighbor);

    if (clusterIndices.length < params.minPoints) {
      noiseCount += clusterIndices.length;
      continue;
    }

    const members = clusterIndices.map((index) => points[index]);
    const center = centroidOf(members);
    const times = members.map((item) => item.timeMs);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const radiusKm =
      members.reduce(
        (acc, item) =>
          acc + haversineKm(center.lon, center.lat, item.lon, item.lat),
        0
      ) / members.length;
    const timeSpanHours = formatDurationHours(maxTime - minTime);
    const intensity =
      members.length / Math.max(timeSpanHours, 0.5) / Math.max(radiusKm, 1);

    clusters.push({
      id: `cluster-${clusters.length + 1}`,
      label: `聚集簇 ${clusters.length + 1}`,
      centerLon: center.lon,
      centerLat: center.lat,
      centerTimeMs: (minTime + maxTime) / 2,
      memberCount: members.length,
      members,
      radiusKm,
      timeSpanHours,
      intensity,
      riskLevel: resolveRiskLevel(members.length, timeSpanHours, radiusKm)
    });
  }

  clusters.sort(
    (a, b) => b.intensity - a.intensity || b.memberCount - a.memberCount
  );

  return {
    clusters,
    noiseCount,
    summary: {
      clusterCount: clusters.length,
      coveredPoints: clusters.reduce((acc, item) => acc + item.memberCount, 0),
      largestClusterSize: clusters[0]?.memberCount || 0,
      highRiskCount: clusters.filter((item) => item.riskLevel === 'high').length
    }
  };
};

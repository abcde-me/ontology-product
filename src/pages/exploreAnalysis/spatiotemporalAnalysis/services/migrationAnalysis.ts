import type {
  MigrationAnalysisParams,
  MigrationAnalysisResult,
  MigrationFlow,
  SpatiotemporalDataset
} from '../types';
import { DEFAULT_ANALYSIS_PARAMS } from '../constants';
import { formatTimeLabel, centroidOf } from './loadDataset';
import { getRegionIdForPoint, runRegionAnalysis } from './regionAnalysis';
import { haversineKm } from '@/pages/exploreAnalysis/implicitRelation/services/spatiotemporalFeatures';

export const runMigrationAnalysis = (
  dataset: SpatiotemporalDataset,
  params: MigrationAnalysisParams
): MigrationAnalysisResult => {
  const regionResult = runRegionAnalysis(
    dataset,
    DEFAULT_ANALYSIS_PARAMS.region
  );
  const regionMap = new Map(
    regionResult.regions.map((item) => [item.id, item] as const)
  );
  const span = dataset.timeRange.max - dataset.timeRange.min;
  const splitMs = dataset.timeRange.min + span * params.earlyPeriodRatio;

  const periodLabels: [string, string] = [
    `${formatTimeLabel(dataset.timeRange.min)} ~ ${formatTimeLabel(splitMs)}`,
    `${formatTimeLabel(splitMs)} ~ ${formatTimeLabel(dataset.timeRange.max)}`
  ];

  const earlyByEntity = new Map<
    string,
    { lon: number; lat: number; regionId: string }
  >();
  const lateByEntity = new Map<
    string,
    { lon: number; lat: number; regionId: string }
  >();

  const entityPoints = new Map<string, typeof dataset.points>();
  dataset.points.forEach((point) => {
    const key = `${point.objectTypeId}:${point.entityKey}`;
    if (!entityPoints.has(key)) {
      entityPoints.set(key, []);
    }
    entityPoints.get(key)!.push(point);
  });

  entityPoints.forEach((points, entityKey) => {
    const sorted = [...points].sort((a, b) => a.timeMs - b.timeMs);
    const earlyPoints = sorted.filter((item) => item.timeMs <= splitMs);
    const latePoints = sorted.filter((item) => item.timeMs > splitMs);

    const earlyRef = earlyPoints.length ? earlyPoints : [sorted[0]];
    const lateRef = latePoints.length
      ? latePoints
      : [sorted[sorted.length - 1]];

    const earlyCenter = centroidOf(earlyRef);
    const lateCenter = centroidOf(lateRef);
    const earlyRegionId = getRegionIdForPoint(
      { ...earlyRef[0], lon: earlyCenter.lon, lat: earlyCenter.lat },
      dataset,
      regionResult.gridSize
    );
    const lateRegionId = getRegionIdForPoint(
      { ...lateRef[0], lon: lateCenter.lon, lat: lateCenter.lat },
      dataset,
      regionResult.gridSize
    );

    earlyByEntity.set(entityKey, {
      lon: earlyCenter.lon,
      lat: earlyCenter.lat,
      regionId: earlyRegionId
    });
    lateByEntity.set(entityKey, {
      lon: lateCenter.lon,
      lat: lateCenter.lat,
      regionId: lateRegionId
    });
  });

  const totalEntities = earlyByEntity.size;
  const flowMap = new Map<string, MigrationFlow>();
  let totalDisplacement = 0;
  let migratingEntities = 0;

  earlyByEntity.forEach((early, entityKey) => {
    const late = lateByEntity.get(entityKey);
    if (!late) {
      return;
    }
    if (early.regionId === late.regionId) {
      return;
    }

    const distance = haversineKm(early.lon, early.lat, late.lon, late.lat);
    if (distance < params.minDisplacementKm) {
      return;
    }

    migratingEntities += 1;
    totalDisplacement += distance;

    const flowKey = `${early.regionId}->${late.regionId}`;
    const fromRegion = regionMap.get(early.regionId);
    const toRegion = regionMap.get(late.regionId);
    if (!flowMap.has(flowKey)) {
      flowMap.set(flowKey, {
        id: flowKey,
        fromRegionId: early.regionId,
        toRegionId: late.regionId,
        fromLabel: fromRegion
          ? `区域 R${fromRegion.row + 1}C${fromRegion.col + 1}`
          : early.regionId,
        toLabel: toRegion
          ? `区域 R${toRegion.row + 1}C${toRegion.col + 1}`
          : late.regionId,
        fromLon: fromRegion?.centerLon ?? early.lon,
        fromLat: fromRegion?.centerLat ?? early.lat,
        toLon: toRegion?.centerLon ?? late.lon,
        toLat: toRegion?.centerLat ?? late.lat,
        entityCount: 0,
        avgDistanceKm: 0,
        migrationRate: 0
      });
    }

    const flow = flowMap.get(flowKey)!;
    flow.entityCount += 1;
    flow.avgDistanceKm =
      (flow.avgDistanceKm * (flow.entityCount - 1) + distance) /
      flow.entityCount;
  });

  const flows = Array.from(flowMap.values())
    .map((flow) => ({
      ...flow,
      migrationRate:
        totalEntities > 0 ? (flow.entityCount / totalEntities) * 100 : 0
    }))
    .sort((a, b) => b.entityCount - a.entityCount);

  return {
    periodLabels,
    splitMs,
    flows,
    summary: {
      totalEntities,
      migratingEntities,
      migrationRate:
        totalEntities > 0 ? (migratingEntities / totalEntities) * 100 : 0,
      dominantFlow: flows[0],
      avgDisplacementKm:
        migratingEntities > 0 ? totalDisplacement / migratingEntities : 0
    }
  };
};

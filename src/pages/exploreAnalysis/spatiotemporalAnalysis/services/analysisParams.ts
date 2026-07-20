import { DEFAULT_ANALYSIS_PARAMS, USAGE_SCENARIOS } from '../constants';
import type {
  SpatiotemporalAnalysisParams,
  SpatiotemporalDataset,
  SpatiotemporalPoint,
  UsageScenario
} from '../types';

export const mergeAnalysisParams = (
  patch?: Partial<SpatiotemporalAnalysisParams>
): SpatiotemporalAnalysisParams => ({
  timeFilter: {
    ...DEFAULT_ANALYSIS_PARAMS.timeFilter,
    ...patch?.timeFilter
  },
  trajectory: {
    ...DEFAULT_ANALYSIS_PARAMS.trajectory,
    ...patch?.trajectory
  },
  clustering: {
    ...DEFAULT_ANALYSIS_PARAMS.clustering,
    ...patch?.clustering
  },
  region: {
    ...DEFAULT_ANALYSIS_PARAMS.region,
    ...patch?.region
  },
  migration: {
    ...DEFAULT_ANALYSIS_PARAMS.migration,
    ...patch?.migration
  },
  evolution: {
    ...DEFAULT_ANALYSIS_PARAMS.evolution,
    ...patch?.evolution
  }
});

export const applyUsageScenario = (
  scenario: UsageScenario
): {
  mode: UsageScenario['mode'];
  params: SpatiotemporalAnalysisParams;
  tip: string;
} => ({
  mode: scenario.mode,
  params: mergeAnalysisParams(scenario.paramsPatch),
  tip: scenario.tip
});

export const getScenarioById = (id: string): UsageScenario | undefined =>
  USAGE_SCENARIOS.find((item) => item.id === id);

export const filterDataset = (
  dataset: SpatiotemporalDataset,
  params: SpatiotemporalAnalysisParams
): SpatiotemporalDataset => {
  if (!params.timeFilter.enabled) {
    return dataset;
  }

  const startMs = params.timeFilter.startMs ?? dataset.timeRange.min;
  const endMs = params.timeFilter.endMs ?? dataset.timeRange.max;
  const points = dataset.points.filter(
    (item) => item.timeMs >= startMs && item.timeMs <= endMs
  );

  if (!points.length) {
    throw new Error('时间筛选后无有效时空点，请放宽时间范围');
  }

  const times = points.map((item) => item.timeMs);
  const lons = points.map((item) => item.lon);
  const lats = points.map((item) => item.lat);

  const typeMap = new Map<string, number>();
  points.forEach((item) => {
    const name = item.objectTypeName || `类型#${item.objectTypeId}`;
    typeMap.set(name, (typeMap.get(name) || 0) + 1);
  });

  return {
    ...dataset,
    points,
    timeRange: {
      min: Math.min(...times),
      max: Math.max(...times)
    },
    bounds: {
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats)
    },
    quality: {
      ...dataset.quality,
      validPoints: points.length,
      objectTypeBreakdown: Array.from(typeMap.entries()).map(
        ([name, count]) => ({ name, count })
      ),
      timeSpanHours: Math.max(
        (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60),
        0.01
      )
    }
  };
};

export const groupPointsByEntity = (
  points: SpatiotemporalPoint[]
): Map<string, SpatiotemporalPoint[]> => {
  const grouped = new Map<string, SpatiotemporalPoint[]>();
  points.forEach((point) => {
    const key = `${point.objectTypeId}:${point.entityKey}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(point);
  });
  return grouped;
};

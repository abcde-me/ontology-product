import type {
  RegionAnalysisParams,
  RegionAnalysisResult,
  RegionCell,
  RegionHeatLevel,
  SpatiotemporalDataset,
  SpatiotemporalPoint
} from '../types';

const locateCell = (
  point: SpatiotemporalPoint,
  bounds: SpatiotemporalDataset['bounds'],
  gridSize: number
): { row: number; col: number } => {
  const lonSpan = bounds.maxLon - bounds.minLon || 0.0001;
  const latSpan = bounds.maxLat - bounds.minLat || 0.0001;
  const col = Math.min(
    gridSize - 1,
    Math.max(0, Math.floor(((point.lon - bounds.minLon) / lonSpan) * gridSize))
  );
  const row = Math.min(
    gridSize - 1,
    Math.max(0, Math.floor(((point.lat - bounds.minLat) / latSpan) * gridSize))
  );
  return { row, col };
};

const resolveHeatLevel = (
  rank: number,
  total: number,
  hotTopPercent: number
): RegionHeatLevel => {
  const hotCutoff = Math.max(1, Math.ceil((total * hotTopPercent) / 100));
  if (rank < hotCutoff) {
    return 'hot';
  }
  if (rank < hotCutoff * 2) {
    return 'warm';
  }
  return 'cold';
};

export const runRegionAnalysis = (
  dataset: SpatiotemporalDataset,
  params: RegionAnalysisParams
): RegionAnalysisResult => {
  const gridSize = params.gridSize;
  const { bounds } = dataset;
  const lonStep = (bounds.maxLon - bounds.minLon || 0.0001) / gridSize;
  const latStep = (bounds.maxLat - bounds.minLat || 0.0001) / gridSize;
  const cellMap = new Map<
    string,
    RegionCell & {
      times: number[];
      sharePercent?: number;
      heatLevel?: RegionHeatLevel;
    }
  >();

  dataset.points.forEach((point) => {
    const { row, col } = locateCell(point, bounds, gridSize);
    const id = `r${row}c${col}`;
    if (!cellMap.has(id)) {
      const minLon = bounds.minLon + col * lonStep;
      const maxLon = minLon + lonStep;
      const minLat = bounds.minLat + row * latStep;
      const maxLat = minLat + latStep;
      cellMap.set(id, {
        id,
        row,
        col,
        minLon,
        maxLon,
        minLat,
        maxLat,
        centerLon: (minLon + maxLon) / 2,
        centerLat: (minLat + maxLat) / 2,
        count: 0,
        density: 0,
        sharePercent: 0,
        heatLevel: 'cold',
        times: []
      });
    }
    const cell = cellMap.get(id)!;
    cell.count += 1;
    cell.times.push(point.timeMs);
  });

  const areaKm2 = Math.max(
    Math.abs(
      lonStep *
        111 *
        Math.cos((((bounds.minLat + bounds.maxLat) / 2) * Math.PI) / 180) *
        latStep *
        111
    ),
    0.01
  );

  const totalPoints = dataset.points.length;
  const regions = Array.from(cellMap.values())
    .map((cell) => {
      const { times, ...rest } = cell;
      const earliestMs = times.length ? Math.min(...times) : undefined;
      const latestMs = times.length ? Math.max(...times) : undefined;
      return {
        ...rest,
        density: cell.count / areaKm2,
        sharePercent: totalPoints > 0 ? (cell.count / totalPoints) * 100 : 0,
        earliestMs,
        latestMs,
        activeHours:
          earliestMs != null && latestMs != null
            ? Math.max((latestMs - earliestMs) / (1000 * 60 * 60), 0.01)
            : undefined
      };
    })
    .sort((a, b) => b.count - a.count);

  const activeRegions = regions
    .filter((item) => item.count > 0)
    .map((item, index) => ({
      ...item,
      heatLevel: resolveHeatLevel(index, regions.length, params.hotTopPercent)
    }));

  const avgDensity =
    activeRegions.length > 0
      ? activeRegions.reduce((acc, item) => acc + item.density, 0) /
        activeRegions.length
      : 0;

  const hotRegionCount = activeRegions.filter(
    (item) => item.heatLevel === 'hot'
  ).length;
  const coveragePercent =
    totalPoints > 0
      ? (activeRegions.reduce((acc, item) => acc + item.count, 0) /
          totalPoints) *
        100
      : 0;

  return {
    gridSize,
    regions: activeRegions,
    summary: {
      activeRegions: activeRegions.length,
      hottestRegion: activeRegions[0],
      avgDensity,
      hotRegionCount,
      coveragePercent
    }
  };
};

export const getRegionIdForPoint = (
  point: SpatiotemporalPoint,
  dataset: SpatiotemporalDataset,
  gridSize: number
): string => {
  const { row, col } = locateCell(point, dataset.bounds, gridSize);
  return `r${row}c${col}`;
};

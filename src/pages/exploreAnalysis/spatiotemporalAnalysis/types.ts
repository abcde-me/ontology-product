import type { ImplicitAnalysisScope } from '@/pages/exploreAnalysis/implicitRelation/types';

export type SpatiotemporalAnalysisMode =
  | 'trajectory'
  | 'clustering'
  | 'region'
  | 'migration'
  | 'evolution';

export interface SpatiotemporalTimeFilter {
  enabled: boolean;
  startMs?: number;
  endMs?: number;
}

export interface TrajectoryAnalysisParams {
  /** 最少时空点数，低于此值的轨迹不展示 */
  minPointCount: number;
  /** 最短路径（km） */
  minDistanceKm: number;
  /** 驻留判定：相邻点距离小于阈值且间隔超过该分钟数 */
  stopDwellMinutes: number;
  /** 超速异常阈值（km/h） */
  speedAnomalyKmh: number;
}

export interface ClusteringAnalysisParams {
  epsKm: number;
  timeWindowHours: number;
  minPoints: number;
}

export interface RegionAnalysisParams {
  gridSize: number;
  /** 实例数排名前 X% 视为热点区域 */
  hotTopPercent: number;
}

export interface MigrationAnalysisParams {
  /** 前期时段占比（0~1） */
  earlyPeriodRatio: number;
  /** 最小位移（km），低于此不计入迁徙 */
  minDisplacementKm: number;
}

export interface EvolutionAnalysisParams {
  bucketCount: number;
}

export interface SpatiotemporalAnalysisParams {
  timeFilter: SpatiotemporalTimeFilter;
  trajectory: TrajectoryAnalysisParams;
  clustering: ClusteringAnalysisParams;
  region: RegionAnalysisParams;
  migration: MigrationAnalysisParams;
  evolution: EvolutionAnalysisParams;
}

export interface SpatiotemporalPoint {
  key: string;
  instanceId: string;
  objectTypeId: number;
  objectTypeName?: string;
  label: string;
  lon: number;
  lat: number;
  timeMs: number;
  entityKey: string;
  spaceSource?: string;
  timeSource?: string;
}

export interface SpatiotemporalDataset {
  scope: ImplicitAnalysisScope;
  points: SpatiotemporalPoint[];
  timeRange: { min: number; max: number };
  bounds: {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
  };
  quality: DatasetQuality;
}

export interface DatasetQuality {
  requestedInstances: number;
  validPoints: number;
  objectTypeCount: number;
  objectTypeBreakdown: Array<{ name: string; count: number }>;
  timeSpanHours: number;
}

export interface TrajectoryStopPoint {
  lon: number;
  lat: number;
  dwellMinutes: number;
  startMs: number;
  endMs: number;
  label: string;
}

export interface TrajectorySegment {
  entityKey: string;
  entityLabel: string;
  objectTypeName?: string;
  points: SpatiotemporalPoint[];
  distanceKm: number;
  durationHours: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  stopCount: number;
  stops: TrajectoryStopPoint[];
  isSpeedAnomaly: boolean;
  startTimeMs: number;
  endTimeMs: number;
}

export interface TrajectoryAnalysisResult {
  trajectories: TrajectorySegment[];
  summary: {
    entityCount: number;
    pointCount: number;
    totalDistanceKm: number;
    avgSegmentKm: number;
    anomalyCount: number;
    totalStopCount: number;
  };
}

export interface SpatiotemporalCluster {
  id: string;
  label: string;
  centerLon: number;
  centerLat: number;
  centerTimeMs: number;
  memberCount: number;
  members: SpatiotemporalPoint[];
  radiusKm: number;
  timeSpanHours: number;
  /** 聚集强度：成员数 × 时间紧凑度 */
  intensity: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface ClusteringAnalysisResult {
  clusters: SpatiotemporalCluster[];
  noiseCount: number;
  summary: {
    clusterCount: number;
    coveredPoints: number;
    largestClusterSize: number;
    highRiskCount: number;
  };
}

export type RegionHeatLevel = 'hot' | 'warm' | 'cold';

export interface RegionCell {
  id: string;
  row: number;
  col: number;
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
  centerLon: number;
  centerLat: number;
  count: number;
  density: number;
  sharePercent: number;
  heatLevel: RegionHeatLevel;
  earliestMs?: number;
  latestMs?: number;
  activeHours?: number;
}

export interface RegionAnalysisResult {
  gridSize: number;
  regions: RegionCell[];
  summary: {
    activeRegions: number;
    hottestRegion?: RegionCell;
    avgDensity: number;
    hotRegionCount: number;
    coveragePercent: number;
  };
}

export interface MigrationFlow {
  id: string;
  fromRegionId: string;
  toRegionId: string;
  fromLabel: string;
  toLabel: string;
  fromLon: number;
  fromLat: number;
  toLon: number;
  toLat: number;
  entityCount: number;
  avgDistanceKm: number;
  migrationRate: number;
}

export interface MigrationAnalysisResult {
  periodLabels: [string, string];
  splitMs: number;
  flows: MigrationFlow[];
  summary: {
    totalEntities: number;
    migratingEntities: number;
    migrationRate: number;
    dominantFlow?: MigrationFlow;
    avgDisplacementKm: number;
  };
}

export interface EvolutionSnapshot {
  bucketIndex: number;
  label: string;
  startMs: number;
  endMs: number;
  count: number;
  centerLon: number;
  centerLat: number;
  spreadKm: number;
  hotRegionCount: number;
  growthRate: number;
}

export interface EvolutionAnalysisResult {
  snapshots: EvolutionSnapshot[];
  summary: {
    bucketCount: number;
    peakCount: number;
    trend: 'expanding' | 'contracting' | 'stable' | 'shifted';
    totalGrowthRate: number;
    peakBucketLabel?: string;
  };
}

export type SpatiotemporalAnalysisResult =
  | { mode: 'trajectory'; data: TrajectoryAnalysisResult }
  | { mode: 'clustering'; data: ClusteringAnalysisResult }
  | { mode: 'region'; data: RegionAnalysisResult }
  | { mode: 'migration'; data: MigrationAnalysisResult }
  | { mode: 'evolution'; data: EvolutionAnalysisResult };

export interface UsageScenario {
  id: string;
  /** 用户目标问句 */
  goalQuestion: string;
  title: string;
  description: string;
  /** 分析完成后用户应得到的答案 */
  expectedOutcome: string;
  mode: SpatiotemporalAnalysisMode;
  tip: string;
  paramsPatch: Partial<SpatiotemporalAnalysisParams>;
  /** 演示数据使用的对象类型 code */
  objectTypeCodes: string[];
  /** 建议下一步 */
  nextSteps: string[];
}

export type JourneyStep = 'goal' | 'running' | 'result' | 'advanced';

export interface JourneyConclusion {
  headline: string;
  findings: string[];
  recommendations: string[];
}

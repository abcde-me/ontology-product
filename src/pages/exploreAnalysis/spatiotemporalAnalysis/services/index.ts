import type {
  SpatiotemporalAnalysisMode,
  SpatiotemporalAnalysisParams,
  SpatiotemporalAnalysisResult,
  SpatiotemporalDataset
} from '../types';
import { filterDataset } from './analysisParams';
import { runClusteringAnalysis } from './clusteringAnalysis';
import { runEvolutionAnalysis } from './evolutionAnalysis';
import { runMigrationAnalysis } from './migrationAnalysis';
import { runRegionAnalysis } from './regionAnalysis';
import { runTrajectoryAnalysis } from './trajectoryAnalysis';

export { loadSpatiotemporalDataset } from './loadDataset';
export {
  applyUsageScenario,
  filterDataset,
  mergeAnalysisParams
} from './analysisParams';

export const runSpatiotemporalAnalysis = (
  mode: SpatiotemporalAnalysisMode,
  dataset: SpatiotemporalDataset,
  params: SpatiotemporalAnalysisParams
): SpatiotemporalAnalysisResult => {
  const scopedDataset = filterDataset(dataset, params);

  switch (mode) {
    case 'trajectory':
      return {
        mode,
        data: runTrajectoryAnalysis(scopedDataset, params.trajectory)
      };
    case 'clustering':
      return {
        mode,
        data: runClusteringAnalysis(scopedDataset, params.clustering)
      };
    case 'region':
      return {
        mode,
        data: runRegionAnalysis(scopedDataset, params.region)
      };
    case 'migration':
      return {
        mode,
        data: runMigrationAnalysis(scopedDataset, params.migration)
      };
    case 'evolution':
      return {
        mode,
        data: runEvolutionAnalysis(scopedDataset, params.evolution)
      };
    default:
      return {
        mode: 'trajectory',
        data: runTrajectoryAnalysis(scopedDataset, params.trajectory)
      };
  }
};

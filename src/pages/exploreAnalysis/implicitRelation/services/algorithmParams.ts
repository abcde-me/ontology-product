import {
  MAX_DISCOVERIES,
  SPATIAL_NEAR_KM,
  TEMPORAL_NEAR_HOURS
} from '../constants';
import type {
  ImplicitDiscoveryAlgorithm,
  ImplicitDiscoveryParams
} from '../types';

export type ResolvedDiscoveryParams = ImplicitDiscoveryParams;

const BASE_DEFAULTS: ImplicitDiscoveryParams = {
  maxDiscoveries: MAX_DISCOVERIES,
  maxIterations: 20,
  maxPathDepth: 4,
  minSharedNeighbors: 1,
  spatialNearKm: SPATIAL_NEAR_KM,
  temporalNearHours: TEMPORAL_NEAR_HOURS,
  minScore: 0.2,
  coreNodeRatio: 0.25,
  maxBridgeCount: 4
};

const ALGORITHM_DEFAULT_PATCH: Partial<
  Record<ImplicitDiscoveryAlgorithm, Partial<ImplicitDiscoveryParams>>
> = {
  'weak-link': {
    maxPathDepth: 5
  }
};

export const getDefaultAlgorithmParams = (
  algorithm: ImplicitDiscoveryAlgorithm
): ImplicitDiscoveryParams => ({
  ...BASE_DEFAULTS,
  ...ALGORITHM_DEFAULT_PATCH[algorithm]
});

export const mergeAlgorithmParams = (
  algorithm: ImplicitDiscoveryAlgorithm,
  patch?: Partial<ImplicitDiscoveryParams>
): ImplicitDiscoveryParams => ({
  ...getDefaultAlgorithmParams(algorithm),
  ...patch
});

export const resolveDiscoveryParams = (
  algorithm: ImplicitDiscoveryAlgorithm,
  params?: Partial<ImplicitDiscoveryParams>
): ResolvedDiscoveryParams => mergeAlgorithmParams(algorithm, params);

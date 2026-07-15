import type { ImplicitDiscoveryAlgorithm } from './types';

export const DISCOVERY_ALGORITHM_OPTIONS: Array<{
  value: ImplicitDiscoveryAlgorithm;
  label: string;
  description: string;
}> = [
  {
    value: 'community',
    label: '社区分析',
    description: '基于社区发现识别同社区但尚未直连的实例，推断潜在关联'
  },
  {
    value: 'path-prediction',
    label: '路径预测',
    description:
      '基于共同邻居与路径相似度（Adamic-Adar）预测尚未存在但可信的链接'
  },
  {
    value: 'spatiotemporal',
    label: '时空分析',
    description:
      '基于实例的空间邻近（经纬度）与时间邻近（时间戳）发现潜在共现关联'
  }
];

export const DISCOVERY_ALGORITHM_LABEL: Record<
  ImplicitDiscoveryAlgorithm,
  string
> = {
  community: '社区分析',
  'path-prediction': '路径预测',
  spatiotemporal: '时空分析'
};

export const IMPLICIT_EDGE_COLOR = '#E85D04';
export const CONFIRMED_EDGE_COLOR = '#94A3B8';

/** 单次最多展示的挖掘关系条数 */
export const MAX_DISCOVERIES = 30;

/** 时空分析：判定空间邻近的公里阈值 */
export const SPATIAL_NEAR_KM = 50;

/** 时空分析：判定时间邻近的小时阈值 */
export const TEMPORAL_NEAR_HOURS = 72;

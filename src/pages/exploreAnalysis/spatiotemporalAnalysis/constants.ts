import type {
  SpatiotemporalAnalysisMode,
  SpatiotemporalAnalysisParams,
  UsageScenario
} from './types';

export const SPATIOTEMPORAL_ANALYSIS_MODES: {
  key: SpatiotemporalAnalysisMode;
  label: string;
  description: string;
  usageHint: string;
}[] = [
  {
    key: 'trajectory',
    label: '轨迹分析',
    description: '按实体串联时空点，还原移动路径、驻留与异常速度',
    usageHint: '回答：目标从哪里出发、去了哪里、途中是否停留'
  },
  {
    key: 'clustering',
    label: '时空聚集',
    description: '识别在相近空间与时间窗口内共现的实例群组',
    usageHint: '回答：哪些目标在相近时间出现在相近位置'
  },
  {
    key: 'region',
    label: '区域分析',
    description: '网格化统计空间密度，标注热点、温区和冷区',
    usageHint: '回答：哪些区域最活跃、资源应优先投向哪里'
  },
  {
    key: 'migration',
    label: '迁徙分析',
    description: '对比前后时段，识别群体从哪些区域迁往哪些区域',
    usageHint: '回答：整体活动重心是否从 A 区域转向 B 区域'
  },
  {
    key: 'evolution',
    label: '时空演化',
    description: '按时间分桶观察数量、扩散半径与重心迁移趋势',
    usageHint: '回答：态势随时间是增强、减弱还是发生转移'
  }
];

export const isSpatiotemporalAnalysisMode = (
  key: string
): key is SpatiotemporalAnalysisMode =>
  SPATIOTEMPORAL_ANALYSIS_MODES.some((item) => item.key === key);

export const DEFAULT_ANALYSIS_PARAMS: SpatiotemporalAnalysisParams = {
  timeFilter: { enabled: false },
  trajectory: {
    minPointCount: 2,
    minDistanceKm: 0,
    stopDwellMinutes: 30,
    speedAnomalyKmh: 120
  },
  clustering: {
    epsKm: 30,
    timeWindowHours: 72,
    minPoints: 2
  },
  region: {
    gridSize: 6,
    hotTopPercent: 20
  },
  migration: {
    earlyPeriodRatio: 0.5,
    minDisplacementKm: 5
  },
  evolution: {
    bucketCount: 6
  }
};

/** 以用户目标为导向的分析旅程（非功能清单） */
export const USAGE_SCENARIOS: UsageScenario[] = [
  {
    id: 'target-track',
    goalQuestion: '这些目标去了哪里？',
    title: '追踪目标轨迹',
    description: '还原舰艇、航空器等目标的移动路径与驻留位置',
    expectedOutcome: '得到各目标的行进路线、驻留点和异常速度提示',
    mode: 'trajectory',
    tip: '演示数据含 5 条移动目标轨迹，其中含驻留与高速异常样本',
    objectTypeCodes: ['mobile_target'],
    nextSteps: [
      '查看速度异常轨迹',
      '对比驻留点与周边事件',
      '切换至聚集分析看共现'
    ],
    paramsPatch: {
      trajectory: {
        minPointCount: 2,
        minDistanceKm: 1,
        stopDwellMinutes: 20,
        speedAnomalyKmh: 100
      }
    }
  },
  {
    id: 'event-cooccurrence',
    goalQuestion: '谁在附近聚集？',
    title: '发现共现聚集',
    description: '找出短时间、近距离内多次出现的关联群组',
    expectedOutcome: '识别共现簇位置、规模与风险等级',
    mode: 'clustering',
    tip: '演示数据含平潭以东海域与海峡北口两个共现簇',
    objectTypeCodes: ['situation_event'],
    nextSteps: [
      '点击聚集簇查看成员',
      '缩小半径精查核心区域',
      '对照轨迹看是否有机动目标经过'
    ],
    paramsPatch: {
      clustering: {
        epsKm: 10,
        timeWindowHours: 24,
        minPoints: 3
      }
    }
  },
  {
    id: 'hotspot-region',
    goalQuestion: '哪里最活跃？',
    title: '研判热点区域',
    description: '找出活动最密集的空间区域，辅助注意力与资源分配',
    expectedOutcome: '获得热点/温区/冷区分布及占比排序',
    mode: 'region',
    tip: '演示数据覆盖海峡北部多网格区域',
    objectTypeCodes: ['mobile_target', 'situation_event'],
    nextSteps: [
      '优先巡查热点区域',
      '查看热点时段覆盖',
      '结合迁徙看热点是否转移'
    ],
    paramsPatch: {
      region: {
        gridSize: 8,
        hotTopPercent: 15
      }
    }
  },
  {
    id: 'group-migration',
    goalQuestion: '群体往哪迁移？',
    title: '分析迁徙流向',
    description: '对比前后阶段，看清活动重心从哪些区域迁往哪些区域',
    expectedOutcome: '获得主流向箭头、迁徙率与平均位移',
    mode: 'migration',
    tip: '演示数据中巡逻艇等目标自西向东迁移',
    objectTypeCodes: ['mobile_target'],
    nextSteps: [
      '关注主流向涉及实体',
      '调整前后占比做对比',
      '打开轨迹看具体路径'
    ],
    paramsPatch: {
      migration: {
        earlyPeriodRatio: 0.4,
        minDisplacementKm: 10
      }
    }
  },
  {
    id: 'situation-evolution',
    goalQuestion: '态势如何演变？',
    title: '复盘态势演化',
    description: '按时间轴观察活动量、扩散范围与重心是否迁移',
    expectedOutcome: '判断态势增强/减弱/转移，定位峰值时段',
    mode: 'evolution',
    tip: '演示数据后期事件明显增多，适合观察演化趋势',
    objectTypeCodes: ['situation_event'],
    nextSteps: [
      '点击时段查看地图点位',
      '对照峰值时段查聚集',
      '导出结论用于汇报'
    ],
    paramsPatch: {
      evolution: {
        bucketCount: 8
      }
    }
  }
];

export const ENTITY_ID_KEYS = [
  'entity_id',
  'entityId',
  'track_id',
  'trackId',
  'device_id',
  'deviceId',
  'vehicle_id',
  'vehicleId',
  '目标编号',
  '轨迹编号'
];

export const STOP_MAX_DISTANCE_KM = 0.5;

export const TRAJECTORY_SPEED_ANOMALY_LABEL = '速度异常';

export const REGION_HEAT_LABEL = {
  hot: '热点',
  warm: '温区',
  cold: '冷区'
} as const;

export const CLUSTER_RISK_LABEL = {
  high: '高',
  medium: '中',
  low: '低'
} as const;

export const CLUSTER_RISK_COLOR = {
  high: 'red',
  medium: 'orangered',
  low: 'arcoblue'
} as const;

export const DEMO_SCENE_NAME = '海峡时空态势演示';

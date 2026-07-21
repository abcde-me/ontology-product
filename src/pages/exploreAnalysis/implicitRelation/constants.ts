import type {
  ImplicitDiscoveryAlgorithm,
  ImplicitRelationTaskType,
  ImplicitRelationUsageScenario
} from './types';

/** 新建任务弹窗 — 任务类型选项（与列表页典型场景前三项一致） */
export const IMPLICIT_RELATION_TASK_TYPE_OPTIONS: Array<{
  value: ImplicitRelationTaskType;
  label: string;
}> = [
  { value: 'invisible-edge', label: '发现隐藏的关系' },
  { value: 'invisible-path', label: '发现隐藏的路径' },
  { value: 'invisible-group', label: '发现可聚合的群组' }
];

export const DISCOVERY_ALGORITHM_OPTIONS: Array<{
  value: ImplicitDiscoveryAlgorithm;
  label: string;
  description: string;
}> = [
  {
    value: 'path-prediction',
    label: '路径预测',
    description:
      '基于共同邻居与路径相似度（Adamic-Adar）预测尚未存在但可信的链接'
  },
  {
    value: 'community',
    label: '社区分析',
    description: '基于社区发现识别同社区但尚未直连的实例，推断潜在关联'
  },
  {
    value: 'spatiotemporal',
    label: '时空分析',
    description:
      '基于实例的空间邻近（经纬度）与时间邻近（时间戳）发现潜在共现关联'
  },
  {
    value: 'core-node',
    label: '核心节点',
    description: '基于度中心性与介数中心性，识别结构核心节点周边的潜在关键关联'
  },
  {
    value: 'weak-link',
    label: '薄弱环节',
    description: '识别跨群体桥接过少的结构薄弱区间，发现应补充的隐性连边'
  }
];

export const DISCOVERY_ALGORITHM_LABEL: Record<
  ImplicitDiscoveryAlgorithm,
  string
> = {
  community: '社区分析',
  'path-prediction': '路径预测',
  spatiotemporal: '时空分析',
  'core-node': '核心节点',
  'weak-link': '薄弱环节'
};

export const IMPLICIT_EDGE_COLOR = '#E85D04';
export const CONFIRMED_EDGE_COLOR = '#94A3B8';

/** 单次最多展示的挖掘关系条数 */
export const MAX_DISCOVERIES = 30;

/** 时空分析：判定空间邻近的公里阈值 */
export const SPATIAL_NEAR_KM = 50;

/** 时空分析：判定时间邻近的小时阈值 */
export const TEMPORAL_NEAR_HOURS = 72;

/** 关系挖掘列表页 — 关注隐性关系挖掘的典型场景 */
export const IMPLICIT_RELATION_USAGE_SCENARIOS: ImplicitRelationUsageScenario[] =
  [
    {
      id: 'invisible-edge',
      goalQuestion: '哪些该连却未连？',
      title: '发现隐藏的关系',
      description:
        '基于共同邻居与结构相似度，预测图谱中尚未绘制、但理应存在的直连边',
      expectedOutcome: '获得潜在连边候选、共同邻居与链路预测置信证据',
      algorithm: 'path-prediction',
      defaultTaskName: '发现隐藏的关系',
      defaultDescription:
        '通过链路预测发现实例间尚未建模、但结构可信的潜在业务连边',
      tip: '需本体中存在足够显式链接，以形成有意义的共同邻居',
      objectTypeCodes: ['mobile_target', 'situation_event']
    },
    {
      id: 'invisible-path',
      goalQuestion: '谁绕弯也能搭上关系？',
      title: '发现隐藏的路径',
      description:
        '基于共同邻居与间接路径结构，预测实例间虽无直连、但经中间节点可达的隐性关联',
      expectedOutcome: '获得间接关联候选、共同邻居与支撑路径证据链',
      algorithm: 'path-prediction',
      defaultTaskName: '发现隐藏的路径',
      defaultDescription:
        '通过链路预测与路径相似度，发现实例间潜在间接关联与中间传导路径',
      tip: '需本体中存在足够显式链接，以形成有意义的共同邻居与间接路径',
      objectTypeCodes: ['mobile_target', 'situation_event']
    },
    {
      id: 'invisible-group',
      goalQuestion: '谁本是一伙却未相连？',
      title: '发现可聚合的群组',
      description:
        '通过社区发现划分实例群体，找出同群体内尚未建立链接的成员对，补全群体内部关联',
      expectedOutcome: '发现同社区隐性关联，附社区归属与结构相似证据',
      algorithm: 'community',
      defaultTaskName: '发现可聚合的群组',
      defaultDescription:
        '基于社区分析，识别被划分至同一社区但尚未直连的实例潜在关联',
      tip: '演示场景「海峡时空态势演示」含移动目标与态势事件，适合快速体验',
      objectTypeCodes: ['mobile_target', 'situation_event']
    },
    {
      id: 'spatiotemporal-cooccur',
      goalQuestion: '谁在相近的时间、地点一起出现？',
      title: '发现相近时间地点的关联',
      description:
        '结合位置与时间信息，找出在相近地点或相近时间段出现、但尚未建立直接联系的实例',
      expectedOutcome: '识别潜在关联及距离远近、时间间隔等证据',
      algorithm: 'spatiotemporal',
      defaultTaskName: '发现相近时间地点的关联',
      defaultDescription:
        '基于位置邻近与时间邻近，发现可能一同出现但尚未建模的业务关联',
      tip: '实例需含经纬度与时间字段；开发环境可使用演示场景',
      objectTypeCodes: ['mobile_target', 'situation_event']
    },
    {
      id: 'core-node-discovery',
      goalQuestion: '谁是网络中的关键枢纽？',
      title: '发现核心节点',
      description:
        '基于度中心性与介数中心性，识别结构核心节点周边尚未直连的潜在关键关联',
      expectedOutcome: '定位核心节点及其高价值隐性连边候选，附中心性得分证据',
      algorithm: 'core-node',
      defaultTaskName: '发现核心节点',
      defaultDescription:
        '挖掘涉及结构核心节点的潜在隐性关联，补全枢纽周边关键关系',
      tip: '适合关系较密的图谱；节点需有一定显式连接基础',
      objectTypeCodes: ['mobile_target', 'situation_event']
    },
    {
      id: 'weak-link-discovery',
      goalQuestion: '哪里连得少却很重要？',
      title: '发现薄弱环节',
      description:
        '识别跨群体桥接过少、结构脆弱的区间，发现应补充的隐性连边以加固网络',
      expectedOutcome: '发现跨社区薄弱区间的隐性关联候选及桥接强度证据',
      algorithm: 'weak-link',
      defaultTaskName: '发现薄弱环节',
      defaultDescription: '基于跨社区桥接分析，发现结构薄弱处潜在的补链关联',
      tip: '当本体中存在多个相对独立群体时效果更明显',
      objectTypeCodes: ['mobile_target', 'situation_event']
    }
  ];

export const findImplicitRelationUsageScenario = (id: string) =>
  IMPLICIT_RELATION_USAGE_SCENARIOS.find((item) => item.id === id);

export const findImplicitRelationTaskTypeScenario = (
  taskType: ImplicitRelationTaskType
) => findImplicitRelationUsageScenario(taskType);

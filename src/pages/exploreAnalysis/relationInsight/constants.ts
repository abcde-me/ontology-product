import type {
  CanvasModeKey,
  GraphAlgorithmKey,
  GraphAlgorithmOption,
  GraphAlgorithmParams,
  GraphLayoutKey
} from './types';

export const GRAPH_ALGORITHM_CATEGORY_LABEL: Record<
  GraphAlgorithmOption['category'],
  string
> = {
  path: '路径与可达',
  centrality: '关键节点',
  community: '社区发现',
  structure: '结构致密性',
  similarity: '相似性'
};

/** 图算法分类标签文字色 */
export const GRAPH_ALGORITHM_CATEGORY_COLOR: Record<
  GraphAlgorithmOption['category'],
  string
> = {
  path: '#0F766E',
  centrality: '#C2410C',
  community: '#7C3AED',
  structure: '#0369A1',
  similarity: '#BE185D'
};

export const GRAPH_ALGORITHM_OPTIONS: GraphAlgorithmOption[] = [
  {
    value: 'neighbor-1',
    label: '一度关系',
    description: '展示与当前对象直接相连的节点与关系',
    nebulaAlgo: 'BFS (depth=1)',
    category: 'path',
    scenarios: ['装备一跳关联', '直接协作对象'],
    fields: [],
    defaults: { maxDepth: 1 }
  },
  {
    value: 'neighbor-2',
    label: '二度关系',
    description: '扩展至两跳范围内的关联对象',
    nebulaAlgo: 'BFS (depth=2)',
    category: 'path',
    scenarios: ['供应链两级展开', '协作圈层扩线'],
    fields: [],
    defaults: { maxDepth: 2 }
  },
  {
    value: 'bfs-khop',
    label: 'K-Hop 广度搜索',
    description:
      '对齐 Nebula BFS：按可配置深度扩展可达对象，适用于打击链路/装备关联扩线',
    nebulaAlgo: 'BFS',
    category: 'path',
    scenarios: ['打击链路追踪', '科研协作 K 跳扩线', '备件保障链路'],
    fields: [
      {
        key: 'maxDepth',
        label: '搜索深度',
        type: 'number',
        min: 1,
        max: 6,
        tip: '对应 Nebula BFS 跳数'
      },
      {
        key: 'topN',
        label: '最大展开节点数',
        type: 'number',
        min: 10,
        max: 200,
        tip: '控制画布规模'
      }
    ],
    defaults: { maxDepth: 3, topN: 40 }
  },
  {
    value: 'shortest-path',
    label: '最短路径',
    description:
      '对齐 Nebula ShortestPath：在焦点对象与目标对象类型间寻找最短关联路径',
    nebulaAlgo: 'ShortestPath',
    category: 'path',
    scenarios: ['后勤保障路径规划', '任务链路最短径', '科研协作最短连接'],
    fields: [
      {
        key: 'maxDepth',
        label: '最大搜索深度',
        type: 'number',
        min: 1,
        max: 8,
        tip: '超出深度未找到则返回邻域近似结果'
      },
      {
        key: 'targetObjectTypeId',
        label: '目标对象类型 ID',
        type: 'number',
        min: 1,
        tip: '可选；未填时优先使用第二个已选对象类型'
      }
    ],
    defaults: { maxDepth: 5 }
  },
  {
    value: 'connected',
    label: '连通分量',
    description:
      '对齐 Nebula ConnectedComponent：展示焦点所在弱连通分量，发现孤岛单元',
    nebulaAlgo: 'ConnectedComponent',
    category: 'community',
    scenarios: ['孤岛作战单元发现', '孤立科研协作岛'],
    fields: [
      {
        key: 'topN',
        label: '最大展示节点数',
        type: 'number',
        min: 10,
        max: 200
      }
    ],
    defaults: { topN: 60 }
  },
  {
    value: 'pagerank',
    label: 'PageRank 关键度',
    description:
      '对齐 Nebula PageRank：识别影响力最高的对象类型节点（关键装备/设施/主体）',
    nebulaAlgo: 'PageRank',
    category: 'centrality',
    scenarios: ['关键设施挖掘', '核心科研主体识别', '枢纽节点排序'],
    fields: [
      {
        key: 'maxIter',
        label: '最大迭代次数',
        type: 'number',
        min: 5,
        max: 50,
        tip: 'Nebula pagerank.maxIter'
      },
      {
        key: 'resetProb',
        label: '重置概率',
        type: 'number',
        min: 0.05,
        max: 0.5,
        step: 0.01,
        precision: 2,
        tip: 'Nebula pagerank.resetProb，默认 0.15'
      },
      {
        key: 'maxDepth',
        label: '分析邻域深度',
        type: 'number',
        min: 1,
        max: 5
      },
      {
        key: 'topN',
        label: '高亮 Top-N',
        type: 'number',
        min: 3,
        max: 50
      }
    ],
    defaults: { maxIter: 10, resetProb: 0.15, maxDepth: 3, topN: 10 }
  },
  {
    value: 'betweenness',
    label: '介数中心性',
    description:
      '对齐 Nebula BetweennessCentrality：定位关键路径上的瓶颈/桥接节点',
    nebulaAlgo: 'BetweennessCentrality',
    category: 'centrality',
    scenarios: ['保障瓶颈定位', '关键中转节点', '信息枢纽分析'],
    fields: [
      {
        key: 'maxDepth',
        label: '分析邻域深度',
        type: 'number',
        min: 1,
        max: 5
      },
      {
        key: 'topN',
        label: '高亮 Top-N',
        type: 'number',
        min: 3,
        max: 50
      }
    ],
    defaults: { maxDepth: 3, topN: 10 }
  },
  {
    value: 'closeness',
    label: '接近中心性',
    description:
      '对齐 Nebula ClosenessCentrality：识别到其他节点平均距离最短的高可达节点',
    nebulaAlgo: 'ClosenessCentrality',
    category: 'centrality',
    scenarios: ['快速响应节点', '中心部署选址', '协作可达性评估'],
    fields: [
      {
        key: 'maxDepth',
        label: '分析邻域深度',
        type: 'number',
        min: 1,
        max: 5
      },
      {
        key: 'topN',
        label: '高亮 Top-N',
        type: 'number',
        min: 3,
        max: 50
      }
    ],
    defaults: { maxDepth: 3, topN: 10 }
  },
  {
    value: 'degree',
    label: '度中心性',
    description:
      '对齐 Nebula DegreeStatic：按出入度统计连接最密集的对象类型节点',
    nebulaAlgo: 'DegreeStatic',
    category: 'centrality',
    scenarios: ['高度关联装备', '高频协作主体', '图谱结构概览'],
    fields: [
      {
        key: 'maxDepth',
        label: '分析邻域深度',
        type: 'number',
        min: 1,
        max: 5
      },
      {
        key: 'topN',
        label: '高亮 Top-N',
        type: 'number',
        min: 3,
        max: 50
      }
    ],
    defaults: { maxDepth: 2, topN: 10 }
  },
  {
    value: 'louvain',
    label: 'Louvain 社区',
    description:
      '对齐 Nebula Louvain：层次化社区挖掘，发现组织编制/科研协作圈层',
    nebulaAlgo: 'Louvain',
    category: 'community',
    scenarios: ['编制体系聚类', '科研协作圈层', '装备体系分群'],
    fields: [
      {
        key: 'maxIter',
        label: '最大迭代次数',
        type: 'number',
        min: 5,
        max: 40,
        tip: 'Nebula louvain.maxIter'
      },
      {
        key: 'internalIter',
        label: '内部迭代次数',
        type: 'number',
        min: 2,
        max: 20,
        tip: 'Nebula louvain.internalIter'
      },
      {
        key: 'tolerance',
        label: '收敛阈值',
        type: 'number',
        min: 0.1,
        max: 1,
        step: 0.1,
        precision: 1,
        tip: 'Nebula louvain.tol'
      },
      {
        key: 'maxDepth',
        label: '分析邻域深度',
        type: 'number',
        min: 1,
        max: 5
      }
    ],
    defaults: { maxIter: 20, internalIter: 10, tolerance: 0.5, maxDepth: 3 }
  },
  {
    value: 'label-propagation',
    label: '标签传播',
    description:
      '对齐 Nebula LabelPropagation：基于近邻标签扩散发现传播群落与群体边界',
    nebulaAlgo: 'LabelPropagation',
    category: 'community',
    scenarios: ['情报传播圈', '影响扩散分析', '协作群体边界'],
    fields: [
      {
        key: 'maxIter',
        label: '最大迭代次数',
        type: 'number',
        min: 5,
        max: 40
      },
      {
        key: 'maxDepth',
        label: '分析邻域深度',
        type: 'number',
        min: 1,
        max: 5
      }
    ],
    defaults: { maxIter: 15, maxDepth: 3 }
  },
  {
    value: 'k-core',
    label: 'K-Core 核心子图',
    description: '对齐 Nebula KCore：保留度数 ≥ K 的核心子结构，定位致密协同簇',
    nebulaAlgo: 'KCore',
    category: 'community',
    scenarios: ['核心协同簇', '高韧性子网', '关键闭环单元'],
    fields: [
      {
        key: 'k',
        label: 'K 值',
        type: 'number',
        min: 1,
        max: 10,
        tip: '度数低于 K 的节点会被剥离'
      },
      {
        key: 'maxDepth',
        label: '分析邻域深度',
        type: 'number',
        min: 1,
        max: 5
      }
    ],
    defaults: { k: 2, maxDepth: 3 }
  },
  {
    value: 'triangle-count',
    label: '三角形计数',
    description:
      '对齐 Nebula TriangleCount：统计局部闭合三角，衡量网络紧密与协同强度',
    nebulaAlgo: 'TriangleCount',
    category: 'structure',
    scenarios: ['协同致密性评估', '三方闭环发现', '科研合作紧密度'],
    fields: [
      {
        key: 'maxDepth',
        label: '分析邻域深度',
        type: 'number',
        min: 1,
        max: 5
      },
      {
        key: 'topN',
        label: '高亮 Top-N',
        type: 'number',
        min: 3,
        max: 50
      }
    ],
    defaults: { maxDepth: 2, topN: 10 }
  },
  {
    value: 'jaccard',
    label: 'Jaccard 相似',
    description: '对齐 Nebula Jaccard：按共同邻居相似度推荐相近装备/主体',
    nebulaAlgo: 'Jaccard',
    category: 'similarity',
    scenarios: ['相似装备发现', '同类课题主体推荐', '可替代部件分析'],
    fields: [
      {
        key: 'similarityThreshold',
        label: '相似度阈值',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.05,
        precision: 2,
        tip: '低于阈值的邻居不展示'
      },
      {
        key: 'maxDepth',
        label: '邻居采样深度',
        type: 'number',
        min: 1,
        max: 3
      },
      {
        key: 'topN',
        label: '最大相似节点数',
        type: 'number',
        min: 3,
        max: 50
      }
    ],
    defaults: { similarityThreshold: 0.2, maxDepth: 2, topN: 15 }
  }
];

export const DEFAULT_GRAPH_ALGORITHM: GraphAlgorithmKey = 'neighbor-2';

export const getGraphAlgorithmOption = (key: GraphAlgorithmKey) =>
  GRAPH_ALGORITHM_OPTIONS.find((item) => item.value === key);

export const getDefaultAlgorithmParams = (
  key: GraphAlgorithmKey
): GraphAlgorithmParams => ({
  ...(getGraphAlgorithmOption(key)?.defaults ?? {})
});

export const DEFAULT_CANVAS_MODE: CanvasModeKey = 'minimal';

export const CANVAS_MODE_OPTIONS: Array<{
  value: CanvasModeKey;
  label: string;
  description?: string;
  disabled?: boolean;
}> = [
  {
    value: 'minimal',
    label: '极简模式',
    description: '展示实例名称与关系名称，选中节点查看详情'
  },
  {
    value: 'detail',
    label: '详情模式（待开发）',
    disabled: true
  }
];

export const GRAPH_LAYOUT_OPTIONS: Array<{
  value: GraphLayoutKey;
  label: string;
}> = [
  { value: 'force', label: '力导向图' },
  { value: 'hierarchical', label: '层次图' },
  { value: 'circular', label: '环形图' },
  { value: 'grid', label: '网格图' },
  { value: 'neural', label: '神经网络' },
  { value: 'radiation', label: '辐射' }
];

export const RELATION_INSIGHT_FAVORITE_KEY = 'relation-insight-favorites';

export const OPERATION_GUIDE_ITEMS = [
  {
    title: '查询目标对象',
    content:
      '点击「选择对象」选定对象类型与场景库，输入关键字后查询实例；查询结果支持多选，并可分别载入节点或载入图谱。'
  },
  {
    title: '载入节点与载入图谱',
    content:
      '「载入节点」仅将选中实例作为焦点节点加入画布；「载入图谱」默认按二度关系展开两跳关联数据。已载入实例状态会变为「已载入」。'
  },
  {
    title: '图算法分析',
    content:
      '支持 NebulaGraph 常见算法能力（BFS、最短路径、PageRank、介数/接近/度中心性、Louvain、标签传播、K-Core、三角形计数、Jaccard 等），面向军工保障链路与科研协作分析。选中算法后需填写参数并应用，以控制展开深度与关键节点高亮。'
  },
  {
    title: '画布模式与布局',
    content:
      '画布模式支持极简模式（展示实例名称、关系名称，选中节点查看详情）与详情模式（待开发）；布局支持力导向图、层次图、环形图、网格图、神经网络、辐射六种方式。'
  },
  {
    title: '画布交互',
    content:
      '滚轮缩放画布，按住空白区域拖动平移；节点可单独拖动调整位置。左下角控件支持放大、缩小与适应视图，右下角小地图可拖动视口并缩放。'
  },
  {
    title: '清空画布',
    content: '清除当前画布上的全部节点与关系，不影响已选对象配置。'
  },
  {
    title: '收藏',
    content:
      '将当前选中的对象上下文保存至本地收藏，便于后续快速回溯分析（需先选择对象）。'
  }
];

import type { GraphAlgorithmKey, GraphLayoutKey, CanvasModeKey } from './types';

export const GRAPH_ALGORITHM_OPTIONS: Array<{
  value: GraphAlgorithmKey;
  label: string;
  description: string;
}> = [
  {
    value: 'neighbor-1',
    label: '一度关系',
    description: '展示与当前对象直接相连的节点与关系'
  },
  {
    value: 'neighbor-2',
    label: '二度关系',
    description: '扩展至两跳范围内的关联对象'
  },
  {
    value: 'connected',
    label: '连通子图',
    description: '展示当前对象所在连通分量内的全部关系'
  },
  {
    value: 'shortest-path',
    label: '最短路径',
    description: '在选中对象与关联对象间寻找最短路径（实验性）'
  }
];

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
      '切换一度/二度关系、连通子图等分析模式，控制已载入图谱实例的关联展示范围与深度。'
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

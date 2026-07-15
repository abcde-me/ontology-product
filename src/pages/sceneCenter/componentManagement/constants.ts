import type { AppComponentItem, ComponentCategory } from './types';

export const COMPONENT_CATEGORY_OPTIONS: Array<{
  key: ComponentCategory | 'all';
  label: string;
}> = [
  { key: 'all', label: '全部' },
  { key: 'geo', label: '地理空间' },
  { key: 'time', label: '时间序列' },
  { key: 'chart', label: '常用可视化' },
  { key: 'data', label: '数据展示' },
  { key: 'graph', label: '关系图谱' },
  { key: 'interaction', label: '交互控制' },
  { key: 'content', label: '内容媒体' }
];

export const COMPONENT_CATEGORY_LABEL: Record<ComponentCategory, string> = {
  geo: '地理空间',
  time: '时间序列',
  chart: '常用可视化',
  data: '数据展示',
  graph: '关系图谱',
  interaction: '交互控制',
  content: '内容媒体'
};

/** 应用组件目录：覆盖地图、时间轴、常用图，并参考 Palantir Workshop 等产品补充 */
export const APP_COMPONENT_CATALOG: AppComponentItem[] = [
  {
    id: 'map',
    name: '地图',
    category: 'geo',
    description:
      '基于经纬度 / GeoJSON 展示对象分布、轨迹与热力图层，支持框选与点位钻取。',
    tags: ['图层', '轨迹', '热力', '框选'],
    status: 'available',
    reference: 'Palantir Map / Geospatial'
  },
  {
    id: 'geo-fence',
    name: '电子围栏',
    category: 'geo',
    description: '绘制与管理地理围栏区域，触发进出区域告警或筛选条件。',
    tags: ['围栏', '告警', '区域筛选'],
    status: 'planned',
    reference: 'Geospatial Filter'
  },
  {
    id: 'timeline',
    name: '时间轴',
    category: 'time',
    description: '按时间顺序排列事件与对象变更，支持缩放、刷选区间与播放回放。',
    tags: ['事件', '刷选', '回放'],
    status: 'available',
    reference: 'Palantir Timeline'
  },
  {
    id: 'gantt',
    name: '甘特图',
    category: 'time',
    description:
      '展示任务 / 行动计划的起止时间与依赖关系，适合作战筹划与排程。',
    tags: ['排程', '依赖', '里程碑'],
    status: 'planned',
    reference: 'Workshop Gantt'
  },
  {
    id: 'bar-chart',
    name: '柱状图',
    category: 'chart',
    description: '对比分类指标规模，支持堆叠、分组与点击联动筛选。',
    tags: ['对比', '堆叠', '联动'],
    status: 'available',
    reference: 'Workshop Chart'
  },
  {
    id: 'line-chart',
    name: '折线图',
    category: 'chart',
    description: '刻画指标随时间或其他连续维度的变化趋势与多序列对比。',
    tags: ['趋势', '多序列'],
    status: 'available',
    reference: 'Workshop Chart'
  },
  {
    id: 'area-chart',
    name: '面积图',
    category: 'chart',
    description: '在折线基础上强调量级累积，适合占比变化与容量展示。',
    tags: ['累积', '占比'],
    status: 'available',
    reference: 'Workshop Chart'
  },
  {
    id: 'pie-chart',
    name: '饼图 / 环图',
    category: 'chart',
    description: '展示构成占比，支持高亮扇区与图例联动。',
    tags: ['占比', '构成'],
    status: 'available',
    reference: 'Workshop Chart'
  },
  {
    id: 'scatter-chart',
    name: '散点图',
    category: 'chart',
    description: '分析两个数值维度的分布与相关关系，支持气泡大小编码。',
    tags: ['相关', '气泡', '分布'],
    status: 'available',
    reference: 'Workshop Chart'
  },
  {
    id: 'heatmap',
    name: '热力图',
    category: 'chart',
    description: '以矩阵色块呈现交叉维度密度或强度，定位异常热点。',
    tags: ['密度', '矩阵', '异常'],
    status: 'available',
    reference: 'Workshop / Contour'
  },
  {
    id: 'radar-chart',
    name: '雷达图',
    category: 'chart',
    description: '多维能力 / 威胁评分对比，适合格局评估与对象画像。',
    tags: ['多维', '画像'],
    status: 'planned',
    reference: 'Common BI Charts'
  },
  {
    id: 'sankey',
    name: '桑基图',
    category: 'chart',
    description: '展示流量、资源或威胁在实体间的流转路径与体积。',
    tags: ['流转', '路径'],
    status: 'planned',
    reference: 'Foundry Charts'
  },
  {
    id: 'treemap',
    name: '树图',
    category: 'chart',
    description: '层次结构下的规模对比，适合资产分类与组织占比。',
    tags: ['层级', '规模'],
    status: 'planned',
    reference: 'Workshop Chart'
  },
  {
    id: 'funnel',
    name: '漏斗图',
    category: 'chart',
    description: '刻画流程阶段转化率，用于线索研判与处置链路分析。',
    tags: ['转化', '阶段'],
    status: 'planned',
    reference: 'Common BI Charts'
  },
  {
    id: 'metric-card',
    name: '指标卡',
    category: 'data',
    description: '突出展示关键 KPI、同比环比与阈值状态，可作为看板首屏。',
    tags: ['KPI', '阈值', '同比'],
    status: 'available',
    reference: 'Workshop Metric'
  },
  {
    id: 'object-table',
    name: '对象表格',
    category: 'data',
    description:
      '以表格浏览本体对象实例，支持排序、列配置、批量选择与行级操作。',
    tags: ['实例', '排序', '批量'],
    status: 'available',
    reference: 'Workshop Object Table'
  },
  {
    id: 'pivot-table',
    name: '透视图',
    category: 'data',
    description: '行列维度交叉聚合，快速得到多维统计结果。',
    tags: ['交叉', '聚合'],
    status: 'planned',
    reference: 'Foundry Pivot'
  },
  {
    id: 'list-gallery',
    name: '列表 / 画廊',
    category: 'data',
    description: '卡片或列表方式浏览对象集合，适合情报条目与人员名册。',
    tags: ['卡片', '名册'],
    status: 'planned',
    reference: 'Workshop Gallery'
  },
  {
    id: 'network-graph',
    name: '关系网络图',
    category: 'graph',
    description: '可视化实体与链接关系，支持力导向、社区高亮与路径高亮。',
    tags: ['实体', '链接', '路径'],
    status: 'available',
    reference: 'Palantir Graph / Object Explorer'
  },
  {
    id: 'hierarchy-tree',
    name: '层级树',
    category: 'graph',
    description: '展示组织、装备或概念的上下级归属结构。',
    tags: ['树形', '归属'],
    status: 'planned',
    reference: 'Workshop Hierarchy'
  },
  {
    id: 'filter-panel',
    name: '筛选面板',
    category: 'interaction',
    description: '统一配置属性筛选、时间范围与对象类型过滤，并驱动整页联动。',
    tags: ['过滤', '联动', '参数'],
    status: 'available',
    reference: 'Workshop Filter List'
  },
  {
    id: 'search-bar',
    name: '语义搜索',
    category: 'interaction',
    description: '关键字或自然语言检索对象与场景数据，支持推荐与历史。',
    tags: ['检索', '自然语言'],
    status: 'planned',
    reference: 'Workshop Search'
  },
  {
    id: 'action-form',
    name: '操作表单',
    category: 'interaction',
    description: '绑定本体行为动作，采集参数并提交写回或触发自动化。',
    tags: ['表单', '写回', '动作'],
    status: 'planned',
    reference: 'Workshop Button / Action Form'
  },
  {
    id: 'button-group',
    name: '按钮组',
    category: 'interaction',
    description: '快捷操作入口，触发场景跳转、导出或规则执行。',
    tags: ['快捷操作', '导出'],
    status: 'available',
    reference: 'Workshop Buttons'
  },
  {
    id: 'markdown',
    name: '富文本 / Markdown',
    category: 'content',
    description: '在应用中嵌入方案说明、研判结论与操作指引。',
    tags: ['说明', '结论'],
    status: 'available',
    reference: 'Workshop Markdown'
  },
  {
    id: 'media-viewer',
    name: '媒体查看器',
    category: 'content',
    description: '预览图片、视频与文档附件，支持标注与关联对象。',
    tags: ['图片', '视频', '附件'],
    status: 'planned',
    reference: 'Workshop Media'
  },
  {
    id: 'iframe-embed',
    name: '外部嵌入',
    category: 'content',
    description: '嵌入第三方页面或内部子系统，扩展应用能力边界。',
    tags: ['嵌入', 'iframe'],
    status: 'planned',
    reference: 'Workshop Embed'
  }
];

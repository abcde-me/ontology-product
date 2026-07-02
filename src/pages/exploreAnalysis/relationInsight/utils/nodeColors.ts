import type {
  KnowledgeGraphNodeData,
  RelationGraphEdge,
  RelationGraphNode
} from '../types';

export type NodeColorTone = 'warm' | 'cool';

/** 四主色 */
const BRAND_CHINA_RED = '#C41E3A';
const BRAND_HERMES_ORANGE = '#E85D04';
const BRAND_KLEIN_BLUE = '#002FA7';
const BRAND_GREEN = '#16A34A';

/** 连线源端：中国红、爱马仕橙及同系深浅 */
const WARM_PALETTE = [
  BRAND_CHINA_RED,
  BRAND_HERMES_ORANGE,
  '#A81832',
  '#F37021'
];

/** 连线目标端：克莱因蓝、绿及同系深浅 */
const COOL_PALETTE = [BRAND_KLEIN_BLUE, BRAND_GREEN, '#1E40AF', '#22C55E'];

const ISOLATED_NODE_COLOR = '#94A3B8';

export const DEFAULT_EDGE_COLOR = '#CBD5E1';

/** 焦点节点：克莱因蓝（图谱中心） */
export const FOCUS_NODE_FILL = BRAND_KLEIN_BLUE;
/** 焦点节点边框 */
export const FOCUS_NODE_BORDER = 'rgba(255, 255, 255, 0.92)';
/** 焦点节点选中：爱马仕橙，与蓝底形成对比 */
export const FOCUS_NODE_SELECTED_FILL = BRAND_HERMES_ORANGE;

const parseHexColor = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized.slice(0, 6);

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ];
};

const toHexChannel = (channel: number) =>
  Math.max(0, Math.min(255, Math.round(channel)))
    .toString(16)
    .padStart(2, '0');

const shadeHexColor = (hex: string, amount: number): string => {
  const [r, g, b] = parseHexColor(hex);

  return `#${toHexChannel(r + amount)}${toHexChannel(g + amount)}${toHexChannel(b + amount)}`;
};

export const shadeNodeColor = (hex: string, amount: number): string =>
  shadeHexColor(hex, amount);

const hashString = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
};

export const getToneColor = (
  tone: NodeColorTone,
  objectTypeId?: number,
  nodeId?: string
): string => {
  const palette = tone === 'warm' ? WARM_PALETTE : COOL_PALETTE;
  const seed =
    objectTypeId != null
      ? Math.abs(objectTypeId)
      : nodeId
        ? hashString(nodeId)
        : 0;

  return palette[seed % palette.length];
};

const resolveNodeTone = (
  node: RelationGraphNode,
  asSource: Set<string>,
  asTarget: Set<string>
): NodeColorTone => {
  if (node.data.isFocus) {
    return 'warm';
  }

  const isSource = asSource.has(node.id);
  const isTarget = asTarget.has(node.id);

  if (isSource && !isTarget) {
    return 'warm';
  }

  if (isTarget && !isSource) {
    return 'cool';
  }

  if (isSource) {
    return 'warm';
  }

  if (isTarget) {
    return 'cool';
  }

  return 'cool';
};

/** 按连线方向分配冷暖色：source 暖色，target 冷暗色 */
export const applyEdgePairNodeColors = (
  nodes: RelationGraphNode[],
  edges: RelationGraphEdge[]
): RelationGraphNode[] => {
  if (nodes.length === 0) {
    return nodes;
  }

  const asSource = new Set(edges.map((edge) => edge.source));
  const asTarget = new Set(edges.map((edge) => edge.target));

  return nodes.map((node) => {
    const hasEdge = asSource.has(node.id) || asTarget.has(node.id);
    const tone = resolveNodeTone(node, asSource, asTarget);
    const color = node.data.isFocus
      ? FOCUS_NODE_FILL
      : hasEdge
        ? getToneColor(tone, node.data.objectTypeId, node.id)
        : ISOLATED_NODE_COLOR;

    return {
      ...node,
      data: {
        ...node.data,
        color
      }
    };
  });
};

/** 实色填充，与参考图谱一致 */
export const getNodeGradient = (baseColor: string): string => baseColor;

export const getFocusNodeFillColor = (selected: boolean): string =>
  selected ? FOCUS_NODE_SELECTED_FILL : FOCUS_NODE_FILL;

export const getFocusNodeGradient = (selected: boolean): string =>
  getNodeGradient(getFocusNodeFillColor(selected));

/** 节点当前展示色（选中焦点节点使用选中填充色） */
export const getNodeDisplayColor = (
  data: Pick<KnowledgeGraphNodeData, 'color' | 'isFocus'>,
  selected = false
): string => {
  if (data.isFocus) {
    return getFocusNodeFillColor(selected);
  }

  return data.color;
};

/** 节点标签默认/选中文字色（实色节点上用浅色字） */
export const NODE_LABEL_COLOR = '#FFFFFF';
export const NODE_LABEL_SELECTED_COLOR = '#FFFBEB';

/** @deprecated 由 applyEdgePairNodeColors 统一分配 */
export const getCategoryColor = (
  objectTypeId?: number,
  isFocus = false
): string => {
  if (isFocus) {
    return FOCUS_NODE_FILL;
  }

  return getToneColor('cool', objectTypeId);
};

export const getNodeSize = (isFocus: boolean): number => (isFocus ? 88 : 64);

import type { InstanceQueryRow } from '@/pages/exploreAnalysis/objectBrowse/types';

export interface SelectedObjectContext {
  sceneId: number;
  sceneName?: string;
  objectTypeId: number;
  objectTypeName?: string;
  objectTypeCode?: string;
  instanceId: string;
  instanceLabel?: string;
  /** 是否已按图谱模式载入（含关联展开） */
  loadedAsGraph?: boolean;
}

export type RelationLoadMode = 'nodes-only' | 'graph';

export type QueryResultLoadStatus = 'pending' | 'loaded';

export interface QueryResultItem {
  key: string;
  sceneId: number;
  sceneName?: string;
  objectTypeId: number;
  objectTypeName?: string;
  objectTypeCode?: string;
  instanceId: string;
  instanceLabel: string;
  phone?: string;
  rawRecord?: InstanceQueryRow;
  loadStatus: QueryResultLoadStatus;
}

export type GraphAlgorithmKey =
  | 'neighbor-1'
  | 'neighbor-2'
  | 'connected'
  | 'shortest-path';

export type CanvasModeKey = 'minimal' | 'detail';

export type GraphLayoutKey =
  | 'force'
  | 'hierarchical'
  | 'circular'
  | 'grid'
  | 'neural'
  | 'radiation';

export interface KnowledgeGraphNodeData {
  label: string;
  subLabel?: string;
  isFocus?: boolean;
  objectTypeId?: number;
  objectTypeName?: string;
  instanceId?: string;
  sceneId?: number;
  color: string;
  size: number;
  detailFields?: Array<{ label: string; value: string }>;
}

export interface RelationGraphNode {
  id: string;
  type: 'knowledgeNode';
  data: KnowledgeGraphNodeData;
  position: { x: number; y: number };
}

export interface RelationGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'knowledgeEdge';
  data?: {
    linkName?: string;
    edgeColor?: string;
  };
}

export interface RelationGraphData {
  nodes: RelationGraphNode[];
  edges: RelationGraphEdge[];
}

export interface RelationInsightFavorite {
  id: string;
  sceneId: number;
  sceneName?: string;
  objectTypeId: number;
  objectTypeName?: string;
  instanceId: string;
  instanceLabel?: string;
  createdAt: number;
}

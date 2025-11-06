/**
 * RAG Detail Page Types
 */

// 文件类型定义 - 按照文件格式区分，而不是内容结构
export type FileType = 'pdf' | 'ppt' | 'excel';

// 为了向后兼容，保留SceneType别名
export type SceneType = FileType;

// PDF坐标信息 - 前端使用格式
export interface PDFCoordinate {
  page: number; // 页码（1-based）
  x1: number; // 左上角X坐标
  y1: number; // 左上角Y坐标
  x2: number; // 右下角X坐标
  y2: number; // 右下角Y坐标
}

// 后端返回的位置数据格式: { "0": [x1, y1, x2, y2], "1": [...] }
export type PositionBBox = Record<string, number[]>;

// 后端返回的分段数据结构
export interface ApiSegment {
  id: string;
  dataset_id: string;
  document_id: string;
  position_bbox: PositionBBox;
  position: number;
  content: string;
  content_shot: string;
  word_count: number;
  tokens: number;
  enabled: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  type: number;
  full_title: string;
  title_id: string;
  node_id: number;
  level: number;
  title: string;
  tag_status: number;
}

// 前端使用的分段类型
export interface Segment {
  id: string;
  content: string;
  charCount: number;
  segmentIndex: number;
  createdAt: string;
  updatedAt: string;
  pdfCoordinates?: PDFCoordinate[]; // 可能跨多页
  title?: string;
  fullTitle?: string;
  level?: number;
}

// 分层级分段（场景2）
export interface HierarchicalSegment extends Segment {
  level: number; // 1-5
  parentId?: string;
  children?: HierarchicalSegment[];
}

// 图文混合分段（场景3）
export interface ImageTextSegment extends Segment {
  images?: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
}

// PPT分段（场景4）
export interface PptSegment extends Segment {
  slideNumber: number;
  slideTitle?: string;
  slideContent?: string;
}

// 表格分段（场景5）
export interface TableSegment extends Segment {
  tableData?: {
    headers: string[];
    rows: Array<Record<string, string>>;
  };
}

// 元素类型定义
export type ElementType = 'text' | 'image' | 'table';

// 文本元素
export interface TextElement {
  id: string;
  type: 'text';
  content: string;
  relatedDescription?: string; // 关键描述
  extractionEntity?: string[]; // 抽取实体（标签）
  positionType?: string; // 定位类型
  positionInfo?: string; // 位置信息
}

// 图片元素
export interface ImageElement {
  id: string;
  type: 'image';
  url: string;
  relatedDescription?: string; // 关键描述
  extractionEntity?: string[]; // 抽取实体（标签）
  positionType?: string; // 定位类型
  positionInfo?: string; // 位置信息
  dimensions?: string; // 尺寸
  modifiers?: string; // 修饰
}

// 表格元素
export interface TableElement {
  id: string;
  type: 'table';
  headers: string[];
  rows: Array<Record<string, string>>;
  relatedDescription?: string; // 关键描述
  extractionEntity?: string[]; // 抽取实体（标签）
  positionType?: string; // 定位类型
  positionInfo?: string; // 位置信息
}

// 元素联合类型
export type Element = TextElement | ImageElement | TableElement;

// 分段详情数据
export interface SegmentDetailData {
  segmentId: string;
  charCount: number;
  elements: Element[];
}

// 后端返回的目录树节点结构
export interface ApiCatalogNode {
  title: string;
  title_id: string;
  position: Record<string, string>; // {"0": "[73,109,481,137]"}
  short_text_positions: Record<string, string> | null; // {"segment-id": "{\"0\":[73,141,284,157]}"}
  level: number;
  short_texts?: string[];
  node_id: number;
  segment_ids: string[] | null;
  children?: ApiCatalogNode[];
}

// 前端使用的目录树节点
export interface DirectoryNode {
  id: string;
  label: string;
  level: number;
  children?: DirectoryNode[];
  segmentIds?: string[];
  position?: PDFCoordinate[]; // 标题在PDF中的位置
  isShort?: boolean; // 标记是否为short_text节点（子级）
}

export interface RagDetailData {
  ragId: string;
  fileName: string;
  filePath: string;
  sceneType: SceneType;
  segments:
    | Segment[]
    | HierarchicalSegment[]
    | ImageTextSegment[]
    | PptSegment[]
    | TableSegment[];
  directory?: DirectoryNode[]; // 仅在hierarchical场景中使用
}

export interface SegmentUpdatePayload {
  segmentId: string;
  content: string;
}

export interface RagDetailState {
  ragId: string | null;
  fileName: string;
  filePath: string;
  sceneType: SceneType;
  segments:
    | Segment[]
    | HierarchicalSegment[]
    | ImageTextSegment[]
    | PptSegment[]
    | TableSegment[];
  directory?: DirectoryNode[];
  selectedSegmentId: string | null;
  selectedDirectoryNodeId?: string | null; // 用于hierarchical场景
  editingSegmentId: string | null;
  showPdfViewer: boolean;
  showImageModal: boolean;
  selectedImageUrl?: string;
  highlightedPdfCoordinate?: PDFCoordinate; // PDF高亮坐标（单个，保留向后兼容）
  highlightedPdfCoordinates?: PDFCoordinate[]; // PDF高亮坐标（多个，支持跨页）
  loading: boolean;
  error: string | null;
  // Segment Drawer state
  segmentDrawerVisible: boolean;
  segmentDrawerTab: 'detail' | 'trace';
  segmentDrawerSegmentId: string | null;
}

export interface RagDetailActions {
  initializeRagDetail: (ragId: string) => Promise<void>;
  selectSegment: (segmentId: string) => void;
  selectDirectoryNode: (nodeId: string) => void;
  startEditingSegment: (segmentId: string) => void;
  cancelEditingSegment: () => void;
  updateSegmentContent: (segmentId: string, content: string) => Promise<void>;
  togglePdfViewer: () => void;
  openImageModal: (imageUrl: string) => void;
  closeImageModal: () => void;
  highlightPdfSegment: (segmentId: string) => void;
  highlightPdfCoordinates: (coordinates: PDFCoordinate[]) => void; // 新增：高亮多个坐标
  clearPdfHighlight: () => void;
  setError: (error: string | null) => void;
  setSelectedSegmentId: (segmentId: string | null) => void;
  scrollToSegment: (segmentId: string) => void;
  // Segment Drawer actions
  openSegmentDrawer: (segmentId: string, tab: 'detail' | 'trace') => void;
  closeSegmentDrawer: () => void;
}

export type RagDetailStore = RagDetailState & RagDetailActions;

/**
 * Component Props Types
 */

export interface HeaderProps {
  filePath: string;
  fileName: string;
}

export interface MainContentProps {
  showPdfViewer: boolean;
  loading: boolean;
}

export interface PdfViewerProps {
  fileName: string;
}

export interface SegmentListProps {
  segments: Segment[];
  selectedSegmentId: string | null;
}

export interface SegmentListHeaderProps {
  segments: Segment[];
  showPdfViewer: boolean;
  onTogglePdfViewer: () => void;
}

export interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
  onSelect: (segmentId: string) => void;
  onStartEditing: (segmentId: string) => void;
  isEditing: boolean;
}

export interface SegmentCardActionsProps {
  segment: Segment;
  isEditing: boolean;
  onEdit: (segmentId: string) => void;
}

export interface SegmentCardContentProps {
  segment: Segment;
  isEditing: boolean;
  onUpdate: (segmentId: string, content: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * API Response Types
 */

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// export interface RagDetailResponse extends ApiResponse<RagDetailData> { }

// export interface SegmentUpdateResponse extends ApiResponse<Segment> { }

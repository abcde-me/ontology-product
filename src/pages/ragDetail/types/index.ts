/**
 * RAG Detail Page Types
 */

// 文件类型定义 - 按照文件格式区分，而不是内容结构
export type FileType = 'pdf' | 'ppt' | 'excel';

// 为了向后兼容，保留SceneType别名
export type SceneType = FileType;

// PDF坐标信息 (position_bbox)
export interface PDFCoordinate {
  page: number; // 页码（1-based）
  x: number; // 左上角X坐标
  y: number; // 左上角Y坐标
  w: number; // 宽度
  h: number; // 高度
}

// 基础分段类型
export interface Segment {
  id: string;
  content: string;
  charCount: number;
  segmentIndex: number;
  createdAt: string;
  updatedAt: string;
  pdfCoordinate?: PDFCoordinate; // PDF中的坐标信息（可选）
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

// 目录树节点（场景2）
export interface DirectoryNode {
  id: string;
  label: string;
  level: number;
  children?: DirectoryNode[];
  segmentIds?: string[];
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
  highlightedPdfCoordinate?: PDFCoordinate; // PDF高亮坐标
  loading: boolean;
  error: string | null;
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
  clearPdfHighlight: () => void;
  setError: (error: string | null) => void;
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

/**
 * RAG Detail Page Types
 */

// 文件类型定义 - 按照文件格式区分，而不是内容结构
export type FileType = 'pdf' | 'ppt' | 'excel';

// 为了向后兼容，保留SceneType别名
export type SceneType = FileType;

// PDF坐标信息 - 前端使用格式
// 支持 bbox 为空的情况：仅定位到页面，不高亮
export interface PDFCoordinate {
  page: number; // 页码（1-based）
  x1?: number; // 左上角X坐标（可选，为空时仅定位不高亮）
  y1?: number; // 左上角Y坐标（可选，为空时仅定位不高亮）
  x2?: number; // 右下角X坐标（可选，为空时仅定位不高亮）
  y2?: number; // 右下角Y坐标（可选，为空时仅定位不高亮）
}

// 新的后端返回的位置数据格式
export interface ApiPosition {
  page_id: number; // 页码（0-based）
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

// 旧的后端返回的位置数据格式: { "0": [x1, y1, x2, y2], "1": [...] }
export type PositionBBox = Record<string, number[]>;

// 新的后端返回的分段数据结构
export interface ApiSegment {
  id: string;
  document_id: string;
  index: number;
  positions: ApiPosition[] | null; // 可能为 null
  content: string;
  type: 'text' | 'image' | 'table'; // 分段类型
  char_count: number;
  parent_title: string;
  parent_title_id: string;
  enabled: boolean;
  source: string; // 'Auto' | 'Manual'
  is_edit: boolean;
}

// 旧的后端返回的分段数据结构（保留以兼容旧数据）
export interface ApiSegmentOld {
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
  createdAt?: string;
  updatedAt?: string;
  pdfCoordinates?: PDFCoordinate[]; // 可能跨多页
  parentTitle?: string;
  parentTitleId?: string; // 新增：用于关联目录树
  fullTitle?: string;
  level?: number;
  type?: 'text' | 'image' | 'table'; // 新增：分段类型
  enabled?: boolean;
  source?: string;
  isEdit?: boolean;
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
export type ElementType = 'text' | 'image' | 'table' | 'formula';

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
  bucketName?: string; // S3 bucket 名称
  path?: string; // S3 路径
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

// 公式元素
export interface FormulaElement {
  id: string;
  type: 'formula';
  content: string;
  relatedDescription?: string; // 关键描述
  extractionEntity?: string[]; // 抽取实体（标签）
  positionType?: string; // 定位类型
  positionInfo?: string; // 位置信息
}

// 元素联合类型
export type Element =
  | TextElement
  | ImageElement
  | TableElement
  | FormulaElement;

// 分段增强信息
export interface EnhancementInfo {
  summary: string; // 分段总结
  hypotheticalAnswer: string; // 假设性问答
  extractionEntity?: string[]; // 实体
  tags?: string[]; // 标签
}

// 新的后端返回的位置信息（用于分段详情）
export interface ApiPositionDetail {
  bbox?: [number, number, number, number]; // 坐标 [x1, y1, x2, y2]
  text_offset?: {
    start: number;
    end: number;
  };
  xpath?: string;
  block_index?: number;
  page_id?: number; // 页码
}

// 新的后端返回的元素格式
export interface ApiMaterial {
  id: string; // 元素ID
  type: 'text' | 'title' | 'table' | 'image' | 'formula'; // 元素类型
  text: string; // 文本内容（对于image是s3路径，对于table是JSON字符串，对于formula是公式字符串）
  positions?: ApiPositionDetail[]; // 位置信息
  uri?: string; // 资源URI（如S3路径）
  bucket_name?: string; // S3 bucket 名称（图片专用）
  path?: string; // S3 路径（图片专用）
}

// 新的后端返回的AI增强数据
export interface ApiAiData {
  summaries?: string; // 总结
  questions?: string; // 假设性问题
  keywords?: string[]; // 实体
  tags?: Array<{
    id: number;
    name: string;
  }>; // 标签
}

// 新的后端返回的分段详情数据
export interface ApiSegmentDetail {
  id: string; // 分段编号
  char_count: number; // 分段大小
  parent_id?: string; // 父分片ID
  left_chunk_id?: string; // 左邻分片ID
  right_chunk_id?: string; // 右邻分片ID
  materials?: ApiMaterial[]; // 元素列表
  ai_data?: ApiAiData; // AI增强数据
}

// 分段详情数据
export interface SegmentDetailData {
  segmentId: string;
  charCount: number;
  elements: Element[];
  enhancement?: EnhancementInfo; // 分段增强信息（可选）
  metadata?: Record<string, string>; // 元数据（可选）
}

// 新的后端返回的目录树节点结构
export interface ApiCatalogNode {
  level: number;
  type: 'Title' | 'Text'; // Title: 标题节点（不高亮分段），Text: 文本节点（高亮分段）
  chunk_id: string; // 对应分段的 id 或 title_id
  content: string;
  positions: ApiPosition[] | null; // 可能为 null
  children?: ApiCatalogNode[];
}

// 旧的后端返回的目录树节点结构（保留以兼容旧数据）
export interface ApiCatalogNodeOld {
  title: string;
  title_id: string;
  position: Record<string, string>; // {"0": "[73,109,481,137]"}
  short_text_positions: Record<string, string> | null; // {"segment-id": "{\"0\":[73,141,284,157]}"}
  level: number;
  short_texts?: string[];
  node_id: number;
  segment_ids: string[] | null;
  children?: ApiCatalogNodeOld[];
}

// 前端使用的目录树节点
export interface DirectoryNode {
  id: string; // 对应 chunk_id
  label: string; // 对应 content
  level: number;
  type: 'Title' | 'Text'; // Title: 标题节点（不高亮分段），Text: 文本节点（高亮分段）
  children?: DirectoryNode[];
  segmentIds?: string[]; // 关联的分段ID列表（用于滚动定位）
  position?: PDFCoordinate[]; // 在PDF中的位置
  isShort?: boolean; // 标记是否为short_text节点（子级）- 保留以兼容旧逻辑
}

export interface RagDetailData {
  ragId: string;
  fileName: string;
  filePath: string; // 显示用的文件路径
  sceneType: SceneType;
  segments:
    | Segment[]
    | HierarchicalSegment[]
    | ImageTextSegment[]
    | PptSegment[]
    | TableSegment[];
  directory?: DirectoryNode[]; // 仅在hierarchical场景中使用
  bucket?: string; // 文件存储桶
  path?: string; // 文件实际存储路径
}

export interface SegmentUpdatePayload {
  segmentId: string;
  content: string;
}

export interface RagDetailState {
  ragId: string | null;
  datasetId: number | null; // 数据集ID
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
  // Segment search state
  segmentSearchText: string;
  // File binary data state
  fileBinaryData: ArrayBuffer | null; // 文件二进制数据
  fileBinaryDataLoading: boolean; // 文件二进制数据加载状态
  fileBinaryDataError: string | null; // 文件二进制数据加载错误
  bucket: string; // 文件存储桶
  path: string; // 文件路径
  // Document info state
  documentName: string; // 文件名称（来自API）
  datasetName: string; // 数据集名称（来自URL）
  documentFormat: string; // 文件格式（来自API，对应sceneType）
}

export interface RagDetailActions {
  initializeRagDetail: (
    datasetId: number,
    documentId: string,
    bucketName?: string | null,
    path?: string | null,
    datasetName?: string | null
  ) => Promise<void>;
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
  // Segment search actions
  setSegmentSearchText: (text: string) => void;
  // File binary data actions
  loadFileBinaryData: (
    bucket: string,
    path: string,
    isConvertPdf: boolean
  ) => Promise<void>;
  clearFileBinaryData: () => void;
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

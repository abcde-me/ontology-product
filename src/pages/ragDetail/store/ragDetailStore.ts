import { create } from 'zustand';
import {
  fetchRagDetail,
  updateSegmentContent as apiUpdateSegmentContent
} from '../api/ragDetailApi';
import {
  Segment,
  RagDetailState,
  RagDetailActions,
  SceneType,
  DirectoryNode,
  HierarchicalSegment,
  ImageTextSegment,
  PptSegment,
  TableSegment,
  PDFCoordinate
} from '../types';

// 导出Segment类型供其他组件使用
export type {
  Segment,
  HierarchicalSegment,
  ImageTextSegment,
  PptSegment,
  TableSegment
};

export const useRagDetailStore = create<RagDetailState & RagDetailActions>(
  (set, get) => ({
    // State
    ragId: null,
    fileName: '',
    filePath: '',
    sceneType: 'pdf', // 默认为PDF文件类型
    segments: [],
    directory: undefined,
    selectedSegmentId: null,
    selectedDirectoryNodeId: null,
    editingSegmentId: null,
    showPdfViewer: true,
    showImageModal: false,
    selectedImageUrl: undefined,
    highlightedPdfCoordinate: undefined,
    highlightedPdfCoordinates: undefined,
    loading: false,
    error: null,
    // Segment Drawer state
    segmentDrawerVisible: false,
    segmentDrawerTab: 'trace',
    segmentDrawerSegmentId: null,

    // Actions
    initializeRagDetail: async (ragId: string) => {
      set({ loading: true, error: null });
      try {
        const data = await fetchRagDetail(ragId);
        set({
          ragId,
          fileName: data.fileName,
          filePath: data.filePath,
          sceneType: data.sceneType,
          segments: data.segments,
          directory: data.directory,
          // 默认不选中任何分段和目录节点
          selectedSegmentId: null,
          selectedDirectoryNodeId: null,
          loading: false
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to load RAG detail',
          loading: false
        });
      }
    },

    selectSegment: (segmentId: string) => {
      set({ selectedSegmentId: segmentId, editingSegmentId: null });

      // 如果有目录树，找到对应的目录节点并高亮
      const directory = get().directory;
      if (directory) {
        const findNodeBySegmentId = (
          nodes: DirectoryNode[],
          targetSegmentId: string
        ): string | null => {
          for (const node of nodes) {
            // 检查当前节点的 segmentIds
            if (node.segmentIds && node.segmentIds.includes(targetSegmentId)) {
              return node.id;
            }
            // 递归检查子节点
            if (node.children) {
              const result = findNodeBySegmentId(
                node.children,
                targetSegmentId
              );
              if (result) return result;
            }
          }
          return null;
        };

        const nodeId = findNodeBySegmentId(directory, segmentId);
        if (nodeId) {
          set({ selectedDirectoryNodeId: nodeId });
        }
      }
    },

    selectDirectoryNode: (nodeId: string) => {
      set({ selectedDirectoryNodeId: nodeId });
      // 自动滚动到该节点对应的第一个分段
      const directory = get().directory;
      if (directory) {
        const findSegmentId = (nodes: DirectoryNode[]): string | null => {
          for (const node of nodes) {
            if (
              node.id === nodeId &&
              node.segmentIds &&
              node.segmentIds.length > 0
            ) {
              return node.segmentIds[0];
            }
            if (node.children) {
              const result = findSegmentId(node.children);
              if (result) return result;
            }
          }
          return null;
        };
        const segmentId = findSegmentId(directory);
        if (segmentId) {
          set({ selectedSegmentId: segmentId });
        }
      }
    },

    startEditingSegment: (segmentId: string) => {
      set({ editingSegmentId: segmentId });
    },

    cancelEditingSegment: () => {
      set({ editingSegmentId: null });
    },

    updateSegmentContent: async (segmentId: string, content: string) => {
      try {
        const ragId = get().ragId;
        if (!ragId) throw new Error('RAG ID not found');

        await apiUpdateSegmentContent(ragId, segmentId, content);

        const segments = get().segments.map((seg) =>
          seg.id === segmentId
            ? {
                ...seg,
                content,
                charCount: content.length,
                updatedAt: new Date().toISOString()
              }
            : seg
        );
        set({ segments, editingSegmentId: null });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : 'Failed to update segment'
        });
      }
    },

    togglePdfViewer: () => {
      set((state) => ({ showPdfViewer: !state.showPdfViewer }));
    },

    openImageModal: (imageUrl: string) => {
      set({ showImageModal: true, selectedImageUrl: imageUrl });
    },

    closeImageModal: () => {
      set({ showImageModal: false, selectedImageUrl: undefined });
    },

    highlightPdfSegment: (segmentId: string) => {
      const segments = get().segments;
      const segment = segments.find((s) => s.id === segmentId);

      if (
        segment &&
        segment.pdfCoordinates &&
        segment.pdfCoordinates.length > 0
      ) {
        // 使用第一个坐标进行高亮
        set({ highlightedPdfCoordinate: segment.pdfCoordinates[0] });
      }
    },

    clearPdfHighlight: () => {
      set({
        highlightedPdfCoordinate: undefined,
        highlightedPdfCoordinates: undefined
      });
    },

    // 新增：高亮多个PDF坐标
    highlightPdfCoordinates: (coordinates: PDFCoordinate[]) => {
      set({ highlightedPdfCoordinates: coordinates });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    // 设置选中的分段ID（用于高亮）
    setSelectedSegmentId: (segmentId: string | null) => {
      set({ selectedSegmentId: segmentId });
    },

    // 滚动到指定分段
    scrollToSegment: (segmentId: string) => {
      // 触发滚动事件，由SegmentList组件监听
      const event = new CustomEvent('scrollToSegment', {
        detail: { segmentId }
      });
      window.dispatchEvent(event);
    },

    // Segment Drawer actions
    openSegmentDrawer: (segmentId: string, tab: 'detail' | 'trace') => {
      set({
        segmentDrawerVisible: true,
        segmentDrawerTab: tab,
        segmentDrawerSegmentId: segmentId
      });
    },

    closeSegmentDrawer: () => {
      set({
        segmentDrawerVisible: false,
        segmentDrawerSegmentId: null
      });
    }
  })
);

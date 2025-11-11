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
    segmentDrawerTab: 'detail',
    segmentDrawerSegmentId: null,
    // Segment search state
    segmentSearchText: '',

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
      const segments = get().segments;

      if (directory && segments) {
        // 先找到被点击的分段
        const clickedSegment = segments.find((seg) => seg.id === segmentId);

        // 查找目录树节点的逻辑：
        // 1. 如果分段有 titleId，优先查找 type='text' 且 chunk_id 等于分段 id 的节点
        // 2. 如果找不到，再查找包含该 segmentId 的节点
        const findNodeBySegmentId = (
          nodes: DirectoryNode[],
          targetSegmentId: string,
          targetTitleId?: string
        ): string | null => {
          for (const node of nodes) {
            // 优先匹配：type='text' 且 chunk_id 等于分段 id
            if (node.type === 'text' && node.id === targetSegmentId) {
              return node.id;
            }

            // 递归检查子节点
            if (node.children) {
              const result = findNodeBySegmentId(
                node.children,
                targetSegmentId,
                targetTitleId
              );
              if (result) return result;
            }
          }
          return null;
        };

        const nodeId = findNodeBySegmentId(
          directory,
          segmentId,
          clickedSegment?.titleId
        );

        if (nodeId) {
          set({ selectedDirectoryNodeId: nodeId });
        }
      }
    },

    selectDirectoryNode: (nodeId: string) => {
      set({ selectedDirectoryNodeId: nodeId });

      const directory = get().directory;
      if (!directory) return;

      // 查找被点击的节点
      const findNode = (nodes: DirectoryNode[]): DirectoryNode | null => {
        for (const node of nodes) {
          if (node.id === nodeId) {
            return node;
          }
          if (node.children) {
            const result = findNode(node.children);
            if (result) return result;
          }
        }
        return null;
      };

      const clickedNode = findNode(directory);
      if (!clickedNode) return;

      // 高亮 PDF 坐标（无论是 title 还是 text 类型）
      if (clickedNode.position && clickedNode.position.length > 0) {
        get().highlightPdfCoordinates(clickedNode.position);
      }

      // 根据节点类型决定是否高亮分段
      if (clickedNode.type === 'text') {
        // type='text': 高亮对应的分段（chunk_id 就是分段的 id）
        set({ selectedSegmentId: clickedNode.id });
        // 滚动到该分段
        get().scrollToSegment(clickedNode.id);
      } else if (clickedNode.type === 'title') {
        // type='title': 只滚动到第一个关联的分段，不高亮
        if (clickedNode.segmentIds && clickedNode.segmentIds.length > 0) {
          const firstSegmentId = clickedNode.segmentIds[0];
          // 清除分段高亮
          set({ selectedSegmentId: null });
          // 滚动到第一个分段
          get().scrollToSegment(firstSegmentId);
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
    },

    // Segment search actions
    setSegmentSearchText: (text: string) => {
      set({ segmentSearchText: text });
    }
  })
);

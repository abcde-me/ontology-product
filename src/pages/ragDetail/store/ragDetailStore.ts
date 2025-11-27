import { create } from 'zustand';
import {
  fetchRagDetail,
  updateSegmentContent as apiUpdateSegmentContent,
  fetchSegments
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
import {
  getFileBinaryData,
  GetFileBinaryDataParams,
  getKnowledgeDocument
} from '@/api/modules/rag';

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
    datasetId: null,
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
    // File binary data state
    fileBinaryData: null,
    fileBinaryDataLoading: false,
    fileBinaryDataError: null,
    bucket: '',
    path: '',
    // Document info state
    documentName: '',
    datasetName: '',
    documentFormat: '',

    // Actions
    initializeRagDetail: async (
      datasetId: number,
      documentId: string,
      bucketName?: string | null,
      path?: string | null,
      datasetNameParam?: string | null
    ) => {
      set({ loading: true, error: null });
      try {
        // 先调用 getKnowledgeDocument 获取文件详情
        let documentName = '';
        let documentFormat = '';
        try {
          const docResponse = await getKnowledgeDocument({
            document_id: documentId
          });
          if (docResponse && docResponse.data) {
            documentName = docResponse.data.name || '';
            documentFormat = docResponse.data.format || '';
          }
        } catch (docError) {
          console.warn('⚠️ 获取文件详情失败:', docError);
        }

        const data = await fetchRagDetail(datasetId, documentId);

        // 优先使用 URL 参数中的 bucket 和 path，如果没有则使用 API 返回的
        const finalBucket = bucketName || data.bucket || '';
        const finalPath = path || data.path || '';

        // 如果 API 返回了 documentFormat，将其映射到 sceneType
        let finalSceneType = data.sceneType;
        if (documentFormat) {
          const formatLower = documentFormat.toLowerCase();
          if (formatLower === 'pdf') {
            finalSceneType = 'pdf';
          } else if (formatLower === 'ppt' || formatLower === 'pptx') {
            finalSceneType = 'ppt';
          } else if (
            formatLower === 'excel' ||
            formatLower === 'xlsx' ||
            formatLower === 'xls'
          ) {
            finalSceneType = 'excel';
          }
        }
        console.log('finalSceneType', finalSceneType);
        set({
          datasetId: Number(datasetId), // 保存 datasetId
          ragId: documentId, // 使用 documentId 作为 ragId
          fileName: data.fileName,
          filePath: data.filePath,
          sceneType: finalSceneType,
          segments: data.segments,
          directory: data.directory,
          bucket: finalBucket, // 保存 bucket
          path: finalPath, // 保存 path
          // 文件详情
          documentName,
          datasetName: datasetNameParam || '',
          documentFormat,
          // 默认不选中任何分段和目录节点
          selectedSegmentId: null,
          selectedDirectoryNodeId: null,
          loading: false
        });

        // @ts-ignore
        const isConvertPdf =
          finalSceneType === 'xlsx' || finalSceneType === 'xls' ? false : true;

        // 如果有 bucket 和 path，自动加载文件二进制数据
        if (finalBucket && finalPath) {
          console.log('🔍 自动加载文件二进制数据:', {
            bucket: finalBucket,
            path: finalPath
          });
          get().loadFileBinaryData(finalBucket, finalPath, isConvertPdf);
        } else {
          console.warn('⚠️ 缺少 bucket 或 path，无法加载文件二进制数据');
        }
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
        // 1. 如果分段有 parentTitleId，优先查找 type='text' 且 chunk_id 等于分段 id 的节点
        // 2. 如果找不到，再查找包含该 segmentId 的节点
        const findNodeBySegmentId = (
          nodes: DirectoryNode[],
          targetSegmentId: string,
          targetParentTitleId?: string
        ): string | null => {
          for (const node of nodes) {
            // 优先匹配：type='Text' 且 chunk_id 等于分段 id
            if (node.type === 'Text' && node.id === targetSegmentId) {
              return node.id;
            }

            // 递归检查子节点
            if (node.children) {
              const result = findNodeBySegmentId(
                node.children,
                targetSegmentId,
                targetParentTitleId
              );
              if (result) return result;
            }
          }
          return null;
        };

        const nodeId = findNodeBySegmentId(
          directory,
          segmentId,
          clickedSegment?.parentTitleId
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
      if (clickedNode.type === 'Text') {
        // type='Text': 高亮对应的分段（chunk_id 就是分段的 id）
        set({ selectedSegmentId: clickedNode.id });
        // 滚动到该分段
        get().scrollToSegment(clickedNode.id);
      } else if (clickedNode.type === 'Title') {
        // type='Title': 只滚动到第一个关联的分段，不高亮
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
        const datasetId = get().datasetId;
        const documentId = get().ragId;
        if (!datasetId || !documentId) {
          throw new Error('Dataset ID or Document ID not found');
        }

        console.log('🔄 开始更新分段内容:', { segmentId, content });

        // 调用更新接口
        await apiUpdateSegmentContent(
          datasetId,
          documentId,
          segmentId,
          content
        );

        console.log('✅ 分段内容更新成功，重新获取分段列表...');

        // 更新成功后，重新获取分段列表数据
        const updatedSegments = await fetchSegments(datasetId, documentId);

        console.log('✅ 分段列表刷新成功:', updatedSegments);

        // 更新 store 中的 segments 数据
        set({
          segments: updatedSegments,
          editingSegmentId: null
        });
      } catch (error) {
        console.error('❌ 更新分段内容失败:', error);
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
    },

    // File binary data actions
    loadFileBinaryData: async (
      bucket: string,
      path: string,
      isConvertPdf: boolean
    ) => {
      set({
        fileBinaryDataLoading: true,
        fileBinaryDataError: null,
        bucket,
        path
      });

      try {
        console.log('🔍 开始加载文件二进制数据:', { bucket, path });
        const response = await getFileBinaryData({
          bucket_name: bucket,
          path,
          convert_pdf: isConvertPdf
        });
        console.log('✅ 文件二进制数据加载成功:', response);

        set({
          fileBinaryData: response as ArrayBuffer,
          fileBinaryDataLoading: false
        });
      } catch (error) {
        console.error('❌ 加载文件二进制数据失败:', error);
        set({
          fileBinaryDataError:
            error instanceof Error
              ? error.message
              : 'Failed to load file binary data',
          fileBinaryDataLoading: false
        });
      }
    },

    clearFileBinaryData: () => {
      set({
        fileBinaryData: null,
        fileBinaryDataLoading: false,
        fileBinaryDataError: null
      });
    }
  })
);

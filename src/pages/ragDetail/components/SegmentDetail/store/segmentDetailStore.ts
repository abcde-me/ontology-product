/**
 * Segment Detail Store
 * 分段详情状态管理
 */

import { create } from 'zustand';
import type { SegmentDetailData, Element } from '../../../types';

interface SegmentDetailState {
  // 数据状态
  segmentId: string | null;
  detailData: SegmentDetailData | null;
  initialData: SegmentDetailData | null; // 用于取消时恢复

  // UI 状态
  isEditing: boolean;
  loading: boolean;
  error: string | null;
}

interface SegmentDetailActions {
  // 初始化数据
  initializeDetail: (segmentId: string, data: SegmentDetailData) => void;

  // 编辑控制
  startEditing: () => void;
  cancelEditing: () => void;
  confirmEditing: () => Promise<void>;

  // 更新元素
  updateElement: (elementId: string, updates: Partial<Element>) => void;

  // 重置状态
  reset: () => void;
}

type SegmentDetailStore = SegmentDetailState & SegmentDetailActions;

const initialState: SegmentDetailState = {
  segmentId: null,
  detailData: null,
  initialData: null,
  isEditing: false,
  loading: false,
  error: null
};

export const useSegmentDetailStore = create<SegmentDetailStore>((set, get) => ({
  ...initialState,

  // 初始化数据
  initializeDetail: (segmentId: string, data: SegmentDetailData) => {
    // 深拷贝数据，避免引用污染
    const deepCopy = JSON.parse(JSON.stringify(data));
    set({
      segmentId,
      detailData: deepCopy,
      initialData: JSON.parse(JSON.stringify(data)), // 保存初始数据用于取消
      isEditing: false,
      error: null
    });
  },

  // 开始编辑
  startEditing: () => {
    set({ isEditing: true });
  },

  // 取消编辑
  cancelEditing: () => {
    const { initialData } = get();
    if (initialData) {
      // 恢复到初始数据
      set({
        detailData: JSON.parse(JSON.stringify(initialData)),
        isEditing: false
      });
    }
  },

  // 确认编辑
  confirmEditing: async () => {
    const { detailData, segmentId } = get();

    try {
      set({ loading: true, error: null });

      // TODO: 调用 API 保存数据
      console.log('💾 保存数据到后端:', { segmentId, detailData });

      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 保存成功后，更新 initialData
      set({
        initialData: JSON.parse(JSON.stringify(detailData)),
        isEditing: false,
        loading: false
      });

      console.log('✅ 保存成功');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '保存失败',
        loading: false
      });
      console.error('❌ 保存失败:', error);
    }
  },

  // 更新元素
  updateElement: (elementId: string, updates: Partial<Element>) => {
    const { detailData } = get();
    if (!detailData) return;

    console.log('🔄 updateElement 被调用:', { elementId, updates });

    // 只更新当前元素（所有字段都是独立的）
    const newElements = detailData.elements.map((el) =>
      el.id === elementId ? { ...el, ...updates } : el
    ) as Element[];

    const newData: SegmentDetailData = {
      ...detailData,
      elements: newElements
    };

    console.log('✅ 更新后的数据:', newData);
    set({ detailData: newData });
  },

  // 重置状态
  reset: () => {
    set(initialState);
  }
}));

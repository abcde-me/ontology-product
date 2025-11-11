/**
 * Segment Detail Store
 * 分段详情状态管理
 */

import { create } from 'zustand';
import type {
  SegmentDetailData,
  Element,
  EnhancementInfo
} from '../../../types';

interface SegmentDetailState {
  // 数据状态
  segmentId: string | null;
  detailData: SegmentDetailData | null;
  initialData: SegmentDetailData | null; // 用于取消时恢复

  // UI 状态 - 元素信息编辑状态
  isEditing: boolean;
  loading: boolean;
  error: string | null;

  // UI 状态 - 增强信息编辑状态
  isEditingEnhancement: boolean;
  loadingEnhancement: boolean;
}

interface SegmentDetailActions {
  // 初始化数据
  initializeDetail: (segmentId: string, data: SegmentDetailData) => void;

  // 元素信息编辑控制
  startEditing: () => void;
  cancelEditing: () => void;
  confirmEditing: () => Promise<void>;

  // 更新元素
  updateElement: (elementId: string, updates: Partial<Element>) => void;

  // 增强信息编辑控制
  startEditingEnhancement: () => void;
  cancelEditingEnhancement: () => void;
  confirmEditingEnhancement: () => Promise<void>;

  // 更新增强信息
  updateEnhancement: (field: keyof EnhancementInfo, value: string) => void;

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
  error: null,
  isEditingEnhancement: false,
  loadingEnhancement: false
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
      isEditingEnhancement: false,
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

  // 开始编辑增强信息
  startEditingEnhancement: () => {
    set({ isEditingEnhancement: true });
  },

  // 取消编辑增强信息
  cancelEditingEnhancement: () => {
    const { initialData } = get();
    if (initialData) {
      // 只恢复增强信息部分
      set((state) => ({
        detailData: state.detailData
          ? {
              ...state.detailData,
              enhancement: initialData.enhancement
                ? JSON.parse(JSON.stringify(initialData.enhancement))
                : undefined
            }
          : state.detailData,
        isEditingEnhancement: false
      }));
    }
  },

  // 确认编辑增强信息
  confirmEditingEnhancement: async () => {
    const { detailData, segmentId } = get();

    try {
      set({ loadingEnhancement: true, error: null });

      // TODO: 调用 API 保存增强信息
      console.log('💾 保存增强信息到后端:', {
        segmentId,
        enhancement: detailData?.enhancement
      });

      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 保存成功后，更新 initialData 中的增强信息
      set((state) => ({
        initialData: state.initialData
          ? {
              ...state.initialData,
              enhancement: detailData?.enhancement
                ? JSON.parse(JSON.stringify(detailData.enhancement))
                : undefined
            }
          : state.initialData,
        isEditingEnhancement: false,
        loadingEnhancement: false
      }));

      console.log('✅ 增强信息保存成功');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '保存增强信息失败',
        loadingEnhancement: false
      });
      console.error('❌ 保存增强信息失败:', error);
    }
  },

  // 更新增强信息
  updateEnhancement: (field: keyof EnhancementInfo, value: string) => {
    const { detailData } = get();
    if (!detailData) return;

    console.log('🔄 updateEnhancement 被调用:', { field, value });

    const newData: SegmentDetailData = {
      ...detailData,
      enhancement: {
        ...(detailData.enhancement || { summary: '', hypotheticalAnswer: '' }),
        [field]: value
      }
    };

    console.log('✅ 更新后的增强信息:', newData.enhancement);
    set({ detailData: newData });
  },

  // 重置状态
  reset: () => {
    set(initialState);
  }
}));

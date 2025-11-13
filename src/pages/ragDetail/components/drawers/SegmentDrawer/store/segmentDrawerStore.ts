/**
 * Segment Drawer Store
 * 分段抽屉统一状态管理
 */

import { create } from 'zustand';
import { mockSegmentDetailData } from '../SegmentDetail/mockData';
import {
  mockTraceLogStatistics,
  mockNodeDetails
} from '../../../../utils/traceLogMockData';
import type { SegmentDetailData } from '../../../../types';
import type {
  TraceLogStatistics,
  NodeDetail
} from '../../../../utils/traceLogMockData';

interface SegmentDrawerState {
  // 抽屉状态
  visible: boolean;
  activeTab: 'detail' | 'trace';

  // 分段导航
  currentSegmentIndex: number;
  totalSegments: number;

  // 分段详情数据
  segmentDetailData: SegmentDetailData | null;
  segmentDetailLoading: boolean;
  segmentDetailError: string | null;

  // 溯源日志数据
  traceLogStatistics: TraceLogStatistics | null;
  traceLogNodes: NodeDetail[];
  traceLogLoading: boolean;
  traceLogError: string | null;
}

interface SegmentDrawerActions {
  // 抽屉控制
  openDrawer: (
    segmentIndex: number,
    activeTab?: 'detail' | 'trace'
  ) => Promise<void>;
  closeDrawer: () => void;
  setActiveTab: (tab: 'detail' | 'trace') => void;
  setTotalSegments: (total: number) => void;

  // 分段导航
  goToPrevSegment: () => Promise<void>;
  goToNextSegment: () => Promise<void>;
  goToSegment: (index: number) => Promise<void>;

  // 数据加载
  loadSegmentDetail: (segmentIndex: number) => Promise<void>;
  loadTraceLog: (segmentIndex: number) => Promise<void>;

  // 重置
  reset: () => void;
}

type SegmentDrawerStore = SegmentDrawerState & SegmentDrawerActions;

const initialState: SegmentDrawerState = {
  visible: false,
  activeTab: 'trace',
  currentSegmentIndex: 1,
  totalSegments: 100,
  segmentDetailData: null,
  segmentDetailLoading: false,
  segmentDetailError: null,
  traceLogStatistics: null,
  traceLogNodes: [],
  traceLogLoading: false,
  traceLogError: null
};

export const useSegmentDrawerStore = create<SegmentDrawerStore>((set, get) => ({
  ...initialState,

  // 打开抽屉
  openDrawer: async (segmentIndex: number, activeTab = 'trace' as const) => {
    set({
      visible: true,
      currentSegmentIndex: segmentIndex,
      activeTab
    });

    // 根据 activeTab 加载对应数据
    if (activeTab === 'detail') {
      await get().loadSegmentDetail(segmentIndex);
    } else {
      await get().loadTraceLog(segmentIndex);
    }
  },

  // 关闭抽屉
  closeDrawer: () => {
    set({ visible: false });
  },

  // 切换 Tab
  setActiveTab: async (tab: 'detail' | 'trace') => {
    const { currentSegmentIndex } = get();
    set({ activeTab: tab });

    // 切换 Tab 时加载对应数据
    if (tab === 'detail') {
      await get().loadSegmentDetail(currentSegmentIndex);
    } else {
      await get().loadTraceLog(currentSegmentIndex);
    }
  },

  // 设置总分段数
  setTotalSegments: (total: number) => {
    set({ totalSegments: total });
  },

  // 上一个分段
  goToPrevSegment: async () => {
    const { currentSegmentIndex, activeTab } = get();
    if (currentSegmentIndex > 1) {
      const newIndex = currentSegmentIndex - 1;
      set({ currentSegmentIndex: newIndex });

      // 加载新分段的数据
      if (activeTab === 'detail') {
        await get().loadSegmentDetail(newIndex);
      } else {
        await get().loadTraceLog(newIndex);
      }
    }
  },

  // 下一个分段
  goToNextSegment: async () => {
    const { currentSegmentIndex, totalSegments, activeTab } = get();
    if (currentSegmentIndex < totalSegments) {
      const newIndex = currentSegmentIndex + 1;
      set({ currentSegmentIndex: newIndex });

      // 加载新分段的数据
      if (activeTab === 'detail') {
        await get().loadSegmentDetail(newIndex);
      } else {
        await get().loadTraceLog(newIndex);
      }
    }
  },

  // 跳转到指定分段
  goToSegment: async (index: number) => {
    const { totalSegments, activeTab } = get();
    if (index >= 1 && index <= totalSegments) {
      set({ currentSegmentIndex: index });

      // 加载新分段的数据
      if (activeTab === 'detail') {
        await get().loadSegmentDetail(index);
      } else {
        await get().loadTraceLog(index);
      }
    }
  },

  // 加载分段详情
  loadSegmentDetail: async (segmentIndex: number) => {
    try {
      set({ segmentDetailLoading: true, segmentDetailError: null });

      console.log('📥 加载分段详情:', segmentIndex);

      // TODO: 调用真实 API
      // const response = await fetch(`/api/segments/${segmentIndex}/detail`);
      // const data = await response.json();

      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 使用 mock 数据
      const data = JSON.parse(JSON.stringify(mockSegmentDetailData));

      set({
        segmentDetailData: data,
        segmentDetailLoading: false
      });

      console.log('✅ 分段详情加载成功');
    } catch (error) {
      set({
        segmentDetailError:
          error instanceof Error ? error.message : '加载分段详情失败',
        segmentDetailLoading: false
      });
      console.error('❌ 加载分段详情失败:', error);
    }
  },

  // 加载溯源日志
  loadTraceLog: async (segmentIndex: number) => {
    try {
      set({ traceLogLoading: true, traceLogError: null });

      console.log('📥 加载溯源日志:', segmentIndex);

      // TODO: 调用真实 API
      // const response = await fetch(`/api/segments/${segmentIndex}/trace`);
      // const data = await response.json();

      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 使用 mock 数据
      const statistics = JSON.parse(JSON.stringify(mockTraceLogStatistics));
      const nodes = JSON.parse(JSON.stringify(mockNodeDetails));

      set({
        traceLogStatistics: statistics,
        traceLogNodes: nodes,
        traceLogLoading: false
      });

      console.log('✅ 溯源日志加载成功');
    } catch (error) {
      set({
        traceLogError:
          error instanceof Error ? error.message : '加载溯源日志失败',
        traceLogLoading: false
      });
      console.error('❌ 加载溯源日志失败:', error);
    }
  },

  // 重置状态
  reset: () => {
    set(initialState);
  }
}));

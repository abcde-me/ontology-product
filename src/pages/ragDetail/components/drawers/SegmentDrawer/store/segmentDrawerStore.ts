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
import { fetchSegmentTraceLog } from '../../../../api/ragDetailApi';
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

  // API 参数
  datasetId: string;
  chunkId: string;

  // 分段列表（用于导航时获取对应的 chunkId）
  segments: Array<{ id: string; [key: string]: any }>;

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
  setDatasetIdAndChunkId: (datasetId: string, chunkId: string) => void;
  setSegments: (segments: Array<{ id: string; [key: string]: any }>) => void;

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

/**
 * 格式化成本时间（毫秒转分钟）
 */
function formatCostTime(milliseconds: number): string {
  const minutes = Math.round(milliseconds / 60000);
  return `${minutes}min`;
}

/**
 * 格式化持续时间（毫秒转秒）
 */
function formatDuration(milliseconds: number): string {
  const seconds = Math.round(milliseconds / 1000);
  return `${seconds}s`;
}

/**
 * 格式化时间戳（Unix 时间戳转 YYYY-MM-DD HH:MM:SS）
 */
function formatTimestamp(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const initialState: SegmentDrawerState = {
  visible: false,
  activeTab: 'trace',
  currentSegmentIndex: 1,
  totalSegments: 100,
  datasetId: '',
  chunkId: '',
  segments: [],
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

  // 设置 datasetId 和 chunkId
  setDatasetIdAndChunkId: (datasetId: string, chunkId: string) => {
    set({ datasetId, chunkId });
  },

  // 设置分段列表
  setSegments: (segments: Array<{ id: string; [key: string]: any }>) => {
    set({ segments });
  },

  // 上一个分段
  goToPrevSegment: async () => {
    const { currentSegmentIndex, activeTab, segments } = get();
    if (currentSegmentIndex > 1) {
      const newIndex = currentSegmentIndex - 1;
      // 获取对应分段的 id（segments 是 0-based，但 currentSegmentIndex 是 1-based）
      const newSegment = segments[newIndex - 1];
      const newChunkId = newSegment?.id || '';

      set({ currentSegmentIndex: newIndex, chunkId: newChunkId });

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
    const { currentSegmentIndex, totalSegments, activeTab, segments } = get();
    if (currentSegmentIndex < totalSegments) {
      const newIndex = currentSegmentIndex + 1;
      // 获取对应分段的 id（segments 是 0-based，但 currentSegmentIndex 是 1-based）
      const newSegment = segments[newIndex - 1];
      const newChunkId = newSegment?.id || '';

      set({ currentSegmentIndex: newIndex, chunkId: newChunkId });

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
    const { totalSegments, activeTab, segments } = get();
    if (index >= 1 && index <= totalSegments) {
      // 获取对应分段的 id（segments 是 0-based，但 index 是 1-based）
      const newSegment = segments[index - 1];
      const newChunkId = newSegment?.id || '';

      set({ currentSegmentIndex: index, chunkId: newChunkId });

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

      const { datasetId, chunkId } = get();

      console.log('📥 加载溯源日志:', {
        segmentIndex,
        datasetId,
        chunkId
      });

      // 调用真实 API
      const traceLogData = await fetchSegmentTraceLog(datasetId, chunkId);

      // 转换 API 返回的数据格式
      const statistics = {
        totalNodes: traceLogData.node_count || 0,
        successNodes: traceLogData.node_success_count || 0,
        totalTime: formatCostTime(traceLogData.cost_time || 0)
      };

      const nodes = (traceLogData.nodes || []).map(
        (node: any, index: number) => ({
          id: `node_${index}`,
          index: node.node_index || index,
          name: node.node_type || '未知节点',
          status: node.status === 1 ? 'success' : 'failed',
          duration: formatDuration(node.cost_time || 0),
          startTime: formatTimestamp(node.start_time || 0),
          input: node.node_input ? JSON.parse(node.node_input) : {},
          output: node.node_output ? JSON.parse(node.node_output) : {},
          msg: node.msg || ''
        })
      );

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

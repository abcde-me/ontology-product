import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  BehaviorItem,
  OrchestrationNode,
  NodeConfig,
  TestResult,
  HistoryItem
} from '../types';
import {
  fetchBehaviorList,
  executeBehaviorTest,
  getBehaviorHistory
} from '../services/behaviorTestApi';

interface BusinessStore {
  // ===== 数据 =====
  behaviorList: BehaviorItem[];
  orchestrationNodes: OrchestrationNode[];
  nodeConfigs: Record<string, NodeConfig>;
  testResults: TestResult[];
  historyList: HistoryItem[];
  currentBehaviorDetail: BehaviorItem | null;

  // ===== 业务操作 =====
  fetchBehaviors: (params?: {
    keyword?: string;
    objectType?: string;
  }) => Promise<void>;
  addNode: (behavior: BehaviorItem) => string;
  removeNode: (nodeId: string) => void;
  updateNodeConfig: (nodeId: string, config: NodeConfig) => void;
  reorderNodes: (startIndex: number, endIndex: number) => void;
  executeTest: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  restoreHistory: (historyItem: HistoryItem) => void;
  setCurrentBehaviorDetail: (behavior: BehaviorItem | null) => void;

  // ===== 查询方法 =====
  isNodeConfigured: (nodeId: string) => boolean;
  canExecuteTest: () => boolean;
  getNodeById: (nodeId: string) => OrchestrationNode | undefined;

  // ===== 重置 =====
  resetBusiness: () => void;
  clearOrchestration: () => void;
}

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  // 初始状态
  behaviorList: [],
  orchestrationNodes: [],
  nodeConfigs: {},
  testResults: [],
  historyList: [],
  currentBehaviorDetail: null,

  // 获取行为列表
  fetchBehaviors: async (params = {}) => {
    try {
      const list = await fetchBehaviorList(params);
      set({ behaviorList: list });
    } catch (error) {
      console.error('Failed to fetch behaviors:', error);
      throw error;
    }
  },

  // 添加节点
  addNode: (behavior: BehaviorItem) => {
    const { orchestrationNodes } = get();
    const nodeId = uuidv4();
    const newNode: OrchestrationNode = {
      id: nodeId,
      // TODO: 修复类型错误
      // @ts-expect-error
      behaviorId: behavior.id,
      behavior,
      order: orchestrationNodes.length,
      isConfigured: false,
      isExpanded: true
    };

    set({
      orchestrationNodes: [...orchestrationNodes, newNode]
    });

    return nodeId;
  },

  // 删除节点
  removeNode: (nodeId: string) => {
    const { orchestrationNodes, nodeConfigs } = get();

    // 删除节点
    const newNodes = orchestrationNodes.filter((node) => node.id !== nodeId);

    // 重新排序
    newNodes.forEach((node, index) => {
      node.order = index;
    });

    // 删除配置
    const newConfigs = { ...nodeConfigs };
    delete newConfigs[nodeId];

    set({
      orchestrationNodes: newNodes,
      nodeConfigs: newConfigs
    });
  },

  // 更新节点配置
  updateNodeConfig: (nodeId: string, config: NodeConfig) => {
    const { nodeConfigs, orchestrationNodes } = get();

    // 更新配置
    const newConfigs = {
      ...nodeConfigs,
      [nodeId]: config
    };

    // 检查配置是否完整
    const node = orchestrationNodes.find((n) => n.id === nodeId);
    if (!node) return;

    // 检查所有必填字段是否已填写
    const requiredFields =
      node.behavior.configSchema?.fields.filter((f) => f.required) || [];
    const isConfigured = requiredFields.every((field) => {
      const value = config[field.name];
      return value !== undefined && value !== null && value !== '';
    });

    // 更新节点的 isConfigured 状态
    const newNodes = orchestrationNodes.map((n) =>
      n.id === nodeId ? { ...n, isConfigured } : n
    );

    set({
      nodeConfigs: newConfigs,
      orchestrationNodes: newNodes
    });
  },

  // 重新排序节点
  reorderNodes: (startIndex: number, endIndex: number) => {
    const { orchestrationNodes } = get();
    const newNodes = [...orchestrationNodes];
    const [removed] = newNodes.splice(startIndex, 1);
    newNodes.splice(endIndex, 0, removed);

    // 更新 order
    newNodes.forEach((node, index) => {
      node.order = index;
    });

    set({ orchestrationNodes: newNodes });
  },

  // 执行测试
  executeTest: async () => {
    const { orchestrationNodes, nodeConfigs } = get();

    try {
      const results = await executeBehaviorTest({
        nodes: orchestrationNodes.map((node) => ({
          behaviorId: node.behaviorId,
          config: nodeConfigs[node.id] || {}
        }))
      });

      set({ testResults: results });
    } catch (error) {
      console.error('Failed to execute test:', error);
      throw error;
    }
  },

  // 获取历史记录
  fetchHistory: async () => {
    try {
      const history = await getBehaviorHistory();
      set({ historyList: history });
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw error;
    }
  },

  // 恢复历史编排
  restoreHistory: (historyItem: HistoryItem) => {
    const { behaviorList } = get();

    // 根据历史记录重建节点
    const newNodes: OrchestrationNode[] = historyItem.nodes.map(
      (historyNode, index) => {
        const behavior = behaviorList.find(
          // TODO: 修复类型错误
          // @ts-expect-error
          (b) => b.id === historyNode.behaviorId
        );
        if (!behavior) {
          throw new Error(
            `Behavior ${historyNode.behaviorId} not found in behavior list`
          );
        }

        return {
          id: uuidv4(),
          behaviorId: historyNode.behaviorId,
          behavior,
          order: index,
          isConfigured: true,
          isExpanded: false
        };
      }
    );

    // 重建配置
    const newConfigs: Record<string, NodeConfig> = {};
    newNodes.forEach((node, index) => {
      newConfigs[node.id] = historyItem.nodes[index].config;
    });

    set({
      orchestrationNodes: newNodes,
      nodeConfigs: newConfigs
    });
  },

  // 设置当前查看的行为详情
  setCurrentBehaviorDetail: (behavior: BehaviorItem | null) => {
    set({ currentBehaviorDetail: behavior });
  },

  // 检查节点是否已配置
  isNodeConfigured: (nodeId: string): boolean => {
    const { nodeConfigs, orchestrationNodes } = get();
    const config = nodeConfigs[nodeId];
    const node = orchestrationNodes.find((n) => n.id === nodeId);

    if (!config || !node) return false;

    // 检查所有必填字段是否已填写
    const requiredFields =
      node.behavior.configSchema?.fields.filter((f) => f.required) || [];

    return requiredFields.every((field) => {
      const value = config[field.name];
      return value !== undefined && value !== null && value !== '';
    });
  },

  // 检查是否可以执行测试
  canExecuteTest: (): boolean => {
    const { orchestrationNodes } = get();

    if (orchestrationNodes.length === 0) return false;

    // 所有节点都必须已配置
    return orchestrationNodes.every((node) => get().isNodeConfigured(node.id));
  },

  // 根据 ID 获取节点
  getNodeById: (nodeId: string): OrchestrationNode | undefined => {
    const { orchestrationNodes } = get();
    return orchestrationNodes.find((n) => n.id === nodeId);
  },

  // 重置业务数据
  resetBusiness: () =>
    set({
      behaviorList: [],
      orchestrationNodes: [],
      nodeConfigs: {},
      testResults: [],
      historyList: [],
      currentBehaviorDetail: null
    }),

  // 清空编排（保留行为列表）
  clearOrchestration: () =>
    set({
      orchestrationNodes: [],
      nodeConfigs: {},
      testResults: []
    })
}));

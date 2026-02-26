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
  executeBehaviorTest,
  getBehaviorHistory
} from '../services/behaviorTestApi';
import { getActionList } from '@/api/ontologySceneLibrary/ontologyAction';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';

interface BusinessStore {
  // ===== 数据 =====
  behaviorList: BehaviorItem[];
  orchestrationNodes: OrchestrationNode[];
  nodeConfigs: Record<string, NodeConfig>;
  testResults: TestResult[];
  historyList: HistoryItem[];
  currentBehaviorDetail: BehaviorItem | null;
  // 分页相关
  currentPage: number;
  totalCount: number;
  hasMore: boolean;

  // ===== 业务操作 =====
  fetchBehaviors: (params?: {
    keyword?: string;
    objectType?: string;
    ontologyModelID?: number;
    reset?: boolean; // 是否重置列表
  }) => Promise<void>;
  loadMoreBehaviors: (params?: {
    keyword?: string;
    objectType?: string;
    ontologyModelID?: number;
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
  currentPage: 1,
  totalCount: 0,
  hasMore: true,

  // 获取行为列表
  fetchBehaviors: async (params = {}) => {
    try {
      const { ontologyModelID, keyword, reset = true } = params;
      const pageNum = reset ? 1 : get().currentPage;

      // 调用真实 API
      const response = await getActionList({
        ontologyModelID,
        filter: keyword,
        pageNum,
        pageSize: 100 // 后端限制最大 100
      });

      // 将 API 返回的数据转换为 BehaviorItem 格式
      const newItems: BehaviorItem[] = response.items.map((item) => ({
        ...item,
        description: item.description || '',
        name: item.name || '',
        ontologyObjectTypeName: item.objectTypeName
      }));

      set({
        behaviorList: reset ? newItems : [...get().behaviorList, ...newItems],
        currentPage: pageNum,
        totalCount: response.total,
        hasMore:
          newItems.length === 100 &&
          get().behaviorList.length + newItems.length < response.total
      });
    } catch (error) {
      console.error('Failed to fetch behaviors:', error);
      throw error;
    }
  },

  // 加载更多行为
  loadMoreBehaviors: async (params = {}) => {
    const { hasMore, currentPage } = get();
    if (!hasMore) return;

    try {
      await get().fetchBehaviors({
        ...params,
        reset: false
      });
      set({ currentPage: currentPage + 1 });
    } catch (error) {
      console.error('Failed to load more behaviors:', error);
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

    // 检查所有必填参数是否已填写
    const requiredParams =
      node.behavior.params?.filter((p) => p.enabledValidation) || [];
    const isConfigured = requiredParams.every((param) => {
      const value = config[param.code];
      // 对于 Switch 类型，false 也是有效值
      if (param.uiType === UiType.Switch) {
        return value !== undefined && value !== null;
      }
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
    const node = orchestrationNodes.find((n) => n.id === nodeId);

    if (!node) {
      console.log('isNodeConfigured: node not found', nodeId);
      return false;
    }

    // 检查所有必填参数（enabledValidation 为 true 的参数）
    const requiredParams =
      node.behavior.params?.filter((p) => p.enabledValidation) || [];

    console.log('isNodeConfigured:', {
      nodeId,
      behaviorName: node.behavior.name,
      requiredParamsCount: requiredParams.length,
      hasConfig: !!nodeConfigs[nodeId],
      params: node.behavior.params
    });

    // 如果没有必填参数，认为已配置
    if (requiredParams.length === 0) {
      console.log('isNodeConfigured: no required params, returning true');
      return true;
    }

    const config = nodeConfigs[nodeId];
    if (!config) {
      console.log('isNodeConfigured: no config found, returning false');
      return false;
    }

    const result = requiredParams.every((param) => {
      const value = config[param.code];
      // 对于 Switch 类型，false 也是有效值
      if (param.uiType === UiType.Switch) {
        return value !== undefined && value !== null;
      }
      return value !== undefined && value !== null && value !== '';
    });

    console.log('isNodeConfigured: checking required params, result:', result);
    return result;
  },

  // 检查是否可以执行测试
  canExecuteTest: (): boolean => {
    const { orchestrationNodes } = get();

    console.log('canExecuteTest called:', {
      nodesCount: orchestrationNodes.length,
      nodes: orchestrationNodes.map((n) => ({
        id: n.id,
        name: n.behavior.name,
        isConfigured: get().isNodeConfigured(n.id)
      }))
    });

    if (orchestrationNodes.length === 0) {
      console.log('canExecuteTest: no nodes, returning false');
      return false;
    }

    // 所有节点都必须已配置
    const result = orchestrationNodes.every((node) =>
      get().isNodeConfigured(node.id)
    );
    console.log('canExecuteTest result:', result);
    return result;
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
      currentBehaviorDetail: null,
      currentPage: 1,
      totalCount: 0,
      hasMore: true
    }),

  // 清空编排（保留行为列表）
  clearOrchestration: () =>
    set({
      orchestrationNodes: [],
      nodeConfigs: {},
      testResults: []
    })
}));

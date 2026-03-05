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
import {
  EnumRule,
  LengthRule,
  RangeRule
} from '@/pages/ontologyScene/types/behaviorActions';

interface BusinessStore {
  // ===== 数据 =====
  behaviorList: BehaviorItem[];
  orchestrationNodes: OrchestrationNode[];
  nodeConfigs: Record<string, NodeConfig>;
  nodeValidationErrors: Record<string, Record<string, string>>; // 存储每个节点的验证错误
  nodeTouchedFields: Record<string, Set<string>>; // 存储每个节点已触碰的字段
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
  markFieldAsTouched: (nodeId: string, fieldCode: string) => void; // 标记字段为已触碰
  markAllFieldsAsTouched: (nodeId: string) => void; // 标记节点所有字段为已触碰
  validateNode: (nodeId: string) => {
    isValid: boolean;
    errors: Record<string, string>;
  }; // 验证单个节点
  validateAllNodes: () => { isValid: boolean; invalidNodeIds: string[] }; // 验证所有节点
  reorderNodes: (startIndex: number, endIndex: number) => void;
  executeTest: () => Promise<void>;
  executeSingleNodeTest: (nodeId: string) => Promise<void>; // 执行单节点测试
  fetchHistory: () => Promise<void>;
  restoreHistory: (historyItem: HistoryItem) => void;
  setCurrentBehaviorDetail: (behavior: BehaviorItem | null) => void;

  // ===== 查询方法 =====
  isNodeConfigured: (nodeId: string) => boolean;
  canExecuteTest: () => boolean;
  getNodeById: (nodeId: string) => OrchestrationNode | undefined;
  getNodeErrorCount: (nodeId: string) => number; // 获取节点错误数量
  isFieldTouched: (nodeId: string, fieldCode: string) => boolean; // 检查字段是否已触碰

  // ===== 重置 =====
  resetBusiness: () => void;
  clearOrchestration: () => void;
}

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  // 初始状态
  behaviorList: [],
  orchestrationNodes: [],
  nodeConfigs: {},
  nodeValidationErrors: {}, // 存储验证错误
  nodeTouchedFields: {}, // 存储已触碰的字段
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
    const {
      orchestrationNodes,
      nodeConfigs,
      nodeValidationErrors,
      nodeTouchedFields
    } = get();

    // 删除节点
    const newNodes = orchestrationNodes.filter((node) => node.id !== nodeId);

    // 重新排序
    newNodes.forEach((node, index) => {
      node.order = index;
    });

    // 删除配置、验证错误和已触碰字段
    const newConfigs = { ...nodeConfigs };
    delete newConfigs[nodeId];

    const newErrors = { ...nodeValidationErrors };
    delete newErrors[nodeId];

    const newTouched = { ...nodeTouchedFields };
    delete newTouched[nodeId];

    set({
      orchestrationNodes: newNodes,
      nodeConfigs: newConfigs,
      nodeValidationErrors: newErrors,
      nodeTouchedFields: newTouched
    });
  },

  // 标记字段为已触碰
  markFieldAsTouched: (nodeId: string, fieldCode: string) => {
    const { nodeTouchedFields } = get();
    const currentTouched = nodeTouchedFields[nodeId] || new Set<string>();
    const newTouched = new Set(currentTouched);
    newTouched.add(fieldCode);

    set({
      nodeTouchedFields: {
        ...nodeTouchedFields,
        [nodeId]: newTouched
      }
    });
  },

  // 标记节点所有字段为已触碰
  markAllFieldsAsTouched: (nodeId: string) => {
    const { orchestrationNodes, nodeTouchedFields } = get();
    const node = orchestrationNodes.find((n) => n.id === nodeId);

    if (!node) return;

    // 只标记输入参数字段为已触碰，过滤掉输出参数
    const allFieldCodes = new Set(
      node.behavior.params
        ?.filter((p) => p.inputType === 'input')
        .map((p) => p.code) || []
    );

    set({
      nodeTouchedFields: {
        ...nodeTouchedFields,
        [nodeId]: allFieldCodes
      }
    });
  },

  // 验证单个节点（不依赖 DOM）
  validateNode: (nodeId: string) => {
    const { orchestrationNodes, nodeConfigs, nodeValidationErrors } = get();
    const node = orchestrationNodes.find((n) => n.id === nodeId);

    if (!node) {
      return { isValid: false, errors: {} };
    }

    const config = nodeConfigs[nodeId] || {};
    const errors: Record<string, string> = {};
    const params = node.behavior.params || [];

    // 只验证输入参数，过滤掉输出参数
    params
      .filter((param) => param.inputType === 'input')
      .forEach((param) => {
        const value = config[param.code];

        // 检查必填
        if (param.enabledValidation) {
          if (param.uiType === UiType.Switch) {
            if (value === undefined || value === null) {
              errors[param.code] = `请填写${param.name}`;
            }
          } else {
            if (value === undefined || value === null || value === '') {
              errors[param.code] = `请填写${param.name}`;
              return; // 必填未填，跳过其他验证
            }
          }
        }

        // 如果有值且有验证规则，进行规则验证
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          param.validationRule &&
          param.enabledValidation
        ) {
          const { ruleName, failMessage } = param.validationRule;

          switch (ruleName) {
            case 'range_rule': {
              const ruleConfig = param.validationRule.ruleConfig as RangeRule;
              if (
                ruleConfig &&
                (value < ruleConfig.minValue || value > ruleConfig.maxValue)
              ) {
                errors[param.code] =
                  failMessage ||
                  `值必须在 ${ruleConfig.minValue} 到 ${ruleConfig.maxValue} 之间`;
              }
              break;
            }
            case 'length_rule': {
              const length = String(value).trim().length;
              const ruleConfig = param.validationRule.ruleConfig as LengthRule;
              if (
                ruleConfig &&
                (length < ruleConfig.minLength || length > ruleConfig.maxLength)
              ) {
                errors[param.code] =
                  failMessage ||
                  `长度必须在 ${ruleConfig.minLength} 到 ${ruleConfig.maxLength} 之间`;
              }
              break;
            }
            case 'enum_rule':
              const ruleConfig = param.validationRule.ruleConfig as EnumRule;
              if (!ruleConfig.options.includes(value)) {
                errors[param.code] =
                  failMessage ||
                  `值必须是以下之一: ${ruleConfig.options.join(', ')}`;
              }
              break;
          }
        }
      });

    // 保存验证错误到 store
    set({
      nodeValidationErrors: {
        ...nodeValidationErrors,
        [nodeId]: errors
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // 验证所有节点
  validateAllNodes: () => {
    const { orchestrationNodes } = get();
    const invalidNodeIds: string[] = [];

    orchestrationNodes.forEach((node) => {
      const { isValid } = get().validateNode(node.id);
      if (!isValid) {
        invalidNodeIds.push(node.id);
      }
    });

    return {
      isValid: invalidNodeIds.length === 0,
      invalidNodeIds
    };
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

    // 如果该节点的字段已被触碰过，重新验证该节点以更新错误状态
    const { nodeTouchedFields } = get();
    if (nodeTouchedFields[nodeId] && nodeTouchedFields[nodeId].size > 0) {
      get().validateNode(nodeId);
    }
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

    // 先验证所有节点
    const { isValid, invalidNodeIds } = get().validateAllNodes();
    if (!isValid) {
      throw new Error(`以下节点配置不完整或有误: ${invalidNodeIds.join(', ')}`);
    }

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

  // 执行单节点测试
  executeSingleNodeTest: async (nodeId: string) => {
    const { orchestrationNodes, nodeConfigs } = get();
    const node = orchestrationNodes.find((n) => n.id === nodeId);

    if (!node) {
      throw new Error('节点不存在');
    }

    // 验证当前节点
    const { isValid } = get().validateNode(nodeId);
    if (!isValid) {
      throw new Error('当前节点配置不完整或有误');
    }

    try {
      const results = await executeBehaviorTest({
        nodes: [
          {
            behaviorId: node.behaviorId,
            config: nodeConfigs[nodeId] || {}
          }
        ]
      });

      set({ testResults: results });
    } catch (error) {
      console.error('Failed to execute single node test:', error);
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

  // 获取节点错误数量
  getNodeErrorCount: (nodeId: string): number => {
    const { nodeValidationErrors } = get();
    const errors = nodeValidationErrors[nodeId] || {};
    return Object.keys(errors).length;
  },

  // 检查字段是否已触碰
  isFieldTouched: (nodeId: string, fieldCode: string): boolean => {
    const { nodeTouchedFields } = get();
    const touched = nodeTouchedFields[nodeId] || new Set<string>();
    return touched.has(fieldCode);
  },

  // 重置业务数据
  resetBusiness: () =>
    set({
      behaviorList: [],
      orchestrationNodes: [],
      nodeConfigs: {},
      nodeValidationErrors: {},
      nodeTouchedFields: {},
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
      nodeValidationErrors: {},
      nodeTouchedFields: {},
      testResults: []
    })
}));

import { create } from 'zustand';
import type { OntologScene } from '@/types/ontologySceneApi';
import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import type { SystemPromptStore } from '../types/systemPrompt';
import type { PluginConfigStore } from '../types/pluginConfig';
import type { SecurityProtectionConfig } from '../types/securityProtection';
import {
  getActiveSystemPromptContent as resolveActiveSystemPromptContent,
  loadSystemPromptStore
} from '../services/systemPromptStorage';
import {
  buildPluginConfigPayload,
  loadPluginConfigStore
} from '../services/pluginConfigStorage';
import { loadSecurityProtectionConfig } from '../services/securityProtectionStorage';
import { checkSensitiveContent } from '../services/checkSensitiveContent';

/**
 * 详情面板类型
 */
export type DetailPanelType = 'object' | 'behavior' | 'link' | null;

/**
 * 详情面板数据
 */
export interface DetailPanelData {
  type: DetailPanelType;
  id: string | number;
  data?: any;
}

/**
 * AI 本体工作台状态
 */
interface AIWorkbenchState {
  // ========== 本体相关 ==========
  /** 本体列表 */
  ontologyList: OntologScene[];
  /** 当前选中的本体 */
  currentOntology: OntologScene | null;
  /** 本体列表加载状态 */
  ontologyListLoading: boolean;

  // ========== 图谱相关 ==========
  /** 图谱数据 */
  graphData: GetOntologyTopologyResponse | null;
  /** 图谱加载状态 */
  graphLoading: boolean;

  // ========== 会话相关 ==========
  /** 当前会话ID */
  currentSessionId: string | null;
  /** 会话列表 */
  sessionList: any[];
  /** 会话列表加载状态 */
  sessionListLoading: boolean;

  // ========== 详情面板相关 ==========
  /** 详情面板是否显示 */
  detailPanelVisible: boolean;
  /** 详情面板数据 */
  detailPanelData: DetailPanelData | null;
  /** 详情面板高度 */
  detailPanelHeight: number;

  // ========== 左侧菜单相关 ==========
  /** 左侧菜单是否收起 */
  leftMenuCollapsed: boolean;

  // ========== 系统提示词 ==========
  /** 当前本体的系统提示词版本库 */
  systemPromptStore: SystemPromptStore | null;

  // ========== 插件配置 ==========
  /** 当前本体的插件配置 */
  pluginConfigStore: PluginConfigStore | null;

  // ========== 安全防护 ==========
  /** 当前本体的安全防护配置 */
  securityProtectionConfig: SecurityProtectionConfig | null;

  // ========== Actions ==========
  /** 设置本体列表 */
  setOntologyList: (list: OntologScene[]) => void;
  /** 设置当前本体 */
  setCurrentOntology: (ontology: OntologScene | null) => void;
  /** 设置本体列表加载状态 */
  setOntologyListLoading: (loading: boolean) => void;

  /** 设置图谱数据 */
  setGraphData: (data: GetOntologyTopologyResponse | null) => void;
  /** 设置图谱加载状态 */
  setGraphLoading: (loading: boolean) => void;

  /** 设置当前会话ID */
  setCurrentSessionId: (id: string | null) => void;
  /** 设置会话列表 */
  setSessionList: (list: any[]) => void;
  /** 设置会话列表加载状态 */
  setSessionListLoading: (loading: boolean) => void;

  /** 打开详情面板 */
  openDetailPanel: (data: DetailPanelData) => void;
  /** 关闭详情面板 */
  closeDetailPanel: () => void;
  /** 设置详情面板高度 */
  setDetailPanelHeight: (height: number) => void;

  /** 设置左侧菜单收起状态 */
  setLeftMenuCollapsed: (collapsed: boolean) => void;

  /** 加载本体的系统提示词配置 */
  loadSystemPromptForOntology: (ontologyModelId: number) => void;
  /** 更新系统提示词配置 */
  setSystemPromptStore: (store: SystemPromptStore | null) => void;
  /** 获取当前生效的系统提示词 */
  getActiveSystemPromptContent: () => string;

  /** 加载本体的插件配置 */
  loadPluginConfigForOntology: (ontologyModelId: number) => void;
  /** 更新插件配置 */
  setPluginConfigStore: (store: PluginConfigStore | null) => void;
  /** 获取对话请求使用的插件配置 */
  getPluginConfigPayload: () => ReturnType<typeof buildPluginConfigPayload>;

  /** 加载本体的安全防护配置 */
  loadSecurityProtectionForOntology: (ontologyModelId: number) => void;
  /** 更新安全防护配置 */
  setSecurityProtectionConfig: (
    config: SecurityProtectionConfig | null
  ) => void;
  /** 检测输入是否包含敏感内容 */
  checkInputSecurity: (
    text: string
  ) => ReturnType<typeof checkSensitiveContent>;

  /** 重置状态 */
  reset: () => void;
}

const initialState = {
  ontologyList: [],
  currentOntology: null,
  ontologyListLoading: false,
  graphData: null,
  graphLoading: false,
  currentSessionId: null,
  sessionList: [],
  sessionListLoading: false,
  detailPanelVisible: false,
  detailPanelData: null,
  detailPanelHeight: 400, // 默认高度 400px
  leftMenuCollapsed: false,
  systemPromptStore: null,
  pluginConfigStore: null,
  securityProtectionConfig: null
};

export const useAIWorkbenchStore = create<AIWorkbenchState>((set, get) => ({
  ...initialState,

  // ========== 本体相关 Actions ==========
  setOntologyList: (list) => set({ ontologyList: list }),
  setCurrentOntology: (ontology) => {
    console.log('[Store] setCurrentOntology 被调用，ontology:', ontology);
    set({ currentOntology: ontology });
  },
  setOntologyListLoading: (loading) => set({ ontologyListLoading: loading }),

  // ========== 图谱相关 Actions ==========
  setGraphData: (data) => set({ graphData: data }),
  setGraphLoading: (loading) => set({ graphLoading: loading }),

  // ========== 会话相关 Actions ==========
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  setSessionList: (list) => set({ sessionList: list }),
  setSessionListLoading: (loading) => set({ sessionListLoading: loading }),

  // ========== 详情面板相关 Actions ==========
  openDetailPanel: (data) =>
    set({
      detailPanelVisible: true,
      detailPanelData: data
    }),
  closeDetailPanel: () =>
    set({
      detailPanelVisible: false,
      detailPanelData: null
    }),
  setDetailPanelHeight: (height) => set({ detailPanelHeight: height }),

  // ========== 左侧菜单相关 Actions ==========
  setLeftMenuCollapsed: (collapsed) => set({ leftMenuCollapsed: collapsed }),

  // ========== 系统提示词 Actions ==========
  loadSystemPromptForOntology: (ontologyModelId) =>
    set({
      systemPromptStore: loadSystemPromptStore(ontologyModelId)
    }),
  setSystemPromptStore: (store) => set({ systemPromptStore: store }),
  getActiveSystemPromptContent: () =>
    resolveActiveSystemPromptContent(get().systemPromptStore),

  // ========== 插件配置 Actions ==========
  loadPluginConfigForOntology: (ontologyModelId) =>
    set({
      pluginConfigStore: loadPluginConfigStore(ontologyModelId)
    }),
  setPluginConfigStore: (store) => set({ pluginConfigStore: store }),
  getPluginConfigPayload: () =>
    buildPluginConfigPayload(get().pluginConfigStore),

  // ========== 安全防护 Actions ==========
  loadSecurityProtectionForOntology: (ontologyModelId) =>
    set({
      securityProtectionConfig: loadSecurityProtectionConfig(ontologyModelId)
    }),
  setSecurityProtectionConfig: (config) =>
    set({ securityProtectionConfig: config }),
  checkInputSecurity: (text) =>
    checkSensitiveContent(text, get().securityProtectionConfig),

  // ========== 重置状态 ==========
  reset: () => set(initialState)
}));

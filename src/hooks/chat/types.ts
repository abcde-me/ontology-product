/**
 * Chat hooks 类型定义
 */

// ==================== 消息相关 ====================
/**
 * 思考步骤
 */
export interface ThinkingStep {
  chunk_id?: string;
  type: string;
  content: string;
  status?: 'running' | 'success' | 'error';
  running_time?: number; // 统一使用 number
  done?: boolean;
  [key: string]: any;
}

/**
 * 工具调用
 */
export interface ToolCall {
  id?: string;
  chunk_id?: string;
  name: string;
  input?: any;
  output?: any;
  status?: 'running' | 'success' | 'error';
  running_time?: number; // 统一使用 number
  error?: string;
  done?: boolean;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status: MessageStatus;
  files?: FileAttachment[];
  // AI 消息扩展字段
  thinkingSteps?: ThinkingStep[]; // 统一的步骤数组，包含 thinking、ontology 等所有类型
}

export type MessageStatus =
  | 'local'
  | 'loading'
  | 'streaming'
  | 'success'
  | 'error'
  | 'abort';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

// ==================== SSE 事件类型 ====================
export type SSEEventType = 'answer' | 'llm' | 'done' | 'error';

export interface SSEEvent {
  event?: SSEEventType;
  type?: string;
  chunk_id?: string;
  content?: string | any;
  data?: {
    text?: string;
    [key: string]: any;
  };
  conversation_id?: string;
  message_id?: string;
  error_detail?: string;
  running_time?: number; // 统一使用 number，与 StreamEvent 保持一致
  done?: boolean;
  [key: string]: any;
}

// ==================== Hook 配置 ====================

/**
 * API 配置接口 - 用于依赖注入
 */
export interface ChatApiConfig {
  /** 获取聊天 API URL */
  getChatUrl: (appId: string) => string;

  /** 获取历史消息（可选） */
  getHistoryMessages?: (params: {
    appId: string;
    conversationId: string;
  }) => Promise<any>;

  /** 构建请求体（可选，如果不提供则使用默认实现） */
  buildRequestBody?: (params: {
    appId: string;
    conversationId: string;
    query: string;
    files?: any[];
    enableDeepThink: boolean;
    projectId?: string;
    appConfigId?: string;
    channel?: string;
    source?: string;
  }) => Record<string, any>;
}

export interface UseChatConfig {
  appId: string | number;
  conversationId?: string | null; // null = 未初始化, undefined = 新建会话, string = 已有会话
  projectId?: string | number;
  appConfigId?: string | number; // 应用配置ID
  channel?: string; // 渠道（Preview/Production）
  source?: 'published' | 'debugger'; // 来源（published/debugger）

  /** API 配置（必需，用于依赖注入） */
  apiConfig: ChatApiConfig;

  /** 消息提示函数（可选，用于依赖注入） */
  showMessage?: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
  };

  onConversationCreated?: (conversationId: string) => void;
  onError?: (error: Error) => void;
}

export interface SendMessageParams {
  text: string;
  files?: FileAttachment[];
  enableDeepThink?: boolean;
}

// ==================== Hook 返回 ====================
export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (params: SendMessageParams) => Promise<void>;
  stopGeneration: () => void;
  clearMessages: () => void;
  deleteMessage: (messageId: string) => void;
  regenerateMessage: (messageId: string) => Promise<void>;
  loadHistoryMessages: (conversationId: string) => Promise<void>;
}

// ==================== 会话管理 ====================
export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage?: string;
}

/**
 * 会话 API 配置接口 - 用于依赖注入
 */
export interface ConversationApiConfig {
  /** 获取会话列表 */
  getConversationList: (params: {
    appId: string;
    projectId?: string;
    pageNo?: number;
    pageSize?: number;
  }) => Promise<any>;

  /** 删除会话 */
  deleteConversation: (params: { id: string }) => Promise<any>;

  /** 重命名会话 */
  renameConversation: (params: { id: string; name: string }) => Promise<any>;
}

export interface UseConversationsConfig {
  defaultConversations?: Conversation[];
  defaultActiveConversationId?: string;

  /** API 配置（必需，用于依赖注入） */
  apiConfig: ConversationApiConfig;

  /** 消息提示函数（可选，用于依赖注入） */
  showMessage?: {
    success: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  activeConversationId?: string | null; // null = 未初始化, undefined = 新建会话, string = 已有会话
  loading: boolean;
  setActiveConversation: (id: string | undefined | null) => void;
  createConversation: (title?: string) => Conversation;
  deleteConversation: (id: string, projectId?: string) => Promise<boolean>;
  updateConversation: (
    id: string,
    updates: Partial<Conversation>,
    projectId?: string
  ) => Promise<void>;
  getConversation: (id: string) => Conversation | undefined;
  loadConversations: (appId: string, projectId?: string) => Promise<void>;
}

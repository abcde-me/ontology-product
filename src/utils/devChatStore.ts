import { isDevBypassEnabled } from '@/utils/devFallback';
import { isAIWorkbenchLlmConfigured } from '@/pages/aiOntologyWorkbench/config/llm';
import {
  runDirectLlmChatStream,
  type DirectLlmStreamCallbacks
} from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import { isLocalLlmAppId } from '@/utils/devOntologyStore';

const STORAGE_KEY = 'dev_chat_conversations';

export interface DevConversationRecord {
  id: string;
  name: string;
  appId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const readAll = (): DevConversationRecord[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (records: DevConversationRecord[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const isDevAppId = (appId?: string) =>
  isDevBypassEnabled() && !!appId?.startsWith('dev-app-');

/** 已配置真实 LLM 时不再走本地模拟对话 */
export const shouldUseDevChatStream = (appId?: string) =>
  isDevAppId(appId) && !isAIWorkbenchLlmConfigured();

/** 开发环境：后端 SSE 不可用时是否允许直连 DeepSeek 兜底 */
export const shouldAllowDirectLlmFallback = () =>
  isDevBypassEnabled() && isAIWorkbenchLlmConfigured();

/** 使用本地 LLM 占位 Agent，跳过后端 CreateMessage */
export const shouldUseLocalLlmStream = (appId?: string) =>
  isLocalLlmAppId(appId) && isAIWorkbenchLlmConfigured();

export const devGetConversationList = (appId: string) => {
  const result = readAll()
    .filter((item) => item.appId === appId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return {
    status: 200,
    code: '',
    message: '',
    requestId: '',
    data: {
      result,
      totalCount: result.length
    }
  };
};

export const devDeleteConversation = (id: string) => {
  writeAll(readAll().filter((item) => item.id !== id));
  return {
    status: 200,
    code: '',
    message: '',
    requestId: ''
  };
};

export const devRenameConversation = (id: string, name: string) => {
  const next = readAll().map((item) =>
    item.id === id
      ? { ...item, name, updatedAt: new Date().toISOString() }
      : item
  );
  writeAll(next);
  return {
    status: 200,
    code: '',
    message: '',
    requestId: ''
  };
};

export const devGetConversationMessages = () => ({
  status: 200,
  code: '',
  message: '',
  requestId: '',
  data: {
    result: []
  }
});

export const devUpsertConversation = (
  appId: string,
  conversationId: string,
  lastQuery: string
) => {
  const now = new Date().toISOString();
  const records = readAll();
  const existing = records.find((item) => item.id === conversationId);

  if (existing) {
    writeAll(
      records.map((item) =>
        item.id === conversationId
          ? {
              ...item,
              description: lastQuery,
              updatedAt: now
            }
          : item
      )
    );
    return;
  }

  writeAll([
    {
      id: conversationId,
      name: lastQuery.slice(0, 20) || '新会话',
      appId,
      description: lastQuery,
      createdAt: now,
      updatedAt: now
    },
    ...records
  ]);
};

export type DevChatStreamCallbacks = DirectLlmStreamCallbacks;

/** 开发环境本地模拟 SSE 对话流 */
export const devRunChatStream = async (options: {
  appId: string;
  query: string;
  conversationID?: string;
  signal?: AbortSignal;
  callbacks: DevChatStreamCallbacks;
}) => {
  const { appId, query, conversationID, signal, callbacks } = options;
  const { onOpen, onMessage, onClose, onError } = callbacks;

  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      const timer = window.setTimeout(resolve, ms);
      signal?.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true }
      );
    });

  try {
    await wait(200);
    onOpen?.();

    const conversationId = conversationID || `dev-conv-${Date.now()}`;
    const reply = `[开发模式] 已收到您的消息：「${query}」。当前为本地开发环境，对话走本地模拟，未连接真实大模型。`;

    for (let index = 0; index < reply.length; index += 4) {
      await wait(24);
      onMessage({
        type: 'answer',
        content: reply.slice(index, index + 4),
        done: false
      });
    }

    await wait(80);
    onMessage({
      type: 'done',
      conversation_id: conversationId,
      message_id: `dev-msg-${Date.now()}`,
      done: true
    });

    devUpsertConversation(appId, conversationId, query);
    onClose?.();
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') {
      return;
    }

    onError?.(error instanceof Error ? error : new Error('本地模拟对话失败'));
  }
};

/** 开发环境直连 DeepSeek OpenAI 兼容接口（后端 CreateMessage 不可用时的兜底） */
export const devRunLlmChatStream = async (options: {
  query: string;
  conversationID?: string;
  signal?: AbortSignal;
  callbacks: DevChatStreamCallbacks;
}) => {
  const { query, conversationID, signal, callbacks } = options;

  return runDirectLlmChatStream({
    messages: [{ role: 'user', content: query }],
    conversationID,
    signal,
    callbacks
  });
};

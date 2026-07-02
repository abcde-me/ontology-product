/**
 * Chat hooks 工具函数
 */

import { getLoginToken } from '@/utils/env';
import { DEV_CEAI_USER_ID, isDevBypassEnabled } from '@/utils/devFallback';
import { ChatMessage, SSEEvent, ThinkingStep, ToolCall } from './types';

/**
 * 生成唯一 ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/** 获取当前 region（与 UAPI inRegion 逻辑一致） */
export const getCurrentRegionId = (): string => {
  const parts = /\/(region\/(.*)\/)?console\/(.*)\//.exec(window.location.href);
  return parts?.[2] ?? 'region1';
};

/**
 * 构建 SSE 流式请求头（补齐 UAPI 拦截器注入的鉴权信息）
 */
export const buildStreamRequestHeaders = (
  projectId?: string
): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'x-auth-validate': JSON.stringify(true),
    'x-regionid': getCurrentRegionId()
  };

  if (projectId) {
    headers['x-ceai-project-id'] = projectId;
  }

  const token = getLoginToken();
  if (token) {
    const cleanToken = token.replace(/['"]/g, '').trim();
    if (cleanToken) {
      headers.authorization = cleanToken.startsWith('Bearer ')
        ? cleanToken
        : `Bearer ${cleanToken}`;
    }
  }

  if (isDevBypassEnabled()) {
    headers['X-Ceai-User-Id'] = DEV_CEAI_USER_ID;
  }

  return headers;
};

/**
 * 解析 JSON（容错）
 */
export const parseJson = <T = any>(jsonString: string): T | null => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
};

const SSE_DONE_MARKERS = new Set(['[DONE]', 'done', 'DONE']);

const SUCCESS_API_CODES = new Set([
  'Success',
  'success',
  'SUCCESS',
  '0',
  '200',
  ''
]);

/** 识别后端以 JSON/SSE 返回的业务错误（如鉴权失败） */
const extractApiStreamError = (raw: Record<string, unknown>): string | null => {
  const code = raw.code != null ? String(raw.code) : '';
  const statusCode = raw.statusCode ?? raw.status;
  const message =
    (typeof raw.message === 'string' && raw.message) ||
    (typeof raw.msg === 'string' && raw.msg) ||
    (typeof raw.error_detail === 'string' && raw.error_detail) ||
    (typeof raw.error === 'string' && raw.error) ||
    null;

  if (!message) {
    return null;
  }

  const hasErrorCode = code && !SUCCESS_API_CODES.has(code);
  const hasErrorStatus =
    typeof statusCode === 'number' && statusCode !== 200 && statusCode !== 0;

  if (hasErrorCode || hasErrorStatus) {
    return message;
  }

  return null;
};

/** 从 OpenAI Chat Completions 流式格式提取文本 */
const extractOpenAiStreamContent = (
  raw: Record<string, unknown>
): { content: string; isReasoning?: boolean } | undefined => {
  if (!Array.isArray(raw.choices) || raw.choices.length === 0) {
    return undefined;
  }

  const choice = raw.choices[0] as Record<string, unknown>;
  const delta = choice?.delta as Record<string, unknown> | undefined;
  const message = choice?.message as Record<string, unknown> | undefined;

  if (typeof delta?.content === 'string' && delta.content) {
    return { content: delta.content };
  }

  if (typeof delta?.reasoning_content === 'string' && delta.reasoning_content) {
    return { content: delta.reasoning_content, isReasoning: true };
  }

  if (typeof message?.content === 'string' && message.content) {
    return { content: message.content };
  }

  if (
    typeof message?.reasoning_content === 'string' &&
    message.reasoning_content
  ) {
    return { content: message.reasoning_content, isReasoning: true };
  }

  return undefined;
};

const unwrapStreamPayload = (
  raw: Record<string, unknown>
): Record<string, unknown> => {
  let payload: Record<string, unknown> = { ...raw };

  if (
    payload.result &&
    typeof payload.result === 'object' &&
    !Array.isArray(payload.result)
  ) {
    payload = { ...payload, ...(payload.result as Record<string, unknown>) };
  }

  if (typeof payload.data === 'string') {
    const inner = parseJson<Record<string, unknown>>(payload.data);
    if (inner) {
      payload = { ...payload, ...inner };
    }
  } else if (
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data) &&
    !payload.type &&
    !payload.event
  ) {
    payload = { ...payload, ...(payload.data as Record<string, unknown>) };
  }

  if (typeof payload.content === 'object' && payload.content !== null) {
    const contentObj = payload.content as Record<string, unknown>;
    if (typeof contentObj.text === 'string') {
      payload.content = contentObj.text;
    } else if (typeof contentObj.answer === 'string') {
      payload.content = contentObj.answer;
    }
  }

  return payload;
};

/**
 * 归一化 SSE 事件结构，兼容不同后端字段命名
 */
export const normalizeStreamEvent = (
  raw: Record<string, unknown> | null,
  sseEventName?: string
): SSEEvent | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const apiError = extractApiStreamError(raw);
  if (apiError) {
    return { type: 'error', error_detail: apiError, done: true };
  }

  const event = unwrapStreamPayload(raw) as SSEEvent;

  const nestedApiError = extractApiStreamError(
    event as unknown as Record<string, unknown>
  );
  if (nestedApiError) {
    return { type: 'error', error_detail: nestedApiError, done: true };
  }

  const rawType = String(
    event.type || event.event || sseEventName || ''
  ).toLowerCase();

  const typeAliases: Record<string, string> = {
    llm: 'answer',
    message: 'answer',
    agent_message: 'answer',
    agent_answer: 'answer',
    chat: 'answer',
    text: 'answer',
    delta: 'answer',
    content: 'answer',
    message_end: 'done',
    workflow_finished: 'done',
    end: 'done',
    finish: 'done',
    finished: 'done',
    agent_thought: 'thinking',
    thought: 'thinking',
    ping: 'ping'
  };

  event.type = typeAliases[rawType] || rawType;

  if (!event.content) {
    if (typeof event.answer === 'string') {
      event.content = event.answer;
    } else if (typeof event.text === 'string') {
      event.content = event.text;
    } else if (typeof event.message === 'string') {
      event.content = event.message;
    } else if (event.data && typeof event.data === 'object') {
      const data = event.data as Record<string, unknown>;
      event.content =
        (data.text as string) ||
        (data.content as string) ||
        (data.answer as string) ||
        data;
    } else if (typeof event.data === 'string') {
      event.content = event.data;
    } else {
      const openAiChunk = extractOpenAiStreamContent(raw);
      if (openAiChunk?.content) {
        event.content = openAiChunk.content;
        if (!event.type) {
          event.type = openAiChunk.isReasoning ? 'thinking' : 'answer';
        }
      }
    }
  }

  if (
    Array.isArray(raw.choices) &&
    (raw.choices[0] as Record<string, unknown>)?.finish_reason === 'stop'
  ) {
    event.type = event.type || 'done';
    event.done = true;
  }

  if (
    event.done === undefined &&
    (event.type === 'done' || event.type === 'error')
  ) {
    event.done = true;
  }

  if (!event.conversation_id) {
    event.conversation_id =
      (event.conversationID as string) ||
      (event.conversationId as string) ||
      event.conversation_id;
  }

  if (!event.message_id) {
    event.message_id =
      (event.messageID as string) ||
      (event.messageId as string) ||
      event.message_id;
  }

  return event;
};

/**
 * 将 SSE 原始 data 解析为统一事件
 */
export const parseStreamEventData = (
  rawData: string,
  sseEventName?: string
): SSEEvent | null => {
  const trimmed = rawData?.trim();
  if (!trimmed) {
    return null;
  }

  if (SSE_DONE_MARKERS.has(trimmed)) {
    return { type: 'done', done: true };
  }

  const parsed = parseJson<Record<string, unknown>>(trimmed);
  if (parsed) {
    const event = normalizeStreamEvent(
      unwrapStreamPayload(parsed),
      sseEventName
    );
    if (event?.type === 'ping') {
      return null;
    }
    return event;
  }

  return normalizeStreamEvent(
    {
      type: sseEventName || 'answer',
      content: trimmed
    },
    sseEventName
  );
};

/**
 * 创建用户消息
 */
export const createUserMessage = (text: string, files?: any[]): ChatMessage => {
  return {
    id: generateId(),
    type: 'user',
    content: text,
    timestamp: Date.now(),
    status: 'local',
    files: files || []
  };
};

/**
 * 创建助手消息占位符
 */
export const createAssistantPlaceholder = (): ChatMessage => {
  return {
    id: generateId(),
    type: 'assistant',
    content: '',
    timestamp: Date.now(),
    status: 'loading',
    thinkingSteps: []
  };
};

/**
 * 从 SSE 事件提取文本
 */
export const extractTextFromSSE = (event: SSEEvent): string => {
  // 处理 answer 类型事件（流式文本输出）
  if (event.type === 'answer' && event.content) {
    if (typeof event.content === 'string') {
      return event.content;
    }
  }

  // content 在顶层
  if (event.content && typeof event.content === 'string') {
    return event.content;
  }

  // 兼容旧格式
  if (event.data?.text) {
    return event.data.text;
  }

  return '';
};

/**
 * 从 SSE 事件中提取思考步骤
 */
export const extractThinkingStep = (event: SSEEvent): ThinkingStep | null => {
  // 处理深度思考事件
  if (event.type === 'thinking') {
    return {
      chunk_id: event.chunk_id || generateId(),
      type: event.type,
      content: event.content || '',
      status: event.done ? 'success' : 'running',
      running_time: event.running_time,
      done: event.done || false
    };
  }

  return null;
};

/**
 * 从 SSE 事件中提取工具调用
 */
export const extractToolCall = (event: SSEEvent): ToolCall | null => {
  // 处理本体工具调用事件
  if (event.type === 'ontology') {
    // content 可能是 JSON 字符串或对象
    let contentData = event.content;
    if (typeof contentData === 'string') {
      contentData = parseJson(contentData);
    }

    return {
      id: event.chunk_id || generateId(),
      name: '本体工具调用',
      input: contentData?.args
        ? typeof contentData.args === 'string'
          ? parseJson(contentData.args)
          : contentData.args
        : null,
      output: contentData?.result || contentData,
      status: event.done ? 'success' : 'running',
      running_time: event.running_time,
      done: event.done,
      ...event // 保留原始事件的所有字段
    };
  }

  return null;
};

/**
 * 判断是否为完成事件
 */
export const isDoneEvent = (event: SSEEvent): boolean => {
  return event.type === 'done';
};

/**
 * 判断是否为错误事件
 */
export const isErrorEvent = (event: SSEEvent): boolean => {
  return event.type === 'error';
};

/**
 * 提取错误信息
 */
export const extractErrorMessage = (event: SSEEvent): string => {
  if (isErrorEvent(event)) {
    return event.error_detail || '发生未知错误';
  }
  return '发生未知错误';
};

/**
 * 合并消息内容（流式更新）
 */
export const mergeMessageContent = (
  existing: string,
  newContent: string
): string => {
  return existing + newContent;
};

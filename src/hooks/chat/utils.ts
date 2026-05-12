/**
 * Chat hooks 工具函数
 */

import { ChatMessage, SSEEvent, ThinkingStep, ToolCall } from './types';

/**
 * 生成唯一 ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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

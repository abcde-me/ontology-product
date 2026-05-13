/**
 * useXChat - 核心消息管理 Hook
 * 完全参考 ai-appforge 的实现，使用 useImmer 和消息队列处理
 */

import { useRef, useCallback, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Message } from '@arco-design/web-react';
import { getToken } from '@/utils/request';
import {
  getChatApiUrl,
  getConversationMessages
} from '@/api/aiOntologyWorkbench/chat';
import {
  ChatMessage,
  SendMessageParams,
  UseChatConfig,
  UseChatReturn,
  SSEEvent,
  ThinkingStep
} from '../types';
import { generateId, parseJson } from '../utils';

// 处理状态常量
const PROCESSING_STATE = {
  IDLE: 'idle',
  PROCESSING: 'processing'
} as const;

// 处理频率（毫秒）
const PROCESSING_FRAME_TIME = 20; // 未完成时的处理频率
const FINISH_FRAME_TIME = 10; // 完成后的处理频率

// 事件类型常量
const EVENT_TYPES = {
  THINKING: 'thinking',
  ONTOLOGY: 'ontology',
  ANSWER: 'answer',
  DONE: 'done',
  ERROR: 'error'
} as const;

export const useXChat = (config: UseChatConfig): UseChatReturn => {
  const {
    appId,
    conversationId: externalConversationId,
    projectId,
    onConversationCreated,
    onError
  } = config;

  // ==================== State ====================
  const [messages, setMessages] = useImmer<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useImmer(false);
  const [isStreaming, setIsStreaming] = useImmer(false);

  // ==================== Refs ====================
  const conversationIdRef = useRef<string>(
    externalConversationId && externalConversationId !== null
      ? externalConversationId
      : ''
  );
  const currentMessageIdRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageQueueRef = useRef<SSEEvent[]>([]);
  const processingStateRef = useRef<string>(PROCESSING_STATE.IDLE);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionClosedRef = useRef(false);
  const prevEventTypeRef = useRef<string | null>(null); // 记录上一次事件类型

  // ==================== 清空队列 ====================
  const onCleanQueue = useCallback(() => {
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    messageQueueRef.current = [];
    processingStateRef.current = PROCESSING_STATE.IDLE;
    connectionClosedRef.current = false;
    prevEventTypeRef.current = null;
  }, []);

  // ==================== 完成当前消息 ====================
  const lastChatDone = useCallback(() => {
    onCleanQueue();
    setIsLoading(false);
    setIsStreaming(false);
    abortControllerRef.current?.abort();
  }, [onCleanQueue, setIsLoading, setIsStreaming]);

  // ==================== 处理单个事件 ====================
  const processingChat = useCallback(
    (event: SSEEvent) => {
      const { type } = event;

      // 处理 thinking 类型
      if (type === EVENT_TYPES.THINKING) {
        setMessages((draft) => {
          const lastIndex = draft.length - 1;
          if (lastIndex < 0) return;

          const lastMsg = draft[lastIndex];
          if (!lastMsg.thinkingSteps) {
            lastMsg.thinkingSteps = [];
          }
          const steps = lastMsg.thinkingSteps;

          // 如果上一次也是 thinking，累积内容
          if (
            prevEventTypeRef.current === EVENT_TYPES.THINKING &&
            steps.length > 0
          ) {
            const lastStepIndex = steps.length - 1;
            steps[lastStepIndex].content += event.content || '';
            steps[lastStepIndex].running_time = event.running_time;
            steps[lastStepIndex].done = event.done || false;
            if (event.done) {
              steps[lastStepIndex].status = 'success';
            }
          } else {
            // 第一次 thinking，创建新步骤
            steps.push({
              chunk_id: event.chunk_id || generateId(),
              type: EVENT_TYPES.THINKING,
              content: event.content || '',
              status: event.done ? 'success' : 'running',
              running_time: event.running_time,
              done: event.done || false
            });
          }

          lastMsg.status = 'streaming';
        });
      }
      // 处理 ontology 类型 - 作为思考步骤的一部分
      else if (type === EVENT_TYPES.ONTOLOGY) {
        setMessages((draft) => {
          const lastIndex = draft.length - 1;
          if (lastIndex < 0) return;

          const lastMsg = draft[lastIndex];
          if (!lastMsg.thinkingSteps) {
            lastMsg.thinkingSteps = [];
          }
          const steps = lastMsg.thinkingSteps;

          // 查找是否已存在相同 chunk_id 的步骤
          const stepIndex = steps.findIndex(
            (s) => s.chunk_id === event.chunk_id
          );

          let contentData = event.content;
          if (typeof contentData === 'string') {
            try {
              contentData = JSON.parse(contentData);
            } catch (e) {
              // ignore
            }
          }

          const ontologyStep: ThinkingStep = {
            chunk_id: event.chunk_id || generateId(),
            type: EVENT_TYPES.ONTOLOGY,
            content: contentData,
            status: event.done ? 'success' : 'running',
            running_time: event.running_time,
            done: event.done || false
          };

          if (stepIndex >= 0) {
            steps[stepIndex] = ontologyStep;
          } else {
            steps.push(ontologyStep);
          }

          lastMsg.status = 'streaming';
        });
      }
      // 处理 answer 类型
      else if (type === EVENT_TYPES.ANSWER) {
        setMessages((draft) => {
          const lastIndex = draft.length - 1;
          if (lastIndex < 0) return;

          const lastMsg = draft[lastIndex];
          lastMsg.content += event.content || '';
          lastMsg.status = 'streaming';
        });
      }
      // 处理 done 类型
      else if (type === EVENT_TYPES.DONE) {
        if (event.conversation_id) {
          conversationIdRef.current = event.conversation_id;
          onConversationCreated?.(event.conversation_id);
        }
        if (event.message_id) {
          currentMessageIdRef.current = event.message_id;
        }

        setMessages((draft) => {
          const lastIndex = draft.length - 1;
          if (lastIndex >= 0) {
            draft[lastIndex].status = 'success';
            // 确保所有未完成的步骤都标记为完成
            const steps = draft[lastIndex].thinkingSteps;
            if (steps && steps.length > 0) {
              steps.forEach((step) => {
                if (!step.done) {
                  step.done = true;
                  step.status = 'success';
                }
              });
            }
          }
        });

        lastChatDone();
      }
      // 处理 error 类型
      else if (type === EVENT_TYPES.ERROR) {
        const errorMsg = event.error_detail || '发生未知错误';

        setMessages((draft) => {
          const lastIndex = draft.length - 1;
          if (lastIndex >= 0) {
            draft[lastIndex].content = errorMsg;
            draft[lastIndex].status = 'error';

            // 将所有未完成的思考步骤标记为失败
            const steps = draft[lastIndex].thinkingSteps;
            if (steps && steps.length > 0) {
              steps.forEach((step) => {
                if (!step.done) {
                  step.done = true;
                  step.status = 'error';
                }
              });
            }
          }
        });

        lastChatDone();
        onError?.(new Error(errorMsg));
      }

      // 记录当前事件类型
      prevEventTypeRef.current = type || null;
    },
    [setMessages, lastChatDone, onConversationCreated, onError]
  );

  // ==================== 处理消息队列 ====================
  const processingQueue = useCallback(() => {
    if (messageQueueRef.current.length === 0) {
      // 队列处理完毕
      if (connectionClosedRef.current) {
        onCleanQueue();
      } else {
        processingStateRef.current = PROCESSING_STATE.IDLE;
      }
      return;
    }

    // 根据连接状态选择处理频率
    const delay = connectionClosedRef.current
      ? FINISH_FRAME_TIME
      : PROCESSING_FRAME_TIME;

    processingStateRef.current = PROCESSING_STATE.PROCESSING;
    const message = messageQueueRef.current.shift();

    try {
      if (message) {
        processingChat(message);
      }
    } catch (e) {
      console.error('Process message error:', e);
    }

    // 设置下一个处理定时器
    processingTimerRef.current = setTimeout(processingQueue, delay);
  }, [processingChat, onCleanQueue]);

  // ==================== 发送消息 ====================
  const sendMessage = useCallback(
    async (params: SendMessageParams) => {
      const { text, files, enableDeepThink = false } = params;

      if (!text.trim()) {
        return;
      }

      if (isLoading || isStreaming) {
        Message.warning('请等待当前消息完成');
        return;
      }

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: generateId(),
        type: 'user',
        content: text,
        timestamp: Date.now(),
        status: 'local',
        files: files || []
      };

      setMessages((draft) => {
        draft.push(userMessage);
      });

      // 添加助手消息占位符
      const assistantMessage: ChatMessage = {
        id: generateId(),
        type: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'loading',
        thinkingSteps: []
      };

      currentMessageIdRef.current = assistantMessage.id;

      setMessages((draft) => {
        draft.push(assistantMessage);
      });

      // 清空队列
      onCleanQueue();
      setIsLoading(true);

      // 创建 AbortController
      abortControllerRef.current = new AbortController();

      // 构建请求 URL
      const requestUrl = getChatApiUrl(String(appId));

      // 构建请求体
      const requestBody = {
        responseMode: 'Streaming',
        status: 'Published',
        appID: String(appId),
        projectID: projectId ? String(projectId) : undefined,
        conversationID: conversationIdRef.current || '', // 空字符串表示创建新会话
        enableDeepThink,
        query: text,
        inputs: files ? { files } : undefined
      };

      // 构建请求头
      const tokenHeaders = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      };

      if (tokenHeaders.authorization) {
        headers.authorization = tokenHeaders.authorization;
      }

      console.log('[useXChat] 发送请求:', {
        url: requestUrl,
        method: 'POST',
        headers,
        body: requestBody
      });

      try {
        await fetchEventSource(requestUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
          credentials: 'include',

          onopen: async (response) => {
            const contentType = response.headers?.get('content-type') || '';

            if (response.ok && contentType.includes('text/event-stream')) {
              setIsLoading(false);
              setIsStreaming(true);
              return;
            }

            if (response.headers.get('content-type') === 'application/json') {
              const data = await response.json();
              throw new Error(data?.msg || '请求失败');
            }

            throw new Error('请求失败');
          },

          onmessage: (msg) => {
            try {
              const event = parseJson<SSEEvent>(msg.data);
              if (event) {
                console.log('[SSE Event]', {
                  type: event.type,
                  content:
                    typeof event.content === 'string'
                      ? event.content.substring(0, 20) + '...'
                      : event.content,
                  chunk_id: event.chunk_id,
                  done: event.done
                });

                messageQueueRef.current.push(event);

                if (processingStateRef.current === PROCESSING_STATE.IDLE) {
                  processingQueue();
                }
              }
            } catch (error) {
              console.error('Parse SSE message error:', error);
            }
          },

          onclose: () => {
            connectionClosedRef.current = true;
            if (messageQueueRef.current.length > 0) {
              if (!processingTimerRef.current) {
                processingQueue();
              }
            } else {
              onCleanQueue();
            }
            abortControllerRef.current?.abort();
          },

          onerror: (error: any) => {
            console.error('SSE Error:', error);
            connectionClosedRef.current = true;
            onCleanQueue();

            const errorMsg = error?.message || '服务响应超时，请稍后再试';

            setMessages((draft) => {
              const lastIndex = draft.length - 1;
              if (lastIndex >= 0) {
                draft[lastIndex].content = errorMsg;
                draft[lastIndex].status = 'error';
              }
            });

            setIsStreaming(false);
            setIsLoading(false);
            onError?.(error);
            abortControllerRef.current?.abort();

            throw error;
          }
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Send message error:', error);
          Message.error(error.message || '发送失败');
          onError?.(error);
        }
      }
    },
    [
      appId,
      projectId,
      isLoading,
      isStreaming,
      onCleanQueue,
      processingQueue,
      onError,
      setMessages,
      setIsLoading,
      setIsStreaming
    ]
  );

  // ==================== 停止生成 ====================
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    onCleanQueue();
    setIsStreaming(false);
    setIsLoading(false);

    setMessages((draft) => {
      const lastIndex = draft.length - 1;
      if (lastIndex >= 0 && draft[lastIndex].type === 'assistant') {
        // 标记为中止状态
        draft[lastIndex].status = 'abort';
        // 在内容末尾添加停止提示
        if (draft[lastIndex].content) {
          draft[lastIndex].content += '\n\n您中途停止生成回答';
        } else {
          draft[lastIndex].content = '您中途停止生成回答';
        }
      }
    });

    // Message.success('已停止生成');
  }, [onCleanQueue, setIsStreaming, setIsLoading, setMessages]);

  // ==================== 加载历史消息 ====================
  const loadHistoryMessages = useCallback(
    async (conversationID: string) => {
      if (!conversationID || !appId) return;

      try {
        setIsLoading(true);
        const response = await getConversationMessages({
          appId: String(appId),
          conversationID
        });

        console.log('历史消息响应:', response);

        if (response?.data?.result) {
          const historyMessages: ChatMessage[] = [];

          // 按时间倒序排列（接口返回的是 desc，需要反转）
          const sortedMessages = [...response.data.result].reverse();

          sortedMessages.forEach((item: any) => {
            // 用户消息
            if (item.query) {
              historyMessages.push({
                id: `user-${item.id}`,
                type: 'user',
                content: item.query,
                timestamp: new Date(item.createdAt).getTime(),
                status: 'success',
                files: item.files || []
              });
            }

            // AI 回复消息
            if (item.answer) {
              historyMessages.push({
                id: `assistant-${item.id}`,
                type: 'assistant',
                content: item.answer,
                timestamp: new Date(item.updatedAt).getTime(),
                status: 'success',
                thinkingSteps: []
              });
            }
          });

          setMessages(historyMessages);
          console.log('解析后的历史消息:', historyMessages);
        }
      } catch (error: any) {
        console.error('加载历史消息失败:', error);
        Message.error(error.message || '加载历史消息失败');
      } finally {
        setIsLoading(false);
      }
    },
    [appId, setMessages, setIsLoading]
  );

  // ==================== 监听 conversationId 变化 ====================
  useEffect(() => {
    // 如果 conversationId 为 null（未初始化），不做任何操作
    if (externalConversationId === null) {
      return;
    }

    // 如果 conversationId 为 undefined（新建会话），清空 ref
    if (externalConversationId === undefined) {
      conversationIdRef.current = '';
      // 不清空消息，因为消息已经在 handleNewSession 中清空了
      return;
    }

    // 如果 conversationId 变化，加载历史消息
    if (externalConversationId !== conversationIdRef.current) {
      conversationIdRef.current = externalConversationId;
      loadHistoryMessages(externalConversationId);
    }
  }, [externalConversationId, loadHistoryMessages]);

  // ==================== 清空消息 ====================
  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = '';
    currentMessageIdRef.current = '';
  }, [setMessages]);

  // ==================== 删除消息 ====================
  const deleteMessage = useCallback(
    (messageId: string) => {
      setMessages((draft) => {
        return draft.filter((msg) => msg.id !== messageId);
      });
    },
    [setMessages]
  );

  // ==================== 重新生成消息 ====================
  const regenerateMessage = useCallback(
    async (messageId: string) => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return;

      const userMessage = messages[messageIndex - 1];
      if (!userMessage || userMessage.type !== 'user') return;

      setMessages((draft) => {
        return draft.slice(0, messageIndex);
      });

      await sendMessage({
        text: userMessage.content,
        files: userMessage.files
      });
    },
    [messages, sendMessage, setMessages]
  );

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    stopGeneration,
    clearMessages,
    deleteMessage,
    regenerateMessage
  };
};

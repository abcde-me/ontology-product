/**
 * useXChat - 核心消息管理 Hook
 * 专注于消息状态管理，使用 useXStream 处理流式连接
 * 参考 x-main 项目的 useXChat 设计，通过依赖注入实现通用化
 */

import { useRef, useCallback, useEffect } from 'react';
import { useImmer } from 'use-immer';
import {
  ChatMessage,
  SendMessageParams,
  UseChatConfig,
  UseChatReturn,
  SSEEvent
} from '../types';
import { generateId } from '../utils';
import { createEventProcessor } from './eventHandlers';
import { useXStream } from '../useXStream';

export const useXChat = (config: UseChatConfig): UseChatReturn => {
  const {
    appId,
    conversationId: externalConversationId,
    projectId,
    appConfigId,
    channel = 'Preview',
    source = 'debugger',
    apiConfig,
    showMessage,
    onConversationCreated,
    onMessageEnd,
    onError
  } = config;

  // ==================== API 函数（通过依赖注入） ====================
  const defaultBuildRequestBody = (params: {
    appId: string;
    conversationId: string;
    query: string;
    files?: any[];
    enableDeepThink: boolean;
    projectId?: string;
    appConfigId?: string;
    channel?: string;
    source?: string;
  }) => ({
    responseMode: 'Streaming',
    status: params.source === 'published' ? 'Published' : 'Unpublished',
    channel: params.channel,
    appID: params.appId,
    appConfigID: params.appConfigId,
    projectID: params.projectId,
    conversationID: params.conversationId,
    enableDeepThink: params.enableDeepThink,
    query: params.query,
    inputs: params.files ? { files: params.files } : {}
  });

  const getChatUrl = apiConfig.getChatUrl;
  const getHistoryMessages = apiConfig.getHistoryMessages;
  const buildRequestBody =
    apiConfig.buildRequestBody || defaultBuildRequestBody;

  // ==================== 流式处理 ====================
  const { connect: connectStream, disconnect: disconnectStream } = useXStream();

  // ==================== State ====================
  const [messages, setMessages] = useImmer<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useImmer(false);
  const [isStreaming, setIsStreaming] = useImmer(false);
  const [isLoadingHistory, setIsLoadingHistory] = useImmer(false);

  // ==================== Refs ====================
  const conversationIdRef = useRef<string>(
    externalConversationId && externalConversationId !== null
      ? externalConversationId
      : ''
  );
  const currentMessageIdRef = useRef<string>('');
  const prevEventTypeRef = useRef<string | null>(null);

  // ==================== 完成当前消息 ====================
  const lastChatDone = useCallback(() => {
    setIsLoading(false);
    setIsStreaming(false);
    disconnectStream();
  }, [setIsLoading, setIsStreaming, disconnectStream]);

  // ==================== 创建事件处理器 ====================
  const processingChat = useCallback(
    createEventProcessor({
      setMessages,
      prevEventTypeRef,
      conversationIdRef,
      currentMessageIdRef,
      onConversationCreated,
      onMessageEnd,
      onError,
      lastChatDone
    }),
    [setMessages, lastChatDone, onConversationCreated, onMessageEnd, onError]
  );

  // ==================== 发送消息 ====================
  const sendMessage = useCallback(
    async (params: SendMessageParams) => {
      const { text, files, enableDeepThink = true } = params;

      if (!text.trim()) {
        return;
      }

      if (isLoading || isStreaming) {
        showMessage?.warning('请等待当前消息完成');
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

      setIsLoading(true);

      // 构建请求 URL
      const requestUrl = getChatUrl(String(appId));

      // 构建请求体
      const requestBody = buildRequestBody({
        appId: String(appId),
        conversationId: conversationIdRef.current || '',
        query: text,
        files,
        enableDeepThink,
        projectId: projectId ? String(projectId) : undefined,
        appConfigId: appConfigId ? String(appConfigId) : undefined,
        channel,
        source
      });

      console.log('[useXChat] 发送请求:', {
        url: requestUrl,
        projectID: requestBody.projectID
      });

      // 构建请求头
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      };

      try {
        // 使用 useXStream 进行流式连接
        await connectStream(
          {
            url: requestUrl,
            method: 'POST',
            headers,
            body: requestBody
          },
          {
            onOpen: () => {
              setIsLoading(false);
              setIsStreaming(true);
            },

            onMessage: (event: SSEEvent) => {
              // 处理事件
              processingChat(event);
            },

            onClose: () => {
              // 连接关闭，等待队列处理完成
            },

            onError: (error) => {
              console.error('SSE Error:', error);

              const errorMsg = error?.message || '服务响应超时，请稍后再试';

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

              setIsStreaming(false);
              setIsLoading(false);
              onError?.(error);
            }
          }
        );
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Send message error:', error);
          showMessage?.error(error.message || '发送失败');
          onError?.(error);
        }
      }
    },
    [
      appId,
      projectId,
      isLoading,
      isStreaming,
      processingChat,
      onError,
      setMessages,
      setIsLoading,
      setIsStreaming,
      getChatUrl,
      buildRequestBody,
      channel,
      source,
      appConfigId,
      connectStream
    ]
  );

  // ==================== 停止生成 ====================
  const stopGeneration = useCallback(() => {
    disconnectStream();
    setIsStreaming(false);
    setIsLoading(false);

    setMessages((draft) => {
      const lastIndex = draft.length - 1;
      if (lastIndex >= 0 && draft[lastIndex].type === 'assistant') {
        draft[lastIndex].status = 'abort';
        if (draft[lastIndex].content) {
          draft[lastIndex].content += '\n\n您中途停止生成回答';
        } else {
          draft[lastIndex].content = '您中途停止生成回答';
        }
      }
    });
  }, [disconnectStream, setIsStreaming, setIsLoading, setMessages]);

  // ==================== 加载历史消息 ====================
  const loadHistoryMessages = useCallback(
    async (conversationID: string) => {
      console.log('[useXChat] loadHistoryMessages 被调用:', {
        conversationID,
        appId,
        hasGetHistoryMessages: !!getHistoryMessages
      });

      if (!conversationID || !appId || !getHistoryMessages) {
        console.log('[useXChat] loadHistoryMessages 条件不满足，跳过');
        return;
      }

      try {
        setIsLoadingHistory(true);
        console.log('[useXChat] 开始调用 getHistoryMessages API');
        const response = await getHistoryMessages({
          appId: String(appId),
          conversationId: conversationID
        });

        console.log('[useXChat] 历史消息响应:', response);

        if (response?.data?.result) {
          const historyMessages: ChatMessage[] = [];
          const sortedMessages = [...response.data.result].reverse();

          sortedMessages.forEach((item: any) => {
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
          console.log('[useXChat] 解析后的历史消息:', historyMessages);
        } else {
          console.log('[useXChat] 响应中没有 result 数据');
        }
      } catch (error: any) {
        console.error('[useXChat] 加载历史消息失败:', error);
        showMessage?.error(error.message || '加载历史消息失败');
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [appId, getHistoryMessages, setMessages, setIsLoadingHistory, showMessage]
  );

  // ==================== 监听 conversationId 变化 ====================
  // 注意：这个 useEffect 只处理外部传入的 conversationId
  // 如果 conversationId 是通过内部状态管理的，应该在外部手动调用 loadHistoryMessages
  useEffect(() => {
    console.log('[useXChat] conversationId 变化:', {
      externalConversationId,
      conversationIdRefCurrent: conversationIdRef.current
    });

    if (externalConversationId === null) {
      console.log('[useXChat] conversationId 为 null，跳过');
      return;
    }

    if (externalConversationId === undefined) {
      console.log('[useXChat] conversationId 为 undefined，清空 ref');
      conversationIdRef.current = '';
      return;
    }

    // 只有当 conversationId 真正变化时才加载历史消息
    if (externalConversationId !== conversationIdRef.current) {
      console.log(
        '[useXChat] conversationId 变化，更新 ref 但不自动加载历史消息'
      );
      conversationIdRef.current = externalConversationId;
      // 注释掉自动加载，改为在外部手动调用
      // loadHistoryMessages(externalConversationId);
    }
  }, [externalConversationId]);

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
    isLoadingHistory,
    sendMessage,
    stopGeneration,
    clearMessages,
    deleteMessage,
    regenerateMessage,
    loadHistoryMessages
  };
};

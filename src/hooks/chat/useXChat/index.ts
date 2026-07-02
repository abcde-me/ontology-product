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
import { buildStreamRequestHeaders, generateId } from '../utils';
import { createEventProcessor } from './eventHandlers';
import { useXStream } from '../useXStream';
import {
  extractConversationResult,
  getApiErrorMessage
} from '@/utils/apiResponse';
import {
  isAIWorkbenchLlmConfigured,
  shouldUseDirectLlmChat
} from '@/pages/aiOntologyWorkbench/config/llm';
import { runDirectLlmChatStream } from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import { useUserInfoStore } from '@/store/userInfoStore';
import {
  devRunChatStream,
  devRunLlmChatStream,
  isDevAppId,
  shouldAllowDirectLlmFallback,
  shouldUseDevChatStream,
  shouldUseLocalLlmStream
} from '@/utils/devChatStore';

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
    useAgentSse?: boolean;
  }) => {
    const body: Record<string, unknown> = {
      responseMode: 'Streaming',
      status: params.useAgentSse
        ? 'Published'
        : params.source === 'published'
          ? 'Published'
          : 'Unpublished',
      channel: params.channel,
      appID: params.appId,
      projectID: params.projectId,
      enableDeepThink: params.enableDeepThink,
      query: params.query,
      inputs: params.files ? { files: params.files } : {}
    };

    if (params.appConfigId) {
      body.appConfigID = params.appConfigId;
    }
    if (params.conversationId) {
      body.conversationID = params.conversationId;
    }

    return body;
  };

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
  const streamIdleTimerRef = useRef<number>();
  const devAbortRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isStreamingRef = useRef(false);
  const userStoppedRef = useRef(false);
  const llmFallbackAttemptedRef = useRef(false);
  const activeQueryRef = useRef('');
  const currentSendUseAgentRef = useRef(false);

  /** 后端 SSE 空闲超时：开发环境较短以便触发直连兜底 */
  const STREAM_IDLE_TIMEOUT_MS = shouldAllowDirectLlmFallback() ? 20000 : 90000;

  isLoadingRef.current = isLoading;
  isStreamingRef.current = isStreaming;

  useEffect(() => {
    return () => {
      sendingRef.current = false;
      userStoppedRef.current = false;
    };
  }, []);

  const clearStreamIdleTimer = useCallback(() => {
    if (streamIdleTimerRef.current) {
      window.clearTimeout(streamIdleTimerRef.current);
      streamIdleTimerRef.current = undefined;
    }
  }, []);

  const finalizeAssistantMessage = useCallback(
    (fallbackError?: string) => {
      clearStreamIdleTimer();
      devAbortRef.current?.abort();

      setMessages((draft) => {
        const lastIndex = draft.length - 1;
        if (lastIndex < 0) {
          return;
        }

        const lastMsg = draft[lastIndex];
        if (lastMsg.type !== 'assistant') {
          return;
        }

        if (lastMsg.status !== 'loading' && lastMsg.status !== 'streaming') {
          return;
        }

        const hasContent =
          !!lastMsg.content?.trim() ||
          (lastMsg.thinkingSteps && lastMsg.thinkingSteps.length > 0) ||
          (lastMsg.ontologyActions && lastMsg.ontologyActions.length > 0);

        if (hasContent) {
          lastMsg.status = 'success';
          lastMsg.thinkingSteps?.forEach((step) => {
            if (!step.done) {
              step.done = true;
              step.status = 'success';
            }
          });
          return;
        }

        lastMsg.content =
          fallbackError || '未收到模型回复，请检查 Agent 配置或稍后重试';
        lastMsg.status = 'error';
      });

      setIsStreaming(false);
      setIsLoading(false);
      sendingRef.current = false;
      disconnectStream();
    },
    [
      clearStreamIdleTimer,
      disconnectStream,
      setIsLoading,
      setIsStreaming,
      setMessages
    ]
  );

  const resetStreamIdleTimer = useCallback(
    (onIdle?: () => void) => {
      clearStreamIdleTimer();
      streamIdleTimerRef.current = window.setTimeout(() => {
        onIdle?.();
      }, STREAM_IDLE_TIMEOUT_MS);
    },
    [clearStreamIdleTimer, STREAM_IDLE_TIMEOUT_MS]
  );

  // ==================== 完成当前消息 ====================
  const lastChatDone = useCallback(() => {
    clearStreamIdleTimer();
    setIsLoading(false);
    setIsStreaming(false);
    sendingRef.current = false;
    disconnectStream();
  }, [clearStreamIdleTimer, setIsLoading, setIsStreaming, disconnectStream]);

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
      const {
        text,
        files,
        enableDeepThink = true,
        useAgentSse = false,
        agentAppId
      } = params;

      const resetSendingState = () => {
        sendingRef.current = false;
        setIsLoading(false);
        setIsStreaming(false);
      };

      const failAssistantMessage = (message: string) => {
        setMessages((draft) => {
          const lastIndex = draft.length - 1;
          if (lastIndex >= 0 && draft[lastIndex].type === 'assistant') {
            draft[lastIndex].content = message;
            draft[lastIndex].status = 'error';
          }
        });
      };

      try {
        if (!text.trim()) {
          return;
        }

        if (!appId) {
          showMessage?.error('Agent 未就绪，请等待初始化完成后再发送');
          return;
        }

        if (
          sendingRef.current ||
          isLoadingRef.current ||
          isStreamingRef.current
        ) {
          showMessage?.warning('请等待当前消息完成');
          return;
        }

        clearStreamIdleTimer();
        sendingRef.current = true;
        userStoppedRef.current = false;
        llmFallbackAttemptedRef.current = false;
        activeQueryRef.current = text;
        currentSendUseAgentRef.current = useAgentSse;
        const hasStreamContentRef = { current: false };
        const streamAppId = agentAppId || String(appId);

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

        const useDirectLlm =
          !useAgentSse &&
          (apiConfig.useDirectLlmChat ?? shouldUseDirectLlmChat());

        const startIdleWatchdog = () => {
          if (useDirectLlm) {
            return;
          }
          resetStreamIdleTimer(async () => {
            const usedFallback = await attemptDirectLlmFallback();
            if (!usedFallback) {
              finalizeAssistantMessage(
                useAgentSse
                  ? 'Agent 响应超时，请稍后重试'
                  : '模型响应超时，请稍后重试'
              );
            }
          });
        };

        if (useAgentSse) {
          console.log('[useXChat] Agent SSE 模式 (CreateMessage):', {
            streamAppId,
            url: getChatUrl(streamAppId)
          });
        }

        if (useDirectLlm) {
          console.log('[useXChat] 直连 DeepSeek 模式', {
            appId,
            origin: window.location.origin
          });

          if (!isAIWorkbenchLlmConfigured()) {
            clearStreamIdleTimer();
            sendingRef.current = false;
            setIsLoading(false);
            setMessages((draft) => {
              const lastIndex = draft.length - 1;
              if (lastIndex >= 0 && draft[lastIndex].type === 'assistant') {
                draft[lastIndex].content =
                  '未配置 DeepSeek API Key，请在 .env.development 中设置 REACT_APP_AI_WORKBENCH_LLM_API_KEY';
                draft[lastIndex].status = 'error';
              }
            });
            showMessage?.error('未配置 DeepSeek API Key');
            return;
          }

          devAbortRef.current?.abort();
          devAbortRef.current = new AbortController();

          try {
            const llmMessages = apiConfig.buildDirectLlmMessages?.({
              query: text
            }) ?? [{ role: 'user' as const, content: text }];

            const markStreamContent = (event: SSEEvent) => {
              if (
                event.type === 'error' ||
                event.type === 'done' ||
                (event.content != null && event.content !== '') ||
                event.type === 'thinking'
              ) {
                hasStreamContentRef.current = true;
              }
              processingChat(event);
            };

            await runDirectLlmChatStream({
              messages: llmMessages,
              conversationID: conversationIdRef.current || undefined,
              signal: devAbortRef.current.signal,
              callbacks: {
                onRequestStart: () => {
                  console.log('[useXChat] DeepSeek fetch 已开始');
                },
                onOpen: () => {
                  setIsLoading(false);
                  setIsStreaming(true);
                },
                onMessage: (event) => markStreamContent(event as SSEEvent),
                onClose: () => {
                  clearStreamIdleTimer();
                  setIsStreaming(false);
                  setIsLoading(false);
                  sendingRef.current = false;
                },
                onError: (error) => {
                  clearStreamIdleTimer();
                  failAssistantMessage(error.message);
                  setIsStreaming(false);
                  setIsLoading(false);
                  sendingRef.current = false;
                  onError?.(error);
                }
              }
            });
          } catch (error: any) {
            resetSendingState();
            if (error?.name !== 'AbortError') {
              failAssistantMessage(error?.message || 'DeepSeek 请求失败');
              onError?.(
                error instanceof Error ? error : new Error('DeepSeek 请求失败')
              );
            }
          } finally {
            if (sendingRef.current) {
              resetSendingState();
            }
          }
          return;
        }

        const effectiveProjectId =
          (projectId ? String(projectId) : undefined) ||
          useUserInfoStore.getState().getEffectiveProjectId();

        if (!effectiveProjectId) {
          clearStreamIdleTimer();
          sendingRef.current = false;
          setIsLoading(false);
          setMessages((draft) => {
            const lastIndex = draft.length - 1;
            if (lastIndex >= 0 && draft[lastIndex].type === 'assistant') {
              draft.pop();
            }
          });
          showMessage?.warning('请先在左上角选择有效项目后再发送消息');
          return;
        }

        if (isDevAppId(streamAppId)) {
          clearStreamIdleTimer();
          sendingRef.current = false;
          setIsLoading(false);
          setMessages((draft) => {
            const lastIndex = draft.length - 1;
            if (lastIndex >= 0 && draft[lastIndex].type === 'assistant') {
              draft[lastIndex].content =
                'Agent 未正确初始化（本地占位 ID），请刷新页面或点击重试创建 Agent';
              draft[lastIndex].status = 'error';
            }
          });
          showMessage?.error('Agent 未正确初始化，请刷新页面后重试');
          return;
        }

        // 构建请求 URL（相对路径，与 UAPI 其它接口一致，由 devServer proxy 转发）
        const requestUrl = getChatUrl(streamAppId);

        // 构建请求体
        const requestBody = buildRequestBody({
          appId: streamAppId,
          conversationId: conversationIdRef.current || '',
          query: text,
          files,
          enableDeepThink,
          projectId: effectiveProjectId,
          appConfigId: appConfigId ? String(appConfigId) : undefined,
          channel,
          source,
          useAgentSse
        });

        console.log('[useXChat] 发送请求:', {
          url: requestUrl,
          projectID: requestBody.projectID,
          appId: streamAppId,
          useAgentSse,
          llmConfigured: isAIWorkbenchLlmConfigured(),
          useDevStream: shouldUseDevChatStream(streamAppId)
        });

        const streamHeaders = {
          ...buildStreamRequestHeaders(effectiveProjectId),
          ...(apiConfig.getStreamHeaders?.() || {})
        };

        const showStreamError = (error: Error) => {
          console.error('SSE Error:', error);
          clearStreamIdleTimer();

          let errorMsg = error?.message || '服务响应超时，请稍后再试';
          if (errorMsg.includes('权限')) {
            errorMsg =
              '权限系统错误：请先在左侧选择有效项目，或联系管理员分配项目权限。';
          }

          setMessages((draft) => {
            const lastIndex = draft.length - 1;
            if (lastIndex >= 0) {
              draft[lastIndex].content = errorMsg;
              draft[lastIndex].status = 'error';

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
          sendingRef.current = false;
          onError?.(error);
        };

        const releaseSending = () => {
          sendingRef.current = false;
        };

        const attemptDirectLlmFallback = async (): Promise<boolean> => {
          if (
            !shouldAllowDirectLlmFallback() ||
            currentSendUseAgentRef.current ||
            llmFallbackAttemptedRef.current ||
            hasStreamContentRef.current
          ) {
            return false;
          }

          const query = activeQueryRef.current;
          if (!query?.trim()) {
            return false;
          }

          llmFallbackAttemptedRef.current = true;
          clearStreamIdleTimer();
          disconnectStream();

          console.warn('[useXChat] 后端 SSE 无有效响应，切换为直连 DeepSeek');

          setMessages((draft) => {
            const lastIndex = draft.length - 1;
            if (lastIndex >= 0 && draft[lastIndex].type === 'assistant') {
              draft[lastIndex].content = '';
              draft[lastIndex].status = 'loading';
              draft[lastIndex].thinkingSteps = [];
            }
          });

          setIsLoading(true);
          setIsStreaming(false);
          startIdleWatchdog();

          devAbortRef.current?.abort();
          devAbortRef.current = new AbortController();

          try {
            await devRunLlmChatStream({
              query,
              conversationID: conversationIdRef.current || undefined,
              signal: devAbortRef.current.signal,
              callbacks: {
                onOpen: streamCallbacks.onOpen,
                onMessage: (event) =>
                  streamCallbacks.onMessage(event as SSEEvent),
                onClose: () => {
                  streamCallbacks.onFinished?.();
                  releaseSending();
                },
                onError: (error) => {
                  showStreamError(error);
                  releaseSending();
                }
              }
            });
            return true;
          } catch (error) {
            console.error('[useXChat] 直连 DeepSeek 失败:', error);
            return false;
          }
        };

        const handleStreamError = async (error: Error) => {
          if (
            !hasStreamContentRef.current &&
            (await attemptDirectLlmFallback())
          ) {
            return;
          }
          showStreamError(error);
        };

        const streamCallbacks = {
          onOpen: () => {
            setIsLoading(false);
            setIsStreaming(true);
            startIdleWatchdog();
          },

          onMessage: (event: SSEEvent) => {
            if (
              event.type === 'error' ||
              event.type === 'done' ||
              (event.content != null && event.content !== '') ||
              event.type === 'thinking' ||
              event.type === 'ontology' ||
              event.type === 'http' ||
              event.type === 'workflow' ||
              event.type === 'mcp' ||
              event.type === 'knowledge'
            ) {
              hasStreamContentRef.current = true;
            }

            startIdleWatchdog();
            processingChat(event);
          },

          onActivity: () => {
            startIdleWatchdog();
          },

          onClose: () => {
            // 等待队列处理完成后由 onFinished 收尾
          },

          onFinished: async () => {
            if (
              !hasStreamContentRef.current &&
              (await attemptDirectLlmFallback())
            ) {
              return;
            }
            finalizeAssistantMessage();
          },

          onError: handleStreamError
        };

        startIdleWatchdog();

        try {
          if (!useAgentSse && shouldUseDevChatStream(streamAppId)) {
            console.log(
              '[useXChat] 使用本地模拟对话流（不会产生 Network 请求）'
            );
            devAbortRef.current?.abort();
            devAbortRef.current = new AbortController();

            await devRunChatStream({
              appId: streamAppId,
              query: text,
              conversationID: conversationIdRef.current || undefined,
              signal: devAbortRef.current.signal,
              callbacks: {
                onOpen: streamCallbacks.onOpen,
                onMessage: (event) =>
                  streamCallbacks.onMessage(event as SSEEvent),
                onClose: () => {
                  streamCallbacks.onFinished?.();
                  releaseSending();
                },
                onError: (error) => {
                  handleStreamError(error);
                  releaseSending();
                }
              }
            });
            return;
          }

          if (!useAgentSse && shouldUseLocalLlmStream(streamAppId)) {
            console.log('[useXChat] 使用本地 LLM 直连对话流');
            devAbortRef.current?.abort();
            devAbortRef.current = new AbortController();

            await devRunLlmChatStream({
              query: text,
              conversationID: conversationIdRef.current || undefined,
              signal: devAbortRef.current.signal,
              callbacks: {
                onOpen: streamCallbacks.onOpen,
                onMessage: (event) =>
                  streamCallbacks.onMessage(event as SSEEvent),
                onClose: () => {
                  streamCallbacks.onFinished?.();
                  releaseSending();
                },
                onError: (error) => {
                  void handleStreamError(error);
                  releaseSending();
                }
              }
            });
            return;
          }

          console.log('[useXChat] 即将发起 SSE 连接');
          await connectStream(
            {
              url: requestUrl,
              method: 'POST',
              headers: streamHeaders,
              body: requestBody
            },
            {
              ...streamCallbacks,
              onFinished: async () => {
                await streamCallbacks.onFinished();
                releaseSending();
              },
              onError: async (error) => {
                await handleStreamError(error);
                releaseSending();
              },
              onActivity: streamCallbacks.onActivity
            }
          );
        } catch (error: any) {
          releaseSending();
          if (error.name === 'AbortError') {
            if (!userStoppedRef.current) {
              void handleStreamError(new Error('连接被中断，请重试'));
            }
            return;
          }

          console.error('Send message error:', error);
          void handleStreamError(
            error instanceof Error ? error : new Error('发送失败')
          );
        }
      } catch (error: unknown) {
        console.error('[useXChat] sendMessage 未捕获异常:', error);
        resetSendingState();
        const message =
          error instanceof Error
            ? error.message
            : '发送消息失败，请打开 Console 查看详情';
        failAssistantMessage(message);
        showMessage?.error(message);
        onError?.(error instanceof Error ? error : new Error(message));
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
      finalizeAssistantMessage,
      resetStreamIdleTimer,
      clearStreamIdleTimer,
      connectStream,
      apiConfig,
      showMessage
    ]
  );

  // ==================== 停止生成 ====================
  const stopGeneration = useCallback(() => {
    userStoppedRef.current = true;
    clearStreamIdleTimer();
    devAbortRef.current?.abort();
    devAbortRef.current = null;
    disconnectStream();
    sendingRef.current = false;
    setIsStreaming(false);
    setIsLoading(false);

    // 将最后一条消息标记为中止状态，并完成所有未完成的思维链步骤
    setMessages((draft) => {
      const lastIndex = draft.length - 1;
      if (lastIndex >= 0 && draft[lastIndex].type === 'assistant') {
        draft[lastIndex].status = 'abort';

        // 将所有未完成的思考步骤标记为完成
        const steps = draft[lastIndex].thinkingSteps;
        if (steps && steps.length > 0) {
          steps.forEach((step) => {
            if (!step.done) {
              step.done = true;
              // 可以选择标记为 abort 状态，或者保持原状态
              // step.status = 'abort';
            }
          });
        }
      }
    });
  }, [
    clearStreamIdleTimer,
    disconnectStream,
    setIsStreaming,
    setIsLoading,
    setMessages
  ]);

  // ==================== 加载历史消息 ====================
  const loadHistoryMessages = useCallback(
    async (conversationID: string) => {
      console.log('[useXChat] loadHistoryMessages 被调用:', {
        conversationID,
        appId,
        conversationIdRefCurrent: conversationIdRef.current,
        hasGetHistoryMessages: !!getHistoryMessages
      });

      if (!conversationID || !appId || !getHistoryMessages) {
        console.log('[useXChat] loadHistoryMessages 条件不满足，跳过');
        return;
      }

      // 更新 conversationIdRef，确保后续操作使用正确的会话 ID
      console.log(
        '[useXChat] 更新 conversationIdRef.current 为:',
        conversationID
      );
      conversationIdRef.current = conversationID;

      try {
        setIsLoadingHistory(true);
        console.log(
          '[useXChat] 开始调用 getHistoryMessages API，conversationID:',
          conversationID
        );
        const response = await getHistoryMessages({
          appId: String(appId),
          conversationId: conversationID
        });

        console.log('[useXChat] 历史消息响应:', response);

        const result = extractConversationResult(response);

        if (result.length > 0) {
          const historyMessages: ChatMessage[] = [];
          const sortedMessages = [...result].reverse();

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
          console.log('[useXChat] 响应中没有历史消息数据');
          setMessages([]);
        }
      } catch (error: unknown) {
        console.error('[useXChat] 加载历史消息失败:', error);
        showMessage?.error(getApiErrorMessage(error, '加载历史消息失败'));
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
      console.log('[useXChat] conversationId 为 null，清空 ref');
      conversationIdRef.current = '';
      return;
    }

    if (externalConversationId === undefined) {
      console.log('[useXChat] conversationId 为 undefined，清空 ref');
      conversationIdRef.current = '';
      return;
    }

    // 只有当 conversationId 真正变化时才更新 ref
    if (externalConversationId !== conversationIdRef.current) {
      console.log(
        '[useXChat] conversationId 变化，更新 ref:',
        externalConversationId
      );
      conversationIdRef.current = externalConversationId;
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

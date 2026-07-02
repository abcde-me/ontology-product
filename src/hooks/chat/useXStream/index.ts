/**
 * useXStream - 通用 SSE 流式处理 Hook
 * 专注于 SSE 连接管理、事件队列处理和流式数据解析
 * 参考 x-main 项目的 XStream 设计，提供完整的流式处理能力
 */

import { useRef, useCallback, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { parseStreamEventData } from '../utils';
import {
  StreamConfig,
  StreamCallbacks,
  UseStreamReturn,
  StreamEvent,
  StreamState
} from './types';
import { PROCESSING_STATE, DEFAULT_CONFIG, DEFAULT_HEADERS } from './constants';

export const useXStream = (): UseStreamReturn => {
  // ==================== State ====================
  const [state, setState] = useState<StreamState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    queueSize: 0
  });

  // ==================== Refs ====================
  const abortControllerRef = useRef<AbortController | null>(null);
  const eventQueueRef = useRef<StreamEvent[]>([]);
  const processingStateRef = useRef<string>(PROCESSING_STATE.IDLE);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionClosedRef = useRef(false);
  const configRef = useRef<StreamConfig | null>(null);
  const callbacksRef = useRef<StreamCallbacks | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const isConnectedRef = useRef(false);
  const userAbortRef = useRef(false);

  // ==================== 清空队列 ====================
  const clearQueue = useCallback(() => {
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    eventQueueRef.current = [];
    processingStateRef.current = PROCESSING_STATE.IDLE;
    connectionClosedRef.current = false;

    setState((prev) => ({ ...prev, queueSize: 0 }));
  }, []);

  // ==================== 处理事件队列 ====================
  const processQueue = useCallback(() => {
    if (eventQueueRef.current.length === 0) {
      if (connectionClosedRef.current) {
        clearQueue();
        callbacksRef.current?.onFinished?.();
      } else {
        processingStateRef.current = PROCESSING_STATE.IDLE;
      }
      return;
    }

    const config = configRef.current;
    if (!config) return;

    // 根据连接状态选择处理频率
    const delay = connectionClosedRef.current
      ? config.finishInterval || DEFAULT_CONFIG.finishInterval
      : config.processingInterval || DEFAULT_CONFIG.processingInterval;

    processingStateRef.current = PROCESSING_STATE.PROCESSING;
    const event = eventQueueRef.current.shift();

    if (event) {
      try {
        callbacksRef.current?.onMessage?.(event);
      } catch (error) {
        console.error('Process event error:', error);
        callbacksRef.current?.onError?.(error as Error);
      }
    }

    // 更新队列大小
    setState((prev) => ({ ...prev, queueSize: eventQueueRef.current.length }));

    // 设置下一个处理定时器
    processingTimerRef.current = setTimeout(processQueue, delay);
  }, [clearQueue]);

  // ==================== 断开连接 ====================
  const disconnect = useCallback(() => {
    userAbortRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    // 中止连接
    abortControllerRef.current?.abort();

    // 清空队列
    clearQueue();

    // 重置状态
    setState({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      reconnectAttempts: 0,
      queueSize: 0
    });
    isConnectingRef.current = false;
    isConnectedRef.current = false;

    console.log('[useXStream] Disconnected');
  }, [clearQueue]);

  // ==================== 连接函数 ====================
  const connect = useCallback(
    async (config: StreamConfig, callbacks: StreamCallbacks) => {
      configRef.current = { ...DEFAULT_CONFIG, ...config };
      callbacksRef.current = callbacks;
      userAbortRef.current = false;

      if (isConnectingRef.current || isConnectedRef.current) {
        abortControllerRef.current?.abort();
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        if (openTimeoutRef.current) {
          clearTimeout(openTimeoutRef.current);
          openTimeoutRef.current = null;
        }
        eventQueueRef.current = [];
        processingStateRef.current = PROCESSING_STATE.IDLE;
        connectionClosedRef.current = false;
        isConnectingRef.current = false;
        isConnectedRef.current = false;
      }

      isConnectingRef.current = true;
      isConnectedRef.current = false;
      setState((prev) => ({ ...prev, isConnecting: true }));

      abortControllerRef.current = new AbortController();
      const activeSignal = abortControllerRef.current.signal;

      const headers = {
        ...DEFAULT_HEADERS,
        ...config.headers
      };

      const body = config.body ? JSON.stringify(config.body) : undefined;
      const requestUrl = config.url.startsWith('http')
        ? config.url
        : `${window.location.origin}${config.url}`;

      console.log(
        '[useXStream] Connecting to:',
        requestUrl,
        'method:',
        config.method || 'POST'
      );

      const notifyError = (error: Error) => {
        if (userAbortRef.current) {
          return;
        }
        callbacks.onError?.(error);
      };

      openTimeoutRef.current = setTimeout(() => {
        console.error('[useXStream] Connection open timeout');
        abortControllerRef.current?.abort();
        notifyError(new Error('连接模型服务超时，请稍后重试'));
      }, 30000);

      try {
        await fetchEventSource(requestUrl, {
          method: config.method || DEFAULT_CONFIG.method,
          headers,
          body,
          signal: activeSignal,
          credentials: 'include',
          openWhenHidden: true,

          fetch: (input, init) => {
            console.log('[useXStream] fetch 已发起:', input);
            return window.fetch(input, init);
          },

          onopen: async (response) => {
            const contentType = response.headers?.get('content-type') || '';

            if (
              response.ok &&
              (contentType.includes('text/event-stream') ||
                contentType.includes('application/stream+json') ||
                contentType.includes('text/plain') ||
                contentType.includes('application/octet-stream'))
            ) {
              if (openTimeoutRef.current) {
                clearTimeout(openTimeoutRef.current);
                openTimeoutRef.current = null;
              }

              isConnectingRef.current = false;
              isConnectedRef.current = true;
              setState((prev) => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                reconnectAttempts: 0
              }));

              callbacks.onOpen?.(response);
              console.log('[useXStream] Connected successfully');
              return;
            }

            if (response.ok && contentType.includes('application/json')) {
              try {
                const data = await response.clone().json();
                const errMsg =
                  data?.message ||
                  data?.msg ||
                  data?.error_detail ||
                  data?.error;
                const code = data?.code != null ? String(data.code) : '';
                if (
                  errMsg ||
                  (code &&
                    code !== 'Success' &&
                    code !== 'success' &&
                    code !== '0' &&
                    code !== '200' &&
                    code !== '')
                ) {
                  throw new Error(
                    errMsg ||
                      `CreateMessage 请求失败 (${code || response.status})`
                  );
                }
              } catch (parseError) {
                if (
                  parseError instanceof Error &&
                  parseError.message !== 'Connection failed'
                ) {
                  throw parseError;
                }
              }
              throw new Error(
                '服务端返回 JSON 而非 SSE 流，请检查 Agent 是否已发布并配置大模型'
              );
            }

            // 处理错误响应
            let errorMsg = 'Connection failed';
            const responseContentType =
              response.headers.get('content-type') || '';

            if (responseContentType.includes('application/json')) {
              try {
                const data = await response.json();
                errorMsg =
                  data?.msg || data?.message || data?.error || errorMsg;
              } catch (e) {
                // 忽略解析错误
              }
            } else {
              try {
                const text = await response.text();
                if (text) {
                  try {
                    const data = JSON.parse(text);
                    errorMsg =
                      data?.msg || data?.message || data?.error || errorMsg;
                  } catch {
                    errorMsg = text.slice(0, 200);
                  }
                }
              } catch (e) {
                // 忽略解析错误
              }
            }

            if (response.status) {
              errorMsg = `${errorMsg} (${response.status})`;
            }

            throw new Error(errorMsg);
          },

          onmessage: (msg) => {
            callbacks.onActivity?.();

            try {
              const event = parseStreamEventData(msg.data, msg.event);
              if (event) {
                eventQueueRef.current.push(event);
                setState((prev) => ({
                  ...prev,
                  queueSize: eventQueueRef.current.length
                }));

                if (processingStateRef.current === PROCESSING_STATE.IDLE) {
                  processQueue();
                }
              }
            } catch (error) {
              console.error('[useXStream] Parse message error:', error);
            }
          },

          onclose: () => {
            console.log('[useXStream] Connection closed');
            connectionClosedRef.current = true;

            isConnectingRef.current = false;
            isConnectedRef.current = false;
            setState((prev) => ({
              ...prev,
              isConnected: false,
              isConnecting: false
            }));

            // 处理剩余队列
            if (eventQueueRef.current.length > 0) {
              if (!processingTimerRef.current) {
                processQueue();
              }
            } else {
              processingStateRef.current = PROCESSING_STATE.IDLE;
              callbacks.onFinished?.();
            }

            callbacks.onClose?.();
            abortControllerRef.current?.abort();
          },

          onerror: (error: any) => {
            console.error('[useXStream] SSE Error:', error);
            connectionClosedRef.current = true;

            isConnectingRef.current = false;
            isConnectedRef.current = false;
            setState((prev) => ({
              ...prev,
              isConnected: false,
              isConnecting: false
            }));

            if (openTimeoutRef.current) {
              clearTimeout(openTimeoutRef.current);
              openTimeoutRef.current = null;
            }

            notifyError(
              error instanceof Error ? error : new Error('SSE 连接失败')
            );
            abortControllerRef.current?.abort();
          }
        });
      } catch (error: any) {
        if (openTimeoutRef.current) {
          clearTimeout(openTimeoutRef.current);
          openTimeoutRef.current = null;
        }

        isConnectingRef.current = false;
        isConnectedRef.current = false;
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          isReconnecting: false
        }));

        if (error?.name === 'AbortError') {
          notifyError(new Error('连接被中断，请重试'));
          return;
        }

        console.error('[useXStream] Connect error:', error);
        notifyError(error instanceof Error ? error : new Error('连接失败'));
      }
    },
    [disconnect, processQueue]
  );

  // ==================== 重新连接 ====================
  const reconnect = useCallback(async () => {
    const config = configRef.current;
    const callbacks = callbacksRef.current;

    if (!config || !callbacks) {
      console.warn('[useXStream] No config or callbacks for reconnect');
      return;
    }

    console.log('[useXStream] Manual reconnect');
    setState((prev) => ({ ...prev, reconnectAttempts: 0 }));
    await connect(config, callbacks);
  }, [connect]);

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    isReconnecting: state.isReconnecting,
    reconnectAttempts: state.reconnectAttempts,
    queueSize: state.queueSize,
    connect,
    disconnect,
    reconnect,
    clearQueue
  };
};

export * from './types';
export * from './constants';

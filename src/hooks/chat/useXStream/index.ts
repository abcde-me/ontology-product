/**
 * useXStream - 通用 SSE 流式处理 Hook
 * 专注于 SSE 连接管理、事件队列处理和流式数据解析
 * 参考 x-main 项目的 XStream 设计，提供完整的流式处理能力
 */

import { useRef, useCallback, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { parseJson } from '../utils';
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
      // 队列处理完毕
      if (connectionClosedRef.current) {
        clearQueue();
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
    // 清理定时器
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
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

    console.log('[useXStream] Disconnected');
  }, [clearQueue]);

  // ==================== 连接函数 ====================
  const connect = useCallback(
    async (config: StreamConfig, callbacks: StreamCallbacks) => {
      // 保存配置和回调
      configRef.current = { ...DEFAULT_CONFIG, ...config };
      callbacksRef.current = callbacks;

      // 如果已经在连接，先断开
      if (state.isConnecting || state.isConnected) {
        disconnect();
      }

      setState((prev) => ({ ...prev, isConnecting: true }));

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();

      // 构建请求头
      const headers = {
        ...DEFAULT_HEADERS,
        ...config.headers
      };

      // 构建请求体
      const body = config.body ? JSON.stringify(config.body) : undefined;

      console.log('[useXStream] Connecting to:', config.url);

      try {
        await fetchEventSource(config.url, {
          method: config.method || DEFAULT_CONFIG.method,
          headers,
          body,
          signal: abortControllerRef.current.signal,
          credentials: 'include',

          onopen: async (response) => {
            const contentType = response.headers?.get('content-type') || '';

            if (response.ok && contentType.includes('text/event-stream')) {
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

            // 处理错误响应
            let errorMsg = 'Connection failed';
            if (response.headers.get('content-type') === 'application/json') {
              try {
                const data = await response.json();
                errorMsg = data?.msg || data?.message || errorMsg;
              } catch (e) {
                // 忽略解析错误
              }
            }

            throw new Error(errorMsg);
          },

          onmessage: (msg) => {
            try {
              const event = parseJson<StreamEvent>(msg.data);
              if (event) {
                // 添加到队列
                eventQueueRef.current.push(event);
                setState((prev) => ({
                  ...prev,
                  queueSize: eventQueueRef.current.length
                }));

                // 如果队列处理器空闲，启动处理
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
              clearQueue();
            }

            callbacks.onClose?.();
            abortControllerRef.current?.abort();
          },

          onerror: (error: any) => {
            console.error('[useXStream] SSE Error:', error);
            connectionClosedRef.current = true;

            setState((prev) => ({
              ...prev,
              isConnected: false,
              isConnecting: false
            }));

            clearQueue();
            callbacks.onError?.(error);
            abortControllerRef.current?.abort();

            // 如果启用自动重连，尝试重连
            const currentConfig = configRef.current;
            if (
              currentConfig?.autoReconnect &&
              state.reconnectAttempts <
                (currentConfig.maxReconnectAttempts ||
                  DEFAULT_CONFIG.maxReconnectAttempts)
            ) {
              const nextAttempt = state.reconnectAttempts + 1;
              setState((prev) => ({
                ...prev,
                isReconnecting: true,
                reconnectAttempts: nextAttempt
              }));

              console.log(
                `[useXStream] Auto reconnecting... (${nextAttempt}/${currentConfig.maxReconnectAttempts})`
              );
              callbacks.onReconnect?.(nextAttempt);

              reconnectTimerRef.current = setTimeout(() => {
                connect(currentConfig, callbacks);
              }, currentConfig.reconnectInterval || DEFAULT_CONFIG.reconnectInterval);
            }

            throw error;
          }
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('[useXStream] Connect error:', error);
          setState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            isReconnecting: false
          }));
          callbacks.onError?.(error);
        }
      }
    },
    [
      state.isConnecting,
      state.isConnected,
      state.reconnectAttempts,
      disconnect,
      processQueue,
      clearQueue
    ]
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

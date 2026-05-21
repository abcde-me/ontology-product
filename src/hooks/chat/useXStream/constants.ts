/**
 * useXStream 常量定义
 */

export const CONNECTION_STATE = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
} as const;

export const PROCESSING_STATE = {
  IDLE: 'idle',
  PROCESSING: 'processing'
} as const;

export const DEFAULT_CONFIG = {
  method: 'POST',
  processingInterval: 16, // ~60fps
  finishInterval: 8, // 更快处理剩余队列
  autoReconnect: false,
  maxReconnectAttempts: 3,
  reconnectInterval: 3000
} as const;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'text/event-stream'
} as const;

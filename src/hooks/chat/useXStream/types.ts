/**
 * useXStream 类型定义
 */

export interface StreamEvent {
  type?: string;
  content?: any;
  chunk_id?: string;
  done?: boolean;
  running_time?: number;
  conversation_id?: string;
  message_id?: string;
  error_detail?: string;
  [key: string]: any;
}

export interface StreamConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  processingInterval?: number;
  finishInterval?: number;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

export interface StreamCallbacks {
  onOpen?: (response: Response) => void;
  onMessage?: (event: StreamEvent) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onReconnect?: (attempt: number) => void;
}

export interface StreamState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  queueSize: number;
}

export interface UseStreamReturn {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  queueSize: number;
  connect: (config: StreamConfig, callbacks: StreamCallbacks) => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  clearQueue: () => void;
}

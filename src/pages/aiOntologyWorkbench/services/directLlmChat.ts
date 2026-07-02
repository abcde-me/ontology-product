/**
 * AI 本体工作台 - 前端直连 DeepSeek 流式对话
 * 开发环境经 devServer 代理 /deepseek-api 转发，避免 CORS
 */
import { parseStreamEventData } from '@/hooks/chat/utils';
import { isWujie } from '@/utils/env';
import {
  estimateTokensFromText,
  extractUsageFromChatResponse,
  recordModelTokenUsage
} from '@/services/llmTokenUsageStorage';
import { AI_WORKBENCH_LLM_CONFIG } from '../config/llm';

export const DIRECT_LLM_APP_ID = 'direct-llm-workbench';

export interface DirectLlmStreamCallbacks {
  onOpen?: () => void;
  onMessage: (event: Record<string, unknown>) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onRequestStart?: () => void;
}

export const DIRECT_LLM_FETCH_TIMEOUT_MS = 120000;

export interface DirectLlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** 开发环境 wujie 嵌入时，页面 origin 可能不是 CRA devServer，需显式指向代理 */
const DEV_PROXY_FALLBACK = 'http://localhost:9070/deepseek-api';

/** 解析开发环境 DeepSeek 代理 base（支持 IP/域名访问，如 10.56.53.71:9070） */
const resolveDevProxyBase = (): string => {
  if (typeof window === 'undefined') {
    return DEV_PROXY_FALLBACK;
  }

  const configured =
    process.env.REACT_APP_AI_WORKBENCH_LLM_DEV_PROXY?.trim() || '';

  if (configured) {
    try {
      const url = new URL(configured);
      const { protocol, hostname, port } = window.location;
      if (
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1'
      ) {
        return `${protocol}//${hostname}${port ? `:${port}` : ''}${url.pathname.replace(/\/$/, '')}`;
      }
      return configured.replace(/\/$/, '');
    } catch {
      // ignore invalid env
    }
  }

  return `${window.location.origin}/deepseek-api`;
};

/** 解析 DeepSeek 请求 URL（开发环境强制走本地代理） */
export const resolveDirectLlmRequestUrl = (): string => {
  const configured = AI_WORKBENCH_LLM_CONFIG.baseUrl?.trim() || '';
  const useDevProxy =
    process.env.NODE_ENV === 'development' &&
    (!configured ||
      configured.startsWith('/') ||
      !/^https?:\/\//i.test(configured));

  if (useDevProxy) {
    if (isWujie) {
      return `${resolveDevProxyBase()}/v1/chat/completions`;
    }
    return `${window.location.origin}/deepseek-api/v1/chat/completions`;
  }

  const base = configured.replace(/\/$/, '') || 'https://api.deepseek.com';
  return `${base}/v1/chat/completions`;
};

const mergeAbortSignals = (
  userSignal: AbortSignal | undefined,
  timeoutMs: number
) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => {
    controller.abort(
      new DOMException('DeepSeek 响应超时，请稍后重试', 'TimeoutError')
    );
  }, timeoutMs);

  const abort = () => {
    window.clearTimeout(timer);
    if (!controller.signal.aborted) {
      controller.abort(
        userSignal?.reason instanceof Error
          ? userSignal.reason
          : new DOMException('Aborted', 'AbortError')
      );
    }
  };

  userSignal?.addEventListener('abort', abort, { once: true });

  if (userSignal?.aborted) {
    abort();
  }

  return {
    signal: controller.signal,
    dispose: () => {
      window.clearTimeout(timer);
      userSignal?.removeEventListener('abort', abort);
    }
  };
};

export const runDirectLlmChatStream = async (options: {
  messages: DirectLlmMessage[];
  conversationID?: string;
  signal?: AbortSignal;
  thinking?: { type: 'enabled' | 'disabled' };
  callbacks: DirectLlmStreamCallbacks;
}) => {
  const {
    messages,
    conversationID,
    signal,
    thinking = { type: 'disabled' },
    callbacks
  } = options;
  const { onOpen, onMessage, onClose, onError, onRequestStart } = callbacks;
  const { apiKey, model } = AI_WORKBENCH_LLM_CONFIG;

  if (!apiKey?.trim()) {
    onError?.(
      new Error('未配置 DeepSeek API Key（REACT_APP_AI_WORKBENCH_LLM_API_KEY）')
    );
    return;
  }

  if (signal?.aborted) {
    onClose?.();
    return;
  }

  const url = resolveDirectLlmRequestUrl();
  const { signal: mergedSignal, dispose } = mergeAbortSignals(
    signal,
    DIRECT_LLM_FETCH_TIMEOUT_MS
  );

  console.log('[DirectLlm] 发起请求:', url, {
    model,
    messageCount: messages.length
  });
  onRequestStart?.();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        thinking
      }),
      signal: mergedSignal
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `DeepSeek 请求失败 (${response.status})`;
      try {
        const errJson = JSON.parse(errText) as {
          error?: { message?: string };
          message?: string;
        };
        errMsg = errJson.error?.message || errJson.message || errMsg;
      } catch {
        if (errText) {
          errMsg = errText.slice(0, 200);
        }
      }
      if (response.status === 404) {
        errMsg = 'DeepSeek 代理未就绪，请重启开发服务（yarn dev）后重试';
      }
      onError?.(new Error(errMsg));
      return;
    }

    onOpen?.();

    const reader = response.body?.getReader();
    if (!reader) {
      onError?.(new Error('无法读取 DeepSeek 响应流'));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let usageRecorded = false;
    let completionText = '';

    const recordUsageIfPresent = (rawPayload: Record<string, unknown>) => {
      const usage = extractUsageFromChatResponse(rawPayload);
      if (!usage) {
        return false;
      }

      recordModelTokenUsage({
        provider: AI_WORKBENCH_LLM_CONFIG.provider,
        model,
        usage
      });
      usageRecorded = true;
      return true;
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) {
          continue;
        }

        const data = trimmed.startsWith('data:')
          ? trimmed.slice(5).trim()
          : trimmed;

        if (!data || data === '[DONE]') {
          continue;
        }

        if (!data || data === '[DONE]') {
          continue;
        }

        const rawPayload = (() => {
          try {
            return JSON.parse(data) as Record<string, unknown>;
          } catch {
            return null;
          }
        })();

        if (rawPayload) {
          recordUsageIfPresent(rawPayload);

          const delta = (
            rawPayload.choices as
              | Array<{ delta?: { content?: string } }>
              | undefined
          )?.[0]?.delta?.content;

          if (delta) {
            completionText += delta;
          }
        }

        const event = parseStreamEventData(data);
        if (event) {
          onMessage(event);
        }
      }
    }

    if (!usageRecorded) {
      const promptTokens = messages.reduce(
        (sum, item) => sum + estimateTokensFromText(item.content),
        0
      );
      const completionTokens = estimateTokensFromText(completionText);

      recordModelTokenUsage({
        provider: AI_WORKBENCH_LLM_CONFIG.provider,
        model,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        }
      });
    }

    const conversationId = conversationID || `direct-llm-conv-${Date.now()}`;
    onMessage({
      type: 'done',
      done: true,
      conversation_id: conversationId,
      message_id: `direct-llm-msg-${Date.now()}`
    });
    onClose?.();
  } catch (error) {
    const domErr = error as DOMException;
    if (domErr?.name === 'TimeoutError') {
      onError?.(new Error('DeepSeek 响应超时，请稍后重试'));
      return;
    }
    if (domErr?.name === 'AbortError') {
      const msg = String(domErr.message || '');
      if (msg.includes('超时')) {
        onError?.(new Error('DeepSeek 响应超时，请稍后重试'));
      } else {
        onClose?.();
      }
      return;
    }

    const message =
      error instanceof Error ? error.message : 'DeepSeek 直连失败';
    if (message === 'Failed to fetch') {
      onError?.(
        new Error(
          '无法连接 DeepSeek 代理，请确认已执行 yarn dev 并重启开发服务'
        )
      );
      return;
    }

    onError?.(error instanceof Error ? error : new Error(message));
  } finally {
    dispose();
  }
};

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.info('[DirectLlm] 模块已加载，runDirectLlmChatStream 可用');
}

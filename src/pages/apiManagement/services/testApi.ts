import type { ApiTestRequest, ApiTestResult } from '../types';

const parseHeaders = (raw?: string): Record<string, string> => {
  if (!raw?.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {}
      );
    }
  } catch {
    // ignore invalid JSON and fall back to line parsing
  }

  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex <= 0) {
        return acc;
      }
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      if (key) {
        acc[key] = value;
      }
      return acc;
    }, {});
};

const formatResponseBody = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }

  return text;
};

export const executeApiTest = async (
  request: ApiTestRequest,
  headersText?: string
): Promise<ApiTestResult> => {
  const startedAt = Date.now();
  const headers = {
    Accept: 'application/json',
    ...parseHeaders(headersText),
    ...(request.headers || {})
  };

  const hasJsonBody =
    request.body &&
    request.body.trim() &&
    !request.body.startsWith('multipart/form-data');

  if (hasJsonBody && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers,
      body:
        request.method === 'GET' || request.method === 'DELETE'
          ? undefined
          : hasJsonBody
            ? request.body
            : undefined
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      durationMs: Date.now() - startedAt,
      responseHeaders,
      responseBody: await formatResponseBody(response)
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      durationMs: Date.now() - startedAt,
      responseHeaders: {},
      responseBody: '',
      errorMessage: error?.message || '请求失败'
    };
  }
};

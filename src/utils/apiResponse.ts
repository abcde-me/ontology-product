/** 兼容不同后端返回格式的成功判断 */
export const isApiResponseSuccess = (response: any): boolean => {
  if (!response) {
    return false;
  }

  if (response.statusCode === 0) {
    return true;
  }

  const successValues = [0, 200, 'Success', 'SUCCESS', 'success'];
  return (
    successValues.includes(response.code) ||
    successValues.includes(response.status) ||
    successValues.includes(response.message)
  );
};

/** 本体管理接口成功判断（status=200 且 code 为空字符串） */
export const isOntologyApiSuccess = (response: any): boolean => {
  if (!response) {
    return false;
  }

  if (response.status === 200 && response.code === '') {
    return true;
  }

  return isApiResponseSuccess(response);
};

/** 从 GetProjOrg 响应中提取组织/项目树 */
export const extractProjOrgList = (response: any): any[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data?.projectList && Array.isArray(response.data.projectList)) {
    return response.data.projectList;
  }

  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  return extractListData(response);
};

/** 从接口 reject 值中提取可读错误信息（兼容 string / Error） */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

/** 判断是否为资源不存在类响应 */
export const isResourceNotFoundResponse = (response: unknown): boolean => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const record = response as Record<string, unknown>;
  const message = String(record.message || '');

  return (
    record.code === 'ResourceNotFound' ||
    record.code === 'AIMDP.InternalError' ||
    /资源不存在/i.test(message)
  );
};

export const isResourceNotFoundError = (error: unknown): boolean =>
  /资源不存在|ResourceNotFound/i.test(getApiErrorMessage(error, ''));

const getApiErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const record = error as {
    status?: unknown;
    response?: { status?: unknown };
  };

  const status = Number(record.response?.status ?? record.status);
  return Number.isFinite(status) ? status : undefined;
};

/** 网关超时、服务不可用等可回退本地缓存的瞬时错误 */
export const isTransientApiError = (error: unknown): boolean => {
  const status = getApiErrorStatus(error);
  if (status === 502 || status === 503 || status === 504) {
    return true;
  }

  const message = getApiErrorMessage(error, '');
  return /502|503|504|Gateway Timeout|timeout|ETIMEDOUT|ECONNABORTED|Network Error/i.test(
    message
  );
};

export const isTransientApiResponse = (response: unknown): boolean => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const record = response as Record<string, unknown>;
  const status = Number(record.status);
  if (status === 502 || status === 503 || status === 504) {
    return true;
  }

  const message = String(record.message || '');
  return /502|503|504|Gateway Timeout|timeout/i.test(message);
};

/** 从会话/消息类接口响应中提取 result 列表 */
export const extractConversationResult = <T = any>(response: any): T[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response.data?.result)) {
    return response.data.result;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.result)) {
    return response.result;
  }

  return extractListData<T>(response);
};

/** 从通用接口响应中提取列表 */
export const extractListData = <T = any>(response: any): T[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (response.result && Array.isArray(response.result)) {
    return response.result;
  }

  return [];
};

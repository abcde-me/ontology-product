/**
 * AI 本体工作台 - 对话 API
 */
import UAPI from '@/api';
import { ModaForgeResourceEndpoints } from '../endpoints';
import {
  buildCreateOntologyAgentLlmPayload,
  isAIWorkbenchLlmConfigured
} from '@/pages/aiOntologyWorkbench/config/llm';
import { DIRECT_LLM_APP_ID } from '@/pages/aiOntologyWorkbench/services/directLlmChat';
import {
  extractConversationResult,
  isOntologyApiSuccess
} from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import {
  devCreateLocalLlmAgent,
  devCreateOntologyAgent,
  devClearOntologyAgentId,
  devGetOntologyAgentId,
  devSetOntologyAgentId,
  isLocalLlmAppId,
  isPermissionRelatedError
} from '@/utils/devOntologyStore';
import {
  devDeleteConversation,
  devGetConversationList,
  devGetConversationMessages,
  devRenameConversation,
  isDevAppId
} from '@/utils/devChatStore';

const {
  GetAIChatHistoryApi,
  RenameAIChatApi,
  DeleteAIChatApi,
  GetCurrentAIChatApi
} = ModaForgeResourceEndpoints;

const emptyConversationListResponse = () => ({
  status: 200,
  code: 'Success',
  message: '',
  requestId: '',
  data: {
    result: [],
    totalCount: 0
  }
});

const emptyConversationMessagesResponse = () => ({
  status: 200,
  code: 'Success',
  message: '',
  requestId: '',
  data: {
    result: []
  }
});

const normalizeConversationListResponse = (response: any) => {
  const result = extractConversationResult(response);

  return {
    ...(response || emptyConversationListResponse()),
    data: {
      ...(response?.data || {}),
      result,
      totalCount: response?.data?.totalCount ?? result.length
    }
  };
};

const normalizeConversationMessagesResponse = (response: any) => {
  const result = extractConversationResult(response);

  return {
    ...(response || emptyConversationMessagesResponse()),
    data: {
      ...(response?.data || {}),
      result
    }
  };
};

const CREATE_AGENT_DEV_TIMEOUT_MS = 20000;

const withDevTimeout = <T>(promise: Promise<T>, label: string): Promise<T> => {
  if (!isDevBypassEnabled()) {
    return promise;
  }

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`${label} timeout`));
      }, CREATE_AGENT_DEV_TIMEOUT_MS);
    })
  ]);
};

/**
 * 创建本体 Agent
 */
export const createOntologyAgent = async (params: {
  ontologyModelId: number;
  /** Agent 按钮场景：不走 local-llm / dev-app 兜底 */
  skipDevFallback?: boolean;
}) => {
  const { ontologyModelId, skipDevFallback = false } = params;
  const llmConfigured = isAIWorkbenchLlmConfigured();

  if (isDevBypassEnabled()) {
    const cachedAppId = devGetOntologyAgentId(ontologyModelId);
    if (cachedAppId) {
      if (isLocalLlmAppId(cachedAppId) && !skipDevFallback) {
        return {
          status: 200,
          code: '',
          message: '',
          requestId: '',
          data: { appID: cachedAppId }
        };
      }
      // 仅复用真实后端 appID，dev-app-* 必须重新创建
      if (!isDevAppId(cachedAppId) && !isLocalLlmAppId(cachedAppId)) {
        return {
          status: 200,
          code: '',
          message: '',
          requestId: '',
          data: { appID: cachedAppId }
        };
      }
    }
  }

  if (isDevAppId(devGetOntologyAgentId(ontologyModelId))) {
    devClearOntologyAgentId(ontologyModelId);
  }

  try {
    const llmPayload = buildCreateOntologyAgentLlmPayload();
    console.log('[createOntologyAgent] 创建 Agent，LLM 配置:', {
      ontologyModelId,
      apiName: llmPayload.apiName,
      model: llmPayload.model,
      baseUrl: llmPayload.baseUrl,
      hasApiKey: !!llmPayload.apiKey
    });

    const response = await withDevTimeout(
      UAPI.RES.CreateOntologyAgentApi({})
        .post({
          ontologyModelID: ontologyModelId,
          ...llmPayload
        })
        .inRegion()
        .do(),
      'CreateOntologyAgent'
    );

    if (isOntologyApiSuccess(response) && response.data?.appID) {
      if (isDevBypassEnabled()) {
        devSetOntologyAgentId(ontologyModelId, response.data.appID);
      }
      return response;
    }

    if (isDevBypassEnabled()) {
      if (llmConfigured && !skipDevFallback) {
        console.warn('[dev] CreateOntologyAgent 失败，使用本地 LLM 直连 Agent');
        return devCreateLocalLlmAgent(ontologyModelId);
      }
      if (
        !skipDevFallback &&
        (isPermissionRelatedError(response?.message) || !llmConfigured)
      ) {
        console.warn('[dev] CreateOntologyAgent 失败，使用本地 Agent 缓存');
        return devCreateOntologyAgent(ontologyModelId);
      }
    }

    return response;
  } catch (error) {
    if (isDevBypassEnabled() && !skipDevFallback) {
      if (llmConfigured) {
        console.warn('[dev] CreateOntologyAgent 异常，使用本地 LLM 直连 Agent');
        return devCreateLocalLlmAgent(ontologyModelId);
      }
      console.warn('[dev] CreateOntologyAgent 异常，使用本地 Agent 缓存');
      return devCreateOntologyAgent(ontologyModelId);
    }

    throw error;
  }
};

/**
 * 创建消息请求参数
 */
export interface CreateMessageParams {
  /** 响应模式：Streaming（流式）/ Blocking（阻塞） */
  responseMode: 'Streaming' | 'Blocking';
  /** 状态：Published（已发布）/ Unpublished（未发布） */
  status: 'Published' | 'Unpublished';
  /** 渠道：Preview（预览）/ Production（生产） */
  channel?: 'Preview' | 'Production';
  /** 应用配置 ID */
  appConfigID?: string;
  /** 是否启用深度思考 */
  enableDeepThink?: boolean;
  /** 会话 ID */
  conversationID?: string;
  /** 应用 ID */
  appID: string;
  /** 项目 ID */
  projectID?: string;
  /** 输入参数 */
  inputs?: Record<string, any>;
  /** 用户查询内容 */
  query: string;
  /** 文件列表 */
  files?: any[];
}

/**
 * 获取聊天 API URL
 * 注意：此接口返回 SSE 流，需要在 useXChat 中使用 fetchEventSource 处理
 */
export const getChatApiUrl = (appID: string): string => {
  return `${ModaForgeResourceEndpoints.GetAIChatCompletionsApi}/${appID}`;
};

/**
 * 获取默认请求参数（用于调试）
 */
export const getDefaultChatParams = (
  appID: string,
  query: string,
  options?: Partial<CreateMessageParams>
): CreateMessageParams => {
  return {
    responseMode: 'Streaming',
    status: 'Unpublished',
    channel: 'Preview',
    enableDeepThink: true,
    appID,
    query,
    inputs: {},
    ...options
  };
};

/**
 * 获取历史会话列表
 */
export const getConversationList = async (params: {
  appId: string;
  pageNo?: number;
  pageSize?: number;
  projectId?: string;
}) => {
  const { appId, pageNo = 1, pageSize = 20 } = params;

  if (isDevAppId(appId)) {
    return devGetConversationList(appId);
  }

  try {
    const response = await UAPI.RES.GetAIChatHistoryApi({})
      .post({
        appID: appId,
        pageNo,
        pageSize
      })
      .inRegion()
      .do();

    const normalized = normalizeConversationListResponse(response);
    if (normalized.data.result.length > 0) {
      return normalized;
    }

    if (isDevBypassEnabled()) {
      console.warn('[dev] 会话列表接口无数据，回退为空列表');
      return devGetConversationList(appId);
    }

    return normalized;
  } catch (error) {
    console.warn('[getConversationList] 请求失败:', error);

    if (isDevBypassEnabled()) {
      return devGetConversationList(appId);
    }

    return emptyConversationListResponse();
  }
};

/**
 * 删除会话
 */
export const deleteConversation = async (params: { id: string }) => {
  const { id } = params;

  try {
    const response = await UAPI.RES.DeleteAIChatApi({})
      .post({
        id
      })
      .inRegion()
      .do();

    return response;
  } catch (error) {
    if (isDevBypassEnabled()) {
      return devDeleteConversation(id);
    }
    throw error;
  }
};

/**
 * 重命名会话
 */
export const renameConversation = async (params: {
  id: string;
  name: string;
}) => {
  const { id, name } = params;

  try {
    const response = await UAPI.RES.RenameAIChatApi({})
      .post({
        id,
        name
      })
      .inRegion()
      .do();

    return response;
  } catch (error) {
    if (isDevBypassEnabled()) {
      return devRenameConversation(id, name);
    }
    throw error;
  }
};

/**
 * 获取会话历史消息
 */
export const getConversationMessages = async (params: {
  appId: string;
  conversationID: string;
}) => {
  const { appId, conversationID } = params;

  if (isDevAppId(appId)) {
    return devGetConversationMessages();
  }

  try {
    const response = await UAPI.RES.GetCurrentAIChatApi({})
      .post({
        appID: appId,
        conversationID,
        fileIncluded: true,
        order: 'desc'
      })
      .inRegion()
      .do();

    return normalizeConversationMessagesResponse(response);
  } catch (error) {
    console.warn('[getConversationMessages] 请求失败:', error);

    if (isDevBypassEnabled()) {
      return devGetConversationMessages();
    }

    return emptyConversationMessagesResponse();
  }
};

/**
 * 获取 Agent 信息（包含推荐问题）
 */
export const getAgentInfo = async (params: { id: string; status: string }) => {
  const { id, status } = params;

  if (isLocalLlmAppId(id) || id === DIRECT_LLM_APP_ID) {
    return {
      code: 'Success',
      data: {
        appConfig: {
          suggestedQuestions: []
        }
      }
    };
  }

  try {
    const response = await UAPI.RES.GetAgentApi({})
      .post({
        id,
        status
      })
      .inRegion()
      .do();

    return response;
  } catch (error) {
    console.warn('[getAgentInfo] 请求失败:', error);
    return {
      code: 'Success',
      data: {
        appConfig: {
          suggestedQuestions: []
        }
      }
    };
  }
};

/**
 * 创建分片上传
 */
export const createMultipartUpload = async (params: {
  fileName?: string;
  fsID?: string;
  objectPath?: string;
  projectID?: string;
  partCount: number;
  isInternal?: boolean;
}) => {
  const res = await UAPI.RES.UploadFileApi({}).post(params).inRegion().do();
  if (res.code !== 'Success') {
    throw new Error(res.message || '创建分片上传失败');
  }
  return res.data;
};

/**
 * 完成分片上传
 */
export const completeMultipartUpload = async (params: {
  fsID?: string;
  objectURI?: string;
  objectPath?: string;
  projectID?: string;
  parts?: { eTag: string; partNumber: number }[];
  uploadID: string;
}) => {
  const response = await UAPI.RES.CompleteMultipartUploadApi({})
    .post(params)
    .inRegion()
    .do();
  return response;
};

/**
 * 转换文件为 PDF（获取预览 URL）
 */
export const convertToPDF = async (params: { uri: string }) => {
  const response = await UAPI.RES.ConvertToPDFApi({})
    .post(params)
    .inRegion()
    .do();
  return response;
};

/**
 * 打开文件预览（在新窗口中）
 */
export const openPreview = (
  url: string,
  isPreview: boolean,
  fileType: string
) => {
  return fetch(url)
    .then((res) => {
      return res.blob();
    })
    .then((blob) => {
      const pdfBlob = new Blob([blob], { type: fileType });
      const previewUrl = URL.createObjectURL(pdfBlob);
      if (isPreview) {
        window.open(previewUrl, '_blank');
      }
      return previewUrl;
    });
};

// 删除文件
export async function DeleteFile(
  params: { projectID?: string; objectPath?: string } = {
    projectID: '',
    objectPath: ''
  }
) {
  return await UAPI.RES.DeleteFile({})
    .post({
      projectID: params.projectID ?? '',
      objectPath: params.objectPath ?? ''
    })
    .inRegion()
    .do();
}
// 获取预览地址
export async function PreviewFile(params) {
  return await UAPI.RES.ConvertToPDFApi({}).post(params).inRegion().do();
}
// 文件预览
export function OpenPreview(url: string, isPreview: boolean, fileType: string) {
  return fetch(url)
    .then((res) => {
      return res.blob();
    })
    .then((blob) => {
      const pdfBlob = new Blob([blob], { type: fileType });
      const previewUrl = URL.createObjectURL(pdfBlob);
      if (isPreview) {
        window.open(previewUrl, '_blank');
      }
      return previewUrl;
    });
}

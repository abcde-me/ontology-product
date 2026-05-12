/**
 * AI 本体工作台 - 对话 API
 */
import UAPI from '@/api';
import { ModaForgeResourceEndpoints } from '../endpoints';

const {
  GetAIChatHistoryApi,
  RenameAIChatApi,
  DeleteAIChatApi,
  GetCurrentAIChatApi
} = ModaForgeResourceEndpoints;

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
  const { appId, pageNo = 1, pageSize = 20, projectId } = params;

  const response = await UAPI.RES.GetAIChatHistoryApi({})
    .post({
      appId,
      pageNo,
      pageSize,
      projectId
    })
    .inRegion()
    .do();

  return response;
};

/**
 * 删除会话
 */
export const deleteConversation = async (params: { id: string }) => {
  const { id } = params;

  const response = await UAPI.RES.DeleteAIChatApi({})
    .post({
      id
    })
    .inRegion()
    .do();

  return response;
};

/**
 * 重命名会话
 */
export const renameConversation = async (params: {
  id: string;
  name: string;
}) => {
  const { id, name } = params;

  const response = await UAPI.RES.RenameAIChatApi({})
    .post({
      id,
      name
    })
    .inRegion()
    .do();

  return response;
};

/**
 * 获取会话历史消息
 */
export const getConversationMessages = async (params: {
  appId: string;
  conversationID: string;
}) => {
  const { appId, conversationID } = params;

  const response = await UAPI.RES.GetCurrentAIChatApi({})
    .post({
      appId,
      conversationID,
      fileIncluded: true,
      order: 'desc'
    })
    .inRegion()
    .do();

  return response;
};

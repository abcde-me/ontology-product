import { Get, Patch, Post } from './request';
import {
  AppConversationData,
  AppData,
  ConversationItem,
  Feedbacktype
} from './type';

const Prefix = '/api/appforge/v1';
// const Prefix = '/dify';

/**获取聊天信息列表 */
export async function getChatMessagesRequest(params: {
  appId: string;
  conversationId: string;
  getAbortController;
}) {
  const { appId, conversationId, getAbortController } = params;
  return Get(
    Prefix +
      `/console/api/apps/${appId}/chat-messages?conversation_id=${conversationId}`,
    {},
    {},
    {
      getAbortController
    }
  );
}

/**获取聊天推荐问题 */
export async function getChatSuggestedQuestionRequest(params: {
  appId: string;
  responseItemId: string;
  getAbortController;
}) {
  const { appId, responseItemId, getAbortController } = params;
  return Get(
    Prefix +
      `/console/api/apps/${appId}/chat-messages/${responseItemId}/suggested-questions`,
    {},
    {},
    {
      getAbortController
    }
  );
}

/**获取访问token，app分享 */
export const fetchAccessTokenRequest = async (appCode: string) => {
  const headers = new Headers();
  headers.append('X-App-Code', appCode);
  return Get(Prefix + '/passport', {}, { headers }) as Promise<{
    access_token: string;
  }>;
};

export const fetchAppMeta = async (
  isInstalledApp: boolean,
  installedAppId = ''
) => {
  const url = getUrl('meta', isInstalledApp, installedAppId);
  return Get(url);
};
export const fetchAppParams = async (
  isInstalledApp: boolean,
  installedAppId = ''
) => {
  const url = getUrl('parameters', isInstalledApp, installedAppId);
  return Get(url);
};
export const fetchChatList = async (
  conversationId: string,
  isInstalledApp: boolean,
  installedAppId = ''
) => {
  const url = getUrl('messages', isInstalledApp, installedAppId);
  return Get(url, {
    conversation_id: conversationId,
    limit: 20,
    last_id: ''
  }) as any;
};

export const fetchConversations = async (
  isInstalledApp: boolean,
  installedAppId = '',
  last_id?: string,
  pinned?: boolean,
  limit?: number
) => {
  const url = getUrl('conversations', isInstalledApp, installedAppId);
  return Get(url, {
    ...{ limit: limit || 20 },
    ...(last_id ? { last_id } : {}),
    ...(pinned !== undefined ? { pinned } : {})
  }) as Promise<AppConversationData>;
};

export const generationConversationName = async (
  isInstalledApp: boolean,
  installedAppId = '',
  id: string
) => {
  const url = getUrl(
    `conversations/${id}/name`,
    isInstalledApp,
    installedAppId
  );
  return Post(url, { auto_generate: true }) as Promise<ConversationItem>;
};

export const pinConversation = async (
  isInstalledApp: boolean,
  installedAppId = '',
  id: string
) => {
  const url = getUrl(`conversations/${id}/pin`, isInstalledApp, installedAppId);
  return Patch(url, {});
};

export const unpinConversation = async (
  isInstalledApp: boolean,
  installedAppId = '',
  id: string
) => {
  const url = getUrl(
    `conversations/${id}/unpin`,
    isInstalledApp,
    installedAppId
  );
  return Patch(url, {});
};

export const updateFeedback = async (
  { url, body }: { url: string; body: Feedbacktype },
  isInstalledApp: boolean,
  installedAppId = ''
) => {
  const finalurl = getUrl(url, isInstalledApp, installedAppId);
  return Post(finalurl, { ...body });
};

export const fetchAppInfo = async () => {
  return Get('/site') as Promise<AppData>;
};

export const fetchSuggestedQuestions = (
  messageId: string,
  isInstalledApp: boolean,
  installedAppId = ''
) => {
  const url = getUrl(
    `/messages/${messageId}/suggested-questions`,
    isInstalledApp,
    installedAppId
  );
  return Get(url);
};

export const stopChatMessageResponding = async (
  appId: string,
  taskId: string,
  isInstalledApp: boolean,
  installedAppId = ''
) => {
  const url = getUrl(
    `chat-messages/${taskId}/stop`,
    isInstalledApp,
    installedAppId
  );
  return Post(url, {});
};

export function getUrl(
  url: string,
  isInstalledApp: boolean,
  installedAppId: string
) {
  return isInstalledApp
    ? Prefix +
        `/console/api/installed-apps/${installedAppId}/${url.startsWith('/') ? url.slice(1) : url}`
    : url;
}

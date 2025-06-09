import UAPI from '@/api';

export function stopResponding(params: { appId: string; taskId: string }) {
  const { appId, taskId } = params;
  return UAPI.RES.stopChat({ appId, taskId }).post({}).inRegion().do();
}

export function deleteConvension(params: {
  appId: string;
  conversationId: string;
}) {
  const { conversationId, appId } = params;
  return UAPI.RES.deleteConvension({ conversationId, appId })
    .delete({})
    .inRegion()
    .do();
}

export function renameConvension(params: {
  appId: string;
  conversationId: string;
  name: string;
}) {
  const { conversationId, appId, name } = params;
  return UAPI.RES.renameConvension({ conversationId, appId })
    .post({ name })
    .inRegion()
    .do({ preCheck: false });
}

export function getChatMsgs(params: {
  conversationId: string;
  getAbortController;
  appId: string;
}) {
  const { conversationId, getAbortController, appId } = params;
  return UAPI.RES.chatMsgs({ appId })
    .get({ conversation_id: conversationId })
    .inRegion()
    .do({ getAbortController });
}

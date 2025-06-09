import Chat from '@/components/chat/chat';
import { useChat } from '@/components/chat/chat/hooks';
import {
  fetchSuggestedQuestions,
  getUrl,
  stopChatMessageResponding
} from '@/utils/api';
import Avatar from '@/components/avater';
import type { ChatConfig, OnSend } from '@/utils/type';
import React, { ReactNode, useCallback, useEffect, useMemo } from 'react';
import QuestionIcon from '../chat/chat/questionIcon';
import { useChatWithHistoryContext } from './context';
import DefaultAppIcon from '@/assets/default-app-icon.svg';

const ChatWrapper = (props: { chatNode?: ReactNode }) => {
  const { chatNode } = props;
  const {
    appParams,
    appData,
    appPrevChatList,
    currentConversationId,
    currentConversationItem,
    inputsForms,
    newConversationInputs,
    handleNewConversationCompleted,
    isMobile,
    isInstalledApp,
    appId,
    appMeta,
    handleFeedback,
    currentChatInstanceRef,
    debugEnabled
  } = useChatWithHistoryContext();
  const appConfig = useMemo(() => {
    const config = appParams || {};

    return {
      ...config,
      supportFeedback: true,
      opening_statement: currentConversationId
        ? currentConversationItem?.introduction
        : (config as any).opening_statement
    } as ChatConfig;
  }, [appParams, currentConversationItem?.introduction, currentConversationId]);
  const { chatList, handleSend, handleStop, isResponding, suggestedQuestions } =
    useChat(
      appConfig,
      {
        inputs: (currentConversationId
          ? currentConversationItem?.inputs
          : newConversationInputs) as any,
        promptVariables: inputsForms
      },
      appPrevChatList,
      (taskId) => stopChatMessageResponding('', taskId, isInstalledApp, appId)
    );

  useEffect(() => {
    if (currentChatInstanceRef.current)
      currentChatInstanceRef.current.handleStop = handleStop;
  }, [currentChatInstanceRef, handleStop]);

  const doSend: OnSend = useCallback(
    (message, files) => {
      const data: any = {
        query: message,
        inputs: (currentConversationId
          ? currentConversationItem?.inputs
          : newConversationInputs) ?? {},
        conversation_id: currentConversationId || undefined,
        enable_react_msg: debugEnabled
      };

      if (appConfig?.file_upload?.image.enabled && files?.length)
        data.files = files;

      handleSend(getUrl('chat-messages', isInstalledApp, appId || ''), data, {
        onGetSuggestedQuestions: (responseItemId) =>
          fetchSuggestedQuestions(responseItemId, isInstalledApp, appId),
        onConversationComplete: currentConversationId
          ? undefined
          : handleNewConversationCompleted,
        isPublicAPI: !isInstalledApp
      });
    },
    [
      currentConversationId,
      currentConversationItem?.inputs,
      newConversationInputs,
      debugEnabled,
      appConfig?.file_upload?.image.enabled,
      handleSend,
      isInstalledApp,
      appId,
      handleNewConversationCompleted
    ]
  );
  const answerIcon = useMemo(() => {
    return (
      <Avatar
        value={appData?.icon}
        readonly
        size={36}
        defaultIcon={<DefaultAppIcon className="size-[36px]" />}
      />
    );
  }, [appData?.icon]);
  return (
    <Chat
      answerIcon={answerIcon}
      config={appConfig}
      chatList={chatList}
      isResponding={isResponding}
      chatContainerInnerClassName={`mx-auto pt-6 w-full max-w-[720px] ${isMobile && 'px-4'}`}
      chatFooterClassName="pb-4"
      chatFooterInnerClassName={`mx-auto w-full max-w-[720px] ${isMobile && 'px-4'}`}
      onSend={doSend}
      questionIcon={<QuestionIcon />}
      onStopResponding={handleStop}
      allToolIcons={appMeta?.tool_icons || {}}
      onFeedback={handleFeedback}
      chatNode={chatNode}
      suggestedQuestions={suggestedQuestions}
      bottomStyle={{
        background: '#DBE9FF'
      }}
    />
  );
};

export default ChatWrapper;

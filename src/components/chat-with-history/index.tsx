import React from 'react';
import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAsyncEffect } from 'ahooks';
import { ChatWithHistoryContext, useChatWithHistoryContext } from './context';
import { useChatWithHistory } from './hooks';
import Sidebar from './sidebar';
import HeaderInMobile from './header-in-mobile';
import ChatWrapper from './chat-wrapper';
import type { InstalledApp } from '@/utils/type';
import useBreakpoints, { MediaType } from '@/utils/use-breakpoints';
import { checkOrSetAccessToken } from '@/utils/share';
import AppUnavailable from './app-unavailable';
import { Spin } from '@arco-design/web-react';
import ConfigPanel from './config-panel';

type ChatWithHistoryProps = {
  className?: string;
  chatNode?: ReactNode;
};
const ChatWithHistory: FC<ChatWithHistoryProps> = ({ className, chatNode }) => {
  const {
    appInfoError,
    appData,
    appInfoLoading,
    appPrevChatList,
    showConfigPanelBeforeChat,
    appChatListDataLoading,
    chatShouldReloadKey,
    isMobile,
    handleStartChat
  } = useChatWithHistoryContext();

  const chatReady = !showConfigPanelBeforeChat || !!appPrevChatList.length;
  const customConfig = appData?.custom_config;
  const site = appData?.site;

  useEffect(() => {
    if (site) {
      if (customConfig) document.title = `${site.title}`;
      else document.title = `ModaForge`;
    }
  }, [site, customConfig]);

  useEffect(() => {
    if (
      showConfigPanelBeforeChat &&
      !appChatListDataLoading &&
      !appPrevChatList.length
    )
      handleStartChat();
  }, [
    appChatListDataLoading,
    appPrevChatList.length,
    handleStartChat,
    showConfigPanelBeforeChat
  ]);

  if (appInfoLoading) {
    return <Spin loading />;
  }

  if (appInfoError) {
    return <AppUnavailable />;
  }

  return (
    <div className={`flex h-full  ${className} ${isMobile && 'flex-col'}`}>
      <div
        className={`grow overflow-hidden ${showConfigPanelBeforeChat && !appPrevChatList.length && 'flex items-center justify-center'}`}
      >
        {appChatListDataLoading && chatReady && <Spin loading />}
        {chatReady && !appChatListDataLoading && (
          <ChatWrapper chatNode={chatNode} key={chatShouldReloadKey} />
        )}
      </div>
      {!isMobile && <Sidebar />}
    </div>
  );
};

export type ChatWithHistoryWrapProps = {
  installedAppInfo?: InstalledApp;
  className?: string;
  chatNode?: ReactNode;
};
const ChatWithHistoryWrap: FC<ChatWithHistoryWrapProps> = ({
  installedAppInfo,
  className,
  chatNode
}) => {
  const media = useBreakpoints();
  const isMobile = media === MediaType.mobile;

  const {
    appInfoError,
    appInfoLoading,
    appData,
    appParams,
    appMeta,
    appChatListDataLoading,
    currentConversationId,
    currentConversationItem,
    appPrevChatList,
    pinnedConversationList,
    conversationList,
    showConfigPanelBeforeChat,
    newConversationInputs,
    handleNewConversationInputsChange,
    inputsForms,
    handleNewConversation,
    handleStartChat,
    handleChangeConversation,
    handlePinConversation,
    handleUnpinConversation,
    handleDeleteConversation,
    conversationRenaming,
    handleRenameConversation,
    handleNewConversationCompleted,
    chatShouldReloadKey,
    isInstalledApp,
    appId,
    handleFeedback,
    currentChatInstanceRef,
    debugEnabled,
    setDebugEnabled
  } = useChatWithHistory(installedAppInfo);

  return (
    <ChatWithHistoryContext.Provider
      value={{
        appInfoError,
        appInfoLoading,
        appData,
        appParams,
        appMeta,
        appChatListDataLoading,
        currentConversationId,
        currentConversationItem,
        appPrevChatList,
        pinnedConversationList,
        conversationList,
        showConfigPanelBeforeChat,
        newConversationInputs,
        handleNewConversationInputsChange,
        inputsForms,
        handleNewConversation,
        handleStartChat,
        handleChangeConversation,
        handlePinConversation,
        handleUnpinConversation,
        handleDeleteConversation,
        conversationRenaming,
        handleRenameConversation,
        handleNewConversationCompleted,
        chatShouldReloadKey,
        isMobile,
        isInstalledApp,
        appId,
        handleFeedback,
        currentChatInstanceRef,
        debugEnabled,
        setDebugEnabled
      }}
    >
      <ChatWithHistory chatNode={chatNode} className={className} />
    </ChatWithHistoryContext.Provider>
  );
};

const ChatWithHistoryWrapWithCheckToken: FC<ChatWithHistoryWrapProps> = ({
  installedAppInfo,
  className,
  chatNode
}) => {
  const [inited, setInited] = useState(false);
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false);
  const [isUnknwonReason, setIsUnknwonReason] = useState<boolean>(false);

  useAsyncEffect(async () => {
    if (!inited) {
      if (!installedAppInfo) {
        try {
          await checkOrSetAccessToken();
        } catch (e: any) {
          if (e.status === 404) {
            setAppUnavailable(true);
          } else {
            setIsUnknwonReason(true);
            setAppUnavailable(true);
          }
        }
      }
      setInited(true);
    }
  }, []);

  if (appUnavailable)
    return <AppUnavailable isUnknwonReason={isUnknwonReason} />;

  if (!inited) return null;

  return (
    <ChatWithHistoryWrap
      chatNode={chatNode}
      installedAppInfo={installedAppInfo}
      className={className}
    />
  );
};

export default ChatWithHistoryWrapWithCheckToken;

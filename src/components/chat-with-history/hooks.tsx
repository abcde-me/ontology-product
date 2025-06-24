import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { useLocalStorageState } from 'ahooks';
import produce from 'immer';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/store';
import type { Callback, ChatConfig, ChatItem, Feedback } from '@/utils/type';
import { CONVERSATION_ID_INFO } from './constants';
import {
  fetchAppInfo,
  fetchAppMeta,
  fetchAppParams,
  fetchChatList,
  fetchConversations,
  generationConversationName,
  pinConversation,
  unpinConversation,
  updateFeedback
} from '@/utils/api';
import type { InstalledApp } from '@/utils/type';
import type { AppData, ConversationItem } from '@/utils/type';
import { addFileInfos, sortAgentSorts } from '@/utils/tools';
import { Message } from '@arco-design/web-react';
import { deleteConvension, renameConvension } from '@/api/chat';

export const useChatWithHistory = (installedAppInfo?: InstalledApp) => {
  const [debugEnabled, setDebugEnabled] = useState(false);
  const userInfo = useSelector(
    (state: GlobalState) => state?.plugins?.consolePluginAibuilder?.userInfo
  );
  console.log('userInfo', userInfo);
  const isInstalledApp = useMemo(() => !!installedAppInfo, [installedAppInfo]);
  const {
    data: appInfo,
    isLoading: appInfoLoading,
    error: appInfoError
  } = useSWR(installedAppInfo ? null : 'appInfo', fetchAppInfo);

  const appData = useMemo(() => {
    if (isInstalledApp) {
      const { id, app } = installedAppInfo!;
      return {
        app_id: id,
        icon: app.icon,
        site: {
          title: app.name,
          icon: app.icon,
          icon_background: app.icon_background,
          prompt_public: false,
          copyright: ''
        },
        plan: 'basic'
      } as AppData;
    }

    return appInfo;
  }, [isInstalledApp, installedAppInfo, appInfo]);
  const appId = useMemo(() => appData?.app_id, [appData]);

  const [conversationIdInfo, setConversationIdInfo] = useLocalStorageState<
    Record<string, string>
  >(CONVERSATION_ID_INFO, {
    defaultValue: {}
  });
  const currentConversationId = useMemo(
    () => conversationIdInfo?.[userInfo.userId + '/' + (appId || '')] || '',
    [appId, userInfo, conversationIdInfo]
  );
  const handleConversationIdInfoChange = useCallback(
    (changeConversationId: string) => {
      if (appId) {
        setConversationIdInfo({
          ...conversationIdInfo,
          [userInfo.userId + '/' + (appId || '')]: changeConversationId
        });
      }
    },
    [appId, userInfo, conversationIdInfo, setConversationIdInfo]
  );
  const [showConfigPanelBeforeChat, setShowConfigPanelBeforeChat] =
    useState(true);

  const [newConversationId, setNewConversationId] = useState('');
  const chatShouldReloadKey = useMemo(() => {
    if (currentConversationId == newConversationId) return '';

    return currentConversationId;
  }, [currentConversationId, newConversationId]);

  const { data: appParams } = useSWR(['appParams', isInstalledApp, appId], () =>
    fetchAppParams(isInstalledApp, appId)
  );
  const { data: appMeta } = useSWR(['appMeta', isInstalledApp, appId], () =>
    fetchAppMeta(isInstalledApp, appId)
  );
  const {
    data: appPinnedConversationData,
    mutate: mutateAppPinnedConversationData
  } = useSWR(['appConversationData', isInstalledApp, appId, true], () =>
    fetchConversations(isInstalledApp, appId, undefined, true, 100)
  );
  const {
    data: appConversationData,
    isLoading: appConversationDataLoading,
    mutate: mutateAppConversationData
  } = useSWR(['appConversationData', isInstalledApp, appId, false], () =>
    fetchConversations(isInstalledApp, appId, undefined, false, 100)
  );
  const { data: appChatListData, isLoading: appChatListDataLoading } = useSWR(
    chatShouldReloadKey
      ? ['appChatList', chatShouldReloadKey, isInstalledApp, appId]
      : null,
    () => fetchChatList(chatShouldReloadKey, isInstalledApp, appId)
  );

  const appPrevChatList = useMemo(() => {
    const data = appChatListData?.data || [];
    const chatList: ChatItem[] = [];

    if (currentConversationId && data.length) {
      data.forEach((item: any) => {
        chatList.push({
          id: `question-${item.id}`,
          content: item.query,
          isAnswer: false,
          message_files:
            item.message_files?.filter(
              (file: any) => file.belongs_to === 'user'
            ) || []
        });
        chatList.push({
          id: item.id,
          content: item.answer,
          agent_thoughts: addFileInfos(
            item.agent_thoughts
              ? sortAgentSorts(item.agent_thoughts)
              : item.agent_thoughts,
            item.message_files
          ),
          feedback: item.feedback,
          isAnswer: true,
          citation: item.retriever_resources,
          message_files:
            item.message_files?.filter(
              (file: any) => file.belongs_to === 'assistant'
            ) || []
        });
      });
    }

    return chatList;
  }, [appChatListData, currentConversationId]);

  const [showNewConversationItemInList, setShowNewConversationItemInList] =
    useState(false);

  const pinnedConversationList = useMemo(() => {
    return appPinnedConversationData?.data || [];
  }, [appPinnedConversationData]);
  const newConversationInputsRef = useRef<Record<string, any>>({});
  const [newConversationInputs, setNewConversationInputs] = useState<
    Record<string, any>
  >({});
  const handleNewConversationInputsChange = useCallback(
    (newInputs: Record<string, any>) => {
      newConversationInputsRef.current = newInputs;
      setNewConversationInputs(newInputs);
    },
    []
  );
  const inputsForms = useMemo(() => {
    return (appParams?.user_input_form || [])
      .filter(
        (item: any) => item.paragraph || item.select || item['text-input']
      )
      .map((item: any) => {
        if (item.paragraph) {
          return {
            ...item.paragraph,
            type: 'paragraph'
          };
        }
        if (item.select) {
          return {
            ...item.select,
            type: 'select'
          };
        }
        return {
          ...item['text-input'],
          type: 'text-input'
        };
      });
  }, [appParams]);
  useEffect(() => {
    const conversationInputs: Record<string, any> = {};

    inputsForms.forEach((item: any) => {
      conversationInputs[item.variable] = item.default || '';
    });
    handleNewConversationInputsChange(conversationInputs);
  }, [handleNewConversationInputsChange, inputsForms]);

  const { data: newConversation } = useSWR(
    newConversationId ? [isInstalledApp, appId, newConversationId] : null,
    () => generationConversationName(isInstalledApp, appId, newConversationId)
  );
  const [originConversationList, setOriginConversationList] = useState<
    ConversationItem[]
  >([]);
  useEffect(() => {
    if (appConversationData?.data && !appConversationDataLoading)
      setOriginConversationList(appConversationData?.data);
  }, [appConversationData, appConversationDataLoading]);
  const conversationList = useMemo(() => {
    const data = originConversationList.slice();

    if (showNewConversationItemInList && data[0]?.id !== '') {
      data.unshift({
        id: '',
        name: '新的对话',
        inputs: {},
        introduction: ''
      });
    }
    return data;
  }, [originConversationList, showNewConversationItemInList]);

  useEffect(() => {
    if (newConversation) {
      setOriginConversationList(
        produce((draft) => {
          const index = draft.findIndex(
            (item) => item.id == newConversation.id
          );

          if (index > -1) draft[index] = newConversation;
          else draft.unshift(newConversation);
        })
      );
    }
  }, [newConversation]);

  const currentConversationItem = useMemo(() => {
    let coversationItem = conversationList.find(
      (item) => item.id == currentConversationId
    );

    if (!coversationItem && pinnedConversationList.length)
      coversationItem = pinnedConversationList.find(
        (item) => item.id == currentConversationId
      );

    return coversationItem;
  }, [conversationList, currentConversationId, pinnedConversationList]);

  const checkInputsRequired = useCallback(
    (silent?: boolean) => {
      if (inputsForms.length) {
        for (let i = 0; i < inputsForms.length; i += 1) {
          const item = inputsForms[i];

          if (
            item.required &&
            !newConversationInputsRef.current[item.variable]
          ) {
            if (!silent) {
              Message.error(item.variable + '必填');
            }
            return;
          }
        }
        return true;
      }

      return true;
    },
    [inputsForms]
  );
  const handleStartChat = useCallback(() => {
    if (checkInputsRequired()) {
      setShowConfigPanelBeforeChat(false);
      setShowNewConversationItemInList(true);
    }
  }, [
    setShowConfigPanelBeforeChat,
    setShowNewConversationItemInList,
    checkInputsRequired
  ]);
  const currentChatInstanceRef = useRef<{ handleStop: () => void }>({
    handleStop: () => {}
  });
  const handleChangeConversation = useCallback(
    (conversationId: string) => {
      currentChatInstanceRef.current.handleStop();
      setNewConversationId('');
      handleConversationIdInfoChange(conversationId);

      if (conversationId === '' && !checkInputsRequired(true))
        setShowConfigPanelBeforeChat(true);
      else setShowConfigPanelBeforeChat(false);
    },
    [
      handleConversationIdInfoChange,
      setShowConfigPanelBeforeChat,
      checkInputsRequired
    ]
  );
  const handleNewConversation = useCallback(() => {
    currentChatInstanceRef.current.handleStop();
    setNewConversationId('');

    if (showNewConversationItemInList) {
      handleChangeConversation('');
    } else if (currentConversationId) {
      handleConversationIdInfoChange('');
      setShowConfigPanelBeforeChat(true);
      setShowNewConversationItemInList(true);
      handleNewConversationInputsChange({});
    }
  }, [
    handleChangeConversation,
    currentConversationId,
    handleConversationIdInfoChange,
    setShowConfigPanelBeforeChat,
    setShowNewConversationItemInList,
    showNewConversationItemInList,
    handleNewConversationInputsChange
  ]);
  const handleUpdateConversationList = useCallback(() => {
    mutateAppConversationData();
    mutateAppPinnedConversationData();
  }, [mutateAppConversationData, mutateAppPinnedConversationData]);

  const handlePinConversation = useCallback(
    async (conversationId: string) => {
      await pinConversation(isInstalledApp, appId, conversationId);
      Message.success('成功');
      handleUpdateConversationList();
    },
    [isInstalledApp, appId, handleUpdateConversationList]
  );

  const handleUnpinConversation = useCallback(
    async (conversationId: string) => {
      await unpinConversation(isInstalledApp, appId, conversationId);
      Message.success('成功');
      handleUpdateConversationList();
    },
    [isInstalledApp, appId, handleUpdateConversationList]
  );

  const [conversationDeleting, setConversationDeleting] = useState(false);
  const handleDeleteConversation = useCallback(
    async (conversationId: string, { onSuccess }: Callback) => {
      if (conversationDeleting) return;

      try {
        setConversationDeleting(true);
        // TODO: ts错误
        // @ts-expect-error
        await deleteConvension({ appId, conversationId });
        Message.success('删除成功');
        onSuccess();
      } finally {
        setConversationDeleting(false);
      }

      if (conversationId == currentConversationId) handleNewConversation();

      handleUpdateConversationList();
    },
    [
      appId,
      handleUpdateConversationList,
      handleNewConversation,
      currentConversationId,
      conversationDeleting
    ]
  );

  const [conversationRenaming, setConversationRenaming] = useState(false);
  const handleRenameConversation = useCallback(
    async (
      conversationId: string,
      newName: string,
      { onSuccess }: Callback
    ) => {
      if (conversationRenaming) return;

      if (!newName.trim()) {
        Message.error('会话名称必填');
        return;
      }

      setConversationRenaming(true);
      try {
        await renameConvension({
          // TODO: ts错误
          // @ts-expect-error
          appId,
          conversationId,
          name: newName
        });

        Message.success('修改成功');
        setOriginConversationList(
          produce((draft) => {
            const index = originConversationList.findIndex(
              (item) => item.id == conversationId
            );
            const item = draft[index];

            draft[index] = {
              ...item,
              name: newName
            };
          })
        );
        onSuccess();
      } finally {
        setConversationRenaming(false);
      }
    },
    [appId, conversationRenaming, originConversationList]
  );

  const handleNewConversationCompleted = useCallback(
    (newConversationId: string) => {
      setNewConversationId(newConversationId);
      handleConversationIdInfoChange(newConversationId);
      setShowNewConversationItemInList(false);
      mutateAppConversationData();
    },
    [mutateAppConversationData, handleConversationIdInfoChange]
  );

  const handleFeedback = useCallback(
    async (messageId: string, feedback: Feedback) => {
      await updateFeedback(
        {
          url: `/messages/${messageId}/feedbacks`,
          body: { rating: feedback.rating }
        },
        isInstalledApp,
        appId
      );
      Message.success('成功');
    },
    [isInstalledApp, appId]
  );

  return {
    appInfoError,
    appInfoLoading,
    isInstalledApp,
    appId,
    currentConversationId,
    currentConversationItem,
    handleConversationIdInfoChange,
    appData,
    appParams: appParams || ({} as ChatConfig),
    appMeta,
    appPinnedConversationData,
    appConversationData,
    appConversationDataLoading,
    appChatListData,
    appChatListDataLoading,
    appPrevChatList,
    pinnedConversationList,
    conversationList,
    showConfigPanelBeforeChat,
    setShowConfigPanelBeforeChat,
    setShowNewConversationItemInList,
    newConversationInputs,
    handleNewConversationInputsChange,
    inputsForms,
    handleNewConversation,
    handleStartChat,
    handleChangeConversation,
    handlePinConversation,
    handleUnpinConversation,
    conversationDeleting,
    handleDeleteConversation,
    conversationRenaming,
    handleRenameConversation,
    handleNewConversationCompleted,
    newConversationId,
    chatShouldReloadKey,
    handleFeedback,
    currentChatInstanceRef,
    debugEnabled,
    setDebugEnabled
  };
};

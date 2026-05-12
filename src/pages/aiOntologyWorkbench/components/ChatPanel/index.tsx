import React, { useEffect } from 'react';
import { UploadProps } from '@arco-design/web-react';
import { Message } from '@arco-design/web-react';
import Header from './Header';
import WelcomeView from './WelcomeView';
import ChatView from './ChatView';
import { useXChat, useXConversations } from '@/hooks/chat';
import { useAIWorkbenchStore } from '../../store';

interface PromptItem {
  id: string;
  value: string;
}

const PROMPT_LIST: PromptItem[] = [
  { id: '1', value: '介绍下项目名称为：智慧医院集成平台项目 的项目签约方' },
  { id: '2', value: '如何定义对象之间的关系？' },
  { id: '3', value: '为对象添加行为' }
];

interface ChatPanelProps {
  appId: string | number;
  projectId?: string | number;
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  appId,
  projectId,
  conversationId,
  onConversationCreated
}) => {
  // 获取图谱状态管理
  const { setGraphData } = useAIWorkbenchStore();

  // 使用会话管理 hook
  const {
    conversations,
    activeConversationId,
    loading: conversationsLoading,
    setActiveConversation,
    deleteConversation,
    updateConversation,
    loadConversations
  } = useXConversations();

  // 使用 useXChat hook
  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    stopGeneration,
    clearMessages
  } = useXChat({
    appId,
    projectId,
    conversationId: conversationId || activeConversationId || undefined,
    onConversationCreated: (newConversationId) => {
      setActiveConversation(newConversationId);
      onConversationCreated?.(newConversationId);
    },
    onError: (error) => {
      Message.error(error.message || '发送失败');
    }
  });

  // 组件挂载时加载会话列表
  useEffect(() => {
    if (appId) {
      loadConversations(
        String(appId),
        projectId ? String(projectId) : undefined
      );
    }
  }, [appId, projectId, loadConversations]);

  // 会话列表加载完成后，自动选择第一个会话（仅在初始加载时）
  useEffect(() => {
    // 只在初始加载时（activeConversationId === null）自动选择第一个会话
    if (
      !conversationId &&
      activeConversationId === null &&
      conversations.length > 0
    ) {
      setActiveConversation(conversations[0].id);
    }
  }, [
    conversations,
    conversationId,
    activeConversationId,
    setActiveConversation
  ]);

  // 文件上传配置
  const uploaderProps: Partial<UploadProps> = {
    accept: '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif',
    multiple: true
  };

  // 获取文件的函数
  const GetFile = async (params: { id: string }) => {
    // TODO: 实现文件获取逻辑
    console.log('GetFile:', params);
    return Promise.resolve({});
  };

  // 获取语音文本的函数
  const GetAudioText = async (formData: FormData) => {
    // TODO: 实现语音转文字逻辑
    console.log('GetAudioText:', formData);
    return Promise.resolve({
      data: {
        content: [
          {
            text: '',
            type: 'text'
          }
        ]
      }
    });
  };

  const handleSend = async (params: {
    text: string;
    files?: any[];
    enableDeepThink: boolean;
  }) => {
    if (!params.text.trim()) return;

    await sendMessage({
      text: params.text,
      files: params.files,
      enableDeepThink: params.enableDeepThink
    });
  };

  const handlePromptSelect = (params: { id: string; text: string }) => {
    handleSend({ text: params.text, enableDeepThink: false });
  };

  const handleNewSession = () => {
    // 清空消息列表，显示欢迎页面
    clearMessages();
    // 清空活跃会话 ID，下次发送消息时会创建新会话
    setActiveConversation(undefined);
    // 清空图谱数据
    setGraphData(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    // TODO: 加载选中会话的消息
    // 这里可能需要添加一个新的 API 来获取会话的历史消息
  };

  const handleDeleteConversation = async (id: string) => {
    const isCurrentConversation = await deleteConversation(
      id,
      projectId ? String(projectId) : undefined
    );

    // 如果删除的是当前会话，清空消息列表和图谱数据
    if (isCurrentConversation) {
      clearMessages();
      // 清空图谱数据
      setGraphData(null);
      console.log('删除了当前会话，已清空消息列表和图谱数据');
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    await updateConversation(
      id,
      { title: newTitle },
      projectId ? String(projectId) : undefined
    );
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <Header
        conversations={conversations}
        activeConversationId={activeConversationId}
        conversationsLoading={conversationsLoading}
        onNewSession={handleNewSession}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {showWelcome ? (
          <WelcomeView
            prompts={PROMPT_LIST}
            onPromptSelect={handlePromptSelect}
            onSend={handleSend}
            uploaderProps={uploaderProps}
            GetFile={GetFile}
            GetAudioText={GetAudioText}
          />
        ) : (
          <ChatView
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            onSend={handleSend}
            onStop={stopGeneration}
            uploaderProps={uploaderProps}
            GetFile={GetFile}
            GetAudioText={GetAudioText}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPanel;

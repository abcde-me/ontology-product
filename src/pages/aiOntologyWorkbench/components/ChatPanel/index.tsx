import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState
} from 'react';
import { UploadProps, Modal } from '@arco-design/web-react';
import { Message } from '@arco-design/web-react';
import Header from './Header';
import WelcomeView from './WelcomeView';
import ChatView from './ChatView';
import { useXChat, useXConversations } from '@/hooks/chat';
import { useAIWorkbenchStore } from '../../store';
import { useMultipartUploader } from '@/hooks/chat/useMultipartUpload';
import { OntologyAction } from '@/hooks/chat/types';
import {
  getChatApiUrl,
  getConversationMessages,
  getConversationList,
  deleteConversation as deleteConversationApi,
  renameConversation as renameConversationApi
} from '@/api/aiOntologyWorkbench/chat';

interface PromptItem {
  id: string;
  value: string;
}

const PROMPT_LIST: PromptItem[] = [
  { id: '1', value: '先获取本体场景列表，随后获取对象类型元数据信息' },
  { id: '2', value: '如何定义对象之间的关系？' },
  { id: '3', value: '为对象添加行为' }
];

interface ChatPanelProps {
  appId: string | number;
  projectId?: string | number;
  appConfigId?: null;
  channel?: string;
  source?: 'published' | 'debugger';
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
  /** 图谱刷新回调 */
  onGraphRefresh?: () => void;
  /** 节点定位回调 */
  onLocateNode?: (code: string) => void;
  /** 节点查看回调 */
  onViewNode?: (action: OntologyAction) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  appId,
  projectId,
  appConfigId,
  channel,
  source,
  conversationId,
  onConversationCreated,
  onGraphRefresh,
  onLocateNode,
  onViewNode
}) => {
  // 获取图谱状态管理和当前本体
  const { setGraphData, currentOntology } = useAIWorkbenchStore();

  // 文件上传相关
  const uploader = useMultipartUploader();
  const [uploadFileList, setUploadFileList] = useState<any[]>([]);

  // 使用 ref 记录是否是初始加载
  const isInitialMount = useRef(true);
  // 使用 ref 记录上一次的本体 ID
  const prevOntologyIdRef = useRef<number | string | undefined>(undefined);
  // 使用 ref 记录是否是用户主动新建会话
  const isUserNewSession = useRef(false);

  // 稳定 API 配置对象的引用，避免无限循环
  const conversationApiConfig = useMemo(
    () => ({
      // 注入获取会话列表的函数
      getConversationList: async (params: {
        appId: string;
        projectId?: string;
        pageNo?: number;
        pageSize?: number;
      }) => {
        return await getConversationList({
          appId: params.appId,
          projectId: params.projectId,
          pageNo: params.pageNo,
          pageSize: params.pageSize
        });
      },
      // 注入删除会话的函数
      deleteConversation: async (params: { id: string }) => {
        return await deleteConversationApi({ id: params.id });
      },
      // 注入重命名会话的函数
      renameConversation: async (params: { id: string; name: string }) => {
        return await renameConversationApi({
          id: params.id,
          name: params.name
        });
      }
    }),
    []
  );

  const conversationShowMessage = useMemo(
    () => ({
      success: (msg: string) => Message.success(msg),
      error: (msg: string) => Message.error(msg),
      warning: (msg: string) => Message.warning(msg)
    }),
    []
  );

  // 稳定 Chat API 配置对象的引用，避免无限循环
  const chatApiConfig = useMemo(
    () => ({
      // 注入获取聊天 URL 的函数
      getChatUrl: (appId: string) => getChatApiUrl(appId),
      // 注入获取历史消息的函数
      getHistoryMessages: async (params: {
        appId: string;
        conversationId: string;
      }) => {
        return await getConversationMessages({
          appId: params.appId,
          conversationID: params.conversationId
        });
      },
      // 注入构建请求体的函数（可选，使用默认实现）
      buildRequestBody: (params: {
        appId: string;
        conversationId: string;
        query: string;
        files?: any[];
        enableDeepThink: boolean;
        projectId?: string;
        appConfigId?: string;
        channel?: string;
        source?: string;
      }) => ({
        responseMode: 'Streaming',
        status: 'Published',
        channel: params.channel,
        appID: params.appId,
        appConfigID: params.appConfigId,
        projectID: params.projectId,
        conversationID: params.conversationId,
        enableDeepThink: params.enableDeepThink,
        query: params.query,
        inputs: params.files ? { files: params.files } : {}
      })
    }),
    []
  );

  // 使用会话管理 hook，注入项目特定的 API
  const {
    conversations,
    activeConversationId,
    loading: conversationsLoading,
    setActiveConversation,
    deleteConversation,
    updateConversation,
    loadConversations
  } = useXConversations({
    apiConfig: conversationApiConfig,
    showMessage: conversationShowMessage
  });

  // 使用 useXChat hook，注入项目特定的 API
  const {
    messages,
    isLoading,
    isStreaming,
    isLoadingHistory,
    sendMessage,
    stopGeneration,
    clearMessages,
    loadHistoryMessages
  } = useXChat({
    appId,
    projectId,
    appConfigId,
    channel,
    source,
    conversationId: conversationId || activeConversationId || undefined,
    apiConfig: chatApiConfig,
    showMessage: conversationShowMessage,
    onConversationCreated: (newConversationId) => {
      console.log('[ChatPanel] 新会话创建:', newConversationId);
      // 设置为活跃会话
      setActiveConversation(newConversationId);
      // 调用外部回调
      onConversationCreated?.(newConversationId);
      // 注意：不在这里刷新会话列表，由 onMessageEnd 统一处理
    },
    onMessageEnd: (conversationId) => {
      console.log('[ChatPanel] 消息完成，刷新会话列表:', conversationId);
      // 每次对话完成后刷新会话列表，更新会话的最后消息和时间
      // 这里会处理新会话创建和已有会话更新两种情况
      loadConversations(
        String(appId),
        projectId ? String(projectId) : undefined
      );
    },
    onError: (error) => {
      Message.error(error.message || '发送失败');
    }
  });

  // 监听本体切换，清空聊天和图谱
  useEffect(() => {
    const currentOntologyId = currentOntology?.id;

    // 跳过初始加载
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevOntologyIdRef.current = currentOntologyId;
      console.log('[ChatPanel] 初始加载，记录本体 ID:', currentOntologyId);
      return;
    }

    // 只在本体 ID 真正切换时才清空
    if (!currentOntologyId || currentOntologyId === prevOntologyIdRef.current) {
      return;
    }

    console.log('[ChatPanel] 本体切换，清空聊天和图谱数据', {
      prev: prevOntologyIdRef.current,
      current: currentOntologyId
    });

    // 更新上一次的本体 ID
    prevOntologyIdRef.current = currentOntologyId;

    // 清空消息列表
    clearMessages();
    // 清空活跃会话 ID（设置为 null，而不是 undefined）
    setActiveConversation(null);
    // 清空图谱数据
    setGraphData(null);

    // 重新加载会话列表
    if (appId) {
      console.log('[ChatPanel] 本体切换后重新加载会话列表');
      loadConversations(
        String(appId),
        projectId ? String(projectId) : undefined
      );
    }
  }, [
    currentOntology?.id,
    clearMessages,
    setActiveConversation,
    setGraphData,
    appId,
    projectId,
    loadConversations
  ]);

  // 组件挂载时加载会话列表（仅初始加载）
  useEffect(() => {
    console.log('[ChatPanel] 组件挂载 useEffect 触发:', {
      appId,
      projectId,
      hasAppId: !!appId
    });

    // 初始挂载时加载会话列表
    if (appId) {
      console.log('[ChatPanel] 初始挂载，开始加载会话列表');
      loadConversations(
        String(appId),
        projectId ? String(projectId) : undefined
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 移除自动加载第一个对话的逻辑
  // 用户需要手动点击历史对话才会加载

  // 移除自动加载历史消息的逻辑
  // 用户需要手动点击历史对话才会加载

  // 监听消息变化，检查是否需要刷新图谱
  useEffect(() => {
    console.log('[ChatPanel] 消息变化，当前消息数量:', messages.length);

    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    console.log('[ChatPanel] 最后一条消息:', {
      type: lastMessage.type,
      status: lastMessage.status,
      hasOntologyActions: !!lastMessage.ontologyActions,
      ontologyActionsCount: lastMessage.ontologyActions?.length || 0,
      ontologyActions: lastMessage.ontologyActions
    });

    // 只处理 AI 消息且状态为 success
    if (lastMessage.type !== 'assistant' || lastMessage.status !== 'success') {
      console.log('[ChatPanel] 跳过：不是完成的 AI 消息');
      return;
    }

    // 检查是否有本体操作
    const ontologyActions = lastMessage.ontologyActions;
    if (!ontologyActions || ontologyActions.length === 0) {
      console.log('[ChatPanel] 跳过：没有本体操作');
      return;
    }

    // 检查是否有非 get/list 操作
    const hasModification = ontologyActions.some(
      (action) =>
        action.action_type !== 'get' &&
        action.action_type !== 'list' &&
        action.action_type !== 'GET' &&
        action.action_type !== 'LIST'
    );

    console.log('[ChatPanel] 本体操作检查:', {
      hasModification,
      actions: ontologyActions.map((a) => a.action_type)
    });

    if (hasModification && onGraphRefresh) {
      console.log('[ChatPanel] 检测到本体修改操作，触发图谱刷新');
      onGraphRefresh();
    } else if (!hasModification) {
      console.log('[ChatPanel] 所有操作都是查询操作，不刷新图谱');
    }
  }, [messages, onGraphRefresh]);

  // 文件上传配置
  const uploaderProps: Partial<UploadProps> = useMemo(
    () => ({
      accept: '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif',
      multiple: true,
      customRequest: (option: any) => {
        const { file, onProgress, onSuccess, onError } = option;

        uploader.uploadFile({
          file,
          fileKey: file.uid,
          uploadParams: {
            projectID: projectId ? String(projectId) : undefined,
            isInternal: false,
            fileName: file.name
          },
          onProgress: (percent) => {
            onProgress?.(percent, file);
          },
          onSuccess: (res) => {
            onSuccess?.(res, file);
          },
          onError: (err) => {
            Message.error(err?.message || '文件上传失败');
            onError?.(err, file);
          }
        });
      },
      onChange: setUploadFileList
    }),
    [uploader, projectId]
  );

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

  const handleSend = useCallback(
    (params: { text: string; files?: any[]; enableDeepThink: boolean }) => {
      const { text, files = [], enableDeepThink } = params;

      // 清除新建会话标记（用户开始发送消息）
      isUserNewSession.current = false;

      // 过滤出已上传完成的文件
      const uploadedFiles = files
        .filter((file) => file.status === 'done')
        .map((file) => ({
          id: file.uid,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.response?.data?.objectURI || ''
        }));

      // 调用 sendMessage，传递对象参数
      sendMessage({
        text,
        files: uploadedFiles,
        enableDeepThink
      });

      // 发送后清空文件列表
      setUploadFileList([]);
    },
    [sendMessage]
  );

  const handlePromptSelect = (params: { id: string; text: string }) => {
    handleSend({ text: params.text, enableDeepThink: true });
  };

  const handleNewSession = () => {
    console.log('[ChatPanel] 用户点击新建会话');

    // 检查是否正在生成内容
    if (isLoading || isStreaming) {
      Modal.confirm({
        title: '中止对话？',
        content: '新建会话或切换会话将中止生成，是否确认？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          // 停止生成
          stopGeneration();
          // 设置标记，表示这是用户主动新建会话
          isUserNewSession.current = true;
          // 清空消息列表，显示欢迎页面
          clearMessages();
          // 清空活跃会话 ID，下次发送消息时会创建新会话
          setActiveConversation(undefined);
          // 清空图谱数据
          setGraphData(null);
        }
      });
      return;
    }

    // 设置标记，表示这是用户主动新建会话
    isUserNewSession.current = true;
    // 清空消息列表，显示欢迎页面
    clearMessages();
    // 清空活跃会话 ID，下次发送消息时会创建新会话
    setActiveConversation(undefined);
    // 清空图谱数据
    setGraphData(null);
  };

  const handleSelectConversation = (id: string) => {
    console.log('[ChatPanel] 用户选择会话:', id);

    // 检查是否正在生成内容
    if (isLoading || isStreaming) {
      Modal.confirm({
        title: '中止对话？',
        content: '新建会话或切换会话将中止生成，是否确认？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          // 停止生成
          stopGeneration();
          // 清除新建会话标记
          isUserNewSession.current = false;
          setActiveConversation(id);
          // 加载历史消息
          loadHistoryMessages(id);
        }
      });
      return;
    }

    // 清除新建会话标记
    isUserNewSession.current = false;
    setActiveConversation(id);
    // 加载历史消息
    loadHistoryMessages(id);
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
    <div
      className="flex h-full flex-col border-r border-solid border-[#dfe2eb] bg-white"
      style={{ userSelect: 'text' }}
    >
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
            isLoadingHistory={isLoadingHistory}
            ontologyId={currentOntology?.id}
            onSend={handleSend}
            onStop={stopGeneration}
            uploaderProps={uploaderProps}
            GetFile={GetFile}
            GetAudioText={GetAudioText}
            onLocateNode={onLocateNode}
            onViewNode={onViewNode}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPanel;

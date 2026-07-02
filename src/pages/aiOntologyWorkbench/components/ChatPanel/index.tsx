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
  renameConversation as renameConversationApi,
  getAgentInfo,
  convertToPDF
} from '@/api/aiOntologyWorkbench/chat';
import SystemPromptSettings from '../SystemPromptSettings';
import PluginSettings from '../PluginSettings';
import SecuritySettings from '../SecuritySettings';
import {
  resolveDirectLlmRequestUrl,
  DIRECT_LLM_APP_ID
} from '../../services/directLlmChat';
import { useUserInfoStore } from '@/store/userInfoStore';
import { isDevAppId } from '@/utils/devChatStore';
import { isLocalLlmAppId } from '@/utils/devOntologyStore';
import type { OntologScene } from '@/types/ontologySceneApi';
import type { WorkbenchSendParams } from './WorkbenchChatSender';
import {
  formatUploadErrorMessage,
  UPLOAD_PROJECT_REQUIRED_HINT
} from '@/utils/projectFilesystem';

interface PromptItem {
  id: string;
  value: string;
}

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
  /** 确保本体 Agent 已创建（Agent SSE 模式使用） */
  ensureOntologyAgent?: (
    ontology: OntologScene,
    options?: { requireRealBackend?: boolean }
  ) => Promise<string | undefined>;
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
  onViewNode,
  ensureOntologyAgent
}) => {
  // 获取图谱状态管理和当前本体
  const {
    setGraphData,
    currentOntology,
    getActiveSystemPromptContent,
    loadSystemPromptForOntology,
    getPluginConfigPayload,
    loadPluginConfigForOntology,
    loadSecurityProtectionForOntology,
    checkInputSecurity
  } = useAIWorkbenchStore();

  const [systemPromptSettingsVisible, setSystemPromptSettingsVisible] =
    useState(false);
  const [pluginSettingsVisible, setPluginSettingsVisible] = useState(false);
  const [securitySettingsVisible, setSecuritySettingsVisible] = useState(false);

  // 推荐问题状态
  const [suggestedQuestions, setSuggestedQuestions] = useState<PromptItem[]>(
    []
  );
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [agentSending, setAgentSending] = useState(false);

  // 文件上传相关 - 启用自动取消机制
  const uploader = useMultipartUploader({ autoCancelOnUnmount: true });
  const getEffectiveProjectId = useUserInfoStore(
    (s) => s.getEffectiveProjectId
  );
  const getEffectiveFilesystemId = useUserInfoStore(
    (s) => s.getEffectiveFilesystemId
  );
  const effectiveProjectId =
    getEffectiveProjectId() ||
    (projectId != null ? String(projectId) : undefined);
  const effectiveFsId = getEffectiveFilesystemId();

  // 组件卸载时的清理工作
  useEffect(() => {
    return () => {
      // useMultipartUploader 内部已经有 autoCancelOnUnmount 机制
      // 会自动取消所有进行中的上传并清理资源
      console.log('[ChatPanel] 组件卸载，uploader 将自动清理资源');
    };
  }, []);

  // 使用 ref 记录是否是初始加载
  const isInitialMount = useRef(true);
  // 使用 ref 记录上一次的本体 ID
  const prevOntologyIdRef = useRef<number | string | undefined>(undefined);
  // 使用 ref 记录是否是用户主动新建会话
  const isUserNewSession = useRef(false);

  // 加载推荐问题
  const loadSuggestedQuestions = useCallback(async () => {
    if (!appId || String(appId) === DIRECT_LLM_APP_ID) {
      console.log('[ChatPanel] 直连模式，跳过加载推荐问题');
      setSuggestedQuestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      console.log('[ChatPanel] 开始加载推荐问题，appId:', appId);

      const response = await getAgentInfo({
        id: String(appId),
        status: 'Published'
      });

      if (response.code === 'Success' && response.data) {
        const questions =
          response.data.appConfig?.suggestedQuestions?.slice(0, 3) || [];
        console.log('[ChatPanel] 推荐问题加载成功:', questions);

        // 转换为 PromptItem 格式
        const prompts: PromptItem[] = questions.map(
          (q: string, index: number) => ({
            id: String(index + 1),
            value: q
          })
        );

        setSuggestedQuestions(prompts);
      } else {
        console.warn('[ChatPanel] 推荐问题加载失败:', response.message);
        setSuggestedQuestions([]);
      }
    } catch (error) {
      console.error('[ChatPanel] 加载推荐问题出错:', error);
      setSuggestedQuestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [appId]);

  // 延迟加载推荐问题，优先渲染聊天主界面
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) {
        void loadSuggestedQuestions();
      }
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(run, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timerId = window.setTimeout(run, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [loadSuggestedQuestions]);

  useEffect(() => {
    if (currentOntology?.id) {
      loadSystemPromptForOntology(currentOntology.id);
      loadPluginConfigForOntology(currentOntology.id);
      loadSecurityProtectionForOntology(currentOntology.id);
    }
  }, [
    currentOntology?.id,
    loadSystemPromptForOntology,
    loadPluginConfigForOntology,
    loadSecurityProtectionForOntology
  ]);

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
      useDirectLlmChat: true,
      getChatUrl: (appId: string) => getChatApiUrl(appId),
      buildDirectLlmMessages: ({ query }: { query: string }) => {
        const systemPrompt = getActiveSystemPromptContent();
        const messages: Array<{
          role: 'system' | 'user' | 'assistant';
          content: string;
        }> = [];

        if (systemPrompt?.trim()) {
          messages.push({ role: 'system', content: systemPrompt.trim() });
        }
        messages.push({ role: 'user', content: query });
        return messages;
      },
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
        useAgentSse?: boolean;
      }) => {
        const systemPrompt = getActiveSystemPromptContent();
        const pluginPayload = getPluginConfigPayload();
        const inputs: Record<string, unknown> = {
          ...(params.files ? { files: params.files } : {}),
          ...pluginPayload
        };

        if (systemPrompt) {
          inputs.system_prompt = systemPrompt;
          inputs.pre_prompt = systemPrompt;
        }

        const body: Record<string, unknown> = {
          responseMode: 'Streaming',
          status: params.useAgentSse
            ? 'Published'
            : params.source === 'published'
              ? 'Published'
              : 'Unpublished',
          channel: params.channel || 'Preview',
          appID: params.appId,
          projectID: params.projectId,
          enableDeepThink: params.enableDeepThink,
          query: params.query,
          inputs
        };

        if (params.appConfigId) {
          body.appConfigID = params.appConfigId;
        }
        if (params.conversationId) {
          body.conversationID = params.conversationId;
        }

        return body;
      }
    }),
    [getActiveSystemPromptContent, getPluginConfigPayload]
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
    stopGeneration: stopGenerationOriginal,
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
      if (!error.message?.includes('未收到模型回复')) {
        Message.error(error.message || '发送失败');
      }
    }
  });

  // 包装 stopGeneration，添加停止提示
  const stopGeneration = useCallback(() => {
    stopGenerationOriginal();
    Message.info('已停止生成');
  }, [stopGenerationOriginal]);

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
      accept:
        '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.csv,.wps,.ofd,.wav,.mp3,.ogg,.webm,.m4a,.amr,.mpga,.pcm,.bmp,.tif,.tiff',
      multiple: true,
      beforeUpload: () => {
        if (!effectiveProjectId) {
          Message.warning(UPLOAD_PROJECT_REQUIRED_HINT);
          return false;
        }
        return true;
      },
      data: () => ({
        projectID: effectiveProjectId,
        fsID: effectiveFsId,
        source: 'AIWorkbench',
        batch: new Date().getTime().toString()
      }),
      customRequest: (option: any) => {
        const { file, onProgress, onSuccess, onError } = option;

        if (!effectiveProjectId) {
          const err = new Error(UPLOAD_PROJECT_REQUIRED_HINT);
          Message.warning(UPLOAD_PROJECT_REQUIRED_HINT);
          onError?.(err, file);
          return;
        }

        // 用于存储文件的 objectURI
        let objectURI = '';

        uploader
          .uploadFile({
            file,
            uploadParams: {
              projectID: effectiveProjectId,
              fsID: effectiveFsId,
              isInternal: false,
              fileName: file.name
            },
            onCreated: (multipartInfo) => {
              console.log('[ChatPanel] 文件创建成功:', multipartInfo);
              // 保存 objectURI，用于后续获取预览 URL
              objectURI = multipartInfo.objectURI || '';
            },
            onProgress: (percent) => {
              onProgress?.(percent, file);
            },
            onSuccess: async (res) => {
              console.log('[ChatPanel] 文件上传成功:', res);

              // 调用 convertToPDF 获取预览 URL
              let presignedUrl = '';
              try {
                const uri = res?.data?.objectURI || objectURI;
                if (uri) {
                  console.log(
                    '[ChatPanel] 调用 convertToPDF 获取预览 URL:',
                    uri
                  );
                  const previewRes = await convertToPDF({ uri });

                  if (previewRes?.code === 'Success' && previewRes?.data?.url) {
                    presignedUrl = previewRes.data.url;
                    console.log('[ChatPanel] 获取预览 URL 成功:', presignedUrl);
                  } else {
                    console.warn(
                      '[ChatPanel] convertToPDF 返回异常:',
                      previewRes
                    );
                  }
                }
              } catch (err) {
                console.error('[ChatPanel] 获取预览 URL 失败:', err);
                // 即使获取预览 URL 失败，也要标记文件上传成功
              }

              // 构建响应数据 - 匹配 Sender 组件期望的格式
              const response = {
                code: 'Success',
                statusCode: 0,
                data: {
                  id: file.uid,
                  objectURI: res?.data?.objectURI || objectURI,
                  presignedUrl: presignedUrl,
                  name: file.name,
                  size: file.size,
                  mimeType: file.type
                }
              };

              console.log('[ChatPanel] 返回给 Upload 组件的响应:', response);
              console.log('[ChatPanel] presignedUrl 是否存在:', !!presignedUrl);

              // 调用 onSuccess，Arco Upload 会自动将 response 设置到 file.response
              onSuccess?.(response, file);
            },
            onError: (err) => {
              console.error('[ChatPanel] 文件上传失败:', err);
              const message = formatUploadErrorMessage(err);
              Message.error(message);
              onError?.(new Error(message), file);
            }
          })
          .catch((err) => {
            console.error('[ChatPanel] 文件上传异常:', err);
            const message = formatUploadErrorMessage(err);
            Message.error(message);
            onError?.(new Error(message), file);
          });
      }
      // 注意：不要设置 onChange，让 Sender 组件内部的 FileUploader 管理文件列表
    }),
    [uploader, effectiveProjectId, effectiveFsId]
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
    async (params: WorkbenchSendParams) => {
      const { text, files = [], enableDeepThink, useAgentSse = false } = params;

      console.log('[ChatPanel] 发送消息:', {
        text,
        files,
        enableDeepThink,
        useAgentSse,
        appId,
        deepseekUrl: useAgentSse ? undefined : resolveDirectLlmRequestUrl()
      });

      if (!text.trim()) {
        if (useAgentSse) {
          Message.warning('请先输入消息');
        }
        return;
      }

      const securityResult = checkInputSecurity(text);
      if (securityResult.matched) {
        Message.warning({
          content: securityResult.message,
          duration: 4000
        });

        const shouldBlock =
          useAIWorkbenchStore.getState().securityProtectionConfig
            ?.blockOnMatch !== false;

        if (shouldBlock) {
          return;
        }
      }

      // 清除新建会话标记（用户开始发送消息）
      isUserNewSession.current = false;

      // 过滤出已上传完成的文件，并转换为正确的格式
      const uploadedFiles = files
        .filter((file) => file.status === 'done')
        .map((file) => {
          const fileData = {
            id: file.response?.data?.id || file.uid,
            name: file.name || file.originFile?.name,
            size: file.size || file.originFile?.size,
            type: file.type || file.originFile?.type,
            url:
              file.response?.data?.presignedUrl ||
              file.response?.data?.objectURI ||
              '',
            objectURI: file.response?.data?.objectURI || ''
          };
          return fileData;
        });

      try {
        if (useAgentSse) {
          setAgentSending(true);

          let realAppId = currentOntology?.appID;
          const needsRealAgent =
            !realAppId ||
            isDevAppId(realAppId) ||
            isLocalLlmAppId(realAppId) ||
            realAppId === DIRECT_LLM_APP_ID;

          if (needsRealAgent) {
            if (!currentOntology || !ensureOntologyAgent) {
              Message.error('无法创建 Agent，请确认已选择本体');
              return;
            }
            Message.loading({ content: '正在初始化 Agent...', duration: 0 });
            realAppId = await ensureOntologyAgent(currentOntology, {
              requireRealBackend: true
            });
            Message.clear();
          }

          if (
            !realAppId ||
            isDevAppId(realAppId) ||
            isLocalLlmAppId(realAppId)
          ) {
            Message.error(
              'Agent 未就绪，请确认 CreateOntologyAgent 接口已成功返回 appID'
            );
            return;
          }

          await sendMessage({
            text,
            files: uploadedFiles,
            enableDeepThink,
            useAgentSse: true,
            agentAppId: realAppId
          });
          return;
        }

        await sendMessage({
          text,
          files: uploadedFiles,
          enableDeepThink,
          useAgentSse: false
        });
      } catch (error) {
        Message.clear();
        console.error('[ChatPanel] sendMessage 失败:', error);
        Message.error(
          error instanceof Error ? error.message : '发送失败，请查看 Console'
        );
      } finally {
        setAgentSending(false);
      }
    },
    [
      sendMessage,
      appId,
      currentOntology,
      ensureOntologyAgent,
      checkInputSecurity
    ]
  );

  const handlePromptSelect = (params: { id: string; text: string }) => {
    handleSend({
      text: params.text,
      enableDeepThink: true,
      useAgentSse: false
    });
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
        onOpenSystemPromptSettings={() => setSystemPromptSettingsVisible(true)}
        onOpenPluginSettings={() => setPluginSettingsVisible(true)}
        onOpenSecuritySettings={() => setSecuritySettingsVisible(true)}
      />
      <SystemPromptSettings
        visible={systemPromptSettingsVisible}
        onClose={() => setSystemPromptSettingsVisible(false)}
      />
      <PluginSettings
        visible={pluginSettingsVisible}
        onClose={() => setPluginSettingsVisible(false)}
      />
      <SecuritySettings
        visible={securitySettingsVisible}
        onClose={() => setSecuritySettingsVisible(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {showWelcome ? (
          <WelcomeView
            prompts={suggestedQuestions}
            onPromptSelect={handlePromptSelect}
            onSend={handleSend}
            isChatting={isLoading || isStreaming}
            agentSending={agentSending}
            uploaderProps={uploaderProps}
            GetFile={GetFile}
            GetAudioText={GetAudioText}
          />
        ) : (
          <ChatView
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            agentSending={agentSending}
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

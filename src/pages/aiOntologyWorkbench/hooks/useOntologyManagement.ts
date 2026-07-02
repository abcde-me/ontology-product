import { useState, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { useAIWorkbenchStore } from '../store';
import {
  listOntologyModel,
  createOntologyModel
} from '@/api/ontologySceneLibrary/ontologyScene';
import { createOntologyAgent } from '@/api/aiOntologyWorkbench/chat';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevAppId } from '@/utils/devChatStore';
import { DIRECT_LLM_APP_ID } from '../services/directLlmChat';
import {
  devClearOntologyAgentId,
  isLocalLlmAppId
} from '@/utils/devOntologyStore';
import type { SceneFormData } from '@/pages/ontologyScene/modules/list/components/SceneModal';
import type { OntologScene } from '@/types/ontologySceneApi';

/**
 * 本体管理 Hook
 */
export const useOntologyManagement = () => {
  const { setOntologyList, setOntologyListLoading, setCurrentOntology } =
    useAIWorkbenchStore();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const loadingRef = useRef(false);
  const pendingReloadRef = useRef<{
    pageNo: number;
    pageSize: number;
    autoSelectFirst: boolean;
  } | null>(null);
  const creatingAgentPromisesRef = useRef(
    new Map<number, Promise<string | undefined>>()
  );

  /**
   * 加载本体列表
   * @param pageNo 页码
   * @param pageSize 每页数量
   * @param autoSelectFirst 是否自动选择第一个本体（默认 true）
   */
  const loadOntologyList = useCallback(
    async (pageNo = 1, pageSize = 20, autoSelectFirst = true) => {
      if (loadingRef.current) {
        console.log('[useOntologyManagement] 正在加载中，排队等待下一次刷新');
        pendingReloadRef.current = { pageNo, pageSize, autoSelectFirst };
        return { list: [], total: 0, hasMore: false };
      }

      loadingRef.current = true;
      const hasCachedList =
        pageNo === 1 && useAIWorkbenchStore.getState().ontologyList.length > 0;
      if (!hasCachedList) {
        setOntologyListLoading(true);
      }

      try {
        const res = await listOntologyModel({
          pageNo,
          pageSize,
          order: 'desc',
          orderBy: 'create_time'
        });
        if (isOntologyApiSuccess(res) && res.data) {
          const list = res.data.result || [];

          if (pageNo === 1) {
            setOntologyList(list);
            const currentOntology =
              useAIWorkbenchStore.getState().currentOntology;
            if (list.length > 0 && !currentOntology && autoSelectFirst) {
              console.log('[useOntologyManagement] 设置默认本体:', list[0].id);
              setCurrentOntology(list[0]);
            }
          } else {
            useAIWorkbenchStore.setState((state) => ({
              ontologyList: [...state.ontologyList, ...list]
            }));
          }

          return {
            list,
            total: res.data.totalCount || 0,
            hasMore: list.length === pageSize
          };
        }
        return { list: [], total: 0, hasMore: false };
      } catch (error) {
        console.error('加载本体列表失败:', error);
        Message.error('加载本体列表失败');
        return { list: [], total: 0, hasMore: false };
      } finally {
        loadingRef.current = false;
        setOntologyListLoading(false);

        const pending = pendingReloadRef.current;
        if (pending) {
          pendingReloadRef.current = null;
          await loadOntologyList(
            pending.pageNo,
            pending.pageSize,
            pending.autoSelectFirst
          );
        }
      }
    },
    [setOntologyList, setOntologyListLoading, setCurrentOntology]
  );

  const isPlaceholderAppId = (appID?: string) =>
    !appID ||
    isDevAppId(appID) ||
    isLocalLlmAppId(appID) ||
    appID === DIRECT_LLM_APP_ID;

  /**
   * 检查并创建本体 Agent（如果需要）
   */
  const ensureOntologyAgent = useCallback(
    async (
      ontology: OntologScene,
      options?: { requireRealBackend?: boolean }
    ): Promise<string | undefined> => {
      const requireRealBackend = options?.requireRealBackend ?? false;

      if (ontology.appID && !isPlaceholderAppId(ontology.appID)) {
        console.log('[useOntologyManagement] 本体已有 appID:', ontology.appID);
        return ontology.appID;
      }

      const ontologyId = ontology.id!;
      const inFlight = creatingAgentPromisesRef.current.get(ontologyId);
      if (inFlight) {
        console.log(
          '[useOntologyManagement] 等待进行中的 Agent 创建:',
          ontologyId
        );
        return inFlight;
      }

      const createTask = (async (): Promise<string | undefined> => {
        if (
          ontology.appID &&
          (isDevAppId(ontology.appID) ||
            (requireRealBackend && isLocalLlmAppId(ontology.appID)))
        ) {
          console.log(
            '[useOntologyManagement] 检测到占位 appID，重新创建真实 Agent...',
            ontology.appID
          );
          devClearOntologyAgentId(ontologyId);
        }

        console.log(
          '[useOntologyManagement] 本体没有 appID，开始创建 Agent...',
          {
            ontologyId,
            ontologyName: ontology.name,
            requireRealBackend
          }
        );

        try {
          const res = await createOntologyAgent({
            ontologyModelId: ontologyId,
            skipDevFallback: requireRealBackend
          });

          console.log('[useOntologyManagement] createOntologyAgent 响应:', res);

          if (isOntologyApiSuccess(res) && res.data?.appID) {
            const appID = res.data.appID;
            console.log(
              '[useOntologyManagement] Agent 创建成功，appID:',
              appID
            );

            await loadOntologyList(1, 20, false);
            return appID;
          }

          console.error('[useOntologyManagement] 创建 Agent 失败:', {
            status: res.status,
            code: res.code,
            message: res.message,
            data: res.data
          });
          Message.error(res.message || '创建 Agent 失败');
          return undefined;
        } catch (error) {
          console.error('[useOntologyManagement] 创建 Agent 异常:', error);
          Message.error('创建 Agent 失败');
          return undefined;
        }
      })();

      creatingAgentPromisesRef.current.set(ontologyId, createTask);

      try {
        return await createTask;
      } finally {
        creatingAgentPromisesRef.current.delete(ontologyId);
      }
    },
    [loadOntologyList]
  );

  /**
   * 创建本体
   */
  const handleCreateOntology = useCallback(
    async (data: SceneFormData) => {
      setCreateLoading(true);
      try {
        const res = await createOntologyModel({
          name: data.name,
          description: data.description,
          icon: data.icon || '',
          tagIdList: [] // 默认空数组
        });
        if (isOntologyApiSuccess(res)) {
          Message.success('创建成功');
          setCreateModalVisible(false);

          // 重新加载列表
          const result = await loadOntologyList();

          // 如果创建成功且返回了数据，将新创建的本体设置为当前本体
          if (result.list.length > 0) {
            // 新创建的本体应该在列表的第一个位置（按创建时间倒序）
            const newOntology =
              result.list.find((item) => item.name === data.name) ||
              result.list[0];
            console.log(
              '[useOntologyManagement] 创建成功，设置新本体为当前本体:',
              newOntology
            );
            setCurrentOntology(newOntology);

            // 清空图谱数据
            useAIWorkbenchStore.getState().setGraphData(null);
            console.log('[useOntologyManagement] 已清空图谱数据');
          }
        } else {
          Message.error(res.message || '创建失败');
        }
      } catch (error) {
        console.error('创建本体失败:', error);
        Message.error('创建失败');
      } finally {
        setCreateLoading(false);
      }
    },
    [loadOntologyList, setCurrentOntology]
  );

  /**
   * 打开创建弹窗
   */
  const openCreateModal = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  /**
   * 关闭创建弹窗
   */
  const closeCreateModal = useCallback(() => {
    setCreateModalVisible(false);
  }, []);

  return {
    createModalVisible,
    createLoading,
    loadOntologyList,
    handleCreateOntology,
    openCreateModal,
    closeCreateModal,
    ensureOntologyAgent
  };
};

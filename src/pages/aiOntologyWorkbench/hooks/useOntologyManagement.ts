import { useState, useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { useAIWorkbenchStore } from '../store';
import {
  listOntologyModel,
  createOntologyModel
} from '@/api/ontologySceneLibrary/ontologyScene';
import { createOntologyAgent } from '@/api/aiOntologyWorkbench/chat';
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

  // 正在创建 Agent 的本体 ID 集合（防止重复调用）
  const creatingAgentIds = useState(new Set<number>())[0];

  /**
   * 加载本体列表
   * @param pageNo 页码
   * @param pageSize 每页数量
   * @param autoSelectFirst 是否自动选择第一个本体（默认 true）
   */
  const loadOntologyList = useCallback(
    async (pageNo = 1, pageSize = 20, autoSelectFirst = true) => {
      // 如果正在加载中，跳过
      const currentLoading = useAIWorkbenchStore.getState().ontologyListLoading;
      if (currentLoading) {
        console.log('[useOntologyManagement] 正在加载中，跳过重复调用');
        return { list: [], total: 0, hasMore: false };
      }

      setOntologyListLoading(true);
      try {
        const res = await listOntologyModel({
          pageNo,
          pageSize,
          order: 'desc',
          orderBy: 'create_time'
        });
        if (res.status === 200 && res.code === '' && res.data) {
          const list = res.data.result || [];

          // 如果是第一页，直接设置列表
          if (pageNo === 1) {
            setOntologyList(list);
            // 只在没有当前本体且 autoSelectFirst 为 true 时，才设置默认选中第一个
            const currentOntology =
              useAIWorkbenchStore.getState().currentOntology;
            if (list.length > 0 && !currentOntology && autoSelectFirst) {
              console.log('[useOntologyManagement] 设置默认本体:', list[0].id);
              setCurrentOntology(list[0]);
            }
          } else {
            // 如果是后续页，追加到列表
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
        setOntologyListLoading(false);
      }
    },
    [setOntologyList, setOntologyListLoading, setCurrentOntology]
  );

  /**
   * 检查并创建本体 Agent（如果需要）
   */
  const ensureOntologyAgent = useCallback(
    async (ontology: OntologScene): Promise<string | undefined> => {
      // 如果已经有 appID，直接返回
      if (ontology.appID) {
        console.log('[useOntologyManagement] 本体已有 appID:', ontology.appID);
        return ontology.appID;
      }

      // 如果正在创建中，跳过
      if (creatingAgentIds.has(ontology.id!)) {
        console.log(
          '[useOntologyManagement] 本体 Agent 正在创建中，跳过重复调用:',
          ontology.id
        );
        return undefined;
      }

      // 如果没有 appID，调用接口创建
      console.log('[useOntologyManagement] 本体没有 appID，开始创建 Agent...', {
        ontologyId: ontology.id,
        ontologyName: ontology.name
      });

      // 标记为正在创建
      creatingAgentIds.add(ontology.id!);

      try {
        const res = await createOntologyAgent({
          ontologyModelId: ontology.id!
        });

        console.log('[useOntologyManagement] createOntologyAgent 响应:', res);

        if (res.status === 200 && res.code === '' && res.data?.appID) {
          const appID = res.data.appID;
          console.log('[useOntologyManagement] Agent 创建成功，appID:', appID);

          // 刷新本体列表以获取最新的 appID（不自动选择第一个）
          console.log('[useOntologyManagement] 开始刷新本体列表...');
          await loadOntologyList(1, 20, false);
          console.log('[useOntologyManagement] 本体列表刷新完成');

          return appID;
        } else {
          console.error('[useOntologyManagement] 创建 Agent 失败:', {
            status: res.status,
            code: res.code,
            message: res.message,
            data: res.data
          });
          Message.error(res.message || '创建 Agent 失败');
          return undefined;
        }
      } catch (error) {
        console.error('[useOntologyManagement] 创建 Agent 异常:', error);
        Message.error('创建 Agent 失败');
        return undefined;
      } finally {
        // 移除创建标记
        creatingAgentIds.delete(ontology.id!);
      }
    },
    [loadOntologyList, creatingAgentIds]
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
        if (res.status === 200 && res.code === '') {
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

import { useState, useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { useAIWorkbenchStore } from '../store';
import {
  listOntologyModel,
  createOntologyModel
} from '@/api/ontologySceneLibrary/ontologyScene';
import type { SceneFormData } from '@/pages/ontologyScene/modules/list/components/SceneModal';

/**
 * 本体管理 Hook
 */
export const useOntologyManagement = () => {
  const { setOntologyList, setOntologyListLoading, setCurrentOntology } =
    useAIWorkbenchStore();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  /**
   * 加载本体列表
   */
  const loadOntologyList = useCallback(
    async (pageNo = 1, pageSize = 20) => {
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
            // 只在没有当前本体时，才设置默认选中第一个
            const currentOntology =
              useAIWorkbenchStore.getState().currentOntology;
            if (list.length > 0 && !currentOntology) {
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
    closeCreateModal
  };
};

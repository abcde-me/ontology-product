import { useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { useAIWorkbenchStore } from '../store';
import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';

/**
 * 图谱数据管理 Hook
 */
export const useGraphData = () => {
  const { setGraphData, setGraphLoading } = useAIWorkbenchStore();

  /**
   * 加载图谱数据
   */
  const loadGraphData = useCallback(
    async (sceneId: string | number) => {
      setGraphLoading(true);
      try {
        const res = await getOntologyTopology({
          id: Number(sceneId)
        });

        if (res.status === 200 && res.code === '' && res.data) {
          setGraphData(res.data);
        } else {
          Message.error(res.message || '加载图谱数据失败');
          setGraphData(null);
        }
      } catch (error) {
        console.error('加载图谱数据失败:', error);
        Message.error('加载图谱数据失败');
        setGraphData(null);
      } finally {
        setGraphLoading(false);
      }
    },
    [setGraphData, setGraphLoading]
  );

  /**
   * 刷新图谱数据
   */
  const refreshGraphData = useCallback(
    async (sceneId: string | number) => {
      await loadGraphData(sceneId);
    },
    [loadGraphData]
  );

  return {
    loadGraphData,
    refreshGraphData
  };
};

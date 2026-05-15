import { useState, useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { getActionListByObjectType } from '@/api/ontologySceneLibrary/ontologyAction';
import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

/**
 * 行为数据管理 Hook
 */
export const useBehaviorData = () => {
  const [loading, setLoading] = useState(false);
  const [behaviorList, setBehaviorList] = useState<BehaviorActionItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * 加载行为列表
   */
  const loadBehaviorList = useCallback(
    async (objectTypeId: number, ontologyModelID: number) => {
      setLoading(true);
      try {
        const res = await getActionListByObjectType({
          objectTypeId,
          ontologyModelID,
          pageNum: 1,
          pageSize: 100 // 加载所有行为
        });

        if (res.status === 200 && res.code === '' && res.data) {
          setBehaviorList(res.data.result || []);
          setTotalCount(res.data.totalCount || 0);
          return {
            list: res.data.result || [],
            total: res.data.totalCount || 0
          };
        } else {
          Message.error(res.message || '加载行为列表失败');
          return { list: [], total: 0 };
        }
      } catch (error) {
        console.error('加载行为列表失败:', error);
        Message.error('加载行为列表失败');
        return { list: [], total: 0 };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    behaviorList,
    totalCount,
    loadBehaviorList
  };
};

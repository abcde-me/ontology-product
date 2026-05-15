import React, { useRef } from 'react';
import { Spin } from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';
import { useInfiniteScroll } from 'ahooks';
import { useAIWorkbenchStore } from '@/pages/aiOntologyWorkbench/store';
import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import { getActionListByObjectType } from '@/api/ontologySceneLibrary/ontologyAction';

interface BehaviorTooltipProps {
  objectTypeId: number;
  ontologyModelID: number;
  totalCount: number;
  onBehaviorClick: (behavior: BehaviorActionItem) => void;
}

/**
 * 行为 Tooltip 组件
 * - 无行为：显示 "暂无行为，去创建"
 * - 有行为：显示行为列表，支持滚动加载
 */
const BehaviorTooltip: React.FC<BehaviorTooltipProps> = ({
  objectTypeId,
  ontologyModelID,
  totalCount,
  onBehaviorClick
}) => {
  const history = useHistory();
  const { currentOntology } = useAIWorkbenchStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /**
   * 加载行为列表数据
   */
  const loadBehaviorData = async (
    d: { list: BehaviorActionItem[] } | undefined
  ) => {
    const currentPage = d ? Math.floor(d.list.length / 20) + 1 : 1;

    const res = await getActionListByObjectType({
      objectTypeId,
      ontologyModelID,
      pageNum: currentPage,
      pageSize: 20
    });

    if (res.status === 200 && res.code === '' && res.data) {
      const newList = res.data.result || [];
      const list = d ? [...d.list, ...newList] : newList;

      return {
        list,
        hasMore: newList.length === 20
      };
    }

    return {
      list: d?.list || [],
      hasMore: false
    };
  };

  /**
   * 使用无限滚动
   */
  const { data, loading, loadingMore } = useInfiniteScroll(loadBehaviorData, {
    target: scrollContainerRef,
    isNoMore: (d) => !d?.hasMore,
    manual: false
  });

  const behaviorList = data?.list || [];

  /**
   * 跳转到创建行为页面
   */
  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentOntology?.id) {
      history.push(
        `/tenant/compute/onto/ontologyScene/detail/${currentOntology.id}/behaviorActions/create/_NEW_`
      );
    }
  };

  /**
   * 点击行为
   */
  const handleBehaviorClick = (
    e: React.MouseEvent,
    behavior: BehaviorActionItem
  ) => {
    e.stopPropagation();
    onBehaviorClick(behavior);
  };

  // 无行为状态
  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center p-[12px]">
        <p className="text-[14px] leading-[22px] text-[var(--color-text-2)]">
          暂无行为，
          <span
            className="cursor-pointer text-[#184ff2] hover:underline"
            onClick={handleCreateClick}
          >
            去创建
          </span>
        </p>
      </div>
    );
  }

  // 有行为状态
  return (
    <div className="flex w-[240px] flex-col">
      <div
        ref={scrollContainerRef}
        className="max-h-[400px] overflow-y-auto p-[8px]"
      >
        {behaviorList.map((behavior) => (
          <div
            key={behavior.id}
            className="cursor-pointer rounded-[4px] px-[12px] py-[8px] transition-colors hover:bg-[#f7f8fa]"
            onClick={(e) => handleBehaviorClick(e, behavior)}
          >
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] leading-[22px] text-[var(--color-text-1)]">
              {behavior.name || '-'}
            </div>
          </div>
        ))}
        {(loading || loadingMore) && (
          <div className="flex items-center justify-center py-[8px]">
            <Spin size={16} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorTooltip;

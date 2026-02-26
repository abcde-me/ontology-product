import React, { useEffect, useRef, useCallback } from 'react';
import { Spin, Message } from '@arco-design/web-react';
import { useParams } from 'react-router-dom';
import { BehaviorCardList } from '../BehaviorCardList';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import BehaviorCardSvg from '@/assets/benti/behaviorCard.svg';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

interface LeftPanelProps {
  onViewDetail?: (data: BehaviorActionItem) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onViewDetail }) => {
  const { id: OSId } = useParams<{ id: string; moduleType: string }>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingBehaviors = useUIStore((state) => state.loadingBehaviors);
  const setLoadingBehaviors = useUIStore((state) => state.setLoadingBehaviors);
  const behaviorList = useBusinessStore((state) => state.behaviorList);
  const hasMore = useBusinessStore((state) => state.hasMore);
  const fetchBehaviors = useBusinessStore((state) => state.fetchBehaviors);
  const loadMoreBehaviors = useBusinessStore(
    (state) => state.loadMoreBehaviors
  );

  // 加载初始行为列表
  useEffect(() => {
    const loadBehaviors = async () => {
      if (!OSId) return;

      setLoadingBehaviors(true);
      try {
        await fetchBehaviors({ ontologyModelID: +OSId, reset: true });
      } catch (error) {
        Message.error('获取行为列表失败，请稍后重试');
      } finally {
        setLoadingBehaviors(false);
      }
    };

    loadBehaviors();
  }, [OSId, fetchBehaviors, setLoadingBehaviors]);

  // 滚动加载更多
  const handleScroll = useCallback(async () => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || loadingBehaviors) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // 当滚动到距离底部 100px 时触发加载
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setLoadingBehaviors(true);
      try {
        await loadMoreBehaviors({ ontologyModelID: +OSId });
      } catch (error) {
        Message.error('加载更多失败，请稍后重试');
      } finally {
        setLoadingBehaviors(false);
      }
    }
  }, [hasMore, loadingBehaviors, loadMoreBehaviors, OSId, setLoadingBehaviors]);

  // 添加滚动监听
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-14 flex-shrink-0 items-center gap-1 border-b border-[#e5e6eb] px-6">
        <BehaviorCardSvg className="h-4 w-4" />
        <span className="text-base font-medium text-[#000]">行为卡片</span>
      </div>
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden"
      >
        <BehaviorCardList
          behaviors={behaviorList}
          onViewDetail={onViewDetail}
        />
        {loadingBehaviors && (
          <div className="flex items-center justify-center py-4">
            <Spin />
          </div>
        )}
      </div>
    </div>
  );
};

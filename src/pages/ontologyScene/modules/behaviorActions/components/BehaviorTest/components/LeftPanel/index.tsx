import React, { useEffect } from 'react';
import { Spin, Message } from '@arco-design/web-react';
import { BehaviorCardList } from '../BehaviorCardList';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import BehaviorCardSvg from '@/assets/benti/behaviorCard.svg';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

interface LeftPanelProps {
  onViewDetail?: (data: BehaviorActionItem) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onViewDetail }) => {
  const loadingBehaviors = useUIStore((state) => state.loadingBehaviors);
  const setLoadingBehaviors = useUIStore((state) => state.setLoadingBehaviors);
  const behaviorList = useBusinessStore((state) => state.behaviorList);
  const fetchBehaviors = useBusinessStore((state) => state.fetchBehaviors);

  // 加载行为列表
  useEffect(() => {
    const loadBehaviors = async () => {
      setLoadingBehaviors(true);
      try {
        await fetchBehaviors();
      } catch (error) {
        Message.error('获取行为列表失败，请稍后重试');
      } finally {
        setLoadingBehaviors(false);
      }
    };

    loadBehaviors();
  }, [fetchBehaviors, setLoadingBehaviors]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-14 flex-shrink-0 items-center gap-1 border-b border-[#e5e6eb] px-6">
        <BehaviorCardSvg className="h-4 w-4" />
        <span className="text-base font-medium text-[#000]">行为卡片</span>
      </div>
      <div className="scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden">
        <Spin loading={loadingBehaviors} style={{ width: '100%' }}>
          <BehaviorCardList
            behaviors={behaviorList}
            onViewDetail={onViewDetail}
          />
        </Spin>
      </div>
    </div>
  );
};

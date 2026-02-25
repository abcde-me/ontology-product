import React from 'react';
import { NoDataCard } from '@ceai-front/arco-material';
import { BehaviorCard } from '../BehaviorCard';
import { BehaviorItem } from '../../types';
import { useBusinessStore } from '../../store/businessStore';
import { useUIStore } from '../../store/uiStore';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

interface BehaviorCardListProps {
  behaviors: BehaviorItem[];
  onViewDetail?: (data: BehaviorActionItem) => void;
}

export const BehaviorCardList: React.FC<BehaviorCardListProps> = ({
  behaviors,
  onViewDetail
}) => {
  const addNode = useBusinessStore((state) => state.addNode);
  const selectNode = useUIStore((state) => state.selectNode);

  const handleCardClick = (behavior: BehaviorItem) => {
    const nodeId = addNode(behavior);
    selectNode(nodeId);
  };

  const handleViewDetail = (behavior: BehaviorItem) => {
    // 调用父组件传递的回调
    onViewDetail?.(behavior as BehaviorActionItem);
  };

  if (behaviors.length === 0) {
    return (
      <div className="flex items-center justify-center px-5 pt-32">
        <NoDataCard title="暂无行为数据" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {behaviors.map((behavior) => (
        <BehaviorCard
          key={behavior.id}
          behavior={behavior}
          onClick={handleCardClick}
          onViewDetail={handleViewDetail}
        />
      ))}
    </div>
  );
};

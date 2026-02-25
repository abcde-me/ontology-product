import React from 'react';
import { NoDataCard } from '@ceai-front/arco-material';
import { BehaviorCard } from '../BehaviorCard';
import { BehaviorItem } from '../../types';
import { useBusinessStore } from '../../store/businessStore';
import { useUIStore } from '../../store/uiStore';

interface BehaviorCardListProps {
  behaviors: BehaviorItem[];
}

export const BehaviorCardList: React.FC<BehaviorCardListProps> = ({
  behaviors
}) => {
  const addNode = useBusinessStore((state) => state.addNode);
  const setCurrentBehaviorDetail = useBusinessStore(
    (state) => state.setCurrentBehaviorDetail
  );
  const selectNode = useUIStore((state) => state.selectNode);
  const setBehaviorDetailVisible = useUIStore(
    (state) => state.setBehaviorDetailVisible
  );

  const handleCardClick = (behavior: BehaviorItem) => {
    const nodeId = addNode(behavior);
    selectNode(nodeId);
  };

  const handleViewDetail = (behavior: BehaviorItem) => {
    setCurrentBehaviorDetail(behavior);
    setBehaviorDetailVisible(true);
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

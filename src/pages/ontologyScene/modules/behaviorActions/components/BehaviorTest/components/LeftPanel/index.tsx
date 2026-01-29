import React from 'react';
import { Spin } from '@arco-design/web-react';
import { BehaviorCardList } from '../BehaviorCardList';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';

export const LeftPanel: React.FC = () => {
  const loadingBehaviors = useUIStore((state) => state.loadingBehaviors);
  const behaviorList = useBusinessStore((state) => state.behaviorList);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-14 flex-shrink-0 items-center border-b border-[#e5e6eb] px-4">
        <span className="text-sm font-medium text-[#1d2129]">行为卡片</span>
      </div>
      <div className="scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden">
        <Spin loading={loadingBehaviors} style={{ width: '100%' }}>
          <BehaviorCardList behaviors={behaviorList} />
        </Spin>
      </div>
    </div>
  );
};

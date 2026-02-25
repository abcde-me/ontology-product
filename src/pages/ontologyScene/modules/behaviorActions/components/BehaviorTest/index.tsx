import React from 'react';
import { TestLayout } from './components/TestLayout';
import { LeftPanel } from './components/LeftPanel';
import { MiddlePanel } from './components/MiddlePanel';
import { RightPanel } from './components/RightPanel';
import { TestHistoryDrawer } from './components/TestHistoryDrawer';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

interface BehaviorTestProps {
  onViewDetail?: (data: BehaviorActionItem) => void;
}

export const BehaviorTest: React.FC<BehaviorTestProps> = ({ onViewDetail }) => {
  return (
    <>
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <TestLayout
          leftPanel={<LeftPanel onViewDetail={onViewDetail} />}
          middlePanel={<MiddlePanel />}
          rightPanel={<RightPanel />}
        />
      </div>
      {/* 测试历史抽屉 */}
      <TestHistoryDrawer />
    </>
  );
};

export default BehaviorTest;

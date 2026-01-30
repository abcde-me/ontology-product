import React, { useEffect } from 'react';
import { Message } from '@arco-design/web-react';
import { EmptyState } from './components/EmptyState';
import { TestLayout } from './components/TestLayout';
import { LeftPanel } from './components/LeftPanel';
import { MiddlePanel } from './components/MiddlePanel';
import { RightPanel } from './components/RightPanel';
import { BehaviorDetailDrawer } from './components/BehaviorDetailDrawer';
import { TestHistoryDrawer } from './components/TestHistoryDrawer';
import { useUIStore } from './store/uiStore';
import { useBusinessStore } from './store/businessStore';

export const BehaviorTest: React.FC = () => {
  const isEmpty = useUIStore((state) => state.isEmpty);
  const setIsEmpty = useUIStore((state) => state.setIsEmpty);

  const behaviorList = useBusinessStore((state) => state.behaviorList);

  // 监听行为列表变化，更新空状态（只有行为列表为空时才显示空状态）
  useEffect(() => {
    setIsEmpty(behaviorList.length === 0);
  }, [behaviorList.length, setIsEmpty]);

  // 创建行为按钮点击
  const handleCreateBehavior = () => {
    setIsEmpty(false);
  };

  // 渲染空状态或三列布局
  if (isEmpty) {
    return <EmptyState onCreateBehavior={handleCreateBehavior} />;
  }

  return (
    <>
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <TestLayout
          leftPanel={<LeftPanel />}
          middlePanel={<MiddlePanel />}
          rightPanel={<RightPanel />}
        />
      </div>
      {/* 行为详情抽屉 */}
      <BehaviorDetailDrawer />
      {/* 测试历史抽屉 */}
      <TestHistoryDrawer />
    </>
  );
};

export default BehaviorTest;

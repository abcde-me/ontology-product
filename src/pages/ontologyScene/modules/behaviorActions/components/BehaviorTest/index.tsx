import React, { useEffect } from 'react';
import { TestLayout } from './components/TestLayout';
import { LeftPanel } from './components/LeftPanel';
import { MiddlePanel } from './components/MiddlePanel';
import { RightPanel } from './components/RightPanel';
import { TestHistoryDrawer } from './components/TestHistoryDrawer';
import { TestResultDrawer } from './components/TestResultDrawer';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import { useUIStore } from './store/uiStore';
import { useBusinessStore } from './store/businessStore';

interface BehaviorTestProps {
  onViewDetail?: (data: BehaviorActionItem) => void;
}

export const BehaviorTest: React.FC<BehaviorTestProps> = ({ onViewDetail }) => {
  const testResultVisible = useUIStore((state) => state.testResultVisible);
  const setTestResultVisible = useUIStore(
    (state) => state.setTestResultVisible
  );
  const isTestRunning = useUIStore((state) => state.isTestRunning);
  const testResults = useBusinessStore((state) => state.testResults);

  // 组件卸载时关闭抽屉
  useEffect(() => {
    return () => {
      setTestResultVisible(false);
    };
  }, [setTestResultVisible]);

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
      {/* 测试结果抽屉 */}
      <TestResultDrawer
        visible={testResultVisible}
        onClose={() => setTestResultVisible(false)}
        isRunning={isTestRunning}
        results={testResults}
      />
    </>
  );
};

export default BehaviorTest;

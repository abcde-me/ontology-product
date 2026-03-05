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
import useTestFunction from '@/pages/ontologyScene/hooks/useTestFunction';
import { useParams } from 'react-router-dom';

interface BehaviorTestProps {
  onViewDetail?: (data: BehaviorActionItem) => void;
}

export const BehaviorTest: React.FC<BehaviorTestProps> = ({ onViewDetail }) => {
  const { id: ontologyModelID } = useParams<{ id: string }>();
  const testResultVisible = useUIStore((state) => state.testResultVisible);
  const setTestResultVisible = useUIStore(
    (state) => state.setTestResultVisible
  );
  const selectNode = useUIStore((state) => state.selectNode);
  const clearOrchestration = useBusinessStore(
    (state) => state.clearOrchestration
  );

  // 在父组件中使用 useTestFunction，这样所有子组件共享同一个实例
  const testFunctionHook = useTestFunction();

  // 当路由参数（本体ID）变化时，清空编排
  useEffect(() => {
    clearOrchestration();
    selectNode(null);
    setTestResultVisible(false);
  }, [ontologyModelID, clearOrchestration, selectNode, setTestResultVisible]);

  // 组件卸载时清空编排和关闭抽屉
  useEffect(() => {
    return () => {
      clearOrchestration();
      selectNode(null);
      setTestResultVisible(false);
    };
  }, [clearOrchestration, selectNode, setTestResultVisible]);

  return (
    <>
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <TestLayout
          leftPanel={<LeftPanel onViewDetail={onViewDetail} />}
          middlePanel={<MiddlePanel testFunctionHook={testFunctionHook} />}
          rightPanel={<RightPanel testFunctionHook={testFunctionHook} />}
        />
      </div>
      {/* 测试历史抽屉 */}
      <TestHistoryDrawer />
      {/* 测试结果抽屉 */}
      <TestResultDrawer
        visible={testResultVisible}
        onClose={() => setTestResultVisible(false)}
        testFunctionHook={testFunctionHook}
      />
    </>
  );
};

export default BehaviorTest;

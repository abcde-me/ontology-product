import React from 'react';
import { Button, Tooltip, Modal, Message } from '@arco-design/web-react';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import BehaviorScheduleSvg from '@/assets/benti/behaviorSchedule.svg';
import BehaviorRefreshSvg from '@/assets/benti/behaviorRefresh.svg';
import BehaviorTestSvg from '@/assets/benti/behaviorTest.svg';

export const CanvasHeader: React.FC = () => {
  const isTestRunning = useUIStore((state) => state.isTestRunning);
  const setIsTestRunning = useUIStore((state) => state.setIsTestRunning);

  const canExecuteTest = useBusinessStore((state) => state.canExecuteTest);
  const executeTest = useBusinessStore((state) => state.executeTest);
  const clearOrchestration = useBusinessStore(
    (state) => state.clearOrchestration
  );
  const selectNode = useUIStore((state) => state.selectNode);

  const handleRefresh = () => {
    Modal.confirm({
      title: '确认刷新',
      content: '刷新后将清空当前编排和配置，确认继续吗？',
      onOk: () => {
        clearOrchestration();
        selectNode(null);
        Message.success('已清空编排');
      }
    });
  };

  const handleTest = async () => {
    setIsTestRunning(true);
    try {
      await executeTest();
      Message.success('测试执行成功');
    } catch (error) {
      Message.error('测试执行失败，请稍后重试');
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e5e6eb]  px-6">
      <div className="flex items-center gap-1">
        <BehaviorScheduleSvg className="h-4 w-4" />
        <div className="text-base font-medium text-[#000]">行为编排</div>
      </div>
      <div className="flex items-center gap-3">
        <Tooltip content="刷新">
          <BehaviorRefreshSvg
            className="cursor-pointer transition-colors duration-200 hover:opacity-70"
            onClick={handleRefresh}
          />
        </Tooltip>
        <div className="h-4 w-px bg-[#e5e6eb]" />
        <Button
          type="primary"
          style={{
            backgroundColor: '#184FF2',
            borderColor: '#184FF2',
            color: '#fff'
          }}
          className="flex items-center justify-center"
          icon={<BehaviorTestSvg style={{ stroke: 'white' }} />}
          onClick={handleTest}
          disabled={!canExecuteTest()}
          loading={isTestRunning}
        >
          测试
        </Button>
      </div>
    </div>
  );
};

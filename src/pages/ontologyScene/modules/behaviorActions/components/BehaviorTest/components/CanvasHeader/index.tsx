import React from 'react';
import { Button, Tooltip, Modal, Message } from '@arco-design/web-react';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import BehaviorScheduleSvg from '@/assets/benti/behaviorSchedule.svg';
import BehaviorRefreshSvg from '@/assets/benti/behaviorRefresh.svg';

export const CanvasHeader: React.FC = () => {
  const isTestRunning = useUIStore((state) => state.isTestRunning);
  const setIsTestRunning = useUIStore((state) => state.setIsTestRunning);
  const setTestResultVisible = useUIStore(
    (state) => state.setTestResultVisible
  );

  const orchestrationNodes = useBusinessStore(
    (state) => state.orchestrationNodes
  );
  const canExecute = useBusinessStore((state) => state.canExecuteTest());
  const executeTest = useBusinessStore((state) => state.executeTest);
  const clearOrchestration = useBusinessStore(
    (state) => state.clearOrchestration
  );
  const selectNode = useUIStore((state) => state.selectNode);

  console.log('CanvasHeader render:', {
    nodesCount: orchestrationNodes.length,
    canExecute,
    isTestRunning
  });

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
    setTestResultVisible(true); // 打开测试结果抽屉
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
        <Tooltip content="重置">
          <BehaviorRefreshSvg
            className="cursor-pointer transition-colors duration-200 hover:opacity-70"
            onClick={handleRefresh}
          />
        </Tooltip>
        <div className="h-4 w-px bg-[#e5e6eb]" />
        <Button
          type="primary"
          style={{
            backgroundColor: canExecute ? '#184FF2' : '#F5F7FC',
            borderColor: canExecute ? '#184FF2' : '#C3C7D4',
            color: canExecute ? '#fff' : '#9CA3B8'
          }}
          className="flex items-center justify-center"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.44512 5.3787V0.75L10.6808 0.750125V5.37882L14.19 11.5874C14.8653 12.7821 14.0087 14.2628 12.6364 14.273L2.56664 14.348C1.19138 14.3582 0.313147 12.8848 0.976377 11.68L4.44512 5.3787Z"
                stroke={canExecute ? 'white' : '#9CA3B8'}
                strokeWidth="1.5"
              />
            </svg>
          }
          onClick={handleTest}
          disabled={!canExecute}
          loading={isTestRunning}
        >
          测试
        </Button>
      </div>
    </div>
  );
};

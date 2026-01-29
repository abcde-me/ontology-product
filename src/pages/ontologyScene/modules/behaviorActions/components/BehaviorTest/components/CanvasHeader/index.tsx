import React from 'react';
import { Button, Tooltip, Modal, Message } from '@arco-design/web-react';
import {
  IconRefresh,
  IconHistory,
  IconPlayArrow
} from '@arco-design/web-react/icon';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';

export const CanvasHeader: React.FC = () => {
  const isTestRunning = useUIStore((state) => state.isTestRunning);
  const setIsTestRunning = useUIStore((state) => state.setIsTestRunning);
  const setTestHistoryVisible = useUIStore(
    (state) => state.setTestHistoryVisible
  );

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

  const handleHistory = () => {
    setTestHistoryVisible(true);
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
    <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e5e6eb]  pl-4 pr-4">
      <div className="text-sm font-medium text-[#1d2129]">行为编排</div>
      <div className="flex items-center gap-3">
        <Tooltip content="刷新">
          <IconRefresh
            className="cursor-pointer text-lg text-[#4e5969] transition-colors duration-200 hover:text-[#1d2129]"
            onClick={handleRefresh}
          />
        </Tooltip>
        <Tooltip content="历史记录">
          <IconHistory
            className="cursor-pointer text-lg text-[#4e5969] transition-colors duration-200 hover:text-[#1d2129]"
            onClick={handleHistory}
          />
        </Tooltip>
        <Button
          type="primary"
          icon={<IconPlayArrow />}
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

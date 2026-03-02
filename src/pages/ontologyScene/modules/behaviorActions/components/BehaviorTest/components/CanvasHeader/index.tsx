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
  const validateAllNodes = useBusinessStore((state) => state.validateAllNodes);
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
    // 打印所有节点的配置数据
    console.log('=== 开始测试 ===');
    console.log(
      '所有节点:',
      orchestrationNodes.map((n) => ({
        id: n.id,
        name: n.behavior.name,
        order: n.order
      }))
    );

    const allNodeConfigs = useBusinessStore.getState().nodeConfigs;
    console.log('所有节点配置 (nodeConfigs):', allNodeConfigs);

    // 组装成数组格式
    const testDataArray = orchestrationNodes.map((node, index) => {
      const config = allNodeConfigs[node.id] || {};
      return {
        nodeIndex: index + 1,
        nodeId: node.id,
        behaviorId: node.behaviorId,
        behaviorName: node.behavior.name,
        behaviorCode: node.behavior.code,
        formData: config,
        // 转换成后端需要的参数格式
        arguments: Object.entries(config).map(([key, value]) => ({
          name: key,
          value: JSON.stringify(value)
        }))
      };
    });

    console.log('组装后的测试数据数组:', testDataArray);
    console.log('JSON格式:', JSON.stringify(testDataArray, null, 2));

    // 先验证所有节点
    const { isValid, invalidNodeIds } = validateAllNodes();

    if (!isValid && invalidNodeIds.length > 0) {
      console.log('验证失败的节点:', invalidNodeIds);
      Message.error('部分节点配置不完整或有误，请检查后重试');
      // 选中第一个有错误的节点
      selectNode(invalidNodeIds[0]);
      return;
    }

    console.log('所有节点验证通过，开始执行测试');
    setIsTestRunning(true);
    setTestResultVisible(true);
    try {
      await executeTest();
      Message.success('测试执行成功');
    } catch (error: any) {
      console.error('测试执行失败:', error);
      Message.error(error?.message || '测试执行失败，请稍后重试');
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

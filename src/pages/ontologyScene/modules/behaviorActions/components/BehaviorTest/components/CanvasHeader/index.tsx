import React from 'react';
import { Button, Tooltip, Modal, Message } from '@arco-design/web-react';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import BehaviorScheduleSvg from '@/assets/benti/behaviorSchedule.svg';
import BehaviorRefreshSvg from '@/assets/benti/behaviorRefresh.svg';
import { TestFunctionInfo } from '@/pages/ontologyScene/hooks/useTestFunction';
import { buildActionTestItem } from '@/pages/ontologyScene/utils';
import { useParams } from 'react-router-dom';

interface CanvasHeaderProps {
  testFunctionHook: TestFunctionInfo;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  testFunctionHook
}) => {
  const { id: OSId } = useParams<Record<string, string>>();
  const setTestResultVisible = useUIStore(
    (state) => state.setTestResultVisible
  );

  const orchestrationNodes = useBusinessStore(
    (state) => state.orchestrationNodes
  );
  const nodeConfigs = useBusinessStore((state) => state.nodeConfigs);
  const validateAllNodes = useBusinessStore((state) => state.validateAllNodes);
  const markAllFieldsAsTouched = useBusinessStore(
    (state) => state.markAllFieldsAsTouched
  );
  const clearOrchestration = useBusinessStore(
    (state) => state.clearOrchestration
  );
  const selectNode = useUIStore((state) => state.selectNode);

  const { startTest } = testFunctionHook;

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

  const handleTest = () => {
    console.log('=== 开始多节点测试 ===');
    console.log('节点数量:', orchestrationNodes.length);

    // 1. 检查是否有节点
    if (orchestrationNodes.length === 0) {
      Message.warning('请先添加节点');
      return;
    }

    // 2. 标记所有节点的所有字段为已触碰
    orchestrationNodes.forEach((node) => {
      markAllFieldsAsTouched(node.id);
    });

    // 3. 验证所有节点
    const { isValid, invalidNodeIds } = validateAllNodes();

    if (!isValid && invalidNodeIds.length > 0) {
      console.log('验证失败的节点:', invalidNodeIds);

      // 构建详细的错误信息
      const errorMessages = invalidNodeIds
        .map((nodeId, index) => {
          const node = orchestrationNodes.find((n) => n.id === nodeId);
          const errorCount = useBusinessStore
            .getState()
            .getNodeErrorCount(nodeId);
          return `节点${node?.order ? node.order + 1 : index + 1} (${node?.behavior.name}): ${errorCount}个错误`;
        })
        .join('；');

      Message.error(`配置有误，请检查：${errorMessages}`);
      // 选中第一个有错误的节点
      selectNode(invalidNodeIds[0]);
      return;
    }

    try {
      // 循环所有节点，构建 list_data 和 target
      const list_data = orchestrationNodes.map((node) => {
        const config = nodeConfigs[node.id] || {};
        console.log(`节点 ${node.behavior.name} 配置:`, config);
        return buildActionTestItem(node.behavior, config);
      });

      const target = orchestrationNodes.map((node) => node.behavior.code!);

      console.log('测试数据:', {
        list_data,
        target,
        id: +OSId,
        run_action_with_validate: true,
        run_type: 'action'
      });

      // 调用测试接口
      startTest({
        list_data,
        target,
        id: +OSId,
        run_action_with_validate: true,
        run_type: 'action'
      });

      // 打开测试结果抽屉
      setTestResultVisible(true);

      // Message.success('测试已开始');
    } catch (error: any) {
      console.error('测试执行失败:', error);
      Message.error(error?.message || '测试执行失败，请稍后重试');
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
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
          }
          onClick={handleTest}
        >
          测试
        </Button>
      </div>
    </div>
  );
};

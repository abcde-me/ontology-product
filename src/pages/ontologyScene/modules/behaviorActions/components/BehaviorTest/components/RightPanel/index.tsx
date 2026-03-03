import React, { useEffect, useRef } from 'react';
import { Form, Message } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import {
  renderComponentByUiType,
  buildActionTestItem
} from '@/pages/ontologyScene/utils';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';
import BehaviorConfigSvg from '@/assets/benti/behaviorConfig.svg';
import BehaviorTestSvg from '@/assets/benti/behaviorTest.svg';
import { buildFormFieldValidateRules } from '@/pages/ontologyScene/modules/behaviorActionDetail/utils';
import { TestFunctionInfo } from '@/pages/ontologyScene/hooks/useTestFunction';
import { useParams } from 'react-router-dom';

interface RightPanelProps {
  testFunctionHook: TestFunctionInfo;
}

export const RightPanel: React.FC<RightPanelProps> = ({ testFunctionHook }) => {
  const { id: OSId } = useParams<Record<string, string>>();
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const setTestResultVisible = useUIStore(
    (state) => state.setTestResultVisible
  );
  const orchestrationNodes = useBusinessStore(
    (state) => state.orchestrationNodes
  );
  const nodeConfigs = useBusinessStore((state) => state.nodeConfigs);
  const updateNodeConfig = useBusinessStore((state) => state.updateNodeConfig);

  // 从 props 接收 testFunctionHook
  const { testIng, loading, startTest } = testFunctionHook;

  const selectedNode = orchestrationNodes.find((n) => n.id === selectedNodeId);
  const [form] = Form.useForm();
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 当选中节点变化时，加载节点配置
  useEffect(() => {
    if (selectedNode && selectedNodeId) {
      const config = nodeConfigs[selectedNodeId] || {};
      form.setFieldsValue(config);
    }
  }, [selectedNodeId, selectedNode, nodeConfigs, form]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  // 表单值变化时更新配置
  const handleFormChange = (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => {
    if (selectedNodeId) {
      // 清除之前的定时器
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }

      // 更新配置
      updateTimerRef.current = setTimeout(() => {
        updateNodeConfig(selectedNodeId, allValues);
      }, 300);
    }
  };

  // 单节点测试
  const handleSingleNodeTest = async () => {
    if (!selectedNodeId || !selectedNode) return;

    // 先验证表单
    try {
      const formValues = await form.validate();

      console.log('=== 单节点测试 ===');
      console.log('节点信息:', {
        nodeId: selectedNodeId,
        behaviorName: selectedNode.behavior.name,
        behaviorCode: selectedNode.behavior.code,
        functionCode: selectedNode.behavior.functionCode
      });
      console.log('表单数据:', formValues);

      // 构建测试数据
      const testItem = buildActionTestItem(selectedNode.behavior, formValues);
      console.log('测试项:', testItem);

      // 调用测试接口
      startTest({
        list_data: [testItem],
        target: [selectedNode.behavior.functionCode!],
        id: +OSId,
        run_action_with_validate: true,
        run_type: 'action'
      });

      // 打开测试结果抽屉
      setTestResultVisible(true);

      Message.success('测试已开始');
    } catch (error: any) {
      // 表单验证失败
      if (error && typeof error === 'object' && !error.message) {
        Message.error('请检查表单填写是否正确');
      } else {
        // 其他错误
        Message.error(error?.message || '测试失败');
      }
    }
  };

  // 未选中节点时的空状态
  if (!selectedNodeId || !selectedNode) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e5e6eb] px-6">
          <div className="flex items-center gap-1">
            <BehaviorConfigSvg className="h-3.5 w-3.5" />
            <span className="text-base font-medium text-[#000]">参数配置</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5">
          <NoDataCard title="请先选择行为" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* 头部 */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e5e6eb] px-6">
        <div className="flex items-center gap-1">
          <BehaviorConfigSvg className="h-3.5 w-3.5" />
          <span className="text-base font-medium text-[#000]">参数配置</span>
        </div>
        <BehaviorTestSvg
          className="h-4 w-4 cursor-pointer"
          onClick={handleSingleNodeTest}
        />
      </div>

      {/* 表单内容 */}
      <div className="scrollbar-hide flex-1 overflow-y-auto px-5 py-4">
        {/* 动态表单 - 使用 key 让表单在切换节点时重置 */}
        <Form
          key={selectedNodeId}
          form={form}
          layout="vertical"
          onValuesChange={handleFormChange}
          autoComplete="off"
          disabled={loading || testIng}
        >
          {selectedNode.behavior.params?.map((param) => (
            <Form.Item
              key={param.code}
              label={param.name}
              field={param.code}
              required={param.enabledValidation}
              // @ts-ignore
              rules={buildFormFieldValidateRules(param)}
              triggerPropName={
                param.uiType === UiType.Switch ? 'checked' : 'value'
              }
            >
              {renderComponentByUiType(param.uiType)}
            </Form.Item>
          ))}
        </Form>
      </div>
    </div>
  );
};

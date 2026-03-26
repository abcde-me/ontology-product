import React, { useEffect, useRef } from 'react';
import { Form, Message } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import {
  renderComponentByUiType,
  buildActionTestItem
} from '@/pages/ontologyScene/utils';
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
  const markFieldAsTouched = useBusinessStore(
    (state) => state.markFieldAsTouched
  );

  // 从 props 接收 testFunctionHook
  const { startTest } = testFunctionHook;

  const selectedNode = orchestrationNodes.find((n) => n.id === selectedNodeId);
  const [form] = Form.useForm();
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevNodeIdRef = useRef<string | null>(null);
  const isLoadingConfigRef = useRef(false); // 标记是否正在加载配置

  // 当选中节点变化时，加载节点配置
  useEffect(() => {
    // 只在节点ID变化时才重置和加载配置
    if (selectedNodeId !== prevNodeIdRef.current) {
      prevNodeIdRef.current = selectedNodeId;

      if (selectedNode && selectedNodeId) {
        const config = nodeConfigs[selectedNodeId] || {};

        // 标记正在加载配置
        isLoadingConfigRef.current = true;

        // 先重置表单，清除所有字段（包括验证状态）
        form.resetFields();

        // 使用 setTimeout 确保 resetFields 完成后再设置新值
        // 这样可以避免字段值残留的问题
        setTimeout(() => {
          form.setFieldsValue(config);
          // 延迟重置加载状态，确保 setFieldsValue 触发的 onValuesChange 被忽略
          setTimeout(() => {
            isLoadingConfigRef.current = false;
          }, 50);
        }, 0);
      } else {
        // 如果没有选中节点，直接重置表单
        form.resetFields();
        isLoadingConfigRef.current = false;
      }
    }
  }, [selectedNodeId, selectedNode, form]); // 移除 nodeConfigs 依赖

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
    // 如果正在加载配置，忽略所有变化
    if (isLoadingConfigRef.current) {
      return;
    }

    if (selectedNodeId && selectedNode) {
      // 标记变化的字段为已触碰（只在用户真正修改时）
      Object.keys(changedValues).forEach((fieldCode) => {
        markFieldAsTouched(selectedNodeId, fieldCode);
      });

      // 清除之前的定时器
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }

      // 只有当前节点有参数时才更新配置
      const hasInputParams = selectedNode.behavior.params?.some(
        (param) => param.inputType === 'input'
      );

      if (hasInputParams) {
        // 更新配置
        updateTimerRef.current = setTimeout(() => {
          updateNodeConfig(selectedNodeId, allValues);
        }, 300);
      }
    }
  };

  // 单节点测试
  const handleSingleNodeTest = async () => {
    if (!selectedNodeId || !selectedNode) {
      Message.warning('请先选择行为');
      return;
    }

    // 先验证表单
    try {
      const formValues = await form.validate();

      // 过滤掉出参，只保留入参
      const behaviorWithInputParamsOnly = {
        ...selectedNode.behavior,
        params: selectedNode.behavior.params?.filter(
          (param) => param.inputType === 'input'
        )
      };

      // 构建测试数据
      const testItem = buildActionTestItem(
        behaviorWithInputParamsOnly,
        formValues
      );

      // 调用测试接口
      startTest({
        list_data: [testItem],
        target: [selectedNode.behavior.code!],
        id: +OSId,
        run_action_with_validate: true,
        run_type: 'action'
      });

      // 打开测试结果抽屉
      setTestResultVisible(true);

      // Message.success('测试已开始');
    } catch (error: any) {
      // 表单验证失败
      if (error && typeof error === 'object' && !error.message) {
        Message.error('请检查表单填写是否正确');
      } else {
        // 其他错误
        // Message.error(error?.message || '测试失败');
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
          <BehaviorTestSvg
            className="h-4 w-4 cursor-pointer"
            onClick={handleSingleNodeTest}
          />
        </div>
        <div className="flex flex-1 items-center justify-center px-5">
          <NoDataCard title="请先选择行为" type="block" />
        </div>
      </div>
    );
  }

  // 没有参数
  if (selectedNode.behavior.params?.length === 0) {
    return (
      <div className="flex h-full w-full flex-col">
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
        <div className="flex flex-1 items-center justify-center px-5">
          <NoDataCard title="暂无参数" type="block" />
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
        >
          {selectedNode.behavior.params
            ?.filter((param) => param.inputType === 'input') // 只显示输入参数
            .map((param) => (
              <Form.Item
                key={param.code}
                label={param.name}
                field={param.code}
                required
                // @ts-ignore
                rules={
                  buildFormFieldValidateRules(param) || [
                    { required: true, message: '请输入参数值' }
                  ]
                }
              >
                {renderComponentByUiType(
                  param.uiType,
                  OSId ? +OSId : undefined
                )}
              </Form.Item>
            ))}
        </Form>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { Form } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import { renderComponentByUiType } from '@/pages/ontologyScene/utils';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';
import BehaviorConfigSvg from '@/assets/benti/behaviorConfig.svg';
import BehaviorTestSvg from '@/assets/benti/behaviorTest.svg';

export const RightPanel: React.FC = () => {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const orchestrationNodes = useBusinessStore(
    (state) => state.orchestrationNodes
  );
  const nodeConfigs = useBusinessStore((state) => state.nodeConfigs);
  const updateNodeConfig = useBusinessStore((state) => state.updateNodeConfig);

  const selectedNode = orchestrationNodes.find((n) => n.id === selectedNodeId);
  const [form] = Form.useForm();
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<string | null>(null);

  // 当选中节点变化时，重置表单
  useEffect(() => {
    if (selectedNode && selectedNodeId) {
      // 只在节点切换时加载配置，避免输入时重新加载
      if (isInitialLoadRef.current !== selectedNodeId) {
        isInitialLoadRef.current = selectedNodeId;

        const config = nodeConfigs[selectedNodeId] || {};

        // 如果没有配置，使用默认值
        const initialValues: Record<string, any> = {};
        selectedNode.behavior.params?.forEach((param) => {
          if (config[param.code] !== undefined) {
            initialValues[param.code] = config[param.code];
          }
        });

        form.setFieldsValue(initialValues);
      }
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

  // 表单值变化时使用防抖更新到 Store（避免输入时频繁更新导致光标丢失）
  const handleFormChange = (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => {
    if (selectedNodeId) {
      // 清除之前的定时器
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }

      // 设置新的定时器，300ms 后更新
      updateTimerRef.current = setTimeout(() => {
        console.log('表单值变化:', {
          nodeId: selectedNodeId,
          changedValues,
          allValues
        });
        updateNodeConfig(selectedNodeId, allValues);
      }, 300);
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
          {/* <BehaviorTestSvg className="h-4 w-4 cursor-pointer" /> */}
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
        {/* <BehaviorTestSvg className="h-4 w-4 cursor-pointer" /> */}
      </div>

      {/* 表单内容 */}
      <div className="scrollbar-hide flex-1 overflow-y-auto px-5 py-4">
        {/* 动态表单 */}
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormChange}
          autoComplete="off"
        >
          {selectedNode.behavior.params?.map((param) => (
            <Form.Item
              key={param.code}
              label={param.name}
              field={param.code}
              required={param.enabledValidation}
              rules={[
                {
                  required: param.enabledValidation,
                  message: `请输入${param.name}`
                }
              ]}
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

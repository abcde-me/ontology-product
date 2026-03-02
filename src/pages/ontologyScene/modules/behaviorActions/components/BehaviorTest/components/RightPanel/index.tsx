import React, { useEffect, useRef } from 'react';
import { Form, Message } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import { renderComponentByUiType } from '@/pages/ontologyScene/utils';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';
import BehaviorConfigSvg from '@/assets/benti/behaviorConfig.svg';
import BehaviorTestSvg from '@/assets/benti/behaviorTest.svg';
import { buildFormFieldValidateRules } from '@/pages/ontologyScene/modules/behaviorActionDetail/utils';

export const RightPanel: React.FC = () => {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const setTestResultVisible = useUIStore(
    (state) => state.setTestResultVisible
  );
  const setIsTestRunning = useUIStore((state) => state.setIsTestRunning);
  const orchestrationNodes = useBusinessStore(
    (state) => state.orchestrationNodes
  );
  const updateNodeConfig = useBusinessStore((state) => state.updateNodeConfig);
  const setNodeValidationErrors = useBusinessStore(
    (state) => state.setNodeValidationErrors
  );
  const addNodeTouchedField = useBusinessStore(
    (state) => state.addNodeTouchedField
  );
  const executeSingleNodeTest = useBusinessStore(
    (state) => state.executeSingleNodeTest
  );

  const selectedNode = orchestrationNodes.find((n) => n.id === selectedNodeId);
  const [form] = Form.useForm();
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousNodeIdRef = useRef<string | null>(null);

  // 当选中节点变化时，保存上一个节点的验证状态，并加载新节点的配置和验证状态
  useEffect(() => {
    // 保存上一个节点的验证状态
    if (
      previousNodeIdRef.current &&
      previousNodeIdRef.current !== selectedNodeId
    ) {
      const previousNodeId = previousNodeIdRef.current;
      const store = useBusinessStore.getState();
      const touchedFields =
        store.nodeTouchedFields[previousNodeId] || new Set<string>();

      // 只有当有字段被触碰过时，才保存验证状态
      if (touchedFields.size > 0) {
        // 获取当前表单的验证状态
        form
          .validate()
          .then(() => {
            // 验证通过，清除错误
            setNodeValidationErrors(previousNodeId, {});
          })
          .catch((errors: any) => {
            // 验证失败，只保存已触碰字段的错误
            const errorMap: Record<string, string> = {};
            if (errors && typeof errors === 'object') {
              Object.entries(errors).forEach(
                ([field, fieldError]: [string, any]) => {
                  // 只保存已触碰字段的错误
                  if (
                    touchedFields.has(field) &&
                    fieldError &&
                    fieldError.errors &&
                    fieldError.errors.length > 0
                  ) {
                    errorMap[field] = fieldError.errors[0];
                  }
                }
              );
            }
            setNodeValidationErrors(previousNodeId, errorMap);
          });
      }
    }

    // 更新上一个节点 ID
    previousNodeIdRef.current = selectedNodeId;

    // 加载新节点的配置和验证状态
    if (selectedNode && selectedNodeId) {
      const store = useBusinessStore.getState();
      const config = store.nodeConfigs[selectedNodeId] || {};
      const savedErrors = store.nodeValidationErrors[selectedNodeId] || {};
      const touchedFields =
        store.nodeTouchedFields[selectedNodeId] || new Set<string>();

      // 使用 setFields 来同时设置值和错误状态
      const fieldsObj: Record<string, any> = {};
      selectedNode.behavior.params?.forEach((param) => {
        const value = config[param.code];
        // 只恢复已触碰字段的错误
        const error = touchedFields.has(param.code)
          ? savedErrors[param.code]
          : undefined;

        fieldsObj[param.code] = {
          value: value !== undefined ? value : undefined,
          error: error ? { message: error } : undefined
        };
      });

      form.setFields(fieldsObj);
    }
    // 只依赖 selectedNodeId，避免其他状态变化触发
  }, [selectedNodeId]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  // 表单值变化时更新配置并标记字段为已触碰
  const handleFormChange = (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => {
    if (selectedNodeId) {
      // 标记变化的字段为已触碰
      Object.keys(changedValues).forEach((field) => {
        addNodeTouchedField(selectedNodeId, field);
      });

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
    if (!selectedNodeId) return;

    // 先验证表单
    try {
      await form.validate();

      // 表单验证通过，执行测试
      setIsTestRunning(true);
      setTestResultVisible(true);

      await executeSingleNodeTest(selectedNodeId);

      Message.success('测试完成');
    } catch (error: any) {
      // 表单验证失败
      if (error && typeof error === 'object' && !error.message) {
        Message.error('请检查表单填写是否正确');
      } else {
        // 其他错误
        Message.error(error?.message || '测试失败');
      }
    } finally {
      setIsTestRunning(false);
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
        {/* 动态表单 - 不使用 key，通过 setFields 来管理字段状态 */}
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

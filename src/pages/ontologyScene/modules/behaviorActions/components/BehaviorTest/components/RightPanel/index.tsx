import React, { useEffect, useRef } from 'react';
import {
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  Upload,
  Form
} from '@arco-design/web-react';
import { useUIStore } from '../../store/uiStore';
import { useBusinessStore } from '../../store/businessStore';
import { ConfigField } from '../../types';

const { TextArea } = Input;

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
        selectedNode.behavior.configSchema?.fields.forEach((field) => {
          if (config[field.name] !== undefined) {
            initialValues[field.name] = config[field.name];
          } else if (field.defaultValue !== undefined) {
            initialValues[field.name] = field.defaultValue;
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

  const renderField = (field: ConfigField) => {
    const widget = field.widget || field.type;

    // 单行文本框
    if (widget === '单行文本框' || (field.type === 'input' && !field.widget)) {
      return <Input placeholder={field.placeholder} allowClear />;
    }

    // 文本域
    if (widget === '文本域') {
      return (
        <TextArea
          placeholder={field.placeholder}
          autoSize={{ minRows: 3, maxRows: 6 }}
          allowClear
        />
      );
    }

    // 数字步进器
    if (widget === '数字步进器') {
      return (
        <InputNumber
          placeholder={field.placeholder}
          mode="button"
          style={{ width: '100%' }}
        />
      );
    }

    // 高精度数字输入框
    if (widget === '高精度数字输入框') {
      return (
        <InputNumber
          placeholder={field.placeholder}
          precision={2}
          step={0.01}
          style={{ width: '100%' }}
        />
      );
    }

    // 切换开关
    if (widget === '切换开关' || field.type === 'switch') {
      return <Switch />;
    }

    // 日期选择器
    if (widget === '日期选择器') {
      return (
        <DatePicker style={{ width: '100%' }} placeholder={field.placeholder} />
      );
    }

    // 日期时间选择器
    if (widget === '日期时间选择器' || field.type === 'date') {
      return (
        <DatePicker
          showTime
          style={{ width: '100%' }}
          placeholder={field.placeholder}
        />
      );
    }

    // 地图选择器（简化为文本输入）
    if (widget === '地图选择器') {
      return (
        <Input
          placeholder={field.placeholder || '请输入坐标（格式：经度,纬度）'}
          allowClear
        />
      );
    }

    // 对象搜索选择器 / 对象集选择器 / 下拉选择
    if (
      widget === '对象搜索选择器' ||
      widget === '对象集选择器' ||
      widget === '下拉选择' ||
      field.type === 'select'
    ) {
      return (
        <Select
          placeholder={field.placeholder}
          allowClear
          showSearch
          options={field.options}
        />
      );
    }

    // 文件上传区域
    if (widget === '文件上传区域' || field.type === 'upload') {
      return <Upload drag action="/" tip="支持拖拽上传或点击上传" />;
    }

    // 默认：单行文本框
    return <Input placeholder={field.placeholder} allowClear />;
  };

  // 未选中节点时的空状态
  if (!selectedNodeId || !selectedNode) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e5e6eb] pl-4 pr-4">
          <span className="text-sm font-medium text-[#1d2129]">参数配置</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="35" fill="#F7F8FA" />
            <path
              d="M40 28V52M28 40H52"
              stroke="#C9CDD4"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm text-[#86909c]">请先选择行为</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* 头部 */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e5e6eb] pl-4 pr-4">
        <span className="text-sm font-medium text-[#1d2129]">参数配置</span>
      </div>

      {/* 表单内容 */}
      <div className="scrollbar-hide flex-1 overflow-y-auto px-5 py-4">
        {/* 节点信息 */}
        <div className="mb-4 rounded-lg border border-[#e5e6eb] bg-[#f7f8fa] p-4">
          <div className="mb-1 text-sm font-medium text-[#1d2129]">
            {selectedNode.behavior.name}
          </div>
          {selectedNode.behavior.description && (
            <div className="text-xs text-[#86909c]">
              {selectedNode.behavior.description}
            </div>
          )}
        </div>

        {/* 动态表单 */}
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormChange}
          autoComplete="off"
        >
          {selectedNode.behavior.configSchema?.fields.map((field) => (
            <Form.Item
              key={field.name}
              label={field.label}
              field={field.name}
              required={field.required}
              rules={[
                {
                  required: field.required,
                  message: `请输入${field.label}`
                },
                field.validation
                  ? {
                      validator: (value, callback) => {
                        const result = field.validation!(value);
                        if (result === true) {
                          callback();
                        } else {
                          callback(result as string);
                        }
                      }
                    }
                  : {}
              ]}
            >
              {renderField(field)}
            </Form.Item>
          ))}
        </Form>

        {/* 提示信息 */}
        {selectedNode.behavior.validationRules &&
          selectedNode.behavior.validationRules.length > 0 && (
            <div className="mt-4 rounded-lg border border-[#f7ba1e] bg-[#fffbe8] p-3">
              <div className="mb-2 text-xs font-medium text-[#f7ba1e]">
                校验规则
              </div>
              {selectedNode.behavior.validationRules.map((rule) => (
                <div key={rule.id} className="mb-1 text-xs text-[#86909c]">
                  • {rule.description}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

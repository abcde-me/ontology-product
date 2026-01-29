import React from 'react';
import { Modal, Message } from '@arco-design/web-react';
import { IconDelete, IconPlayArrow } from '@arco-design/web-react/icon';
import { OrchestrationNode as OrchestrationNodeType } from '../../types';
import { useBusinessStore } from '../../store/businessStore';

interface OrchestrationNodeProps {
  node: OrchestrationNodeType;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const OrchestrationNode: React.FC<OrchestrationNodeProps> = ({
  node,
  isSelected,
  onClick,
  onDelete
}) => {
  const nodeConfigs = useBusinessStore((state) => state.nodeConfigs);

  const config = nodeConfigs[node.id] || {};

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '删除后该节点的配置将丢失，确认删除吗？',
      onOk: onDelete
    });
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node.isConfigured) {
      Message.warning('请先完成参数配置');
      return;
    }
    Message.info(`执行节点: ${node.behavior.name}`);
    // TODO: 实现单个节点执行逻辑
  };

  const borderColor = node.isConfigured
    ? 'border-[#00b42a]'
    : isSelected
      ? 'border-[#165dff]'
      : 'border-[#e5e6eb]';

  const shadowClass = isSelected
    ? 'shadow-[0_0_0_3px_rgba(22,93,255,0.1)]'
    : '';

  return (
    <div
      className={`cursor-pointer rounded-lg border-2 bg-white transition-all duration-200 hover:border-[#c9cdd4] hover:shadow-md ${borderColor} ${shadowClass}`}
      onClick={onClick}
    >
      {/* 节点头部 */}
      <div className="flex items-center justify-between gap-3 border-b border-[#e5e6eb] px-4 py-3">
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-[#1d2129]">
          {node.behavior.name}
        </span>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors duration-200 hover:bg-[#f2f3f5]"
            onClick={handleRun}
            title="运行"
          >
            <IconPlayArrow className="text-base text-[#165dff]" />
          </div>
          <div
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors duration-200 hover:bg-[#f2f3f5]"
            onClick={handleDelete}
            title="删除"
          >
            <IconDelete className="text-base text-[#86909c] hover:text-[#f53f3f]" />
          </div>
        </div>
      </div>

      {/* 节点参数列表 */}
      <div className="flex flex-col gap-2 px-4 py-3">
        {node.behavior.configSchema?.fields.map((field) => {
          const value = config[field.name];

          // 判断是否已配置
          let isUnconfigured =
            value === undefined || value === null || value === '';

          // 对于布尔值，false 也是有效配置
          if (field.type === 'switch' || field.widget === '切换开关') {
            isUnconfigured = value === undefined || value === null;
          }

          // 格式化显示值
          let displayValue = '未配置';
          if (!isUnconfigured) {
            if (typeof value === 'boolean') {
              displayValue = value ? '是' : '否';
            } else if (Array.isArray(value)) {
              displayValue = value.join(', ');
            } else {
              displayValue = String(value);
            }
          }

          return (
            <div
              key={field.name}
              className="flex items-baseline gap-2 text-[13px]"
            >
              <span className="flex-shrink-0 text-[#4e5969]">
                {field.label}:
              </span>
              <span
                className={`flex-1 break-all ${
                  isUnconfigured ? 'text-[#86909c]' : 'text-[#1d2129]'
                }`}
              >
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

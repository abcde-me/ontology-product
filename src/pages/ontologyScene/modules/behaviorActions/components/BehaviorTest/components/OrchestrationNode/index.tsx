import React from 'react';
import { Modal, Message, Tooltip } from '@arco-design/web-react';
import { OrchestrationNode as OrchestrationNodeType } from '../../types';
import { useBusinessStore } from '../../store/businessStore';
import DeleteSvg from '@/assets/benti/delete.svg';

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
  const [isDeleteHovered, setIsDeleteHovered] = React.useState(false);
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

  const borderColor = isSelected
    ? 'border-[#184FF2]'
    : 'border-[rgba(236,240,243,1)]';

  return (
    <div
      className={`cursor-pointer rounded-lg border-2 bg-white px-4 pb-4 pt-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 ${borderColor}`}
      onClick={onClick}
    >
      {/* 节点头部：编号 + 行为名称 + 删除 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* 编号 */}
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[rgba(190,213,253,1)] bg-[rgba(242,248,255,1)] text-[10px] font-bold leading-none text-[rgba(64,115,245,1)]">
            {String(node.order + 1).padStart(2, '0')}
          </div>
          {/* 行为名称 */}
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-[#1d2129]">
            {node.behavior.name}
          </span>
        </div>
        {/* 删除图标 */}
        <Tooltip content="删除">
          <div
            className="flex-shrink-0 cursor-pointer"
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
            onClick={handleDelete}
          >
            <DeleteSvg
              className="transition-colors duration-200"
              style={{
                fill: isDeleteHovered ? '#F53F3F' : '#4A5169'
              }}
            />
          </div>
        </Tooltip>
      </div>

      {/* 表单项列表 */}
      {node.behavior.configSchema?.fields &&
        node.behavior.configSchema.fields.length > 0 && (
          <div className="mt-2 flex flex-col gap-3">
            {node.behavior.configSchema.fields.map((field) => {
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
                <div key={field.name} className="flex flex-col gap-1">
                  {/* Label */}
                  <span className="text-[13px] font-semibold text-[rgba(15,19,31,1)]">
                    {field.label}
                  </span>
                  {/* Value */}
                  <div className="rounded bg-[#F7F8FA] px-3 py-2 text-[13px] font-normal text-[#86909C]">
                    {displayValue}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

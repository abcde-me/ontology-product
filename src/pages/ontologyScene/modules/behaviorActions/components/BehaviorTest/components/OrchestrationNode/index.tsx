import React, { useState } from 'react';
import { Modal, Tooltip, Typography } from '@arco-design/web-react';

import { OrchestrationNode as OrchestrationNodeType } from '../../types';
import { useBusinessStore } from '../../store/businessStore';
import { formatParamDisplayValue } from './utils';
import DeleteSvg from '@/assets/benti/delete.svg';
import EllipsisTextWithTooltip from '@/pages/ontologyScene/modules/behaviorLog/components/EllipsisTextWithTooltip';

interface OrchestrationNodeProps {
  node: OrchestrationNodeType;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

// 参数显示项组件 - 处理异步显示值和 React 组件
interface ParamDisplayItemProps {
  paramName: string;
  paramCode: string;
  displayValueOrPromise: string | Promise<string> | React.ReactNode;
  errorMessage?: string;
}

const ParamDisplayItem: React.FC<ParamDisplayItemProps> = React.memo(
  ({ paramName, displayValueOrPromise, errorMessage }) => {
    const [displayValue, setDisplayValue] = React.useState<React.ReactNode>('');
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
      // 如果是字符串，直接设置
      if (typeof displayValueOrPromise === 'string') {
        setDisplayValue(displayValueOrPromise);
        setIsLoading(false);
      }
      // 如果是 Promise，等待解析
      else if (displayValueOrPromise instanceof Promise) {
        setIsLoading(true);
        displayValueOrPromise
          .then((value) => {
            setDisplayValue(value);
            setIsLoading(false);
          })
          .catch(() => {
            setDisplayValue('加载失败');
            setIsLoading(false);
          });
      }
      // 如果是 React 组件，直接设置
      else {
        setDisplayValue(displayValueOrPromise);
        setIsLoading(false);
      }
    }, [displayValueOrPromise]);

    return (
      <div className="flex flex-col gap-1">
        {/* Label */}
        <EllipsisTextWithTooltip
          value={paramName}
          className="text-[13px] font-semibold text-[rgba(15,19,31,1)]"
        />
        {/* Value */}
        <div
          className={`rounded px-3 py-2 text-[13px] font-normal ${errorMessage ? 'border border-[#F53F3F] bg-[#FFECE8]' : 'bg-[#F7F8FA]'} text-[#86909C]`}
        >
          {isLoading ? '加载中...' : displayValue || '未配置'}
        </div>
        {/* Error Message */}
        {errorMessage && (
          <EllipsisTextWithTooltip
            value={errorMessage}
            className="text-[12px] text-[#F53F3F]"
          />
        )}
      </div>
    );
  },
  // 自定义比较函数
  (prevProps, nextProps) => {
    if (
      prevProps.paramName !== nextProps.paramName ||
      prevProps.paramCode !== nextProps.paramCode ||
      prevProps.errorMessage !== nextProps.errorMessage
    ) {
      return false;
    }

    // 如果都是字符串，比较字符串值
    if (
      typeof prevProps.displayValueOrPromise === 'string' &&
      typeof nextProps.displayValueOrPromise === 'string'
    ) {
      return (
        prevProps.displayValueOrPromise === nextProps.displayValueOrPromise
      );
    }

    // 对于 Promise 和 React 组件，总是重新渲染
    return false;
  }
);

export const OrchestrationNode: React.FC<OrchestrationNodeProps> = ({
  node,
  isSelected,
  onClick,
  onDelete
}) => {
  const [isDeleteHovered, setIsDeleteHovered] = React.useState(false);
  // 只订阅当前节点的配置，避免其他节点配置变化时重新渲染
  const config = useBusinessStore((state) => state.nodeConfigs[node.id] || {});
  const getNodeErrorCount = useBusinessStore(
    (state) => state.getNodeErrorCount
  );
  const nodeValidationErrors = useBusinessStore(
    (state) => state.nodeValidationErrors[node.id] || {}
  );
  const isFieldTouched = useBusinessStore((state) => state.isFieldTouched);

  // 获取错误数量
  const errorCount = getNodeErrorCount(node.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '删除后该节点的配置将丢失，确认删除吗？',
      onOk: onDelete
    });
  };

  // 边框颜色：选中 > 默认
  const borderColor = isSelected
    ? 'border-[#184FF2]' // 蓝色边框表示选中
    : 'border-[rgba(236,240,243,1)]'; // 默认灰色边框

  return (
    <div
      className={`cursor-pointer rounded-lg border-2 bg-white px-4 pb-4 pt-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 ${borderColor}`}
      onClick={onClick}
    >
      {/* 节点头部：编号 + 行为名称 + 错误提示 + 删除 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* 编号 */}
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[rgba(190,213,253,1)] bg-[rgba(242,248,255,1)] font-DINAlternate text-[10px] font-bold leading-none text-[rgba(64,115,245,1)]">
            {String(node.order + 1).padStart(2, '0')}
          </div>
          {/* 行为名称 */}
          <EllipsisTextWithTooltip
            value={node.behavior.name}
            className="min-w-0 flex-1 text-sm font-semibold text-[#1d2129]"
          />
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
      {node.behavior.params && node.behavior.params.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          {node.behavior.params
            .filter((param) => param.inputType === 'input') // 只显示输入参数
            .map((param) => {
              const value = config[param.code];
              const displayValueOrPromise = formatParamDisplayValue(
                value,
                param.uiType
              );
              // 只显示已触碰字段的错误
              const fieldTouched = isFieldTouched(node.id, param.code);
              const errorMessage = fieldTouched
                ? nodeValidationErrors[param.code]
                : undefined;

              return (
                <ParamDisplayItem
                  key={param.code}
                  paramName={param.name}
                  paramCode={param.code}
                  displayValueOrPromise={displayValueOrPromise}
                  errorMessage={errorMessage}
                />
              );
            })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useCallback, ReactNode } from 'react';
import { Spin } from '@arco-design/web-react';
import { IconDown, IconRight } from '@arco-design/web-react/icon';

export interface CollapsibleSectionProps {
  /**
   * 标题文本
   */
  title: string;
  /**
   * 是否默认展开
   * @default false
   */
  defaultExpanded?: boolean;
  /**
   * 内容区域
   */
  children: ReactNode;
  /**
   * 是否显示加载状态
   * @default false
   */
  loading?: boolean;
  /**
   * 受控模式：是否展开
   */
  expanded?: boolean;
  /**
   * 受控模式：展开状态变化回调
   */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * 自定义展开图标
   */
  expandIcon?: ReactNode;
  /**
   * 自定义收起图标
   */
  collapseIcon?: ReactNode;
  /**
   * 自定义标题样式类名
   */
  titleClassName?: string;
  /**
   * 自定义容器样式类名
   */
  className?: string;
  /**
   * 自定义内容区域样式类名
   */
  contentClassName?: string;
  /**
   * 是否禁用展开/收起功能
   * @default false
   */
  disabled?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultExpanded = false,
  children,
  loading = false,
  expanded: controlledExpanded,
  onExpandedChange,
  expandIcon,
  collapseIcon,
  titleClassName,
  className,
  contentClassName,
  disabled = false
}) => {
  // 内部状态（非受控模式）
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // 判断是否为受控模式
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  // 切换展开/收起状态
  const toggleExpanded = useCallback(() => {
    if (disabled) return;

    const newExpanded = !expanded;

    // 非受控模式：更新内部状态
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }

    // 触发回调
    onExpandedChange?.(newExpanded);
  }, [disabled, expanded, isControlled, onExpandedChange]);

  // 默认图标 - 使用 Arco Design 的图标
  const defaultExpandIcon = (
    <IconDown className="h-[16px] w-[16px] flex-shrink-0 text-[var(--color-text-3)]" />
  );
  const defaultCollapseIcon = (
    <IconRight className="h-[16px] w-[16px] flex-shrink-0 text-[var(--color-text-3)]" />
  );

  return (
    <div className={`flex flex-col gap-[12px] ${className || ''}`}>
      {/* 标题栏 */}
      <div
        className={`flex items-center gap-[8px] ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        onClick={toggleExpanded}
        role="button"
        aria-expanded={expanded}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        {/* 展开/收起图标 */}
        {expanded
          ? expandIcon || defaultExpandIcon
          : collapseIcon || defaultCollapseIcon}
        {/* 标题文字 */}
        <div
          className={
            titleClassName ||
            'text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]'
          }
        >
          {title}
        </div>
      </div>

      {/* 内容区域 */}
      {expanded && (
        <Spin loading={loading}>
          <div className={contentClassName}>{children}</div>
        </Spin>
      )}
    </div>
  );
};

export default CollapsibleSection;

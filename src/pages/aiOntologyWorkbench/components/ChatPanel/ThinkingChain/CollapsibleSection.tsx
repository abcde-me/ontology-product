/**
 * CollapsibleSection - 可折叠面板组件
 * 参考 ai-appforge 的 CollapsibleSection
 */
import React, { memo, useState, ReactNode } from 'react';
import { IconRight } from '@arco-design/web-react/icon';
import styles from './CollapsibleSection.module.scss';

interface CollapsibleSectionProps {
  /** 标题文本 */
  title: string;
  /** 是否默认展开 */
  defaultOpen?: boolean;
  /** 标题右侧附加内容 */
  extra?: ReactNode;
  /** 子内容 */
  children?: ReactNode;
  /** 展开时整体最大高度（超出内容区滚动），单位 px */
  maxHeight?: number;
  /** 展开且无内容时显示的空状态文案 */
  emptyText?: string;
  /** 自定义类名 */
  className?: string;
  /** 内容区自定义类名 */
  contentClassName?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = false,
  extra,
  children,
  maxHeight,
  emptyText,
  className,
  contentClassName
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`${styles.collapsibleSection} ${className || ''}`}
      style={maxHeight && isOpen ? { maxHeight: `${maxHeight}px` } : undefined}
    >
      {/* 头部 */}
      <div className={`${styles.header} ${isOpen ? styles.headerOpen : ''}`}>
        <div className={styles.titleArea} onClick={toggle}>
          <IconRight
            className={`${styles.caretIcon} ${isOpen ? styles.caretOpen : ''}`}
          />
          <span className={styles.title}>{title}</span>
        </div>
        {/* 右侧附加内容（仅展开时显示） */}
        {isOpen && extra && <div className={styles.extra}>{extra}</div>}
      </div>

      {/* 内容区域 */}
      {isOpen && (
        <div className={`${styles.content} ${contentClassName || ''}`}>
          {children ||
            (emptyText && (
              <div className={styles.emptyState}>
                <span>{emptyText}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default memo(CollapsibleSection);

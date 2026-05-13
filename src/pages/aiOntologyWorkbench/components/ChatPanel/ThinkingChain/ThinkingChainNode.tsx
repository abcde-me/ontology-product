/**
 * ThinkingChainNode - 思维链单个节点
 * 参考 ai-appforge 的 ThinkChainNode - 只负责节点行和连接线
 */
import React, { memo, useState, ReactNode } from 'react';
import { IconDown, IconLoading } from '@arco-design/web-react/icon';
import StepIcon from './StepIcon';
import styles from './ThinkingChain.module.scss';

interface ThinkingChainNodeProps {
  /** 步骤类型 */
  type: string;
  /** 是否已完成 */
  done?: boolean;
  /** 耗时（秒） */
  runningTime?: string;
  /** 是否为最后一个节点 */
  isLast?: boolean;
  /** 折叠内容 */
  children?: ReactNode;
  /** 类型文本 */
  typeText: string;
}

const ThinkingChainNode: React.FC<ThinkingChainNodeProps> = ({
  type,
  done = false,
  runningTime,
  isLast = false,
  children,
  typeText
}) => {
  const [open, setOpen] = useState(false);
  const isLoading = !done;

  /** 状态文案 */
  const statusText = isLoading
    ? `${typeText}中...`
    : runningTime
      ? `${typeText}成功，用时${runningTime}秒`
      : `${typeText}完成`;

  /** 是否有可折叠内容 */
  const hasContent = !!children;

  return (
    <div className={styles.nodeContainer}>
      {/* 节点行 */}
      <div
        className={`${styles.nodeRow} ${hasContent ? styles.clickable : ''}`}
        onClick={hasContent ? () => setOpen(!open) : undefined}
      >
        {/* 类型图标 */}
        <div className={styles.nodeIcon}>
          {isLoading ? (
            <IconLoading className={styles.loadingIcon} spin />
          ) : (
            <StepIcon type={type} />
          )}
        </div>

        {/* 状态文案 */}
        <span className={styles.nodeStatus}>{statusText}</span>

        {/* 展开/折叠箭头 */}
        {hasContent && (
          <IconDown
            className={`${styles.arrow} ${open ? styles.arrowUp : styles.arrowDown}`}
          />
        )}
      </div>

      {/* 连接线 + 折叠内容 */}
      {(!isLast || (hasContent && open)) && (
        <div className={styles.nodeContent}>
          {/* 左侧连接线区域 */}
          <div className={styles.nodeLine}>
            {!isLast && <div className={styles.lineBar} />}
          </div>

          {/* 右侧内容区域 */}
          <div className={styles.nodeContentBox}>
            {/* 折叠内容 */}
            {hasContent && open && <div>{children}</div>}

            {/* 无内容时的间距 */}
            {!(hasContent && open) && !isLast && (
              <div className={styles.spacer} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ThinkingChainNode);

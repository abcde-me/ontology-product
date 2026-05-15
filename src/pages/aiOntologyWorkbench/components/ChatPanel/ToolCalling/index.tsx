/**
 * ToolCalling - 本体工具调用组件
 * 设计稿：工具调用中可展开，调用完成自动收起
 */
import React, { useState, useEffect } from 'react';
import { IconDown } from '@arco-design/web-react/icon';
import ToolCallItem from './ToolCallItem';
import type { ToolCallingProps } from './types';
import styles from './ToolCalling.module.scss';

const ToolCalling: React.FC<ToolCallingProps> = ({
  calls,
  allDone = false
}) => {
  // 默认展开，完成后自动收起
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (allDone) {
      // 完成后立即收起
      setExpanded(false);
    } else {
      // 进行中时保持展开
      setExpanded(true);
    }
  }, [allDone]);

  if (!calls || calls.length === 0) return null;

  const headerText = allDone ? '工具调用完成' : '工具调用中...';
  const countText = `${calls.length}个`;

  return (
    <div className={styles.toolCalling}>
      {/* 链头 */}
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.iconWrapper}>
          <div className={styles.toolIcon} />
        </div>
        <span className={styles.headerText}>{headerText}</span>
        <span className={styles.countText}>{countText}</span>
        <IconDown
          className={`${styles.arrow} ${expanded ? styles.arrowUp : styles.arrowDown}`}
        />
      </div>

      {/* 工具列表 */}
      {expanded && (
        <div className={styles.content}>
          <div className={styles.contentInner}>
            {calls.map((call, index) => (
              <ToolCallItem
                key={call.id || call.chunk_id || index}
                call={call}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolCalling;

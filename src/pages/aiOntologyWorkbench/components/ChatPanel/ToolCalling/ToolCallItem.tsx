/**
 * ToolCallItem - 单个工具调用项
 * 包含工具名称和 JSON 结果查看器
 */
import React, { useState } from 'react';
import { IconDown } from '@arco-design/web-react/icon';
import JSONViewer from './JSONViewer';
import { ToolCall } from '@/hooks/chat/types';
import styles from './ToolCalling.module.scss';

interface ToolCallItemProps {
  call: ToolCall;
}

const ToolCallItem: React.FC<ToolCallItemProps> = ({ call }) => {
  const [expanded, setExpanded] = useState(false);

  const hasOutput = call.output && Object.keys(call.output).length > 0;
  const hasInput = call.input && Object.keys(call.input).length > 0;

  return (
    <div className={styles.toolItem}>
      {/* 工具名称 */}
      <div className={styles.toolHeader} onClick={() => setExpanded(!expanded)}>
        <IconDown
          className={`${styles.toolArrow} ${expanded ? styles.toolArrowDown : ''}`}
        />
        <span className={styles.toolName}>{call.name || '未命名工具'}</span>
        {call.status === 'error' && (
          <span className={styles.errorBadge}>失败</span>
        )}
      </div>

      {/* JSON 结果 */}
      {expanded && (
        <div className={styles.toolContent}>
          {/* 输入参数 */}
          {hasInput && (
            <div className={styles.jsonSection}>
              <div className={styles.jsonLabel}>输入参数</div>
              <JSONViewer data={call.input} />
            </div>
          )}

          {/* 输出结果 */}
          {hasOutput && (
            <div className={styles.jsonSection}>
              <div className={styles.jsonLabel}>输出结果</div>
              <JSONViewer data={call.output} />
            </div>
          )}

          {/* 错误信息 */}
          {call.error && (
            <div className={styles.errorSection}>
              <div className={styles.errorLabel}>错误信息</div>
              <div className={styles.errorText}>{call.error}</div>
            </div>
          )}

          {/* 运行时间 */}
          {call.running_time && (
            <div className={styles.timeInfo}>用时: {call.running_time}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCallItem;

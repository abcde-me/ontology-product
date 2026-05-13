/**
 * ThinkingChain - 深度思考组件
 * 通用的思维链组件，支持多种步骤类型
 * 参考 ai-appforge 的 ThinkChain 和 x-main 的 thought-chain
 */
import React, { useState, useEffect, memo } from 'react';
import { IconDown } from '@arco-design/web-react/icon';
import ThinkingChainNode from './ThinkingChainNode';
import type { ThinkingChainProps } from './types';
import styles from './ThinkingChain.module.scss';

const ThinkingChain: React.FC<ThinkingChainProps> = ({
  steps,
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

  if (!steps || steps.length === 0) return null;

  // 按照接口返回的顺序显示，不进行前端排序
  // 因为可能存在多次思考和多次工具调用，顺序为：思考 → 工具1 → 思考 → 工具2 → 正文
  const visibleSteps = steps;

  // 计算总用时
  const totalTime = steps.reduce((acc, step) => {
    if (step.running_time) {
      const time = parseFloat(step.running_time);
      return acc + (isNaN(time) ? 0 : time);
    }
    return acc;
  }, 0);

  const headerText = allDone ? 'Agent执行完成' : 'Agent执行中...';
  const timeText = totalTime > 0 ? `用时${totalTime.toFixed(1)}s` : '';

  return (
    <div className={styles.thinkingChain}>
      {/* 链头 */}
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <span className={styles.headerText}>{headerText}</span>
        {timeText && <span className={styles.timeText}>{timeText}</span>}
        <IconDown
          className={`${styles.arrow} ${expanded ? styles.arrowUp : styles.arrowDown}`}
        />
      </div>

      {/* 步骤列表 */}
      {expanded && (
        <div className={styles.stepsList}>
          {visibleSteps.map((step, index) => (
            <ThinkingChainNode
              key={step.chunk_id || index}
              step={step}
              isLast={index === visibleSteps.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ThinkingChain);

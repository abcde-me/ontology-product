/**
 * ThinkingChain - 深度思考组件
 * 参考 ai-appforge 的 ThinkChain
 */
import React, { useState, useEffect, memo } from 'react';
import { IconDown } from '@arco-design/web-react/icon';
import ThinkingChainNode from './ThinkingChainNode';
import renderStepContent from './renderStepContent';
import type { ThinkingChainProps } from './types';
import styles from './ThinkingChain.module.scss';

// 获取步骤类型文本
const getStepTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    thinking: '深度思考',
    ontology: '本体工具调用',
    knowledge: '知识库调用',
    workflow: '工作流调用',
    mcp: 'MCP调用',
    http: '插件调用'
  };
  return typeMap[type] || '处理中';
};

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
              type={step.type}
              done={step.done}
              runningTime={step.running_time}
              isLast={index === visibleSteps.length - 1}
              typeText={getStepTypeText(step.type)}
            >
              {renderStepContent(step)}
            </ThinkingChainNode>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ThinkingChain);

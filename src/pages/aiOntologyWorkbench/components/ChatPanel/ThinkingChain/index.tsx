/**
 * ThinkingChain - 深度思考组件
 * 参考 ai-appforge 的 ThinkChain
 */
import React, { useEffect, useRef, memo } from 'react';
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
  const stepsListRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (stepsListRef.current) {
      stepsListRef.current.scrollTop = stepsListRef.current.scrollHeight;
    }
  }, [steps]);

  if (!steps || steps.length === 0) return null;

  const visibleSteps = steps;

  return (
    <div className={styles.thinkingChain}>
      {/* 步骤列表 - 始终展开，不显示头部 */}
      <div className={styles.stepsList} ref={stepsListRef}>
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
    </div>
  );
};

export default memo(ThinkingChain);

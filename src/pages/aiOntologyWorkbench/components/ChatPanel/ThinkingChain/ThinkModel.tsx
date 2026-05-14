/**
 * ThinkModel - 深度思考内容组件
 * 显示纯文本内容
 */
import React, { memo, useEffect, useRef } from 'react';
import { ThinkingStep } from '@/hooks/chat/types';
import { useAutoScroll } from '@/hooks/chat/useAutoScroll';
import styles from './ThinkingChain.module.scss';

interface ThinkModelProps {
  step: ThinkingStep;
}

const ThinkModel: React.FC<ThinkModelProps> = ({ step }) => {
  const { content, done } = step;
  const contentRef = useRef<HTMLDivElement>(null);

  // 使用智能滚动控制
  const { scrollToBottom, showGoBottom, forceScrollToBottom } = useAutoScroll(
    contentRef,
    {
      bottomThreshold: 20,
      showButtonThreshold: 80
    }
  );

  // 流式更新时自动滚动
  useEffect(() => {
    if (!done) {
      scrollToBottom('auto');
    }
  }, [content, done, scrollToBottom]);

  if (!content) return null;

  const textContent =
    typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  return (
    <div className={styles.contentCard}>
      <div className={styles.contentText} ref={contentRef}>
        {textContent}
      </div>
      {showGoBottom && (
        <button
          className={styles.goBottomButton}
          onClick={() => forceScrollToBottom('smooth')}
          aria-label="回到底部"
        >
          ↓
        </button>
      )}
    </div>
  );
};

export default memo(ThinkModel);

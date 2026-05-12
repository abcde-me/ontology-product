/**
 * AIBubble - AI 消息气泡（左侧）
 * 包含：ThinkingChain → ToolCalling → Markdown 内容
 */
import React, { memo } from 'react';
import ThinkingChain from '../ThinkingChain';
import MarkdownRenderer from '../MarkdownRenderer';
import { ChatMessage } from '@/hooks/chat/types';
import styles from './MessageBubble.module.scss';

interface AIBubbleProps {
  message: ChatMessage;
}

const AIBubble: React.FC<AIBubbleProps> = ({ message }) => {
  const { content, thinkingSteps, status } = message;

  const isStreaming = status === 'streaming';
  const isLoading = status === 'loading';
  const isDone = status === 'success';
  const isError = status === 'error';
  const isAbort = status === 'abort';

  // 判断是否有任何内容
  const hasThinkingSteps = thinkingSteps && thinkingSteps.length > 0;
  const hasContent = content && content.trim().length > 0;
  const hasAnyContent = hasThinkingSteps || hasContent;

  return (
    <div className={styles.aiBubbleContainer}>
      <div className={styles.aiAvatar}>
        <div className={styles.avatarIcon}>AI</div>
      </div>
      <div className={styles.aiBubble}>
        {/* 思维链 - 包含所有步骤（thinking、ontology 等） */}
        {hasThinkingSteps && (
          <ThinkingChain steps={thinkingSteps} allDone={isDone || isAbort} />
        )}

        {/* 正文内容 - Markdown */}
        {hasContent && (
          <div className={styles.aiContent}>
            <MarkdownRenderer content={content} />
          </div>
        )}

        {/* 错误状态 */}
        {isError && (
          <div className={styles.errorMessage}>
            {content || '生成失败，请重试'}
          </div>
        )}

        {/* 流式加载指示器 - 当没有任何内容且正在加载时显示 */}
        {(isLoading || (isStreaming && !hasAnyContent)) && (
          <div className={styles.loadingIndicator}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(AIBubble);

/**
 * AIBubble - AI 消息气泡（左侧）
 * 包含：ThinkingChain → ToolCalling → Markdown 内容 → OntologyActions
 */
import React, { memo } from 'react';
import ThinkingChain from '../ThinkingChain';
import MarkdownRenderer from '../MarkdownRenderer';
import OntologyActionCard from '../OntologyActionCard';
import { ChatMessage } from '@/hooks/chat/types';
import styles from './MessageBubble.module.scss';

interface AIBubbleProps {
  message: ChatMessage;
  onLocateNode?: (code: string) => void;
}

const AIBubble: React.FC<AIBubbleProps> = ({ message, onLocateNode }) => {
  const { content, thinkingSteps, ontologyActions, status } = message;

  const isStreaming = status === 'streaming';
  const isLoading = status === 'loading';
  const isDone = status === 'success';
  const isError = status === 'error';
  const isAbort = status === 'abort';

  // 判断是否有任何内容
  const hasThinkingSteps = thinkingSteps && thinkingSteps.length > 0;
  const hasContent = content && content.trim().length > 0;
  const hasOntologyActions = ontologyActions && ontologyActions.length > 0;
  const hasAnyContent = hasThinkingSteps || hasContent || hasOntologyActions;

  return (
    <div className={styles.aiBubbleContainer}>
      {/* 移除 AI 头像 */}
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

        {/* 本体操作卡片 - 显示在正文下方 */}
        {hasOntologyActions && (
          <div className={styles.ontologyActions}>
            {ontologyActions.map((action, index) => (
              <OntologyActionCard
                key={`${action.code}-${index}`}
                action={action}
                onLocate={onLocateNode}
              />
            ))}
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

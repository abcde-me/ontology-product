import React, { useEffect, useRef } from 'react';
import styles from '../index.module.scss';

interface AssistantThinkingDetailsProps {
  content: string;
  streaming?: boolean;
}

export default function AssistantThinkingDetails({
  content,
  streaming = false
}: AssistantThinkingDetailsProps) {
  const contentRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!streaming || !contentRef.current) {
      return;
    }
    contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [content, streaming]);

  if (!content.trim() && !streaming) {
    return null;
  }

  return (
    <details className={styles['assistant-thinking-details']}>
      <summary className={styles['assistant-thinking-summary']}>
        思考过程
        {streaming ? (
          <span className={styles['assistant-thinking-status']}>进行中…</span>
        ) : null}
      </summary>
      <pre ref={contentRef} className={styles['assistant-thinking-content']}>
        {content}
        {streaming ? (
          <span className={styles['assistant-thinking-cursor']}>▍</span>
        ) : null}
      </pre>
    </details>
  );
}

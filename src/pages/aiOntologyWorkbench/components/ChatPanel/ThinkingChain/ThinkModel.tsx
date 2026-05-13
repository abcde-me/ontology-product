/**
 * ThinkModel - 深度思考内容组件
 * 显示纯文本内容
 */
import React, { memo } from 'react';
import { ThinkingStep } from '@/hooks/chat/types';
import styles from './ThinkingChain.module.scss';

interface ThinkModelProps {
  step: ThinkingStep;
}

const ThinkModel: React.FC<ThinkModelProps> = ({ step }) => {
  const { content } = step;

  if (!content) return null;

  const textContent =
    typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  return (
    <div className={styles.contentCard}>
      <div className={styles.contentText}>{textContent}</div>
    </div>
  );
};

export default memo(ThinkModel);

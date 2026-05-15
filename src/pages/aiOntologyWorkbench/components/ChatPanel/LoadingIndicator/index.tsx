/**
 * LoadingIndicator - AI 消息加载指示器
 * 显示三个跳动的点，表示 AI 正在思考
 */
import React from 'react';
import styles from './LoadingIndicator.module.scss';

const LoadingIndicator: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.aiAvatar}>
        <div className={styles.avatarIcon}>AI</div>
      </div>
      <div className={styles.loadingDots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;

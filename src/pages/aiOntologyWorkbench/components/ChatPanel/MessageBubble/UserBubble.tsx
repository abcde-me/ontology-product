/**
 * UserBubble - 用户消息气泡（右侧）
 */
import React from 'react';
import UserFileCard from './UserFileCard';
import styles from './MessageBubble.module.scss';

interface UserBubbleProps {
  content: string;
  files?: any[];
}

const UserBubble: React.FC<UserBubbleProps> = ({ content, files }) => {
  return (
    <div className={styles.userBubbleContainer}>
      {/* 文件预览 - 显示在消息气泡上方 */}
      {files && files.length > 0 && (
        <div className={styles.userFiles}>
          <UserFileCard fileList={files} />
        </div>
      )}

      {/* 消息气泡 */}
      <div className={styles.userBubble}>
        <div className={styles.userContent}>{content}</div>
      </div>
    </div>
  );
};

export default UserBubble;

/**
 * UserBubble - 用户消息气泡（右侧）
 */
import React from 'react';
import styles from './MessageBubble.module.scss';

interface UserBubbleProps {
  content: string;
  files?: any[];
}

const UserBubble: React.FC<UserBubbleProps> = ({ content, files }) => {
  return (
    <div className={styles.userBubbleContainer}>
      <div className={styles.userBubble}>
        <div className={styles.userContent}>{content}</div>
        {files && files.length > 0 && (
          <div className={styles.userFiles}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                {file.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBubble;

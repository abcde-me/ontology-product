/**
 * MessageList - 消息列表组件
 * 渲染所有消息，使用 MessageBubble 组件
 */
import React, { memo } from 'react';
import MessageBubble from '../MessageBubble';
import { ChatMessage } from '@/hooks/chat/types';
import styles from './MessageList.module.scss';

interface MessageListProps {
  messages: ChatMessage[];
  onLocateNode?: (code: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onLocateNode
}) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className={styles.messageList}>
      {messages.map((message) => (
        <div key={message.id} className={styles.messageItem}>
          <MessageBubble message={message} onLocateNode={onLocateNode} />
        </div>
      ))}
    </div>
  );
};

export default memo(MessageList);

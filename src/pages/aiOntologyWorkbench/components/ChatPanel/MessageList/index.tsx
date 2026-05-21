/**
 * MessageList - 消息列表组件
 * 渲染所有消息，使用 MessageBubble 组件
 */
import React, { memo } from 'react';
import MessageBubble from '../MessageBubble';
import { ChatMessage, OntologyAction } from '@/hooks/chat/types';
import styles from './MessageList.module.scss';

interface MessageListProps {
  messages: ChatMessage[];
  ontologyId?: number | string; // 本体 ID
  onLocateNode?: (code: string) => void;
  onViewNode?: (action: OntologyAction) => void; // 查看节点回调
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  ontologyId,
  onLocateNode,
  onViewNode
}) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className={styles.messageList} style={{ userSelect: 'text' }}>
      {messages.map((message) => (
        <div key={message.id} className={styles.messageItem}>
          <MessageBubble
            message={message}
            ontologyId={ontologyId}
            onLocateNode={onLocateNode}
            onViewNode={onViewNode}
          />
        </div>
      ))}
    </div>
  );
};

export default memo(MessageList);

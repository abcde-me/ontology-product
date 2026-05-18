/**
 * MessageBubble - 消息气泡路由组件
 */
import React from 'react';
import UserBubble from './UserBubble';
import AIBubble from './AIBubble';
import { ChatMessage, OntologyAction } from '@/hooks/chat/types';

interface MessageBubbleProps {
  message: ChatMessage;
  ontologyId?: number | string; // 本体 ID
  onLocateNode?: (code: string) => void;
  onViewNode?: (action: OntologyAction) => void; // 查看节点回调
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  ontologyId,
  onLocateNode,
  onViewNode
}) => {
  if (message.type === 'user') {
    return <UserBubble content={message.content} files={message.files} />;
  }

  if (message.type === 'assistant') {
    return (
      <AIBubble
        message={message}
        ontologyId={ontologyId}
        onLocateNode={onLocateNode}
        onViewNode={onViewNode}
      />
    );
  }

  return null;
};

export default MessageBubble;

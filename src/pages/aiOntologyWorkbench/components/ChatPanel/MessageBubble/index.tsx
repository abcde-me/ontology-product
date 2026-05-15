/**
 * MessageBubble - 消息气泡路由组件
 */
import React from 'react';
import UserBubble from './UserBubble';
import AIBubble from './AIBubble';
import { ChatMessage } from '@/hooks/chat/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onLocateNode?: (code: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onLocateNode
}) => {
  if (message.type === 'user') {
    return <UserBubble content={message.content} files={message.files} />;
  }

  if (message.type === 'assistant') {
    return <AIBubble message={message} onLocateNode={onLocateNode} />;
  }

  return null;
};

export default MessageBubble;

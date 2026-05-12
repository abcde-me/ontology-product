/**
 * MessageBubble - 消息气泡路由组件
 */
import React from 'react';
import UserBubble from './UserBubble';
import AIBubble from './AIBubble';
import { ChatMessage } from '@/hooks/chat/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  if (message.type === 'user') {
    return <UserBubble content={message.content} files={message.files} />;
  }

  if (message.type === 'assistant') {
    return <AIBubble message={message} />;
  }

  return null;
};

export default MessageBubble;

import React from 'react';
import { memo } from 'react';
import ChatAiIcon from '@/assets/chat/chat-ai.svg';

const ChatLaoding = () => {
  return (
    <div className="flex items-center gap-[10px]">
      <ChatAiIcon />
      <div className="console-global-loading__loader--dots rounded-lg bg-[#EEF6FF] p-5">
        <div className="console-global-loading__loader--one mr-1"></div>
        <div className="console-global-loading__loader--two mr-1"></div>
        <div className="console-global-loading__loader--three"></div>
      </div>
    </div>
  );
};

export default memo(ChatLaoding);

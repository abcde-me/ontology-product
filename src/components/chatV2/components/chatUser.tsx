import React from 'react';
import { memo } from 'react';
import ChatUserIcon from '@/assets/chat/chat-user.svg';
import type { FC } from 'react';

type IchatUserProps = {
  question: string;
  done?: boolean;
};

const ChatUser: FC<IchatUserProps> = ({ question = '', done }) => {
  return (
    <div className="flex gap-[10px]">
      <div className="flex-shrink-0">
        <ChatUserIcon />
      </div>
      <div className="rounded-lg bg-[#438DFB] px-[20px] py-[12px] text-[14px] text-[#fff]">
        {question}
      </div>
    </div>
  );
};

export default memo(ChatUser);

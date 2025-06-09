import React from 'react';
import { memo } from 'react';
import AgentDefaultIcon from '@/assets/agent-icon.png';
import type { FC } from 'react';
import ChatSuggest from './chatSuggest';

interface IProps {
  onSend: (item: string) => void;
  recommend: any[];
  baseInfo: Record<string, string>;
}

const AgentInfo: FC<IProps> = ({ onSend, recommend, baseInfo }) => {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center">
      <img className="h-20 w-20" src={AgentDefaultIcon} alt="icon" />
      <span className="mt-[16px] text-[20px] font-[500] leading-[28px] text-[var(--color-text-1)]">
        {baseInfo?.agentName || '暂无配置'}
      </span>
      <div className="mb-0 mt-6 rounded-xl bg-[#EFF4FD] p-2 text-sm font-normal leading-6 text-black">
        {baseInfo?.agentDesc || '暂无配置'}
      </div>
      <div className="w-full">
        <ChatSuggest list={recommend} onSelect={onSend} />
      </div>
    </div>
  );
};

export default memo(AgentInfo);

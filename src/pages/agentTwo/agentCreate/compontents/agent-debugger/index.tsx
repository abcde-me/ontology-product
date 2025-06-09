import React, { useEffect, useState } from 'react';
import './index.css';
import Textarea from 'rc-textarea';
import Preview from './preview';
import ChatSendIcon from '@/assets/chat-send-icon.png';
import ClearIcon from '@/assets/clear-icon.svg';

function AgentDegubber(props) {

  useEffect(() => {}, []);

  return (
    <div className="w-full h-full flex flex-col shadow-border">
      <div className="text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)] mt-[14px] ml-[16px] pb-2">
        预览与调试
      </div>
      <div className="w-full flex-1 overflow-auto">
        {/* 默认 */}
        <Preview />
        {/* 会话 */}

      </div>
      <div className="flex flex-col items-center text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)] pt-3">
        <div className="flex items-center w-full pl-6 pr-6">
          <div className="flex items-center justify-center w-9 h-9 bg-white border border-[#CBD5E1] rounded-full flex-shrink-0">
            <ClearIcon className="w-4 h-4 text-[#CBD5E1]" />
          </div>
          <div className="flex items-end w-full p-4 border border-[#CBD5E1] rounded-[28px] ml-[16px] bg-white">
            <Textarea
              className={`
                text-sm leading-[22px] max-h-none w-full flex-auto resize-none appearance-none outline-none min-h-[22px] max-h-[132px] m-0 p-0 border-0 outline-0
              `}
              placeholder="发送消息"
              autoSize
            />
            <img className="w-5 h-5 ml-[4px] cursor-pointer" src={ChatSendIcon} />
          </div>
        </div>
        <div className="text-[12px] leading-[20px] text-[#B8BABF] mt-[8px] mb-[8px]">
          内容由 AI 生成，不能保证完全真实
        </div>
      </div>
    </div>
  );
}
export default AgentDegubber;

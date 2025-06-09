import React from 'react';
import type { FC } from 'react';
import { memo, useRef, useState } from 'react';
import Textarea from 'rc-textarea';
import type { EnableType, OnSend, VisionConfig } from '@/utils/type';
import useBreakpoints, { MediaType } from '@/utils/use-breakpoints';
import { Message, Tooltip } from '@arco-design/web-react';
import { IconArrowUp } from '@arco-design/web-react/icon';
import cn from 'classnames';
import './chat-input.css';

type ChatInputProps = {
  visionConfig?: VisionConfig;
  speechToTextConfig?: EnableType;
  onSend?: OnSend;
};
const ChatInput: FC<ChatInputProps> = ({
  visionConfig,
  speechToTextConfig,
  onSend
}) => {
  const isUseInputMethod = useRef(false);
  const [query, setQuery] = useState('');
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSend = () => {
    if (onSend) {
      if (!query || !query.trim()) {
        Message.error('提问不能为空');
        return;
      }
      onSend(query, []);
      setQuery('');
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code === 'Enter') {
      e.preventDefault();
      // prevent send message when using input method enter
      if (!e.shiftKey && !isUseInputMethod.current) handleSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    isUseInputMethod.current = e.nativeEvent.isComposing;
    if (e.code === 'Enter' && !e.shiftKey) {
      setQuery(query.replace(/\n$/, ''));
      e.preventDefault();
    }
  };

  const media = useBreakpoints();
  const isMobile = media === MediaType.mobile;
  const sendBtn = (
    <div
      onClick={handleSend}
      className={cn(
        'flex size-[28px] cursor-pointer items-center justify-center rounded-[4px] bg-[rgb(var(--primary-1))]',
        query.length > 0
          ? 'bg-[linear-gradient(135deg,#40B0FE_0%,#40B0FE_0%,#2761F3_100%)]'
          : ''
      )}
    >
      <IconArrowUp
        className={cn(
          'text-[16px] text-[rgb(var(--primary-3))]',
          query.length > 0 ? 'text-white' : ''
        )}
      />
    </div>
  );

  return (
    <div className="flex items-center">
      <div
        className={cn(
          'flex max-h-[150px] flex-auto items-end overflow-y-auto rounded-[8px] border-[2px] border-transparent bg-white p-[12px_19px]',
          'hover:border-[#40b0fe]',
          'appforge-input-container'
        )}
        style={{ boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.1)' }}
      >
        {visionConfig?.enabled && (
          <>
            <div className="absolute bottom-2 left-2 flex items-center">
              <div className="mx-1 h-4 w-[1px] bg-black/5" />
            </div>
            <div className="pl-[52px]"></div>
          </>
        )}
        <Textarea
          className={`
            mb-[4px] mr-[5px] block h-[28px] max-h-none w-full flex-auto resize-none appearance-none outline-none
            ${visionConfig?.enabled && 'pl-12'}
          `}
          placeholder="请输入问题"
          value={query}
          onChange={handleContentChange}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          autoSize
        />
        <div className="flex-none">
          {speechToTextConfig?.enabled ? (
            <div className="group ml-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-primary-50"></div>
          ) : null}
          {isMobile ? (
            sendBtn
          ) : (
            <Tooltip
              content={
                <div>
                  <div>发送 Enter</div>
                  <div>换行 Shift Enter</div>
                </div>
              }
            >
              {sendBtn}
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ChatInput);

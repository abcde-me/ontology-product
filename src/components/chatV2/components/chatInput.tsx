import React, { memo, useState, FC, useRef } from 'react';
import Textarea from 'rc-textarea';
import ClearIcon from '@/assets/chat/chat-clean.svg';
import ChatSendIcon from '@/assets/chat/chat-send.svg';
import ChatStopIcon from '@/assets/chat/chat-stop.svg';
import { Message } from '@arco-design/web-react';

type ChatInputProps = {
  done?: boolean;
  placeholder?: string;
  onSend?: (text: string) => void;
  onClean?: () => void;
  onStop?: () => void;
};

const ChatUserInput: FC<ChatInputProps> = ({
  done,
  placeholder = '您好，有什么可以帮您？',
  onSend,
  onClean,
  onStop
}) => {
  const textareaRef = useRef(null); // 创建ref引用文本框
  const [inputValue, setInputValue] = useState(''); // 初始化值

  const handleChange = (e) => setInputValue(e.target.value);

  const sendMessage = () => {
    if (!done) {
      Message.error('回复中，请稍后');
      return false;
    }
    if (inputValue.trim() !== '') {
      onSend && onSend(inputValue);
      setInputValue('');
      textareaRef.current && textareaRef.current.blur();
    }
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="box-shadow-[0px_0px_12px_0px] flex h-full w-full flex-col">
      <div className="w-full flex-1 overflow-auto"></div>
      <div className="flex flex-col items-center text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
        <div className="flex w-full items-center">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#CBD5E1] bg-white">
            <ClearIcon
              className="h-4 w-4 cursor-pointer text-[#CBD5E1]"
              onClick={onClean}
            />
          </div>
          <div
            className={`
           ml-[12px] flex w-full items-center rounded-[28px] 
            border-[2px] transition-all duration-200
           ${isFocused ? 'border-[#007DFA]' : 'border-[#CBD5E1]'} 
           bg-white px-4 py-2
         `}
          >
            <Textarea
              className={`
                m-0 max-h-[100px] min-h-[22px] w-full flex-auto resize-none appearance-none border-0 p-0 text-sm leading-[22px] outline-none outline-0
              `}
              ref={textareaRef}
              value={inputValue}
              onChange={handleChange}
              placeholder={placeholder}
              // disabled={!done}
              onPressEnter={sendMessage}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoSize={{ minRows: 1, maxRows: 6 }}
            />
            {done && (
              <ChatSendIcon
                className="h-4 w-4 cursor-pointer text-[#CBD5E1]"
                onClick={sendMessage}
              />
            )}

            {!done && (
              <ChatStopIcon
                className="cursor-pointer"
                onClick={onStop}
              ></ChatStopIcon>
            )}
          </div>
        </div>
        <div className="mt-[2px] text-[12px] leading-[20px] text-[#B8BABF]">
          内容由AI生成，仅供参考
        </div>
      </div>
    </div>
  );
};
export default memo(ChatUserInput);

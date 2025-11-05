import React, { FC } from 'react';
import { memo } from 'react';
import { Popover } from '@arco-design/web-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import TwoCopy from '@/assets/chat/chat-copy.svg';
import { copyCode } from '@/utils/json';
import { atelierHeathLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export interface Iprops {
  language: string;
  code: string;
}

const CodeBlock: FC<Iprops> = (props: Iprops) => {
  const handleCopy = () => {
    copyCode(props?.code);
  };
  return (
    <div>
      <div
        className="flex items-center justify-between border-b p-1 pl-3"
        style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
      >
        <div className="flex w-full items-center justify-between text-[13px] font-normal text-gray-500">
          <span>{props?.language || 'text'}</span>
          <Popover content="复制">
            <TwoCopy
              className="w-[16px] cursor-pointer hover:opacity-80"
              onClick={handleCopy}
            />
          </Popover>
        </div>
      </div>
      <SyntaxHighlighter
        {...props}
        style={atelierHeathLight}
        customStyle={{
          paddingLeft: 12,
          backgroundColor: '#fff'
        }}
        language={props?.language}
        showLineNumbers
        PreTag="div"
      >
        {props?.code}
      </SyntaxHighlighter>
    </div>
  );
};

export default memo(CodeBlock);

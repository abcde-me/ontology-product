import React from 'react';
import type { FC, ReactNode } from 'react';
import { memo, useRef } from 'react';
import type { ChatItem } from '@/utils/type';
import { Markdown } from '../../markdown';

type QuestionProps = {
  item: ChatItem;
  showPromptLog?: boolean;
  questionIcon?: ReactNode;
  isResponding?: boolean;
};
const Question: FC<QuestionProps> = ({ item, questionIcon }) => {
  const ref = useRef(null);
  const { content, message_files } = item;

  const imgSrcs = message_files?.length
    ? message_files.map((item) => item.url)
    : [];

  return (
    <div className="mb-2 flex justify-end pl-10 last:mb-0" ref={ref}>
      <div className="group relative">
        <div
          style={{
            background: 'linear-gradient(270deg, #40B0FE 0%, #2761F3 100%)'
          }}
          className="rounded-[8px] px-4 py-3 text-[14px] font-[600] leading-[22px]  text-[white]"
        >
          <Markdown content={content} />
        </div>
        <div className="mt-1 h-[18px]" />
      </div>
      <div className="h-10 w-10 shrink-0">
        {questionIcon || (
          <div className="h-full w-full rounded-full border-[0.5px] border-black/5"></div>
        )}
      </div>
    </div>
  );
};

export default memo(Question);

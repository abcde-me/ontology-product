import React from 'react';
import type { FC } from 'react';
import { memo } from 'react';

type SuggestedQuestionsProps = {
  list: { id: string; value: string }[];
  onSelect: (question: string) => void;
};
const ChatSuggest: FC<SuggestedQuestionsProps> = ({ list, onSelect }) => {
  return (
    <div className="mt-[8px] flex w-full flex-col items-start justify-between">
      {list
        .filter((question) => question.value)
        .map((question, index) => (
          <div
            key={index}
            className="mt-[8px] cursor-pointer rounded-xl border border-[#D4D6D9] px-3 py-2 text-[14px] font-normal leading-[24px] text-[#5C5F66] hover:bg-[#F2F2F2]"
            onClick={() => onSelect(question.value)}
          >
            {question?.value}
          </div>
        ))}
    </div>
  );
};

export default memo(ChatSuggest);

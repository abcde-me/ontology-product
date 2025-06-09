import React from 'react';
import type { FC } from 'react';
import { memo } from 'react';

type SuggestedQuestionsProps = {
  item: any;
};
const SuggestedQuestions: FC<SuggestedQuestionsProps> = ({ item }) => {
  const { isOpeningStatement, suggestedQuestions } = item;

  if (!isOpeningStatement || !suggestedQuestions?.length) return null;

  return (
    <div className="flex flex-col w-full justify-between items-start px-4 mt-[8px]">
      {suggestedQuestions
        .filter((q) => !!q && q.trim())
        .map((question, index) => (
          <div
            key={index}
            className="border border-[#D4D6D9] rounded-xl text-[14px] text-[#5C5F66] leading-[24px] font-normal py-2 px-3 mt-[8px]"
          >
            {question}
          </div>
        ))}
    </div>
  );
};

export default memo(SuggestedQuestions);

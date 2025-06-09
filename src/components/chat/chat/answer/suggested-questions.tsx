import React from 'react';
import type { FC } from 'react';
import { memo } from 'react';
import type { ChatItem } from '@/utils/type';
import { useChatContext } from '../context';

type SuggestedQuestionsProps = {
  item: ChatItem;
};
const SuggestedQuestions: FC<SuggestedQuestionsProps> = ({ item }) => {
  const { onSend } = useChatContext();
  const { isOpeningStatement, suggestedQuestions } = item;

  if (!isOpeningStatement || !suggestedQuestions?.length) return null;

  return (
    <div className="flex flex-wrap">
      {suggestedQuestions
        .filter((q) => !!q && q.trim())
        .map((question, index) => (
          <div
            key={index}
            className="mr-[8px] mt-[8px] max-w-full shrink-0 cursor-pointer items-center rounded-[4px] border border-[rgb(var(--primary-2))] bg-[rgb(var(--primary-1))] px-[8px] py-[3px]  last:mr-0"
            onClick={() => onSend?.(question)}
          >
            {question}
          </div>
        ))}
    </div>
  );
};

export default memo(SuggestedQuestions);

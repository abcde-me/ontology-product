import React from 'react';
import type { FC } from 'react';
import { memo } from 'react';
import type { OnSend } from '@/utils/type';
import Button from '@/components/button';

type TryToAskProps = {
  suggestedQuestions: string[];
  onSend: OnSend;
};
const TryToAsk: FC<TryToAskProps> = ({ suggestedQuestions, onSend }) => {
  return (
    <div>
      <div className="mb-2.5 flex items-center py-2">
        <div
          className="h-[1px] grow"
          style={{
            background:
              'linear-gradient(270deg, #F3F4F6 0%, rgba(243, 244, 246, 0) 100%)',
          }}
        />
        <div className="flex shrink-0 items-center px-3 text-gray-500">
          <span className="text-xs font-medium text-gray-500">试着问问</span>
        </div>
        <div
          className="h-[1px] grow"
          style={{
            background:
              'linear-gradient(270deg, rgba(243, 244, 246, 0) 0%, #F3F4F6 100%)',
          }}
        />
      </div>
      <div className="flex flex-wrap justify-center">
        {suggestedQuestions.map((suggestQuestion, index) => (
          <Button
            key={index}
            className="mb-2 mr-2 bg-white px-3 py-[5px] text-xs font-medium text-primary-600 last:mr-0"
            onClick={() => onSend(suggestQuestion)}
          >
            {suggestQuestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default memo(TryToAsk);

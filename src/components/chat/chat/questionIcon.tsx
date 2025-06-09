import { IconUser } from '@arco-design/web-react/icon';
import React from 'react';

export default function QuestionIcon() {
  return (
    <div className="group ml-[12px] flex size-[36px] flex-none cursor-pointer items-center justify-center rounded-[8px] bg-white">
      <div className="flex size-[26px] items-center justify-center rounded-[6px] bg-[rgb(var(--success-6))]">
        <IconUser className="text-[18px] text-white" />
      </div>
    </div>
  );
}

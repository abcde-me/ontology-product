import React, { useState } from 'react';
import { memo } from 'react';
import FileIcon from '@/assets/chat/file.svg';
import type { FC } from 'react';
import TextExpander from './textExpander';

export interface ITamperItems {
  chunkName: string;
  similay: string;
  name: string;
  content: string;
}

const ThinkKnowBaseItem: FC<{ item: ITamperItems }> = ({ item }) => {
  const { chunkName, similay, name, content } = item;

  const [open, setOpen] = useState(false); // 控制是否显示内容

  return (
    <div className="mt-2 flex flex-col gap-[10px] rounded-[8px] bg-[white] p-2">
      <div className="text-[12px] text-[#334155]">
        <span>{item?.chunkName}</span>
        <span className="ml-2">匹配分 {item?.similay}</span>
      </div>
      <div>
        <FileIcon className="mr-2"></FileIcon>
        <span className="font-bold">{item?.name}</span>
      </div>
      <div>
        {item?.content && <TextExpander text={item?.content}></TextExpander>}
      </div>
    </div>
  );
};

export default memo(ThinkKnowBaseItem);

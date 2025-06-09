import React, { useState } from 'react';
import { memo } from 'react';
import ArrowDownIcon from '@/assets/chat/arrow-down.svg';
import FileIcon from '@/assets/chat/file.svg';
import type { FC } from 'react';
import type { IstepsState } from '../constants/index';
import {
  getThinkTypeText,
  getIconByState,
  THINK_TIME_TEXT,
  THINK_UNIT
} from '../constants/index';
import ThinkKnowBaseItem from './thinkKnowBaseItem';

export interface ITamperItems {
  name: string;
  id: string;
  content: any[];
  state: IstepsState;
  time: number;
  type: string;
}

const ThinkKnowBase: FC<{ item: ITamperItems }> = ({ item }) => {
  const { name, id, time, state, type, content } = item;

  const [open, setOpen] = useState(false); // 控制是否显示内容

  const IconComponent = getIconByState(state);

  return (
    <div className="flex w-full min-w-0 flex-1 gap-[10px]">
      <div className="overflow-x-hidden rounded-[12px] bg-[#EEF6FF] p-[12px]">
        <div className="flex items-center">
          <div>
            {<IconComponent className="-mt-1 mr-2" />}
            <span>{getThinkTypeText(type)}</span>
            {time && (
              <>
                <span className="mx-1 text-[#aaa]">I</span>
                <span>
                  {THINK_TIME_TEXT}
                  <span className="mx-1 text-blue-600">{time}</span>
                  {THINK_UNIT}
                </span>
              </>
            )}
          </div>
          <div
            className="ml-1 flex cursor-pointer items-center transition-all duration-200"
            onClick={() => setOpen(!open)}
          >
            <ArrowDownIcon
              className={`ml-3 ${
                open
                  ? 'rotate-0 duration-100 ease-in-out'
                  : 'rotate-180 duration-100 ease-in-out'
              }`}
            ></ArrowDownIcon>
          </div>
        </div>
        {open && (
          <>
            {Array.isArray(content) &&
              content.length > 0 &&
              content.map((item, index) => {
                return (
                  <ThinkKnowBaseItem
                    item={item}
                    key={index}
                  ></ThinkKnowBaseItem>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ThinkKnowBase);

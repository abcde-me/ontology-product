import React, { useState } from 'react';
import { memo } from 'react';
import ArrowDownIcon from '@/assets/chat/arrow-down.svg';
import WorkflowIcon from '@/assets/chat/workflow.svg';
import PreviewJson from './previewJson';
import type { FC } from 'react';
import type { IstepsState } from '../constants/index';
import {
  getThinkTypeText,
  getIconByState,
  THINK_TIME_TEXT,
  THINK_UNIT
} from '../constants/index';

export interface IworkflowItems {
  name: string;
  id: string;
  request: string;
  response: string;
  state: IstepsState;
  time: number;
  type: string;
}

const ThinkWorkflow: FC<{ item: IworkflowItems }> = ({ item }) => {
  const { name, id, request, response, time, state, type } = item;

  const [open, setOpen] = useState(false); // 控制是否显示内容

  const IconComponent = getIconByState(state);

  return (
    <div className="flex w-full gap-[10px]">
      <div className="overflow-x-hidden rounded-[12px] bg-[#EEF6FF] p-[12px] ">
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
            <div className="my-4 flex min-w-0 items-center">
              <WorkflowIcon className="-mt-1 mr-2"></WorkflowIcon>
              <p className="min-w-0 flex-1 cursor-pointer text-blue-600 hover:underline">
                {name}
              </p>
            </div>

            <div>
              <div className="my-2 font-bold">Request</div>
              {request && (
                <>
                  <PreviewJson json={request} />
                </>
              )}
            </div>
            <div>
              <div className="my-2 font-bold">Response</div>
              {response && (
                <>
                  <PreviewJson json={response} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ThinkWorkflow);

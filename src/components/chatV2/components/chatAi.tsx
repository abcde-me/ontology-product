import React from 'react';
import { memo, useEffect, useState, useCallback } from 'react';
import ChatAiIcon from '@/assets/chat/chat-ai.svg';
import MarkdownBase from '@/components/markdownBase';
import type { FC } from 'react';
import {
  ThinkModel,
  ThinkWorkflow,
  ThinkTamper,
  ThinkKnowBase
} from '../index';
import {
  THINK_TYPE_MODEL,
  THINK_TYPE_KNOWBASE,
  THINK_TYPE_WORKFLOW,
  THINK_TYPE_TAMPER
} from '../constants/index';

export interface IChatItem {
  answer: string;
  question: string;
  setps: any[];
  like: string;
  id: string;
  done: boolean;
}

interface Iprops {
  item: IChatItem;
}

const ChatUser: FC<Iprops> = ({ item }) => {
  const { answer, setps, like, id, done } = item;

  const onChangeSup = useCallback((con: string) => {
    console.log(con);
  }, []);

  return (
    <div className="flex gap-[10px]">
      <div className="flex-shrink-0">
        <ChatAiIcon />
      </div>
      <div className="flex flex-col gap-4 overflow-x-hidden bg-transparent text-[14px]">
        {/* 思考过程工作流等 */}
        {Array.isArray(item?.setps) &&
          item?.setps?.length > 0 &&
          item?.setps.map((item, index) => {
            if (item.type === THINK_TYPE_MODEL)
              return <ThinkModel item={item} key={index}></ThinkModel>;

            if (item.type === THINK_TYPE_WORKFLOW) {
              return <ThinkWorkflow item={item} key={index}></ThinkWorkflow>;
            }
            if (item.type === THINK_TYPE_KNOWBASE) {
              return <ThinkKnowBase item={item} key={index}></ThinkKnowBase>;
            }

            if (item.type === THINK_TYPE_TAMPER) {
              return <ThinkTamper item={item} key={index}></ThinkTamper>;
            }
          })}

        {/* 正文输出 */}
        <MarkdownBase content={answer} onChangeSup={onChangeSup}></MarkdownBase>
      </div>
    </div>
  );
};

export default memo(ChatUser);

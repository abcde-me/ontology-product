import React from 'react';
import { memo } from 'react';
import type { FC } from 'react';
import CopyIcon from '@/assets/chat/chat-copy.svg';
import UpIcon from '@/assets/chat/thumb-up.svg';
import UpActiveIcon from '@/assets/chat/thumb-up-active.svg';
import DownIcon from '@/assets/chat/thumb-down.svg';

type ICHatFeedbackControlsProps = {
  copyHandler?: () => void;
  likeHandler?: (type: number) => void;
  like?: number;
};

const ChatFeedbackControls: FC<ICHatFeedbackControlsProps> = ({
  copyHandler,
  likeHandler,
  like = 0
}) => {
  return (
    <div className="ml-[50px] mt-4 flex gap-[10px]">
      <CopyIcon onClick={copyHandler} className="cursor-pointer"></CopyIcon>
      {like === 0 && (
        <>
          <UpIcon
            onClick={() => likeHandler(1)}
            className="cursor-pointer"
          ></UpIcon>
          <UpIcon
            onClick={() => likeHandler(2)}
            className="rotate-180 cursor-pointer"
          ></UpIcon>
        </>
      )}

      {like === 1 && (
        <>
          <UpActiveIcon
            onClick={() => likeHandler(0)}
            className="cursor-pointer"
          ></UpActiveIcon>
          <UpIcon
            onClick={() => likeHandler(2)}
            className="rotate-180 cursor-pointer"
          ></UpIcon>
        </>
      )}

      {like === 2 && (
        <>
          <UpIcon
            onClick={() => likeHandler(1)}
            className="cursor-pointer"
          ></UpIcon>
          <UpActiveIcon
            onClick={() => likeHandler(0)}
            className="rotate-180 cursor-pointer"
          ></UpActiveIcon>
        </>
      )}
    </div>
  );
};

export default memo(ChatFeedbackControls);

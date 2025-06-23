import React from 'react';
import type { FC } from 'react';
import { memo } from 'react';
import { Button, Space } from '@arco-design/web-react';
import { Markdown } from '@/components/markdown';
import type { Emoji, ChatItem, ThoughtItem } from '@/utils/type';
import Thought from '@/components/chat/thought';
import ReasonContent from './reason-content';
import dayjs from 'dayjs';

type AgentContentProps = {
  item: ChatItem;
  responding?: boolean;
  allToolIcons?: Record<string, string | Emoji>;
};
const AgentContent: FC<AgentContentProps> = ({
  item,
  responding,
  allToolIcons
}) => {
  const { annotation, agent_thoughts } = item;

  if (annotation?.logAnnotation)
    return <Markdown content={annotation?.logAnnotation.content || ''} />;

  return (
    <div>
      {agent_thoughts?.map((thought, index) => (
        <div key={index}>
          {/* {thought.thought && <Markdown content={thought.thought} />} */}
          {thought.thought && renderReason(thought)}
          {!!thought.tool && (
            <Thought
              thought={thought}
              allToolIcons={allToolIcons || {}}
              isFinished={!!thought.observation || !responding}
            />
          )}
        </div>
      ))}
    </div>
  );
};

function renderReason(item: ThoughtItem) {
  const thinkStartMatch = item?.thought?.match(/\<think\>/);
  if (thinkStartMatch && !item.thinkStart) {
    item.thinkStart = new Date();
  }
  const thinkEndMatch = item?.thought?.match(/\<\/think\>/);
  if (thinkEndMatch && !item.thinkEnd) {
    item.thinkEnd = new Date();
  }
  const isThinking = thinkStartMatch && !thinkEndMatch;
  const thinkTime = String(
    dayjs(item.thinkEnd).diff(dayjs(item.thinkStart), 'second')
  );

  return (
    <div className="ass-msg-content think-time">
      {thinkStartMatch ? (
        <Button
          disabled
          type="text"
          className="mr-[8px]"
          // TODO: ts错误
          // @ts-expect-error
          loading={isThinking}
          style={{
            padding: '0'
          }}
        >
          {isThinking ? (
            '思考中'
          ) : (
            <Space>
              <span>{`思考完成 (用时 ${thinkTime} 秒)`}</span>
            </Space>
          )}
        </Button>
      ) : null}
      <ReasonContent content={item.thought} />
    </div>
  );
}

export default memo(AgentContent);

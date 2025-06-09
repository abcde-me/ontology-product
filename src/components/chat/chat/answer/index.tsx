import type { ChatConfig, ChatItem, Emoji } from '@/utils/type';
import type { FC, ReactNode } from 'react';
import React, { memo } from 'react';
import AgentContent from './agent-content';
import BasicContent from './basic-content';
import More from './more';
import SuggestedQuestions from './suggested-questions';
import { IconLoading } from '@arco-design/web-react/icon';
import cn from 'classnames';

type AnswerProps = {
  item: ChatItem;
  question: string;
  index: number;
  config?: ChatConfig;
  answerIcon?: ReactNode;
  responding?: boolean;
  allToolIcons?: Record<string, string | Emoji>;
};
const Answer: FC<AnswerProps> = ({
  item,
  question,
  index,
  answerIcon,
  responding,
  allToolIcons
}) => {
  const { content, agent_thoughts, more } = item;

  //后端返回的因为不是流式的，所以会有一段时间的内容是空白的，这里判断下防止出现空白的响应
  const hasAgentThoughts =
    !!agent_thoughts?.length &&
    agent_thoughts.some((i) => i.thought?.length > 0);

  const showLoading = responding && !content && !hasAgentThoughts;
  return (
    <div className="mb-2 flex last:mb-0">
      <div className="relative h-10 w-10 shrink-0">
        <div className="flex h-[36px] w-[36px] items-center justify-center overflow-hidden rounded-[8px]">
          {answerIcon}
        </div>
      </div>
      <div className="chat-answer-container group ml-[12px] w-0 grow">
        <div className="relative pr-10">
          <div
            style={{ boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.0784)' }}
            className={cn(
              'group relative inline-block max-w-full overflow-auto rounded-[8px] bg-white px-4 py-3 text-[14px] text-sm font-[500] leading-[22px] text-[var(--color-text-2)] ',
              showLoading
                ? '!bg-[rgb(var(--primary-1))] text-[var(--color-text-4)]'
                : ''
            )}
          >
            {showLoading && (
              <div className="flex items-center justify-center">
                <IconLoading spin className="mr-[8px] text-[16px]" />
                <span>AppForge思考中，对话内容由AI自动生成...</span>
              </div>
            )}
            {content && !hasAgentThoughts && <BasicContent item={item} />}
            {hasAgentThoughts && (
              <AgentContent
                item={item}
                responding={responding}
                allToolIcons={allToolIcons}
              />
            )}
            <SuggestedQuestions item={item} />
          </div>
        </div>
        <More more={more} />
      </div>
    </div>
  );
};

export default memo(Answer);

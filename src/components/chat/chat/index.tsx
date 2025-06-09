import React from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { memo, useEffect, useRef } from 'react';
import { useThrottleEffect } from 'ahooks';
import { debounce } from 'lodash-es';
import type { ChatConfig, ChatItem, Feedback, OnSend } from '@/utils/type';
import Question from './question';
import Answer from './answer';
import ChatInput from './chat-input';
import TryToAsk from './try-to-ask';
import { ChatContextProvider } from './context';
import type { Emoji } from '@/utils/type';
import { IconRecordStop } from '@arco-design/web-react/icon';
import { Button } from '@arco-design/web-react';

export type ChatProps = {
  chatList: ChatItem[];
  config?: ChatConfig;
  isResponding?: boolean;
  noStopResponding?: boolean;
  onStopResponding?: () => void;
  noChatInput?: boolean;
  onSend?: OnSend;
  chatContainerclassName?: string;
  chatContainerInnerClassName?: string;
  chatFooterClassName?: string;
  chatFooterInnerClassName?: string;
  suggestedQuestions?: string[];
  showPromptLog?: boolean;
  questionIcon?: ReactNode;
  answerIcon?: ReactNode;
  allToolIcons?: Record<string, string | Emoji>;
  onAnnotationEdited?: (
    question: string,
    answer: string,
    index: number
  ) => void;
  onAnnotationAdded?: (
    annotationId: string,
    authorName: string,
    question: string,
    answer: string,
    index: number
  ) => void;
  onAnnotationRemoved?: (index: number) => void;
  chatNode?: ReactNode;
  onFeedback?: (messageId: string, feedback: Feedback) => void;
  bottomStyle?: CSSProperties;
};
const Chat: FC<ChatProps> = ({
  config,
  onSend,
  chatList,
  isResponding,
  noStopResponding,
  onStopResponding,
  noChatInput,
  chatContainerclassName,
  chatContainerInnerClassName,
  chatFooterClassName,
  chatFooterInnerClassName,
  suggestedQuestions,
  showPromptLog,
  questionIcon,
  answerIcon,
  allToolIcons,
  onAnnotationAdded,
  onAnnotationEdited,
  onAnnotationRemoved,
  chatNode,
  onFeedback,
  bottomStyle
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerInnerRef = useRef<HTMLDivElement>(null);
  const chatFooterRef = useRef<HTMLDivElement>(null);
  const chatFooterInnerRef = useRef<HTMLDivElement>(null);

  const handleScrolltoBottom = () => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
  };

  const handleWindowResize = () => {
    if (chatContainerRef.current && chatFooterRef.current)
      chatFooterRef.current.style.width = `${chatContainerRef.current.clientWidth}px`;

    if (chatContainerInnerRef.current && chatFooterInnerRef.current)
      chatFooterInnerRef.current.style.width = `${chatContainerInnerRef.current.clientWidth}px`;
  };

  useThrottleEffect(
    () => {
      handleScrolltoBottom();
      // handleWindowResize();
    },
    [chatList],
    { wait: 500 }
  );

  // useEffect(() => {
  //   window.addEventListener('resize', debounce(handleWindowResize));
  //   return () => window.removeEventListener('resize', handleWindowResize);
  // }, []);

  useEffect(() => {
    if (chatFooterRef.current && chatContainerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { blockSize } = entry.borderBoxSize[0];
          if (chatContainerRef.current)
            chatContainerRef.current.style.paddingBottom = `${blockSize}px`;
          handleScrolltoBottom();
        }
      });

      resizeObserver.observe(chatFooterRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [chatFooterRef, chatContainerRef]);

  const hasTryToAsk =
    config?.suggested_questions_after_answer?.enabled &&
    !!suggestedQuestions?.length &&
    onSend;

  return (
    <ChatContextProvider
      config={config}
      chatList={chatList}
      isResponding={isResponding}
      showPromptLog={showPromptLog}
      questionIcon={questionIcon}
      answerIcon={answerIcon}
      allToolIcons={allToolIcons}
      onSend={onSend}
      onAnnotationAdded={onAnnotationAdded}
      onAnnotationEdited={onAnnotationEdited}
      onAnnotationRemoved={onAnnotationRemoved}
      onFeedback={onFeedback}
    >
      <div className="relative h-full overflow-y-auto overflow-x-hidden">
        <div
          ref={chatContainerRef}
          className={`relative h-full overflow-y-auto ${chatContainerclassName}`}
        >
          {chatNode}
          <div
            ref={chatContainerInnerRef}
            className={`${chatContainerInnerClassName}`}
          >
            {chatList.map((item, index) => {
              if (item.isAnswer) {
                const isLast = item.id === chatList[chatList.length - 1]?.id;
                return (
                  <Answer
                    key={item.id}
                    item={item}
                    question={chatList[index - 1]?.content}
                    index={index}
                    config={config}
                    answerIcon={answerIcon}
                    responding={isLast && isResponding}
                    allToolIcons={allToolIcons}
                  />
                );
              }
              return (
                <Question
                  key={item.id}
                  item={item}
                  showPromptLog={showPromptLog}
                  questionIcon={questionIcon}
                  isResponding={isResponding}
                />
              );
            })}
          </div>
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 pt-[15px] ${
            (hasTryToAsk || !noChatInput || !noStopResponding) &&
            chatFooterClassName
          }`}
          ref={chatFooterRef}
          style={{
            background:
              'linear-gradient(0deg, rgb(var(--primary-2)) 60%, rgba(var(--primary-2),0) 100%)',
            ...bottomStyle
          }}
        >
          <div
            ref={chatFooterInnerRef}
            className={`${chatFooterInnerClassName}`}
          >
            {!noStopResponding && isResponding && (
              <div className="mb-2 flex justify-center">
                <Button
                  type="secondary"
                  size="mini"
                  onClick={onStopResponding}
                  icon={<IconRecordStop />}
                >
                  停止响应
                </Button>
              </div>
            )}
            {hasTryToAsk && (
              <TryToAsk
                suggestedQuestions={suggestedQuestions}
                onSend={onSend}
              />
            )}
            {!noChatInput && (
              <ChatInput
                visionConfig={config?.file_upload?.image}
                speechToTextConfig={config?.speech_to_text}
                onSend={onSend}
              />
            )}
          </div>
          <div className="mt-[16px] text-center text-[var(--color-text-5)]">
            AI⽣成内容仅供参考，不代表平台⽴场
          </div>
        </div>
      </div>
    </ChatContextProvider>
  );
};

export default memo(Chat);

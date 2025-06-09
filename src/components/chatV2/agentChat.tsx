import React, { useCallback, useRef, useState, useEffect } from 'react';
import { memo } from 'react';
import { useImmer } from 'use-immer';
import { Message } from '@arco-design/web-react';
import type { FC } from 'react';
import { copyCode } from '@/utils/json';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAgentEditor } from '@/pages/agentTwo/agentCreate/compontents/AgentProvider/Context';
import {
  AgentInfo,
  ChatInput,
  ChatAi,
  ChatUser,
  ChatLoading,
  ChatFeedbackControls
} from './index';
import './style/index.less';
import {
  THINK_TYPE_MODEL,
  THINK_TYPE_KNOWBASE,
  THINK_TYPE_WORKFLOW,
  THINK_TYPE_TAMPER
} from './constants/index';
import { PrefixV2 } from '@/api/endpoints';

type IangentChatProps = {
  appId: string | number;
  modelConfigId: string | number;
  recommend: any[];
  baseInfo: Record<string, string>;
};

const ADD_CHAT_ITEM = {
  answer: '',
  question: '',
  type: '',
  like: 0, // 0 代表未点赞，1 代表已点赞 2踩
  id: '',
  done: false, // 是否完成 默认是false
  reasoning_content: '' // 深度思考内容的过程
};

const AgentChat: FC<IangentChatProps> = ({
  appId,
  modelConfigId,
  recommend,
  baseInfo
}) => {
  const currentCtrl = useRef<any>(null);

  const [pending, setPending] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [chatList, setChatList] = useImmer<any[]>([]);

  const addQuestion = useCallback(
    (q: string) => {
      setChatList((draft) => {
        draft.push({
          ...ADD_CHAT_ITEM,
          question: q.trim()
        });
      });
    },
    [setChatList]
  );

  const goChatBottom = useCallback(
    (behavior = 'smooth') => {
      const node = chatBottomRef.current;
      if (node) {
        // 滚动到DOM节点的底部
        node.scrollIntoView({
          block: 'center',
          behavior
        });
      }
    },
    [chatBottomRef]
  );

  const lastChatDone = useCallback(() => {
    currentCtrl.current?.abort();

    setChatList((draft) => {
      draft[draft.length - 1].done = true;
    });

    setPending(() => false);
    setStreaming(() => false);
  }, [setChatList]);

  const onStop = useCallback(() => {
    lastChatDone();

    setChatList((draft) => {
      draft[draft.length - 1].answer =
        draft[draft.length - 1].answer + '\n\n 您中途停止生成回答';
    });
    Message.success('已停止生成');
  }, [lastChatDone, setChatList]);

  const onClean = useCallback(() => {
    lastChatDone();
    setChatList(() => []);
  }, [lastChatDone, setChatList]);

  const send = useCallback(
    (q: string) => {
      if (!q) {
        Message.error('提问问题为空，请输入问题');
        return;
      }

      addQuestion(q);

      goChatBottom('auto');

      currentCtrl.current = new AbortController();
      const url = `${PrefixV2}/apps/${appId}/chat-messages`;

      setPending(() => true);

      fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/event-stream',
          Accept: ['text/event-stream', 'application/json'] as unknown as string
        },
        body: JSON.stringify({
          streaming: 'streaming',
          query: q,
          model_config_id: modelConfigId
        }),
        openWhenHidden: true,
        signal: currentCtrl.current.signal,
        onopen(e: any) {
          if (e.ok && e.headers.get('content-type') === 'text/event-stream') {
            setPending(() => false);
            setStreaming(() => true);
          } else if (e.headers.get('content-type') === 'application/json') {
            return e
              .json()
              .then((data: any) => {
                console.log(e, 'open-error');
                setPending(() => false);
                Message.error(`${data?.msg}` || '提问失败 请稍后再试');
                currentCtrl.current?.abort();
              })
              .catch(() => {
                console.log(e, 'open-error');
                setPending(() => false);
                Message.error(`${e?.msg}` || '提问失败 请稍后再试');
                currentCtrl.current?.abort();
              });
          }
        },
        onmessage(msg) {
          try {
            const res: any = JSON.parse(msg.data);
            setChatList((draft) => {
              draft[draft.length - 1].answer =
                draft[draft.length - 1].answer + res?.content;
            });
            // 滚动底部
            setTimeout(() => {
              goChatBottom();
            }, 300);
          } catch (e) {
            console.log('msgdata-error', e);
          }
        },
        onclose() {
          console.log('close');
          lastChatDone();
          currentCtrl.current?.abort();
          // 设置id
          setChatList((draft) => {
            draft[draft.length - 1].id = new Date().toString();
          });
        },
        onerror(err: any) {
          console.log('onerror');
          lastChatDone();
          currentCtrl.current?.abort();
        }
      });
    },
    [addQuestion, appId, goChatBottom, lastChatDone, modelConfigId, setChatList]
  );

  const handleCopy = useCallback((con: string) => {
    copyCode(con);
  }, []);

  const handelFeedback = useCallback(
    (id: string, type: number) => {
      setChatList((draft) => {
        const list = draft;
        for (const item of list) {
          if (item.id === id) {
            item.like = type;
          }
        }
        return list;
      });
    },
    [setChatList]
  );

  return (
    <div className="mt-4 flex h-full w-full flex-col overflow-hidden px-[20px]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        {/* 为空介绍 */}
        {chatList?.length === 0 && (
          <AgentInfo
            onSend={send}
            recommend={recommend}
            baseInfo={baseInfo}
          ></AgentInfo>
        )}

        {/* 此处处理会话列表 */}

        {chatList?.length > 0 &&
          chatList.map((item, index) => {
            return (
              <React.Fragment key={index}>
                {/* 提问 */}
                {item?.question && (
                  <ChatUser question={item.question}></ChatUser>
                )}
                {/* 回复 */}
                {item?.answer && (
                  <div>
                    <ChatAi item={item}></ChatAi>
                    {/* 点赞操作 */}
                    {item?.id && item.done && (
                      <ChatFeedbackControls
                        copyHandler={() => handleCopy(item.answer)}
                        likeHandler={(type) => handelFeedback(item.id, type)}
                        like={item?.like}
                      ></ChatFeedbackControls>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}

        {/* loading */}
        {chatList?.length > 0 && pending && <ChatLoading></ChatLoading>}

        {/* 流式输出动画 */}
        {streaming && (
          <span className="arco-spin-icon ml-[50px]">
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              viewBox="0 0 48 48"
              aria-hidden="true"
              focusable="false"
              className="arco-icon arco-icon-loading"
            >
              <path d="M42 24c0 9.941-8.059 18-18 18S6 33.941 6 24 14.059 6 24 6"></path>
            </svg>
          </span>
        )}

        {/* 底部滚动 */}
        {chatList?.length > 0 && (
          <div ref={chatBottomRef} className="mt-32"></div>
        )}
      </div>
      <div className="my-2">
        <ChatInput
          onSend={send}
          onStop={onStop}
          onClean={onClean}
          done={!pending && !streaming}
        ></ChatInput>
      </div>
    </div>
  );
};

export default memo(AgentChat);

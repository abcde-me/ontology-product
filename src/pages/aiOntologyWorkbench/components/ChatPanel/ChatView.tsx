import React, { useRef, useEffect } from 'react';
import { Sender } from '@ceai-front/chat';
import { UploadProps } from '@arco-design/web-react';
import { Button } from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';
import MessageList from './MessageList';
import LoadingIndicator from './LoadingIndicator';
import { ChatMessage } from '@/hooks/chat/types';
import { useAutoScroll } from '@/hooks/chat';
import styles from './ChatPanel.module.scss';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  onSend: (params: {
    text: string;
    files?: any[];
    enableDeepThink: boolean;
  }) => void;
  onStop: () => void;
  uploaderProps?: Partial<UploadProps>;
  GetFile?: (params: { id: string }) => Promise<any>;
  GetAudioText: (
    formData: FormData
  ) => Promise<{ data: { content: { text: string; type: string }[] } }>;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  isStreaming,
  onSend,
  onStop,
  uploaderProps,
  GetFile,
  GetAudioText
}) => {
  // 消息列表容器的 ref
  const messageListRef = useRef<HTMLDivElement>(null);

  // 使用自动滚动 hook
  const { showGoBottom, scrollToBottom, forceScrollToBottom } = useAutoScroll(
    messageListRef,
    {
      bottomThreshold: 20,
      showButtonThreshold: 80
    }
  );

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      // 流式输出时使用 scrollToBottom（尊重用户滚动状态）
      if (isStreaming) {
        scrollToBottom('auto');
      }
    }
  }, [messages, isStreaming, scrollToBottom]);

  // 发送新消息时强制滚动到底部
  const handleSend = (params: {
    text: string;
    files?: any[];
    enableDeepThink: boolean;
  }) => {
    onSend(params);
    // 延迟一帧，确保新消息已经渲染
    requestAnimationFrame(() => {
      forceScrollToBottom('smooth');
    });
  };

  // 只有在没有消息或最后一条消息不是 assistant 时才显示 LoadingIndicator
  const shouldShowLoading =
    isLoading &&
    (messages.length === 0 ||
      messages[messages.length - 1]?.type !== 'assistant');

  return (
    <div className="relative flex h-full flex-col">
      {/* 消息列表 - 可滚动，隐藏滚动条 */}
      <div
        ref={messageListRef}
        className={`flex-1 overflow-y-auto p-5 ${styles.scrollbarHide}`}
      >
        <MessageList messages={messages} />

        {/* Loading 指示器 - 只在特定条件下显示 */}
        {shouldShowLoading && <LoadingIndicator />}
      </div>

      {/* 回到底部按钮 */}
      {showGoBottom && (
        <div className={styles.goBottomButton}>
          <Button
            type="primary"
            shape="circle"
            icon={<IconDown />}
            onClick={() => forceScrollToBottom('smooth')}
          />
        </div>
      )}

      {/* Sender 组件 - 固定在底部 */}
      <div className="w-full flex-shrink-0 p-5">
        <Sender
          placeholder="输入消息..."
          onSend={handleSend}
          onStop={onStop}
          isChatting={isLoading || isStreaming}
          showDeepThink={false}
          showFileUpload={true}
          showAudioRecord={false}
          showAITips={true}
          uploaderProps={{
            ...uploaderProps
          }}
          singleFileLimit={60 * 1024 * 1024}
          totalFileLimit={60 * 1024 * 1024}
          GetFile={GetFile}
          GetAudioText={GetAudioText}
        />
      </div>
    </div>
  );
};

export default ChatView;

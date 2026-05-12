import React from 'react';
import { Sender } from '@ceai-front/chat';
import { UploadProps } from '@arco-design/web-react';
import MessageList from './MessageList';
import LoadingIndicator from './LoadingIndicator';
import { ChatMessage } from '@/hooks/chat/types';
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
  // 只有在没有消息或最后一条消息不是 assistant 时才显示 LoadingIndicator
  const shouldShowLoading =
    isLoading &&
    (messages.length === 0 ||
      messages[messages.length - 1]?.type !== 'assistant');

  return (
    <div className="flex h-full flex-col">
      {/* 消息列表 - 可滚动，隐藏滚动条 */}
      <div className={`flex-1 overflow-y-auto p-5 ${styles.scrollbarHide}`}>
        <MessageList messages={messages} />

        {/* Loading 指示器 - 只在特定条件下显示 */}
        {shouldShowLoading && <LoadingIndicator />}
      </div>

      {/* Sender 组件 - 固定在底部 */}
      <div className="w-full flex-shrink-0 p-5">
        <Sender
          placeholder="输入消息..."
          onSend={onSend}
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

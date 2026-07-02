import React, { useRef, useEffect } from 'react';
import { UploadProps, Spin } from '@arco-design/web-react';
import MessageList from './MessageList';
import LoadingIndicator from './LoadingIndicator';
import WorkbenchChatSender, {
  WorkbenchSendParams
} from './WorkbenchChatSender';
import { ChatMessage, OntologyAction } from '@/hooks/chat/types';
import { useAutoScroll } from '@/hooks/chat';
import styles from './ChatPanel.module.scss';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  isLoadingHistory: boolean;
  agentSending?: boolean;
  ontologyId?: number | string;
  onSend: (params: WorkbenchSendParams) => void;
  onStop: () => void;
  uploaderProps?: Partial<UploadProps>;
  GetFile?: (params: { id: string }) => Promise<any>;
  GetAudioText: (
    formData: FormData
  ) => Promise<{ data: { content: { text: string; type: string }[] } }>;
  onLocateNode?: (code: string) => void;
  onViewNode?: (action: OntologyAction) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  isStreaming,
  isLoadingHistory,
  agentSending = false,
  ontologyId,
  onSend,
  onStop,
  uploaderProps,
  GetFile,
  GetAudioText,
  onLocateNode,
  onViewNode
}) => {
  const messageListRef = useRef<HTMLDivElement>(null);

  const { scrollToBottom, forceScrollToBottom } = useAutoScroll(
    messageListRef,
    {
      bottomThreshold: 20,
      showButtonThreshold: 80
    }
  );

  useEffect(() => {
    if (messages.length > 0 && isStreaming) {
      scrollToBottom('auto');
    }
  }, [messages, isStreaming, scrollToBottom]);

  const handleSend = (params: WorkbenchSendParams) => {
    onSend(params);
    requestAnimationFrame(() => {
      forceScrollToBottom('smooth');
    });
  };

  const shouldShowLoading =
    isLoading &&
    (messages.length === 0 ||
      messages[messages.length - 1]?.type !== 'assistant');

  return (
    <div className="relative flex h-full flex-col">
      {isLoadingHistory ? (
        <div className="flex flex-1 items-center justify-center">
          <Spin />
        </div>
      ) : (
        <>
          <div
            ref={messageListRef}
            className={`flex-1 overflow-y-auto px-[20px] pb-5 pt-[8px] ${styles.scrollbarHide}`}
            style={{ userSelect: 'text' }}
          >
            <MessageList
              messages={messages}
              ontologyId={ontologyId}
              onLocateNode={onLocateNode}
              onViewNode={onViewNode}
            />
            {shouldShowLoading && <LoadingIndicator />}
          </div>

          <div className="w-full flex-shrink-0 px-[20px] pb-[8px]">
            <WorkbenchChatSender
              placeholder="输入消息..."
              onSend={handleSend}
              onStop={onStop}
              isChatting={isLoading || isStreaming}
              agentSending={agentSending}
              uploaderProps={uploaderProps}
              GetFile={GetFile}
              GetAudioText={GetAudioText}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatView;

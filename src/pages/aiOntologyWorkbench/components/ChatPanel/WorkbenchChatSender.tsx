import React, { useRef, useCallback } from 'react';
import { Sender } from '@ceai-front/chat';
import { Button, Message, UploadProps } from '@arco-design/web-react';
import { IconRobot } from '@arco-design/web-react/icon';

export interface WorkbenchSendParams {
  text: string;
  files?: any[];
  enableDeepThink: boolean;
  useAgentSse?: boolean;
}

interface WorkbenchChatSenderProps {
  placeholder?: string;
  isChatting?: boolean;
  onSend: (params: WorkbenchSendParams) => void;
  onStop?: () => void;
  uploaderProps?: Partial<UploadProps>;
  GetFile?: (params: { id: string }) => Promise<any>;
  GetAudioText: (
    formData: FormData
  ) => Promise<{ data: { content: { text: string; type: string }[] } }>;
  agentSending?: boolean;
}

const readSenderInput = (root: HTMLElement | null) => {
  const textarea = root?.querySelector('textarea');
  return textarea?.value?.trim() || '';
};

const WorkbenchChatSender: React.FC<WorkbenchChatSenderProps> = ({
  placeholder = '输入消息...',
  isChatting = false,
  onSend,
  onStop,
  uploaderProps,
  GetFile,
  GetAudioText,
  agentSending = false
}) => {
  const senderRootRef = useRef<HTMLDivElement>(null);

  const handleDirectSend = useCallback(
    (params: { text: string; files?: any[]; enableDeepThink: boolean }) => {
      onSend({ ...params, useAgentSse: false });
    },
    [onSend]
  );

  const handleAgentClick = useCallback(() => {
    if (isChatting || agentSending) {
      return;
    }

    const text = readSenderInput(senderRootRef.current);
    if (!text) {
      Message.warning('请先输入消息');
      return;
    }

    onSend({
      text,
      files: [],
      enableDeepThink: true,
      useAgentSse: true
    });
  }, [agentSending, isChatting, onSend]);

  return (
    <div ref={senderRootRef}>
      <Sender
        placeholder={placeholder}
        onSend={handleDirectSend}
        onStop={onStop}
        isChatting={isChatting}
        showDeepThink={false}
        showFileUpload={true}
        showAudioRecord={false}
        showAITips={true}
        uploaderProps={uploaderProps}
        singleFileLimit={60 * 1024 * 1024}
        totalFileLimit={60 * 1024 * 1024}
        GetFile={GetFile}
        GetAudioText={GetAudioText}
        leftExtraActions={
          <Button
            type="outline"
            size="small"
            icon={<IconRobot />}
            loading={agentSending}
            disabled={isChatting}
            onClick={handleAgentClick}
          >
            Agent
          </Button>
        }
      />
    </div>
  );
};

export default WorkbenchChatSender;

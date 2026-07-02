import React from 'react';
import { UploadProps } from '@arco-design/web-react';
import WelcomeSection from './components/WelcomeSection';
import Introduction from './components/Introduction';
import PromptsSection from './components/PromptsSection';
import WorkbenchChatSender, {
  WorkbenchSendParams
} from './WorkbenchChatSender';
import { PromptItem } from './types';
import styles from './ChatPanel.module.scss';

interface WelcomeViewProps {
  prompts: PromptItem[];
  agentSending?: boolean;
  isChatting?: boolean;
  onPromptSelect: (params: { id: string; text: string }) => void;
  onSend: (params: WorkbenchSendParams) => void;
  uploaderProps?: Partial<UploadProps>;
  GetFile?: (params: { id: string }) => Promise<any>;
  GetAudioText: (
    formData: FormData
  ) => Promise<{ data: { content: { text: string; type: string }[] } }>;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  prompts,
  agentSending = false,
  isChatting = false,
  onPromptSelect,
  onSend,
  uploaderProps,
  GetFile,
  GetAudioText
}) => {
  return (
    <div className="flex h-full flex-col">
      <div className={`flex-1 overflow-y-auto ${styles.scrollbarHide}`}>
        <div className="flex min-h-full flex-col items-center justify-center px-[20px] py-8">
          <div className="flex w-full flex-col items-center gap-6">
            <WelcomeSection />
            <Introduction />
            <PromptsSection prompts={prompts} onSelect={onPromptSelect} />
          </div>
        </div>
      </div>

      <div className="w-full flex-shrink-0 px-[20px] pb-[8px]">
        <WorkbenchChatSender
          placeholder="您好，有什么可以帮您？"
          onSend={onSend}
          isChatting={isChatting}
          agentSending={agentSending}
          uploaderProps={uploaderProps}
          GetFile={GetFile}
          GetAudioText={GetAudioText}
        />
      </div>
    </div>
  );
};

export default WelcomeView;

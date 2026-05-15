import React from 'react';
import { Sender } from '@ceai-front/chat';
import { UploadProps } from '@arco-design/web-react';
import WelcomeSection from './components/WelcomeSection';
import Introduction from './components/Introduction';
import PromptsSection from './components/PromptsSection';
import { PromptItem } from './types';
import styles from './ChatPanel.module.scss';

interface WelcomeViewProps {
  prompts: PromptItem[];
  onPromptSelect: (params: { id: string; text: string }) => void;
  onSend: (params: {
    text: string;
    files?: any[];
    enableDeepThink: boolean;
  }) => void;
  uploaderProps?: Partial<UploadProps>;
  GetFile?: (params: { id: string }) => Promise<any>;
  GetAudioText: (
    formData: FormData
  ) => Promise<{ data: { content: { text: string; type: string }[] } }>;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  prompts,
  onPromptSelect,
  onSend,
  uploaderProps,
  GetFile,
  GetAudioText
}) => {
  return (
    <div className="flex h-full flex-col">
      {/* 内容区域 - 可滚动，隐藏滚动条 */}
      <div className={`flex-1 overflow-y-auto ${styles.scrollbarHide}`}>
        <div className="flex min-h-full flex-col items-center justify-center px-5 py-8">
          <div className="flex w-full max-w-[600px] flex-col items-center gap-6">
            <WelcomeSection />
            <Introduction />
            <PromptsSection prompts={prompts} onSelect={onPromptSelect} />
          </div>
        </div>
      </div>

      {/* Sender 组件 - 固定在底部 */}
      <div className="w-full flex-shrink-0 p-5">
        <Sender
          placeholder="您好，有什么可以帮您？"
          onSend={onSend}
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

export default WelcomeView;

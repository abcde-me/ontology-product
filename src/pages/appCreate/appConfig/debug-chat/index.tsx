import { Button } from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { appConfigStore } from '../model';
import { useChat } from '@/components/chat/chat/hooks';
import { OnSend } from '@/utils/type';
import Chat from '@/components/chat/chat';
import {
  getChatMessagesRequest,
  getChatSuggestedQuestionRequest
} from '@/utils/api';
import { ResourceEndpoints } from '@/api/endpoints';
import QuestionIcon from '@/components/chat/chat/questionIcon';
import Avatar from '@/components/avater';
import DefaultAppIcon from '@/assets/default-app-icon.svg';

function DebugChat() {
  const config = appConfigStore.newAppConfig;
  const appId = appConfigStore.app.id;
  const {
    chatList,
    isResponding,
    handleSend,
    suggestedQuestions,
    handleStop,
    handleRestart,
    handleAnnotationAdded,
    handleAnnotationEdited,
    handleAnnotationRemoved
  } = useChat(config, appConfigStore.userinput, [], (taskId) => {
    appConfigStore.stopResponse(taskId);
  });

  const doSend: OnSend = React.useCallback(
    (message, files) => {
      const data: any = {
        query: message,
        inputs: {},
        model_config: appConfigStore.newAppConfig,
        enable_react_msg: true
      };
      const api = ResourceEndpoints.sendChatMsg.replace(
        '{appId}',
        appConfigStore.app.id
      );
      handleSend(api, data, {
        onGetConvesationMessages: (conversationId, getAbortController) => {
          return getChatMessagesRequest({
            appId,
            conversationId,
            getAbortController
          });
        },
        onGetSuggestedQuestions: (responseItemId, getAbortController) =>
          getChatSuggestedQuestionRequest({
            appId,
            responseItemId,
            getAbortController
          })
      });
    },
    [appId, handleSend]
  );

  const answerIcon = React.useMemo(() => {
    return (
      <Avatar
        size={36}
        readonly
        defaultIcon={<DefaultAppIcon className="size-[36px]" />}
        value={appConfigStore.avatar}
      />
    );
  }, []);

  return (
    <div className="flex h-full flex-col overflow-auto rounded-[8px] bg-[rgb(var(--primary-2))] bg-[url('@/assets/debug-chat-bg.svg')] bg-center bg-no-repeat">
      <div className="flex flex-none items-center justify-between p-[16px]">
        <div className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
          调试与预览
        </div>
        <Button
          className="bg-[length:128px_157px]"
          size="mini"
          type="secondary"
          onClick={() => handleRestart()}
        >
          清空当前对话
        </Button>
      </div>
      <Chat
        answerIcon={answerIcon}
        config={appConfigStore.newAppConfig}
        chatList={chatList}
        isResponding={isResponding}
        chatContainerclassName="p-6"
        chatFooterClassName="px-6 pt-10 pb-4"
        suggestedQuestions={suggestedQuestions}
        onSend={doSend}
        onStopResponding={handleStop}
        showPromptLog
        questionIcon={<QuestionIcon />}
        allToolIcons={{}}
        onAnnotationEdited={handleAnnotationEdited}
        onAnnotationAdded={handleAnnotationAdded}
        onAnnotationRemoved={handleAnnotationRemoved}
      />
    </div>
  );
}
export default observer(DebugChat);

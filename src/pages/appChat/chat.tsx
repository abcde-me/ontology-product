import ChatWithHistoryWrapWithCheckToken from '@/components/chat-with-history';
import { InstalledApp } from '@/utils/type';
import { Spin } from '@arco-design/web-react';
import React from 'react';
export default function Chat(props: { installedApp: InstalledApp }) {
  const { installedApp } = props;
  return (
    <div className="relative flex-auto overflow-auto bg-[url(@/assets/chat-bg.png)] bg-cover bg-[center_bottom] bg-no-repeat">
      {!installedApp ? (
        <Spin
          loading
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      ) : (
        <ChatWithHistoryWrapWithCheckToken installedAppInfo={installedApp} />
      )}
    </div>
  );
}

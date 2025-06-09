import ChatWithHistoryWrapWithCheckToken from '@/components/chat-with-history';
import { InstalledApp } from '@/utils/type';
import { Spin } from '@arco-design/web-react';
import React from 'react';
import s from './chat.module.less';
import cn from 'classnames';
export default function Chat(props: { installedApp: InstalledApp }) {
  const { installedApp } = props;
  const topBanner = (
    <div className="mt-[40px] ">
      <div className="text-center text-[56px] font-[600] leading-[84px] text-[var(--color-text-1)]">
        欢迎来到AppForge
      </div>
      <div
        className={cn(
          'text-center text-[32px] font-[600] leading-[48px]',
          s['blue-text']
        )}
      >
        创建专属于你的AI应用
      </div>
    </div>
  );
  return (
    <div className="relative flex-auto overflow-auto bg-[url(@/assets/chat-bg.png)] bg-cover bg-[center_bottom] bg-no-repeat">
      {!installedApp ? (
        <Spin
          loading
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      ) : (
        <ChatWithHistoryWrapWithCheckToken
          installedAppInfo={installedApp}
          chatNode={topBanner}
        />
      )}
    </div>
  );
}

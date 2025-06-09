import Avatar from '@/components/avater';
import { useInstalledAppDetail } from '@/utils/swr';
import { useParams } from '@/utils/url';
import {
  Button,
  Divider,
  Message,
  Space,
  Tooltip
} from '@arco-design/web-react';
import React, { useEffect } from 'react';
import Chat from './chat';
import Info from './info';
import DefaultAppIcon from '@/assets/default-app-icon.svg';
import { IconEyeInvisible } from '@arco-design/web-react/icon';

export default function AppChat() {
  const appid = useParams('id');
  const { data: installedApp, isLoading, error } = useInstalledAppDetail(appid);

  useEffect(() => {
    if (error) Message.error(error?.message);
  }, [error]);

  return (
    <div className="flex h-full flex-col p-[20px]">
      <div className="flex h-[68px] flex-none items-center rounded-[8px_8px_0_0] bg-white px-[20px]">
        {installedApp ? (
          <Avatar
            readonly
            size={44}
            value={installedApp?.app.icon}
            className="mr-[12px]"
            defaultIcon={<DefaultAppIcon className="size-[44px]" />}
          />
        ) : null}
        <div className="flex-auto">
          <div className="mb-[2px] text-[16px] font-[600] leading-[24px]">
            {installedApp?.app.name}
          </div>
          <div className="flex items-center text-[var(--color-text-4)]">
            发布人:{installedApp?.publish_user}
            <Divider type="vertical" />
            <Tooltip content="此应用的构建者无法查看您的对话。">
              <IconEyeInvisible className="cursor-pointer text-[16px] text-[var(--color-text-3)]" />
            </Tooltip>
          </div>
        </div>
        <Space className="ml-auto" style={{ visibility: 'hidden' }}>
          <Button type="outline">喜欢</Button>
          <Button type="primary">分享</Button>
        </Space>
      </div>
      <div className="border-t-[var(--color-border-2))] flex flex-auto items-stretch overflow-auto rounded-[0_0_8px_8px] border-t">
        <Chat installedApp={installedApp} />
        <Info installedApp={installedApp} />
      </div>
    </div>
  );
}

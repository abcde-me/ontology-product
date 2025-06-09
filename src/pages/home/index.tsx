import { useInstalledAppDetail } from '@/utils/swr';
import { Message } from '@arco-design/web-react';
import React, { useEffect, useLayoutEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Chat from './chat';
import png1 from '@/assets/home_1.png';
import png2 from '@/assets/home_2.png';
import png3 from '@/assets/home_3.png';

export default function AppChat() {
  const appid = '1';
  const { data: installedApp, error } = useInstalledAppDetail(appid);

  const history = useHistory();

  useEffect(() => {
    if (error) Message.error(error?.message);
  }, [error]);

  useLayoutEffect(() => {
    (window as any).appforge_gotoStore = (
      href = '/tenant/compute/appforge/appStore'
    ) => {
      history.push(href);
    };
    const style = document.createElement('style');
    style.innerHTML = `:root{
      --appforge_assets_png1:url(${png1});
      --appforge_assets_png2:url(${png2});
      --appforge_assets_png3:url(${png3});
    }`;
    document.head.append(style);
    return () => {
      delete (window as any).appforge_gotoStore;
    };
  }, [history]);

  return (
    <div className="flex h-full flex-col p-[20px] pl-0">
      <div className="flex h-[68px] flex-none items-center rounded-[8px_8px_0_0] bg-white px-[20px]">
        <div className="mr-[8px] size-[32px] bg-[url(@/assets/appforge-logo.svg)] bg-cover bg-no-repeat"></div>
        <div className="flex-auto">
          <div className="mb-[2px] text-[16px] font-[600] leading-[24px]">
            AppForge - 应用商店
          </div>
        </div>
      </div>
      <div className="flex flex-auto items-stretch overflow-auto rounded-[0_0_8px_8px]">
        <Chat installedApp={installedApp} />
      </div>
    </div>
  );
}

import React from 'react';
import { useState } from 'react';
import { useChatWithHistoryContext } from './context';
import Sidebar from './sidebar';
import AppIcon from '@/components/app-icon';

const HeaderInMobile = () => {
  const { appData, handleNewConversation } = useChatWithHistoryContext();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <div className="flex h-[44px] shrink-0 items-center border-b-[0.5px] border-b-gray-200 px-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          onClick={() => setShowSidebar(true)}
        ></div>
        <div className="flex grow items-center justify-center px-3">
          <AppIcon
            className="mr-2"
            size="tiny"
            icon={appData?.icon}
            background={appData?.site.icon_background}
          />
          <div className="truncate py-1 text-base font-semibold text-gray-800">
            {appData?.site.title}
          </div>
        </div>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          onClick={handleNewConversation}
        ></div>
      </div>
      {showSidebar && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(35, 56, 118, 0.2)' }}
          onClick={() => setShowSidebar(false)}
        >
          <div
            className="inline-block h-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderInMobile;

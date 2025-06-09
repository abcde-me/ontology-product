import React from 'react';
import { useState } from 'react';
import { useChatWithHistoryContext } from '../context';
import Form from './form';
import AppIcon from '@/components/app-icon';
import { Button } from '@arco-design/web-react';

const ConfigPanel = () => {
  const {
    appData,
    inputsForms,
    handleStartChat,
    showConfigPanelBeforeChat,
    isMobile
  } = useChatWithHistoryContext();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex max-h-[80%] w-full max-w-[720px] flex-col">
      <div
        className={`
          grow overflow-y-auto rounded-xl
          ${showConfigPanelBeforeChat && 'border-[0.5px] border-gray-100 shadow-lg'}
          ${!showConfigPanelBeforeChat && collapsed && 'border border-indigo-100'}
          ${!showConfigPanelBeforeChat && !collapsed && 'border-[0.5px] border-gray-100 shadow-lg'}
        `}
      >
        <div
          className={`
            flex flex-wrap rounded-t-xl bg-indigo-25 px-6 py-4
            ${isMobile && '!px-4 !py-3'}
          `}
        >
          {showConfigPanelBeforeChat && (
            <>
              <div className="flex h-8 items-center text-2xl font-semibold text-gray-800">
                <AppIcon
                  icon={appData?.icon}
                  background="transparent"
                  size="small"
                />
                {appData?.site.title}
              </div>
              {appData?.site.description && (
                <div className="mt-2 w-full text-sm text-gray-500">
                  {appData?.site.description}
                </div>
              )}
            </>
          )}
          {!showConfigPanelBeforeChat && collapsed && (
            <>
              <div className="grow py-[3px] text-[13px] font-medium leading-[18px] text-indigo-600">
                开始前，您可以修改对话设置
              </div>
              <Button type="outline" onClick={() => setCollapsed(false)}>
                编辑
              </Button>
            </>
          )}
          {!showConfigPanelBeforeChat && !collapsed && (
            <>
              <div className="grow py-[3px] text-[13px] font-medium leading-[18px] text-indigo-600">
                对话设置
              </div>
            </>
          )}
        </div>
        {!collapsed && !showConfigPanelBeforeChat && (
          <div className="rounded-b-xl p-6">
            <Form />
            <div
              className={`flex items-center pl-[136px] ${isMobile && '!pl-0'}`}
            >
              <Button
                type="primary"
                onClick={() => {
                  setCollapsed(true);
                  handleStartChat();
                }}
              >
                保存
              </Button>
              <Button
                className="text-sm font-medium"
                onClick={() => setCollapsed(true)}
              >
                取消
              </Button>
            </div>
          </div>
        )}
        {showConfigPanelBeforeChat && (
          <div className="rounded-b-xl p-6">
            <Form />
            <Button type="primary" onClick={handleStartChat}>
              开始对话
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;

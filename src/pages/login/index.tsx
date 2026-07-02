import LoginBgPng from '@/assets/LOGINbg.png';
import { Card, Tabs } from '@arco-design/web-react';
import React, { useState } from 'react';
import { PasswordLoginForm } from './components/PasswordLoginForm';
import { ScanLoginPanel } from './components/ScanLoginPanel';
import styles from './index.module.scss';
import type { LoginMode, ScanLoginProvider } from './types';

const TabPane = Tabs.TabPane;

const LoginCard = () => {
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [scanProvider, setScanProvider] = useState<ScanLoginProvider>('lanxin');

  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{
        backgroundImage: `url(${LoginBgPng})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Card
        className={`mx-4 w-full max-w-lg p-4 ${styles.cardWrapper}`}
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        <Header />

        <Tabs
          activeTab={loginMode}
          onChange={(key) => setLoginMode(key as LoginMode)}
          className={styles.loginTabs}
          type="rounded"
        >
          <TabPane key="password" title="账号登录">
            <PasswordLoginForm />
          </TabPane>
          <TabPane key="scan" title="扫码登录">
            <ScanLoginPanel
              provider={scanProvider}
              onProviderChange={setScanProvider}
              enabled={loginMode === 'scan'}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginCard;

function Header() {
  return (
    <div className="mb-8 flex items-center justify-center">
      <div className="flex flex-nowrap items-center gap-3">
        <div
          className="h-8 w-24 shrink-0 rounded-[2px] bg-[rgb(var(--primary-6))]"
          aria-hidden
        />
        <div className="h-6 w-px shrink-0 bg-gray-400" />
        <div className="shrink-0 whitespace-nowrap text-[17px] font-bold text-gray-800">
          本体构建与运营平台
        </div>
      </div>
    </div>
  );
}

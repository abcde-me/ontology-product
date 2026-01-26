import React, { useState } from 'react';
import { Drawer, Tabs } from '@arco-design/web-react';
import styles from './index.module.scss';
import { ActionList, BehaviorDetail } from './components';

// 行为动作
export default function OntologySceneBehaviorActions() {
  const [activeTab, setActiveTab] = useState('list');
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div
      className={`flex h-full w-full flex-col gap-4 overflow-hidden bg-white ${styles['behavior']}`}
    >
      <Tabs
        className={'flex-shrink-0'}
        activeTab={activeTab}
        onChange={setActiveTab}
      >
        <Tabs.TabPane title={'行为列表'} key={'list'} />
        <Tabs.TabPane title={'行为测试'} key={'test'} />
      </Tabs>
      <div className={styles['behavior-content']}>
        {activeTab === 'list' ? <ActionList /> : <div>这里写行为测试</div>}
      </div>
      <BehaviorDetail />
    </div>
  );
}

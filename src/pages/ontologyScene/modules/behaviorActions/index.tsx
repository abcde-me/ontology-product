import React, { useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import styles from './index.module.scss';
import { ActionList, BehaviorDetail } from './components';
import BehaviorTest from './components/BehaviorTest';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

// 行为动作
export default function OntologySceneBehaviorActions() {
  const [activeTab, setActiveTab] = useState('list');
  const [behaviorData, setBehaviorData] = useState<BehaviorActionItem>();

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden bg-white ${styles['behavior']} ${activeTab === 'test' ? '!gap-0' : ''}`}
    >
      <Tabs
        className={'flex-shrink-0'}
        activeTab={activeTab}
        onChange={setActiveTab}
      >
        <Tabs.TabPane title={'行为列表'} key={'list'} />
        <Tabs.TabPane title={'行为测试'} key={'test'} />
      </Tabs>
      <div
        className={`${styles['behavior-content']} ${
          activeTab === 'test' ? 'relative !p-0' : ''
        }`}
      >
        {activeTab === 'list' ? (
          <ActionList
            onViewDetail={(data) => {
              setBehaviorData(data);
            }}
          />
        ) : (
          <BehaviorTest
            onViewDetail={(data) => {
              setBehaviorData(data);
            }}
          />
        )}
      </div>
      <BehaviorDetail
        show={!!behaviorData}
        onClose={() => {
          setBehaviorData(undefined);
        }}
        actionItem={behaviorData?.id}
      />
    </div>
  );
}

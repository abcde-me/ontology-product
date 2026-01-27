import React, { useState } from 'react';
import { Drawer, Tabs } from '@arco-design/web-react';
import styles from './index.module.scss';
import { ActionList, BehaviorDetail } from './components';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behavior_actions';

// 行为动作
export default function OntologySceneBehaviorActions() {
  const [activeTab, setActiveTab] = useState('list');
  const [showDetail, setShowDetail] = useState(false);
  const [behaviorData, setBehaviorData] = useState<BehaviorActionItem>();

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
        {activeTab === 'list' ? (
          <ActionList
            onViewDetail={(data) => {
              setShowDetail(true);
            }}
          />
        ) : (
          <div>这里写行为测试</div>
        )}
      </div>
      <BehaviorDetail
        show={showDetail}
        onClose={() => {
          setShowDetail(false);
          setBehaviorData(undefined);
        }}
        data={behaviorData}
      />
    </div>
  );
}

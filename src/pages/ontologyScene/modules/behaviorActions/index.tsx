import React, { useState, useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import { useLocation, useHistory } from 'react-router-dom';
import styles from './index.module.scss';
import { ActionList, BehaviorDetail } from './components';
import BehaviorTest from './components/BehaviorTest';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

// 行为动作
export default function OntologySceneBehaviorActions() {
  const location = useLocation();
  const history = useHistory();

  const [activeTab, setActiveTab] = useState(() => {
    // 从 URL 参数初始化 tab
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    return tabFromUrl === 'test' ? 'test' : 'list';
  });
  const [behaviorData, setBehaviorData] = useState<BehaviorActionItem>();

  // 当 tab 改变时，更新 URL 参数
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const params = new URLSearchParams(location.search);
    params.set('tab', key);
    history.replace({ search: params.toString() });
  };

  // 监听 URL 参数变化（浏览器前进/后退）
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl === 'test' ? 'test' : 'list');
    }
  }, [location.search]);

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden bg-white ${styles['behavior']} ${activeTab === 'test' ? '!gap-0' : ''}`}
    >
      <Tabs
        className={'flex-shrink-0'}
        activeTab={activeTab}
        onChange={handleTabChange}
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

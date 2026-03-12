import React, { useState, useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import { useLocation, useHistory } from 'react-router-dom';
import styles from './index.module.scss';
import { ActionList, BehaviorDetail } from './components';
import BehaviorTest from './components/BehaviorTest';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import classNames from 'classnames';

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
      <div className={'flex flex-shrink-0 items-center gap-6 px-6 pt-6'}>
        <div
          className={classNames({
            [styles['active-tab']]: activeTab === 'list',
            [styles['action-tab']]: true
          })}
          onClick={() => handleTabChange('list')}
        >
          行为列表
        </div>
        <div
          className={classNames({
            [styles['active-tab']]: activeTab === 'test',
            [styles['action-tab']]: true
          })}
          onClick={() => handleTabChange('test')}
        >
          行为测试
        </div>
      </div>
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

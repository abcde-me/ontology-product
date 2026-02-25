import React, { useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import styles from './index.module.scss';
import { ActionList, BehaviorDetail } from './components';
import BehaviorTest from './components/BehaviorTest';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import { OsEmptyStatusWrapper } from '@/pages/ontologyScene/componens';
import { useHistory, useParams } from 'react-router-dom';
import { ONTOLOGY_SCENE_MENU_ITEM_KEYS } from '@/common/constants';

// 行为动作
export default function OntologySceneBehaviorActions() {
  const [activeTab, setActiveTab] = useState('list');
  const [showDetail, setShowDetail] = useState(false);
  const [behaviorData, setBehaviorData] = useState<BehaviorActionItem>();
  const [isEmpty, setIsEmpty] = useState(false);
  const { id: OSId, moduleType = ONTOLOGY_SCENE_MENU_ITEM_KEYS.GRAPH } =
    useParams<{
      id: string;
      moduleType: string;
    }>();
  const history = useHistory();
  const createAction = () => {
    const baseUrl = '/tenant/compute/modaforge/ontologyScene/detail';
    history.push(`${baseUrl}/${OSId}/behaviorActions/create/_NEW_`);
  };

  return (
    <OsEmptyStatusWrapper
      className={`flex h-full w-full flex-col overflow-hidden bg-white ${styles['behavior']} ${activeTab === 'test' ? '!gap-0' : ''}`}
      onCreate={createAction}
      title={'行为'}
      description={'核心数据模型的原子单位，描述系统中可独立存在的实体'}
      empty={isEmpty}
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
              setShowDetail(true);
              setBehaviorData(data);
            }}
            changePageStatus={setIsEmpty}
          />
        ) : (
          <BehaviorTest
            onViewDetail={(data) => {
              setShowDetail(true);
              setBehaviorData(data);
            }}
          />
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
    </OsEmptyStatusWrapper>
  );
}

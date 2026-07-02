import React, { useEffect, useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import PageHeader from '@/components/PageHeader';
import {
  AttributeQueryTab,
  BehaviorQueryTab,
  FunctionQueryTab,
  LinkQueryTab,
  ObjectTypeQueryTab
} from './components';
import { ONTOLOGY_QUERY_TABS } from './constants';
import type { OntologyQueryTabKey } from './types';
import styles from './index.module.scss';

const isOntologyQueryTabKey = (key: string): key is OntologyQueryTabKey =>
  ONTOLOGY_QUERY_TABS.some((tab) => tab.key === key);

const TAB_CONTENT: Record<OntologyQueryTabKey, React.ReactNode> = {
  objectType: <ObjectTypeQueryTab />,
  attribute: <AttributeQueryTab />,
  link: <LinkQueryTab />,
  behavior: <BehaviorQueryTab />,
  function: <FunctionQueryTab />
};

export default function OntologyQuery() {
  const [activeTab, setActiveTab] = useState<OntologyQueryTabKey>('objectType');

  useEffect(() => {
    return () => {
      removeStaleArcoOverlays();
    };
  }, []);

  return (
    <div className={styles['query-page']}>
      <PageHeader
        className="flex-shrink-0"
        title="本体查询"
        subTitle="支持跨本体场景库查询对象类型、链接、属性、行为和函数信息"
      />

      <div className={styles['query-page-content']}>
        <Tabs
          className={styles['query-tabs']}
          activeTab={activeTab}
          onChange={(key) => {
            if (isOntologyQueryTabKey(key)) {
              setActiveTab(key);
            }
          }}
          type="line"
        >
          {ONTOLOGY_QUERY_TABS.map((tab) => (
            <Tabs.TabPane key={tab.key} title={tab.label} />
          ))}
        </Tabs>

        <div className={styles['query-tab-panel']}>
          {TAB_CONTENT[activeTab]}
        </div>
      </div>
    </div>
  );
}

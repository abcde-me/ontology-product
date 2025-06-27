import React, { useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import './tabs-center.css';
import SourceDataTree from './components/sourcedata-tree';
import TargetDataTree from './components/targetdata-tree';
import EditableTree from '../editable-tree';

const TabPane = Tabs.TabPane;

const tabKeys = [
  { key: 'source', title: '源数据' },
  { key: 'target', title: '目标数据' }
];

export default function SourceData(props) {
  const { onTabChange, onNodeSelect, activeTab } = props;

  const handleTabChange = (value) => {
    console.log('Tab changed to:', value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <div className="mr-[8px] w-[220px] overflow-auto rounded border border-solid border-[#E2E8F0]">
      <div className="h-[40px] w-full">
        <Tabs
          activeTab={activeTab}
          onChange={(e) => handleTabChange(e)}
          className="tabs-center"
        >
          {tabKeys.map((tab) => (
            <TabPane key={tab.key} title={tab.title}>
              <EditableTree onChanges={onNodeSelect} />
            </TabPane>
          ))}
          {/* <TabPane key="source" title="源数据">
            <SourceDataTree onChanges={onNodeSelect} />
          </TabPane>
          <TabPane key="target" title="目标数据">
            <TargetDataTree onChanges={onNodeSelect} />
          </TabPane> */}
        </Tabs>
      </div>
    </div>
  );
}

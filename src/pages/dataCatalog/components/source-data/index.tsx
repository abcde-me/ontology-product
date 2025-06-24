import React, { useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import './tabs-center.css';
import SourceDataTree from './components/sourcedata-tree';
import TargetDataTree from './components/targetdata-tree';

const TabPane = Tabs.TabPane;

export default function SourceDate(props) {
  const { onTabChange, onNodeSelect, activeTab } = props;

  const handleTabChange = (value) => {
    console.log('Tab changed to:', value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <div
      style={{
        width: '220px',
        border: '1px solid #E2E8F0',
        borderRadius: '4px',
        marginRight: '8px'
      }}
    >
      <div style={{ width: '100%', height: '40px' }}>
        <Tabs
          activeTab={activeTab}
          onChange={(e) => handleTabChange(e)}
          className="tabs-center"
        >
          <TabPane key="source" title="源数据">
            <SourceDataTree onChanges={onNodeSelect} />
          </TabPane>
          <TabPane key="target" title="目标数据">
            <TargetDataTree onChanges={onNodeSelect} />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

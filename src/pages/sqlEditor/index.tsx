import React from 'react';
import { Tabs } from '@arco-design/web-react';
import TabPane from '@arco-design/web-react/es/Tabs/tab-pane';
import { IconCode, IconList } from '@arco-design/web-react/icon';
import DataFrames from './components/DataFrames';
import Datasets from './components/Datasets';
import Scripts from './components/Scripts';
import SqlWorkspace from './components/SqlWorkspace';
import './index.less';

export default function SqlEditorIndex() {
  return (
    <div className="flex h-full overflow-hidden bg-white">
      <div className="w-[300px] shrink-0 border-r">
        <Tabs tabPosition="left" className="my-vertical-tabs h-full">
          <TabPane key="data" title={<IconList className="text-[26px]" />}>
            <div className="flex h-full flex-col overflow-hidden">
              <TabPaneHeader title="数据目录" />
              <div className="max-h-[50%] overflow-auto border-b">
                {/* 源数据 */}
                <DataFrames />
              </div>
              <div className="flex-1 overflow-auto">
                {/* 数据集 */}
                <Datasets />
              </div>
            </div>
          </TabPane>

          <TabPane key="script" title={<IconCode className="text-[26px]" />}>
            <div className="flex h-full flex-col overflow-hidden">
              <TabPaneHeader title="SQL 脚本列表" />
              <div className="flex-1 overflow-auto">
                {/* 脚本列表 */}
                <Scripts />
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>

      <div className="flex-1">
        {/* SQL工作区 */}
        <SqlWorkspace />
      </div>
    </div>
  );
}

function TabPaneHeader({ title }) {
  return (
    <div className="flex justify-center bg-blue-50 py-[6px]">
      <span className="text-[14px] font-[600]">{title}</span>
    </div>
  );
}

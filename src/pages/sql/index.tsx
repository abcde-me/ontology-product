import React, { useState } from 'react';
import { Layout, Tabs } from '@arco-design/web-react';
// import { IconCode, IconList } from '@arco-design/web-react/icon';
// import DataFrames from './components/DataFrames';
// import Datasets from './components/Datasets';
// import Scripts from './components/Scripts';
// import SqlWorkspace from './components/SqlWorkspace';
import NotebookTabContent from './components/NotebookTabContent';
import PythonTabContent from './components/PythonTabContent';
import NotebookMainContent from './components/NotebookMainContent';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import './index.scss';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'files' | 'tools' | 'data';

export default function SqlEditorIndex() {
  const [activeTab, setActiveTab] = useState<TabKey>('files');
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  const handleFileOpen = (fileId: string) => {
    setCurrentFileId(fileId);
  };
  return (
    <Layout className="notebook-layout">
      <Sider width={280} className="notebook-sider">
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          direction="vertical"
          className="notebook-tabs"
          type="rounded"
        >
          <TabPane key="files" title={<PythonIcon></PythonIcon>}>
            <PythonTabContent type="files" onFileOpen={handleFileOpen} />
          </TabPane>
          <TabPane key="data" title={<DataIcon></DataIcon>}>
            <NotebookTabContent type="data" />
          </TabPane>
          <TabPane key="tools" title={<SuanziIcon></SuanziIcon>}>
            <NotebookTabContent type="tools" />
          </TabPane>
        </Tabs>
      </Sider>
      <Content className="notebook-content">
        <NotebookMainContent currentFileId={currentFileId} />
      </Content>
    </Layout>
  );
  // return (
  //   <div className="flex h-full overflow-hidden bg-white">
  //     <div className="w-[300px] shrink-0 border-r">
  //       <Tabs tabPosition="left" className="my-vertical-tabs h-full">
  //         <TabPane key="data" title={<IconList className="text-[26px]" />}>
  //           <div className="flex h-full flex-col overflow-hidden">
  //             <TabPaneHeader title="数据目录" />
  //             <div className="max-h-[50%] overflow-auto border-b">
  //               {/* 源数据 */}
  //               <DataFrames />
  //             </div>
  //             <div className="flex-1 overflow-auto">
  //               {/* 数据集 */}
  //               <Datasets />
  //             </div>
  //           </div>
  //         </TabPane>

  //         <TabPane key="script" title={<IconCode className="text-[26px]" />}>
  //           <div className="flex h-full flex-col overflow-hidden">
  //             <TabPaneHeader title="SQL 脚本列表" />
  //             <div className="flex-1 overflow-auto">
  //               {/* 脚本列表 */}
  //               <Scripts />
  //             </div>
  //           </div>
  //         </TabPane>
  //       </Tabs>
  //     </div>

  //     <div className="flex-1">
  //       {/* SQL工作区 */}
  //       <SqlWorkspace />
  //     </div>
  //   </div>
  // );
}

function TabPaneHeader({ title }) {
  return (
    <div className="flex justify-center bg-blue-50 py-[6px]">
      <span className="text-[14px] font-[600]">{title}</span>
    </div>
  );
}

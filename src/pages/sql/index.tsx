import React, { useState, memo, useEffect } from 'react';
import { Layout, Tabs } from '@arco-design/web-react';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import FileManager from './components/file-manager';
import DataManager from './components/data-manager';
import EditorContent from './components/editor';
import DatasetsList from './components/DatasetsList';
import { FileTab, useTabManager } from './hooks/useTabManager';
import './index.scss';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'data' | 'files' | 'dataset';

const defaultActiveTab = 'data';

const SqlIndex: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultActiveTab);
  const {
    fileState,
    directoryTreeRef,
    addTab,
    removeTab,
    switchTab,
    handleCreate,
    updateTab,
    openFile
  } = useTabManager();

  // 初始化创建一个默认SQL查询标签
  useEffect(() => addTab(), []);

  const isDasetTab = activeTab === 'dataset';

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  const handleActiveUpdate = (tabData: FileTab) => {
    console.log('handleActiveUpdate tabData', tabData);
    updateTab(tabData);
  };

  return (
    <Layout className="notebook-layout">
      <Sider width={isDasetTab ? '100%' : 300} className="notebook-sider">
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          direction="vertical"
          className="notebook-tabs"
          type="rounded"
        >
          <TabPane key="data" title={<DataIcon />}>
            <DataManager key="data" />
          </TabPane>
          <TabPane key="files" title={<PythonIcon />}>
            <FileManager
              key="files"
              type="files"
              ref={directoryTreeRef}
              onFileOpen={openFile}
            />
          </TabPane>
          <TabPane key="dataset" title={<SuanziIcon />}>
            <DatasetsList />
          </TabPane>
        </Tabs>
      </Sider>
      <Content
        className={`notebook-content ${isDasetTab ? 'hidden' : 'visible'}`}
      >
        <EditorContent
          fileTabs={fileState.fileTabs}
          activeTab={fileState.activeTab}
          onTabChange={switchTab}
          onAddTab={(newFileInfo?: any) => addTab(newFileInfo)}
          onRemoveTab={removeTab}
          onCreate={handleCreate}
          onActiveUpdate={handleActiveUpdate}
        />
      </Content>
    </Layout>
  );
});

export default SqlIndex;

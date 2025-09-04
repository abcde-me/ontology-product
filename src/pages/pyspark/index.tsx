import React, { useState, memo } from 'react';
import { Layout, Tabs } from '@arco-design/web-react';
import FileManager from './components/file-manager';
import DataManager from './components/data-manager';
import EditorContent from './components/editor';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import { useTabManager } from './hooks/useTabManager';
import './index.scss';
import DatasetsList from './components/daset-export/DatasetsList';
import ToolsManager from './components/tools-manager';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'files' | 'tools' | 'data' | 'daset';

const Python: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabKey>('files');
  const {
    fileState,
    directoryTreeRef,
    openFile,
    addTab,
    removeTab,
    switchTab,
    handleCreate
  } = useTabManager();

  const isDasetTab = activeTab === 'daset';

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
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
          <TabPane key="files" title={<PythonIcon />}>
            <FileManager
              key="files"
              type="files"
              onFileOpen={openFile}
              ref={directoryTreeRef}
            />
          </TabPane>
          <TabPane key="data" title={<DataIcon />}>
            <DataManager key="data" />
          </TabPane>
          <TabPane key="tools" title={<SuanziIcon />}>
            <ToolsManager key="tools" />
          </TabPane>
          <TabPane key="daset" title={<SuanziIcon />}>
            <DatasetsList />
          </TabPane>
        </Tabs>
      </Sider>
      {!isDasetTab && (
        <Content className="notebook-content">
          <EditorContent
            fileTabs={fileState.fileTabs}
            activeTab={fileState.activeTab}
            onTabChange={switchTab}
            onAddTab={(newFileInfo?: any) => addTab(newFileInfo)}
            onRemoveTab={removeTab}
            onCreate={handleCreate}
          />
        </Content>
      )}
    </Layout>
  );
});

Python.displayName = 'Python';

export default Python;

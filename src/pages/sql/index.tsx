import React, { useState, memo, useEffect } from 'react';
import { Layout, Tabs } from '@arco-design/web-react';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import FileManager from './components/file-manager';
import DataManager from './components/data-manager';
import EditorContent from './components/editor';
import DatasetsList from './components/DatasetsList';
import { useTabManager } from './hooks/useTabManager';
import './index.scss';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'files' | 'tools' | 'data';

const defaultActiveTab = 'data';

const SqlIndex: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultActiveTab);
  const {
    fileState,
    directoryTreeRef,
    addTab,
    removeTab,
    switchTab,
    handleCreate
  } = useTabManager();

  useEffect(() => addTab(), []);

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  function getSiderWidth() {
    switch (activeTab) {
      case 'files':
        return 300;
      case 'data':
        return 300;
      case 'tools':
        return 46;
      default:
        return 46;
    }
  }

  function renderContent() {
    const editorNode = (
      <EditorContent
        fileTabs={fileState.fileTabs}
        activeTab={fileState.activeTab}
        onTabChange={switchTab}
        onAddTab={(newFileInfo?: any) => addTab(newFileInfo)}
        onRemoveTab={removeTab}
        onCreate={handleCreate}
      />
    );

    const listNode = <DatasetsList />;

    switch (activeTab) {
      case 'files':
        return editorNode;
      case 'data':
        return editorNode;
      case 'tools':
        return listNode;
      default:
        return editorNode;
    }
  }

  return (
    <div className="h-full py-[20px] pr-[20px]">
      <Layout className="notebook-layout">
        <Sider width={getSiderWidth()} className="notebook-sider">
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
                onFileOpen={addTab}
                key="files"
                type="files"
                ref={directoryTreeRef}
              />
            </TabPane>
            <TabPane key="tools" title={<SuanziIcon />}></TabPane>
          </Tabs>
        </Sider>
        <Content className="notebook-content">{renderContent()}</Content>
      </Layout>
    </div>
  );
});

export default SqlIndex;

import React, { useState } from 'react';
import { Layout, Tabs } from '@arco-design/web-react';
import FileManager from './components/file-manager';
import EditorContent from './components/editor';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import './index.scss';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'files' | 'tools' | 'data';

const Notebook: React.FC = () => {
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
            <FileManager type="files" onFileOpen={handleFileOpen} />
          </TabPane>
          <TabPane key="data" title={<DataIcon></DataIcon>}>
            {/* <NotebookTabContent type="data" /> */}
          </TabPane>
          <TabPane key="tools" title={<SuanziIcon></SuanziIcon>}>
            {/* <NotebookTabContent type="tools" /> */}
          </TabPane>
        </Tabs>
      </Sider>
      <Content className="notebook-content">
        <EditorContent currentFileId={currentFileId} />
      </Content>
    </Layout>
  );
};

export default Notebook;

import React, { useState } from 'react';
import { Layout, Tabs } from '@arco-design/web-react';
import FileManager from './components/file-manager';
import EditorContent from './components/editor';
import { PythonProvider, usePythonContext } from './context/PythonContext';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import './index.scss';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'files' | 'tools' | 'data';

// 内部组件，用于访问Context
const PythonContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('files');
  const { openFile } = usePythonContext();

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
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
            <FileManager type="files" onFileOpen={openFile} />
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
        <EditorContent />
      </Content>
    </Layout>
  );
};

export default function Python() {
  return (
    <PythonProvider>
      <PythonContent />
    </PythonProvider>
  );
}

import React, { useState } from 'react';
import { Button, Layout, Tabs } from '@arco-design/web-react';
import NotebookTabContent from './components/NotebookTabContent';
import PythonTabContent from './components/PythonTabContent';
import NotebookMainContent from './components/NotebookMainContent';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import './index.scss';
import Datasets from './components/Datasets';
import ModalFileList from './components/ModalFileList';
import ModalTableList from './components/ModalTableList';
import ModalTableDetail from './components/ModalTableDetail';
import ModalDatasetDetail from './components/ModalDatasetDetail';
import { useSqlIndexStore, SqlIndexStore } from './store';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'data' | 'files' | 'dataset';

export default function SqlIndex() {
  const {
    // 变量
    activeTab,
    currentFileId,
    // 动作
    handleTabChange,
    handleFileOpen,
    // 弹框
    showVolumnDetail,
    showDbDetail,
    showTableDetail,
    showDatasetDetail
  } = useSqlIndexHooks();

  function getSiderWidth() {
    switch (activeTab) {
      case 'data':
        return 288;
      case 'files':
        return 288;
      case 'dataset':
        return 46;
      default:
        return 46;
    }
  }

  return (
    <Layout className="notebook-layout">
      <Sider width={getSiderWidth()} className="notebook-sider">
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          direction="vertical"
          className="notebook-tabs"
          type="rounded"
        >
          <TabPane key="data" title={<DataIcon></DataIcon>}>
            <div className="flex flex-col gap-[10px] p-[12px]">
              <Button size="mini" onClick={showVolumnDetail}>
                打开数据卷详情
              </Button>
              <Button size="mini" onClick={showDbDetail}>
                打开数据库详情
              </Button>
              <Button size="mini" onClick={showTableDetail}>
                打开数据表详情
              </Button>
              <Button size="mini" onClick={showDatasetDetail}>
                打开数据集详情
              </Button>
            </div>
            <NotebookTabContent type="data" />
          </TabPane>
          <TabPane key="files" title={<PythonIcon></PythonIcon>}>
            <PythonTabContent type="files" onFileOpen={handleFileOpen} />
          </TabPane>
          <TabPane key="dataset" title={<SuanziIcon></SuanziIcon>}></TabPane>
        </Tabs>
      </Sider>
      <Content className="notebook-content">
        {(activeTab === 'files' || activeTab === 'data') && (
          <NotebookMainContent currentFileId={currentFileId} />
        )}

        {activeTab === 'dataset' && <Datasets />}
      </Content>

      <ModalFileList />
      <ModalTableList />
      <ModalTableDetail />
      <ModalDatasetDetail />
    </Layout>
  );
}

function useSqlIndexHooks() {
  const [activeTab, setActiveTab] = useState<TabKey>('data');
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  const showVolumnDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.showVolumnDetail
  );

  const showDbDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.showDbDetail
  );

  const showTableDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.showTableDetail
  );

  const showDatasetDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.showDatasetDetail
  );

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  const handleFileOpen = (fileId: string) => {
    setCurrentFileId(fileId);
  };

  return {
    activeTab,
    currentFileId,
    handleTabChange,
    handleFileOpen,
    showVolumnDetail,
    showDbDetail,
    showTableDetail,
    showDatasetDetail
  };
}

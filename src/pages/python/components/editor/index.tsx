import React, { useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import NotebookWorkspace from './EditorWorkspace';
import { usePythonContext } from '../../context/PythonContext';
import './index.scss';

const TabPane = Tabs.TabPane;

const NotebookMainContent: React.FC<{}> = () => {
  const { state, addTab, removeTab, switchTab } = usePythonContext();
  const { fileTabs, activeTab } = state.files;

  const handleTabChange = (key: string) => {
    switchTab(key);
  };

  const handleAddTab = () => {
    const newTabKey = `notebook-${Date.now()}`;
    const newTab = {
      key: newTabKey,
      title: `新建笔记本 ${fileTabs.length + 1}`,
      content: '',
      fileId: undefined,
      lastModified: undefined
    };

    addTab(newTab);
  };

  const handleCloseTab = (key: string) => {
    removeTab(key);
  };

  // 获取当前活动标签页
  const activeTabData = fileTabs.find((tab) => tab.key === activeTab);

  return (
    <div className="notebook-main-content">
      {/* 头部标签页区域 */}
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        className="notebook-tabs"
        type="card"
        showAddButton
        onAddTab={handleAddTab}
        onDeleteTab={handleCloseTab}
        editable
      >
        {fileTabs.map((tab) => (
          <TabPane
            key={tab.key}
            title={tab.title}
            closable={fileTabs.length > 1}
          >
            {/* 标签页内容为空，实际内容在工作区 */}
          </TabPane>
        ))}
      </Tabs>

      {/* 工作区 */}
      <div className="main-workspace">
        <NotebookWorkspace
          content={activeTabData?.content || ''}
          fileName={activeTabData?.title || '未命名文件'}
          currentFileId={activeTabData?.fileId}
        />
      </div>
    </div>
  );
};

export default NotebookMainContent;

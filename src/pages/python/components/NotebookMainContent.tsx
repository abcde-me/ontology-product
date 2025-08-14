import React, { useState } from 'react';
import { Button, Space, Tag, Typography, Tabs } from '@arco-design/web-react';
import {
  IconPlayArrow,
  IconUpload,
  IconList,
  IconSettings,
  IconFile,
  IconInfoCircle
} from '@arco-design/web-react/icon';
import NotebookWorkspace from './NotebookWorkspace';
import './NotebookMainContent.scss';

const { Title } = Typography;
const TabPane = Tabs.TabPane;

interface NotebookTab {
  key: string;
  title: string;
  content: string;
  isActive: boolean;
}

const NotebookMainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notebook-1');
  const [notebookTabs, setNotebookTabs] = useState<NotebookTab[]>([
    {
      key: 'notebook-1',
      title: '我的第一个notebook',
      content: '',
      isActive: true
    }
  ]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // 更新活动状态
    setNotebookTabs((tabs) =>
      tabs.map((tab) => ({
        ...tab,
        isActive: tab.key === key
      }))
    );
  };

  const handleAddTab = () => {
    const newTabKey = `notebook-${Date.now()}`;
    const newTab: NotebookTab = {
      key: newTabKey,
      title: `新建笔记本 ${notebookTabs.length + 1}`,
      content: '',
      isActive: true
    };

    setNotebookTabs((tabs) => [
      ...tabs.map((tab) => ({ ...tab, isActive: false })),
      newTab
    ]);
    setActiveTab(newTabKey);
  };

  const handleCloseTab = (key: string) => {
    const currentIndex = notebookTabs.findIndex((tab) => tab.key === key);
    const newTabs = notebookTabs.filter((tab) => tab.key !== key);

    if (newTabs.length === 0) {
      // 如果没有标签页了，创建一个新的
      const defaultTab: NotebookTab = {
        key: 'default',
        title: '新建笔记本',
        content: '',
        isActive: true
      };
      setNotebookTabs([defaultTab]);
      setActiveTab('default');
    } else {
      // 如果关闭的是当前活动标签页，切换到下一个
      let newActiveTab = activeTab;
      if (key === activeTab) {
        const nextIndex =
          currentIndex < newTabs.length ? currentIndex : currentIndex - 1;
        newActiveTab = newTabs[nextIndex].key;
      }

      setNotebookTabs(
        newTabs.map((tab) => ({
          ...tab,
          isActive: tab.key === newActiveTab
        }))
      );
      setActiveTab(newActiveTab);
    }
  };

  const handleRun = () => {
    console.log('运行代码');
  };

  const handleExportDataset = () => {
    console.log('导出数据集');
  };

  const handleExportList = () => {
    console.log('导出列表');
  };

  const handleCallOperator = () => {
    console.log('调用算子');
  };

  const handleRunLog = () => {
    console.log('运行日志');
  };

  return (
    <div className="notebook-main-content">
      {/* 头部标签页区域 */}
      {/* <div className="main-header"> */}
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
        {notebookTabs.map((tab) => (
          <TabPane
            key={tab.key}
            title={tab.title}
            closable={notebookTabs.length > 1}
          >
            {/* 标签页内容为空，实际内容在工作区 */}
          </TabPane>
        ))}
      </Tabs>
      {/* </div> */}

      {/* 工作区 */}
      <div className="main-workspace">
        <NotebookWorkspace />
      </div>
    </div>
  );
};

export default NotebookMainContent;

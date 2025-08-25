import React, { useState, useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import NotebookWorkspace from './EditorWorkspace';
import { openPythonItem } from '@/api/python';
import { OpenPythonItemRes } from '@/types/pythonApi';
import './index.scss';

const TabPane = Tabs.TabPane;

interface NotebookTab {
  key: string;
  title: string;
  content: string;
  isActive: boolean;
  fileId?: string;
}

interface NotebookMainContentProps {
  currentFileId: string | null;
}

const NotebookMainContent: React.FC<NotebookMainContentProps> = ({
  currentFileId
}) => {
  const [activeTab, setActiveTab] = useState('notebook-1');
  const [notebookTabs, setNotebookTabs] = useState<NotebookTab[]>([]);

  // 当文件ID变化时，获取文件内容
  useEffect(() => {
    console.log('这里是获取到的文件id', currentFileId);
    if (currentFileId) {
      handleFileOpen(currentFileId);
    }
  }, [currentFileId]);

  const handleFileOpen = async (fileId: string) => {
    try {
      const response = await openPythonItem(fileId);
      console.log('这里是打开文件获取到的结果～', response);
      if (response.status === 200 && response.data) {
        const fileData: OpenPythonItemRes = response.data;

        // 创建新的标签页或更新现有标签页
        const newTabKey = `file-${fileId}`;
        const existingTabIndex = notebookTabs.findIndex(
          (tab) => tab.fileId === fileId
        );

        if (existingTabIndex >= 0) {
          // 更新现有标签页
          setNotebookTabs((tabs) =>
            tabs.map((tab, index) =>
              index === existingTabIndex
                ? { ...tab, content: fileData.data, isActive: true }
                : { ...tab, isActive: false }
            )
          );
          setActiveTab(newTabKey);
        } else {
          // 创建新标签页
          const newTab: NotebookTab = {
            key: newTabKey,
            title: `文件 ${fileId}`,
            content: fileData.data,
            isActive: true,
            fileId: fileId
          };

          setNotebookTabs((tabs) => [
            ...tabs.map((tab) => ({ ...tab, isActive: false })),
            newTab
          ]);
          setActiveTab(newTabKey);
        }
      }
    } catch (error) {
      console.error('打开文件失败:', error);
    }
  };

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

  // 获取当前活动标签页
  const activeTabData = notebookTabs.find((tab) => tab.key === activeTab);

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

      {/* 工作区 */}
      <div className="main-workspace">
        <NotebookWorkspace
          content={activeTabData?.content || ''}
          fileName={activeTabData?.title || '未命名文件'}
          currentFileId={currentFileId ?? ''}
        />
      </div>
    </div>
  );
};

export default NotebookMainContent;

import React, { useState } from 'react';
import { Tabs } from '@arco-design/web-react';
import NotebookWorkspace from './EditorWorkspace';
import { RunningStatus } from '@/types/pythonApi';
import './index.scss';

const TabPane = Tabs.TabPane;

// 类型定义
interface FileTab {
  key: string;
  title: string;
  content: string;
  fileId?: string;
  lastModified?: string;
}

interface EditorState {
  content: string;
  isDirty: boolean;
  lastSaved: string;
  readOnly: boolean;
  cursorPosition: {
    line: number;
    ch: number;
  };
}

interface ExecutionState {
  status: RunningStatus; // 修复：使用正确的RunningStatus类型
  execId: string;
  startTime: Date | null;
  duration: number;
  result: string;
  log: string;
  error: Error | null;
}

interface FileState {
  currentFileId: string | null;
  fileTabs: FileTab[];
  activeTab: string;
  isLoading: boolean;
  error: Error | null;
}

interface PythonState {
  files: FileState;
  editor: EditorState;
  execution: ExecutionState;
}

interface EditorContentProps {
  state: PythonState;
  addTab: (tab: FileTab) => void;
  removeTab: (key: string) => void;
  switchTab: (key: string) => void;
  updateContent: (content: string) => void;
  setDirty: (dirty: boolean) => void;
  setCursorPosition: (line: number, ch: number) => void;
  runCode: (fileId: string) => Promise<void>;
  stopExecution: () => void;
  clearExecutionResult: () => void;
  getExecutionResult: (fileId: string, execId: string) => Promise<void>;
  getExecutionLog: (fileId: string, execId: string) => Promise<void>;
}

const NotebookMainContent: React.FC<EditorContentProps> = ({
  state,
  addTab,
  removeTab,
  switchTab
}) => {
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

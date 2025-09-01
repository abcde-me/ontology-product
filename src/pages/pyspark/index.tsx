import React, { useState, useCallback, useRef } from 'react';
import { Layout, Tabs, Message } from '@arco-design/web-react';
import FileManager from './components/file-manager';
import DataManager from './components/data-manager';
import EditorContent from './components/editor';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import { openPythonItem } from '@/api/python';
import { OpenPythonItemRes, PythonItemType } from '@/types/pythonApi';
import './index.scss';
import { DirectoryTreeRef } from '@/components/directory-tree/DirectoryTree';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'files' | 'tools' | 'data';

// 文件标签页类型
interface FileTab {
  key: string;
  title: string;
  content: string;
  fileId?: string;
  lastModified?: string;
}

// 文件状态类型
interface FileState {
  currentFileId: string | null;
  fileTabs: FileTab[];
  activeTab: string;
  isLoading: boolean;
  error: Error | null;
}

// 初始状态
const initialState: FileState = {
  currentFileId: null,
  fileTabs: [],
  activeTab: '',
  isLoading: false,
  error: null
};

export default function Python() {
  const [activeTab, setActiveTab] = useState<TabKey>('data');
  const [fileState, setFileState] = useState<FileState>(initialState);

  // DirectoryTree 的 ref，用于调用其新建功能
  const directoryTreeRef = useRef<DirectoryTreeRef>(null);

  // 文件操作
  const openFile = useCallback(
    async (fileId: string, fileName?: string) => {
      try {
        setFileState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await openPythonItem(fileId);
        if (response.status === 200 && response.data) {
          const fileData: OpenPythonItemRes = response.data;

          // 创建或更新标签页
          const newTabKey = `file-${fileId}`;
          const existingTabIndex = fileState.fileTabs.findIndex(
            (tab) => tab.fileId === fileId
          );

          let updatedTabs: FileTab[];
          if (existingTabIndex >= 0) {
            // 更新现有标签页
            updatedTabs = fileState.fileTabs.map((tab) =>
              tab.key === newTabKey
                ? {
                    ...tab,
                    content: fileData.data,
                    lastModified: new Date().toISOString()
                  }
                : tab
            );
          } else {
            // 创建新标签页
            const newTab = {
              key: newTabKey,
              title: fileName || `文件 ${fileId}`, // 使用传入的文件名或默认名称
              content: fileData.data,
              fileId: fileId,
              lastModified: new Date().toISOString()
            };
            updatedTabs = [...fileState.fileTabs, newTab];
          }

          setFileState((prev) => ({
            ...prev,
            fileTabs: updatedTabs,
            currentFileId: fileId,
            activeTab: newTabKey,
            isLoading: false
          }));
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('打开文件失败');
        setFileState((prev) => ({
          ...prev,
          error: errorObj,
          isLoading: false
        }));
        Message.error('打开文件失败');
      }
    },
    [fileState.fileTabs]
  );

  const addTab = useCallback(
    (newFileInfo?: any) => {
      let newTabKey: string;
      let newTabTitle: string;
      let newFileId: string | undefined;

      if (newFileInfo) {
        // 如果有新文件信息，使用文件信息创建标签页
        newTabKey = `notebook-${newFileInfo.id}`;
        newTabTitle = newFileInfo.name;
        newFileId = String(newFileInfo.id);
      } else {
        // 否则创建临时标签页
        newTabKey = `notebook-${Date.now()}`;
        newTabTitle = `新建笔记本 ${fileState.fileTabs.length + 1}`;
        newFileId = undefined;
      }

      const newTab = {
        key: newTabKey,
        title: newTabTitle,
        content: '',
        fileId: newFileId,
        lastModified: undefined
      };

      setFileState((prev) => ({
        ...prev,
        fileTabs: [...prev.fileTabs, newTab],
        activeTab: newTab.key
      }));
    },
    [fileState.fileTabs.length]
  );

  const removeTab = useCallback(
    (key: string) => {
      const remainingTabs = fileState.fileTabs.filter((tab) => tab.key !== key);
      let newActiveTab = fileState.activeTab;

      // 如果删除的是当前活动标签页，切换到下一个
      if (key === fileState.activeTab && remainingTabs.length > 0) {
        newActiveTab = remainingTabs[0].key;
      }

      setFileState((prev) => ({
        ...prev,
        fileTabs: remainingTabs,
        activeTab: newActiveTab
      }));
    },
    [fileState.fileTabs, fileState.activeTab]
  );

  const switchTab = useCallback((key: string) => {
    setFileState((prev) => ({ ...prev, activeTab: key }));
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  // 从 FileManager 获取创建文件的函数
  const handleCreate = useCallback(
    (finalName: string, node?: any): Promise<any> => {
      return new Promise((resolve) => {
        try {
          // 直接调用 DirectoryTree 的新建 PySpark 功能
          if (directoryTreeRef.current) {
            directoryTreeRef.current.startRootCreate(false); // false 表示创建文件，不是文件夹
            resolve(null); // 返回 null，因为 DirectoryTree 会自己处理创建逻辑
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('调用新建功能失败:', error);
          Message.error('调用新建功能失败');
          resolve(null);
        }
      });
    },
    []
  );

  return (
    <Layout className="notebook-layout">
      <Sider width={300} className="notebook-sider">
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
          <TabPane key="tools" title={<SuanziIcon />}></TabPane>
        </Tabs>
      </Sider>
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
    </Layout>
  );
}

import React, { useState, memo, useRef } from 'react';
import { Layout, Tabs } from '@arco-design/web-react';
import FileManager from './components/file-manager';
import DataManager from './components/data-manager';
import EditorContent from './components/editor';
import DataIcon from '@/assets/python/data-left-menu.svg';
import DasetIcon from '@/assets/python/daset-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import { useTabManager } from './hooks/useTabManager';
import './index.scss';
import DatasetsList from './components/daset-export/DatasetsList';
import ToolsManager from './components/tools-manager';
import { useHasPermission } from '@/store/userInfoStore';
import { PYSPARK_PERMISSIONS } from '@/config/permissions';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'files' | 'tools' | 'data' | 'daset';

const Python: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabKey>('files');
  const [insertContentFunction, setInsertContentFunction] = useState<
    ((content: string) => void) | null
  >(null);
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const isEditorFocusedRef = useRef<boolean>(false);
  // 用于同步选中状态到FileManager的回调函数
  const [fileManagerSelectedKeys, setFileManagerSelectedKeys] = useState<
    string[]
  >([]);

  const {
    fileState,
    directoryTreeRef,
    openFile,
    addTab,
    removeTab,
    removeTabByFileId, // 获取根据文件ID关闭标签页的方法
    switchTab,
    updateTabContent,
    updateTabTitle, // 获取更新标签页标题的方法
    handleCreate
  } = useTabManager(setFileManagerSelectedKeys);

  // 处理标签页内容更新
  const handleTabContentUpdate = (tabKey: string, content: string) => {
    updateTabContent(tabKey, content);
  };

  const isDasetTab = activeTab === 'daset';

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  // 处理插入内容功能注册
  const handleInsertContentRegister = (insertFn: (content: string) => void) => {
    setInsertContentFunction(() => insertFn);
  };

  // 插入内容到编辑器
  const insertContentToEditor = (content: string) => {
    if (insertContentFunction) {
      insertContentFunction(content);
    }
  };

  // 处理编辑器聚焦状态变化
  const handleEditorFocusChange = (focused: boolean) => {
    console.log('handleEditorFocusChange', focused);
    isEditorFocusedRef.current = focused;
    setIsEditorFocused(focused);
  };

  return (
    <Layout className="pyspark-layout">
      <Sider width={isDasetTab ? '100%' : 300} className="pyspark-sider">
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          direction="vertical"
          className="pyspark-tabs"
          type="rounded"
        >
          <TabPane key="files" title={<PythonIcon />}>
            {activeTab === 'files' && (
              <FileManager
                type="files"
                onFileOpen={openFile}
                onFileDelete={removeTabByFileId} // 传递删除文件时关闭标签页的回调
                onFileRename={updateTabTitle} // 传递重命名文件时更新标签页标题的回调
                ref={directoryTreeRef}
                externalSelectedKeys={fileManagerSelectedKeys}
              />
            )}
          </TabPane>
          <TabPane key="data" title={<DataIcon />}>
            {activeTab === 'data' && (
              <DataManager
                onInsertContent={insertContentToEditor}
                getIsEditorFocused={() => isEditorFocusedRef.current}
              />
            )}
          </TabPane>
          {useHasPermission(PYSPARK_PERMISSIONS.CAN_RETRIEVE_OPERATOR) && (
            <TabPane key="tools" title={<SuanziIcon />}>
              {activeTab === 'tools' && (
                <ToolsManager
                  onInsertContent={insertContentToEditor}
                  getIsEditorFocused={() => isEditorFocusedRef.current}
                />
              )}
            </TabPane>
          )}
          {useHasPermission(PYSPARK_PERMISSIONS.CAN_SEARCH_EXPORTS) && (
            <TabPane key="daset" title={<DasetIcon />}>
              {isDasetTab && <DatasetsList />}
            </TabPane>
          )}
        </Tabs>
      </Sider>
      {!isDasetTab && (
        <Content className="pyspark-content">
          <EditorContent
            fileTabs={fileState.fileTabs}
            activeTab={fileState.activeTab}
            onTabChange={switchTab}
            onAddTab={(newFileInfo?: any) => addTab(newFileInfo)}
            onRemoveTab={removeTab}
            onCreate={handleCreate}
            onTabContentUpdate={handleTabContentUpdate}
            onSidebarTabChange={setActiveTab}
            onInsertContent={handleInsertContentRegister}
            onEditorFocusChange={handleEditorFocusChange}
          />
        </Content>
      )}
    </Layout>
  );
});

Python.displayName = 'Python';

export default Python;

import React, { useState, memo, useEffect, useRef, useCallback } from 'react';
import { Layout, Tabs, Popover } from '@arco-design/web-react';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import DasetIcon from '@/assets/python/daset-left-menu.svg';
import FileManager from './components/file-manager';
import DataManager from './components/data-manager';
import EditorContent from './components/editor';
import DatasetsList from './components/DatasetsList';
import { FileTab, useTabManager } from './hooks/useTabManager';
import './index.scss';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'data' | 'files' | 'dataset';

const defaultActiveTab = 'data';

const SqlIndex: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultActiveTab);
  const [insertContentFunction, setInsertContentFunction] = useState<
    ((content: string) => void) | null
  >(null);
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const isEditorFocusedRef = useRef<boolean>(false);

  // 添加状态桥接：用于同步FileManager的选中状态
  const [fileManagerSelectedKeys, setFileManagerSelectedKeys] = useState<
    string[]
  >([]);

  // 选中状态变化回调
  const handleSelectedKeysChange = useCallback((selectedKeys: string[]) => {
    setFileManagerSelectedKeys(selectedKeys);
  }, []);

  const {
    fileState,
    directoryTreeRef,
    addTab,
    removeTab,
    removeTabByFileId, // 获取根据文件ID关闭标签页的方法
    switchTab,
    handleCreate,
    updateTab,
    openFile,
    updateTabTitle // 获取更新标签页标题的方法
  } = useTabManager(handleSelectedKeysChange);

  // 初始化创建一个默认SQL查询标签
  useEffect(() => addTab(), []);

  const isDasetTab = activeTab === 'dataset';

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  const handleActiveUpdate = (tabData: FileTab) => {
    // console.log('handleActiveUpdate tabData', tabData);
    updateTab(tabData);
  };

  // 处理插入内容功能注册
  const handleInsertContentRegister = (insertFn: (content: string) => void) => {
    setInsertContentFunction(() => insertFn);
  };

  // 插入内容到编辑器
  const insertContentToEditor = (content: string) => {
    console.log(
      'insertContentToEditor called with:',
      content,
      'isEditorFocused:',
      isEditorFocusedRef.current
    );
    if (insertContentFunction) {
      insertContentFunction(content);
    }
  };

  // 处理编辑器聚焦状态变化
  const handleEditorFocusChange = (focused: boolean) => {
    isEditorFocusedRef.current = focused;
    setIsEditorFocused(focused);
  };

  // 刷新目录的函数
  const handleRefreshDirectory = useCallback(async () => {
    if (directoryTreeRef.current?.refresh) {
      await directoryTreeRef.current.refresh();
    }
  }, []);

  // 选中文件的方法
  const selectFile = (fileId: string) => {
    if (directoryTreeRef.current?.selectFile) {
      directoryTreeRef.current.selectFile(fileId);
    }
  };

  return (
    <Layout className="sql-page-layout">
      <Sider width={isDasetTab ? '100%' : 300} className="sql-sider">
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          direction="vertical"
          className="sql-tabs"
          type="rounded"
        >
          <TabPane
            key="data"
            title={
              <Popover content="源数据" position="right">
                <DataIcon />
              </Popover>
            }
          >
            {activeTab === 'data' && (
              <DataManager
                key="data"
                onInsertContent={insertContentToEditor}
                getIsEditorFocused={() => isEditorFocusedRef.current}
              />
            )}
          </TabPane>
          <TabPane
            key="files"
            title={
              <Popover content="SQL脚本列表" position="right">
                <PythonIcon />
              </Popover>
            }
          >
            {activeTab === 'files' && (
              <FileManager
                key="files"
                type="files"
                ref={directoryTreeRef}
                onFileOpen={openFile}
                onFileDelete={removeTabByFileId} // 传递删除文件时关闭标签页的回调
                onFileRename={updateTabTitle} // 传递重命名文件时更新标签页标题的回调
                externalSelectedKeys={fileManagerSelectedKeys}
              />
            )}
          </TabPane>
          {useHasPermission(SQL_PERMISSIONS.CAN_EXPORT_TASK_LIST) && (
            <TabPane
              key="dataset"
              title={
                <Popover content="数据集导出任务" position="right">
                  <DasetIcon />
                </Popover>
              }
            >
              {activeTab === 'dataset' && <DatasetsList />}
            </TabPane>
          )}
        </Tabs>
      </Sider>
      <Content className={`sql-content ${isDasetTab ? 'hidden' : 'visible'}`}>
        <EditorContent
          fileTabs={fileState.fileTabs}
          activeTab={fileState.activeTab}
          onTabChange={switchTab}
          onAddTab={(newFileInfo?: any) => addTab(newFileInfo)}
          onRemoveTab={removeTab}
          onCreate={handleCreate}
          onActiveUpdate={handleActiveUpdate}
          onInsertContent={handleInsertContentRegister}
          onEditorFocusChange={handleEditorFocusChange}
          refreshDirectory={handleRefreshDirectory}
          selectFile={selectFile}
        />
      </Content>
    </Layout>
  );
});

export default SqlIndex;

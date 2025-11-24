import React, { useState, memo, useRef, useEffect } from 'react';
import { Layout, Tabs, Popover, ResizeBox } from '@arco-design/web-react';
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
import { DirectoryTreeRef } from '@/components/directory-tree/DirectoryTree';
import { useLocation, useHistory } from 'react-router-dom';

const { Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'files' | 'tools' | 'data' | 'daset';
const defaultActiveTab = 'files';

const Python: React.FC = memo(() => {
  const location = useLocation();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<TabKey>(defaultActiveTab);
  const isCanCreate = useHasPermission(PYSPARK_PERMISSIONS.CREATE);
  const [insertContentFunction, setInsertContentFunction] = useState<
    ((content: string | number) => void) | null
  >(null);
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const isEditorFocusedRef = useRef<boolean>(false);

  // 从URL查询参数中解析activeTab
  const getActiveTabFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('activeTab') || defaultActiveTab;
  };

  useEffect(() => {
    setActiveTab(getActiveTabFromUrl() as TabKey);
  }, [location.search]);

  // 用于同步选中状态到FileManager的回调函数
  const [fileManagerSelectedKeys, setFileManagerSelectedKeys] = useState<
    string[]
  >([]);

  // 用于获取当前文件夹ID的状态
  const [currentFolderId, setCurrentFolderId] = useState<string>('0');

  // 用于存储创建权限的状态
  // const [isCanCreate, setIsCanCreate] = useState<boolean>(true);

  // FileManager 的引用
  const fileManagerRef = useRef<DirectoryTreeRef>(null);

  // 刷新目录的方法
  const refreshDirectory = async () => {
    if (fileManagerRef.current) {
      // 通过 ref 调用 DirectoryTree 的刷新方法
      await fileManagerRef.current.refresh?.();
    }
  };

  // 选中文件的方法
  const selectFile = (fileId: string) => {
    if (fileManagerRef.current) {
      // 通过 ref 调用 DirectoryTree 的选中方法
      fileManagerRef.current.selectFile?.(fileId);
    }
  };

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
    handleCreate,
    hasOpenTabs // 获取检查是否有标签页打开的方法
  } = useTabManager(
    setFileManagerSelectedKeys,
    () => currentFolderId,
    refreshDirectory,
    selectFile
  );

  // 处理标签页内容更新
  const handleTabContentUpdate = (tabKey: string, content: string) => {
    updateTabContent(tabKey, content);
  };

  const isDasetTab = activeTab === 'daset';

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);

    const searchParams = new URLSearchParams(location.search);

    // 更新activeTab参数
    searchParams.set('activeTab', key);

    // 使用history更新URL，不触发页面重载
    history.push({
      pathname: location.pathname,
      search: searchParams.toString()
    });
  };

  // 处理插入内容功能注册
  const handleInsertContentRegister = (insertFn: (content: string) => void) => {
    setInsertContentFunction(() => insertFn);
  };

  // 插入内容到编辑器
  const insertContentToEditor = (content: string | number) => {
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

  const siderContent = (
    <Sider width="100%" className="pyspark-sider">
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        direction="vertical"
        className="pyspark-tabs"
        type="rounded"
      >
        <TabPane
          key="files"
          title={
            <Popover content="PySpark文件" position="left">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PythonIcon />
              </div>
            </Popover>
          }
        >
          {activeTab === 'files' && (
            <FileManager
              type="files"
              onFileOpen={openFile}
              onFileDelete={removeTabByFileId} // 传递删除文件时关闭标签页的回调
              onFileRename={updateTabTitle} // 传递重命名文件时更新标签页标题的回调
              hasOpenTabs={hasOpenTabs} // 传递检查是否有标签页打开的回调
              ref={fileManagerRef}
              externalSelectedKeys={fileManagerSelectedKeys}
              onCurrentFolderChange={setCurrentFolderId} // 传递当前文件夹变化的回调
              // onCanCreateChange={handleCanCreateChange} // 传递创建权限变化的回调
            />
          )}
        </TabPane>
        <TabPane
          key="data"
          title={
            <Popover content="数据目录" position="left">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DataIcon />
              </div>
            </Popover>
          }
        >
          {activeTab === 'data' && (
            <DataManager
              onInsertContent={insertContentToEditor}
              getIsEditorFocused={() => isEditorFocusedRef.current}
            />
          )}
        </TabPane>
        <TabPane
          key="tools"
          title={
            <Popover content="算子库" position="left">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SuanziIcon />
              </div>
            </Popover>
          }
        >
          {activeTab === 'tools' && (
            <ToolsManager
              onInsertContent={insertContentToEditor}
              getIsEditorFocused={() => isEditorFocusedRef.current}
            />
          )}
        </TabPane>
        <TabPane
          key="daset"
          title={
            <Popover content="数据集导出任务" position="left">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DasetIcon />
              </div>
            </Popover>
          }
        >
          {isDasetTab && <DatasetsList />}
        </TabPane>
      </Tabs>
    </Sider>
  );

  const contentPanel = (
    <div className="pyspark-content">
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
        refreshDirectory={refreshDirectory}
        selectFile={selectFile}
        isCanCreate={isCanCreate}
      />
    </div>
  );

  return (
    <Layout className="pyspark-layout">
      {isDasetTab ? (
        siderContent
      ) : (
        <ResizeBox.Split
          direction="horizontal"
          size={'360px'}
          // min={200}
          // max="80%"
          style={{ height: '100%' }}
          panes={[siderContent, contentPanel]}
        />
      )}
    </Layout>
  );
});

Python.displayName = 'Python';

export default Python;

import React, { useState, memo, useEffect, useRef, useCallback } from 'react';
import { Layout, Tabs, Popover } from '@arco-design/web-react';
import DataIcon from '@/assets/sql/data-left-menu.svg';
import SQLIcon from '@/assets/sql/sql-left-menu.svg';
import DasetIcon from '@/assets/sql/daset-left-menu.svg';
import FileManager from './components/file-manager';
import DataManager from './components/data-manager';
import SplScriptManagement from './components/spl-script-management';
import EditorContent from './components/editor';
import DatasetsList from './components/DatasetsList';
import { FileTab, useTabManager } from './hooks/useTabManager';
import styles from './index.module.scss';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';
import { useLocation, useHistory } from 'react-router-dom';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'data' | 'files' | 'dataset' | 'script';

const defaultActiveTab = 'script';

const SqlIndex: React.FC = memo(() => {
  const location = useLocation();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<TabKey>(defaultActiveTab);
  const [insertContentFunction, setInsertContentFunction] = useState<
    ((content: string) => void) | null
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

  const isDasetTab = activeTab === 'dataset' || activeTab === 'script';

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
    <Layout className={styles['sql-page-layout']}>
      <Sider width={isDasetTab ? '100%' : 400} className={styles['sql-sider']}>
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          direction="vertical"
          className={styles['sql-tabs']}
          type="rounded"
        >
          <TabPane
            key="script"
            title={
              <Popover content="SQL脚本管理" position="left">
                <DataIcon className={styles['sql-menu-icon']} />
              </Popover>
            }
          >
            {activeTab === 'script' && (
              <SplScriptManagement
                onToScriptList={handleTabChange}
                key="script"
              />
            )}
          </TabPane>
          <TabPane
            key="data"
            title={
              <Popover content="数据列表" position="left">
                <DataIcon className={styles['sql-menu-icon']} />
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
              <Popover content="加工脚本列表" position="left">
                <SQLIcon className={styles['sql-menu-icon']} />
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
          {useHasPermission(SQL_PERMISSIONS.LIST) && (
            <TabPane
              key="dataset"
              title={
                <Popover content="数据集导出任务" position="left">
                  <DasetIcon className={styles['sql-menu-icon']} />
                </Popover>
              }
            >
              {activeTab === 'dataset' && <DatasetsList />}
            </TabPane>
          )}
        </Tabs>
      </Sider>
      <Content
        className={`${styles['sql-content']} ${isDasetTab ? styles.hidden : styles.visible}`}
      >
        <EditorContent
          fileTabs={fileState.fileTabs}
          activeTab={fileState.activeTab}
          curActiveTab={activeTab}
          onTabChange={switchTab}
          onAddTab={(newFileInfo?: any) => addTab(newFileInfo)}
          onRemoveTab={removeTab}
          onCreate={handleCreate}
          onActiveUpdate={handleActiveUpdate}
          onInsertContent={handleInsertContentRegister}
          onEditorFocusChange={handleEditorFocusChange}
          refreshDirectory={handleRefreshDirectory}
          selectFile={selectFile}
          onToScriptList={handleTabChange}
        />
      </Content>
    </Layout>
  );
});

export default SqlIndex;

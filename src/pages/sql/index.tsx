import React, { useState, memo, useEffect, useRef, useCallback } from 'react';
import { Layout, Tabs, Popover, ResizeBox } from '@arco-design/web-react';
import ScriptManagementIcon from './assets/script-management-left-menu.svg';
import QueryIcon from './assets/query-menu.svg';
import DevelopIcon from './assets/develop-menu.svg';
import DasetIcon from './assets/daset-left-menu.svg';
import FileManager from './components/file-manager';
import DataManager from './components/data-manager';
import SplScriptManagement from './components/spl-script-management';
import EditorContent from './components/editor';
import DevelopScriptEditor from './components/develop-script-editor';
import DatasetsList from './components/DatasetsList';
import {
  FileTab,
  useQueryScriptTabManager
} from './hooks/useQueryScriptTabManager';
import styles from './index.module.scss';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';
import { useLocation } from 'react-router-dom';
import {
  FileTab as DevelopScriptFileTab,
  useDevelopScriptTabManager
} from './hooks/useDevelopScriptTabManager';
import { useUrlState } from './hooks/useUrlState';
import { generateSqlDefaultName } from './utils';

const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

type TabKey = 'data' | 'files' | 'dataset' | 'script';

const defaultActiveTab = 'script';

const SqlIndex: React.FC = memo(() => {
  const location = useLocation();
  const { urlState, updateUrlState } = useUrlState();
  const [activeTab, setActiveTab] = useState<TabKey>(defaultActiveTab);
  const [insertContentFunction, setInsertContentFunction] = useState<
    ((content: string) => void) | null
  >(null);
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const [isDevelopScriptEditorFocused, setIsDevelopScriptEditorFocused] =
    useState<boolean>(false);
  const isEditorFocusedRef = useRef<boolean>(false);
  const isDevelopScriptEditorFocusedRef = useRef<boolean>(false);
  // 添加状态桥接：用于同步FileManager的选中状态
  // SQL查询脚本选中状态
  const [fileManagerSelectedKeys, setFileManagerSelectedKeys] = useState<
    string[]
  >([]);
  // 添加状态桥接：用于同步FileManager的选中状态
  // SQL加工脚本选中状态
  const [
    developScriptFileManagerSelectedKeys,
    setDevelopScriptFileManagerSelectedKeys
  ] = useState<string[]>([]);

  // 从URL状态中获取activeTab
  useEffect(() => {
    const tab = (urlState.activeTab || defaultActiveTab) as TabKey;

    setActiveTab((prev) => (prev !== tab ? tab : prev));

    // SQL加工脚本选中状态
    if (tab === 'files' && urlState.activeDevelopScriptId) {
      setDevelopScriptFileManagerSelectedKeys([urlState.activeDevelopScriptId]);
    }
  }, [urlState.activeTab, urlState.activeDevelopScriptId]);

  // 选中SQL加工脚本变化回调
  const handleDevelopScriptSelectedKeysChange = useCallback(
    (selectedKeys: string[]) => {
      updateUrlState(
        {
          activeTab: 'files',
          activeDevelopScriptId: selectedKeys[0]
        },
        { method: 'push' }
      );
    },
    [updateUrlState, location.search]
  );

  const handleSqlQueryActiveUpdate = useCallback(
    (selectedKeys: string[]) => {},
    [updateUrlState, location.search]
  );

  const {
    fileState,
    addTab: addQueryScriptTab,
    removeTab,
    switchTab: switchQueryScriptTab,
    updateTab,
    createQueryScript
  } = useQueryScriptTabManager(handleSqlQueryActiveUpdate);

  const {
    fileState: developScriptFileState,
    directoryTreeRef: developScriptDirectoryTreeRef,
    addTab: developScriptAddTab,
    removeTab: developScriptRemoveTab,
    removeTabByFileId: developScriptRemoveTabByFileId,
    switchTab: developScriptSwitchTab,
    handleCreate: developScriptHandleCreate,
    updateTab: developScriptUpdateTab,
    openFile: developScriptOpenFile,
    updateTabTitle: developScriptUpdateTabTitle
  } = useDevelopScriptTabManager(handleDevelopScriptSelectedKeysChange);

  const isDasetTab = activeTab === 'dataset' || activeTab === 'script';

  const handleTabChange = (key: string) => {
    // 使用 useUrlState 更新 URL，自动保留所有现有查询参数
    const method = key === 'files' ? 'push' : 'replace';
    // 如果切换到非 files tab，删除 activeDevelopScriptId 参数
    // 如果切换到非 data tab，删除 activeScriptId 参数
    // 如果切换到非 script tab，删除 scriptType 参数
    const updates: {
      activeTab: string;
      activeDevelopScriptId?: string;
      activeScriptId?: string;
      scriptType?: string;
    } = {
      activeTab: key
    };
    if (key !== 'files') {
      updates.activeDevelopScriptId = '';
    }
    if (key !== 'data') {
      updates.activeScriptId = '';
    }
    if (key !== 'script') {
      updates.scriptType = '';
    }
    updateUrlState(updates, { method });
  };

  const handleActiveUpdate = (tabData: FileTab) => {
    if (tabData.fileId || tabData.scriptId) {
      updateTab({
        fileId: tabData.fileId,
        title: tabData.title ?? '',
        scriptId: tabData.scriptId ?? '',
        content: tabData.content ?? '',
        lastModified: tabData.lastModified ?? undefined,
        hasRun: tabData.hasRun ?? false
      });
    }
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

  const handleDevelopScriptEditorFocusChange = (focused: boolean) => {
    isDevelopScriptEditorFocusedRef.current = focused;
    setIsDevelopScriptEditorFocused(focused);
  };

  const handleDevelopScriptActiveUpdate = (tabData: DevelopScriptFileTab) => {
    developScriptUpdateTab(tabData);
  };

  const handleDevelopScriptInsertContentRegister = (
    insertFn: (content: string) => void
  ) => {
    setInsertContentFunction(() => insertFn);
  };

  const handleDevelopScriptRefreshDirectory = useCallback(async () => {
    if (developScriptDirectoryTreeRef.current?.refresh) {
      await developScriptDirectoryTreeRef.current.refresh();
    }
  }, []);

  const selectDevelopScriptFile = (fileId: string) => {
    if (developScriptDirectoryTreeRef.current?.selectFile) {
      developScriptDirectoryTreeRef.current.selectFile(fileId);
    }
  };

  const siderContent = (
    <Sider width="100%" className={styles['sql-sider']}>
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        direction="vertical"
        className={styles['sql-tabs']}
        type="rounded"
        destroyOnHide
      >
        <TabPane
          key="script"
          title={
            <Popover content="脚本管理" position="left">
              <ScriptManagementIcon className={styles['sql-menu-icon']} />
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

        {useHasPermission(SQL_PERMISSIONS.DEVELOP_SCIPT_LIST) && (
          <TabPane
            key="files"
            title={
              <Popover content="数据加工" position="left">
                <DevelopIcon className={styles['sql-menu-icon']} />
              </Popover>
            }
          >
            {activeTab === 'files' && (
              <FileManager
                key="files"
                type="files"
                ref={developScriptDirectoryTreeRef}
                onFileOpen={developScriptOpenFile}
                onFileDelete={developScriptRemoveTabByFileId} // 传递删除文件时关闭标签页的回调
                onFileRename={developScriptUpdateTabTitle} // 传递重命名文件时更新标签页标题的回调
                externalSelectedKeys={developScriptFileManagerSelectedKeys}
                fileTabs={developScriptFileState.fileTabs} // 传递已打开的标签页列表
                onSwitchTab={developScriptSwitchTab} // 传递切换标签页的回调
              />
            )}
          </TabPane>
        )}

        {useHasPermission(SQL_PERMISSIONS.QUERY_SCRIPT_LIST) && (
          <TabPane
            key="data"
            title={
              <Popover content="SQL查询" position="left">
                <QueryIcon className={styles['sql-menu-icon']} />
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
        )}

        {useHasPermission(SQL_PERMISSIONS.QUERY_SCRIPT_LIST) && (
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
  );

  const contentPanel = (
    <Content className={styles['sql-content']}>
      {activeTab === 'data' && (
        <EditorContent
          key={activeTab}
          fileTabs={fileState.fileTabs}
          activeTab={fileState.activeTab}
          curActiveTab={activeTab}
          onTabChange={switchQueryScriptTab}
          onAddTab={(newFileInfo?: any) => addQueryScriptTab(newFileInfo)}
          onRemoveTab={removeTab}
          onCreate={() => createQueryScript(generateSqlDefaultName(new Date()))}
          onActiveUpdate={handleActiveUpdate}
          onInsertContent={handleInsertContentRegister}
          onEditorFocusChange={handleEditorFocusChange}
          onToScriptList={handleTabChange}
          fileManagerSelectedKeys={fileManagerSelectedKeys}
        />
      )}
      {activeTab === 'files' && (
        <DevelopScriptEditor
          key={activeTab}
          fileTabs={developScriptFileState.fileTabs}
          activeTab={developScriptFileState.activeTab}
          curActiveTab={activeTab}
          onTabChange={developScriptSwitchTab}
          onAddTab={(newFileInfo?: any) => developScriptAddTab(newFileInfo)}
          onRemoveTab={developScriptRemoveTab}
          onCreate={developScriptHandleCreate}
          onActiveUpdate={handleDevelopScriptActiveUpdate}
          onInsertContent={handleDevelopScriptInsertContentRegister}
          onEditorFocusChange={handleDevelopScriptEditorFocusChange}
          refreshDirectory={handleDevelopScriptRefreshDirectory}
          selectFile={selectDevelopScriptFile}
          onToScriptList={handleTabChange}
          onFileOpen={developScriptOpenFile}
        />
      )}
    </Content>
  );

  return (
    <Layout className={styles['sql-page-layout']}>
      {isDasetTab ? (
        siderContent
      ) : (
        <ResizeBox.Split
          direction="horizontal"
          size={'400px'}
          min={'300px'}
          max={'600px'}
          style={{ height: '100%' }}
          panes={[siderContent, contentPanel]}
        />
      )}
    </Layout>
  );
});

export default SqlIndex;

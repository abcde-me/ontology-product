import React, { useState, memo, useEffect, useRef, useCallback } from 'react';
import { Layout, Tabs } from '@arco-design/web-react';
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
    openFile
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
    console.log('handleEditorFocusChange focused', focused);
    isEditorFocusedRef.current = focused;
    setIsEditorFocused(focused);
  };

  return (
    <Layout className="sql-layout">
      <Sider width={isDasetTab ? '100%' : 300} className="sql-sider">
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          direction="vertical"
          className="sql-tabs"
          type="rounded"
        >
          <TabPane key="data" title={<DataIcon />}>
            {activeTab === 'data' && (
              <DataManager
                key="data"
                onInsertContent={insertContentToEditor}
                getIsEditorFocused={() => isEditorFocusedRef.current}
              />
            )}
          </TabPane>
          <TabPane key="files" title={<PythonIcon />}>
            {activeTab === 'files' && (
              <FileManager
                key="files"
                type="files"
                ref={directoryTreeRef}
                onFileOpen={openFile}
                onFileDelete={removeTabByFileId} // 传递删除文件时关闭标签页的回调
                externalSelectedKeys={fileManagerSelectedKeys}
              />
            )}
          </TabPane>
          <TabPane key="dataset" title={<DasetIcon />}>
            {activeTab === 'dataset' && <DatasetsList />}
          </TabPane>
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
        />
      </Content>
    </Layout>
  );
});

export default SqlIndex;

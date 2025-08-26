import React, { useState, useCallback } from 'react';
import { Layout, Tabs, Message } from '@arco-design/web-react';
import FileManager from './components/file-manager';
import EditorContent from './components/editor';
import DataIcon from '@/assets/python/data-left-menu.svg';
import SuanziIcon from '@/assets/python/suanzi-left-menu.svg';
import PythonIcon from '@/assets/python/python-left-menu.svg';
import {
  openPythonItem,
  savePythonItem,
  runPythonItem,
  getRunResult,
  getRunLog
} from '@/api/python';
import { OpenPythonItemRes } from '@/types/pythonApi';
import { RunningStatus } from '@/types/pythonApi';
import './index.scss';

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

// 编辑器状态类型
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

// 执行状态类型
interface ExecutionState {
  status: RunningStatus;
  execId: string;
  startTime: Date | null;
  duration: number;
  result: string;
  log: string;
  error: Error | null;
}

// 文件状态类型
interface FileState {
  currentFileId: string | null;
  fileTabs: FileTab[];
  activeTab: string;
  isLoading: boolean;
  error: Error | null;
}

// 全局状态类型
interface PythonState {
  files: FileState;
  editor: EditorState;
  execution: ExecutionState;
}

// 初始状态
const initialState: PythonState = {
  files: {
    currentFileId: null,
    fileTabs: [],
    activeTab: '',
    isLoading: false,
    error: null
  },
  editor: {
    content: '',
    isDirty: false,
    lastSaved: '',
    readOnly: false,
    cursorPosition: {
      line: 0,
      ch: 0
    }
  },
  execution: {
    status: RunningStatus.IDLE,
    execId: '',
    startTime: null,
    duration: 0,
    result: '',
    log: '',
    error: null
  }
};

export default function Python() {
  const [activeTab, setActiveTab] = useState<TabKey>('files');
  const [state, setState] = useState<PythonState>(initialState);

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<PythonState>) => {
    setState((prevState) => ({ ...prevState, ...updates }));
  }, []);

  const updateFiles = useCallback((updates: Partial<FileState>) => {
    setState((prevState) => ({
      ...prevState,
      files: { ...prevState.files, ...updates }
    }));
  }, []);

  const updateEditor = useCallback((updates: Partial<EditorState>) => {
    setState((prevState) => ({
      ...prevState,
      editor: { ...prevState.editor, ...updates }
    }));
  }, []);

  const updateExecution = useCallback((updates: Partial<ExecutionState>) => {
    setState((prevState) => ({
      ...prevState,
      execution: { ...prevState.execution, ...updates }
    }));
  }, []);

  // 文件操作
  const openFile = useCallback(
    async (fileId: string) => {
      try {
        updateFiles({ isLoading: true, error: null });

        const response = await openPythonItem(fileId);
        if (response.status === 200 && response.data) {
          const fileData: OpenPythonItemRes = response.data;

          // 创建或更新标签页
          const newTabKey = `file-${fileId}`;
          const existingTabIndex = state.files.fileTabs.findIndex(
            (tab) => tab.fileId === fileId
          );

          if (existingTabIndex >= 0) {
            // 更新现有标签页
            const updatedTabs = state.files.fileTabs.map((tab) =>
              tab.key === newTabKey
                ? {
                    ...tab,
                    content: fileData.data,
                    lastModified: new Date().toISOString()
                  }
                : tab
            );
            updateFiles({ fileTabs: updatedTabs });
          } else {
            // 创建新标签页
            const newTab = {
              key: newTabKey,
              title: `文件 ${fileId}`,
              content: fileData.data,
              fileId: fileId,
              lastModified: new Date().toISOString()
            };
            updateFiles({
              fileTabs: [...state.files.fileTabs, newTab],
              activeTab: newTabKey
            });
          }

          // 设置当前文件ID和活动标签页
          updateFiles({ currentFileId: fileId, activeTab: newTabKey });

          // 更新编辑器内容
          updateEditor({
            content: fileData.data,
            lastSaved: new Date().toISOString()
          });
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('打开文件失败');
        updateFiles({ error: errorObj });
        Message.error('打开文件失败');
      } finally {
        updateFiles({ isLoading: false });
      }
    },
    [state.files.fileTabs, updateFiles, updateEditor]
  );

  const closeFile = useCallback(
    (fileId: string) => {
      const tabToClose = state.files.fileTabs.find(
        (tab) => tab.fileId === fileId
      );
      if (tabToClose) {
        const remainingTabs = state.files.fileTabs.filter(
          (tab) => tab.key !== tabToClose.key
        );
        let newActiveTab = state.files.activeTab;

        // 如果删除的是当前活动标签页，切换到下一个
        if (
          tabToClose.key === state.files.activeTab &&
          remainingTabs.length > 0
        ) {
          newActiveTab = remainingTabs[0].key;
        }

        updateFiles({
          fileTabs: remainingTabs,
          activeTab: newActiveTab
        });
      }
    },
    [state.files.fileTabs, state.files.activeTab, updateFiles]
  );

  const saveFile = useCallback(
    async (fileId: string, content: string) => {
      try {
        const response = await savePythonItem(fileId, {
          id: Number(fileId),
          data: content
        });

        if (response?.status === 200) {
          updateEditor({
            lastSaved: response.data.last_modified,
            isDirty: false
          });
          Message.success('保存成功');
        }
      } catch (error) {
        Message.error('保存失败');
        throw error;
      }
    },
    [updateEditor]
  );

  const addTab = useCallback(
    (tab: FileTab) => {
      updateFiles({
        fileTabs: [...state.files.fileTabs, tab],
        activeTab: tab.key
      });
    },
    [state.files.fileTabs, updateFiles]
  );

  const removeTab = useCallback(
    (key: string) => {
      const remainingTabs = state.files.fileTabs.filter(
        (tab) => tab.key !== key
      );
      let newActiveTab = state.files.activeTab;

      // 如果删除的是当前活动标签页，切换到下一个
      if (key === state.files.activeTab && remainingTabs.length > 0) {
        newActiveTab = remainingTabs[0].key;
      }

      updateFiles({
        fileTabs: remainingTabs,
        activeTab: newActiveTab
      });
    },
    [state.files.fileTabs, state.files.activeTab, updateFiles]
  );

  const switchTab = useCallback(
    (key: string) => {
      updateFiles({ activeTab: key });

      // 更新编辑器内容
      const targetTab = state.files.fileTabs.find((tab) => tab.key === key);
      if (targetTab) {
        updateEditor({
          content: targetTab.content,
          isDirty: false
        });
      }
    },
    [state.files.fileTabs, updateFiles, updateEditor]
  );

  // 编辑器操作
  const updateContent = useCallback(
    (content: string) => {
      updateEditor({ content });
    },
    [updateEditor]
  );

  const setDirty = useCallback(
    (dirty: boolean) => {
      updateEditor({ isDirty: dirty });
    },
    [updateEditor]
  );

  const setCursorPosition = useCallback(
    (line: number, ch: number) => {
      updateEditor({ cursorPosition: { line, ch } });
    },
    [updateEditor]
  );

  // 执行操作
  const runCode = useCallback(
    async (fileId: string) => {
      if (state.execution.status === RunningStatus.RUNNING) {
        return;
      }

      try {
        updateExecution({
          status: RunningStatus.RUNNING,
          startTime: new Date(),
          duration: 0,
          error: null
        });

        const response = await runPythonItem(fileId);
        if (response?.status === 200) {
          updateExecution({ execId: response.data.execid });
        } else {
          throw new Error('运行失败');
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('运行失败');
        updateExecution({
          error: errorObj,
          status: RunningStatus.FAILED
        });
        Message.error('运行失败');
      }
    },
    [state.execution.status, updateExecution]
  );

  const stopExecution = useCallback(() => {
    updateExecution({ status: RunningStatus.IDLE });
  }, [updateExecution]);

  const clearExecutionResult = useCallback(() => {
    updateExecution({
      status: RunningStatus.IDLE,
      execId: '',
      startTime: null,
      duration: 0,
      result: '',
      log: '',
      error: null
    });
  }, [updateExecution]);

  const getExecutionResult = useCallback(
    async (fileId: string, execId: string) => {
      try {
        const response = await getRunResult(fileId, { execid: execId });
        if (response?.status === 200 && response.data) {
          updateExecution({
            result: response.data.run_result
          });

          // 检查执行状态
          if (response.data.run_status !== RunningStatus.RUNNING) {
            const status =
              response.data.run_status === RunningStatus.SUCCESS
                ? RunningStatus.SUCCESS
                : RunningStatus.FAILED;

            updateExecution({ status });

            // 计算执行时长
            if (state.execution.startTime) {
              const duration = Math.floor(
                (Date.now() - state.execution.startTime.getTime()) / 1000
              );
              updateExecution({ duration });
            }
          }
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('获取执行结果失败');
        updateExecution({ error: errorObj });
      }
    },
    [state.execution.startTime, updateExecution]
  );

  const getExecutionLog = useCallback(
    async (fileId: string, execId: string) => {
      try {
        const response = await getRunLog(fileId, { execid: execId });
        if (response?.status === 200 && response.data) {
          updateExecution({ log: response.data.log });
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('获取执行日志失败');
        updateExecution({ error: errorObj });
      }
    },
    [updateExecution]
  );

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  // 创建context value对象
  const contextValue = {
    state,
    openFile,
    closeFile,
    saveFile,
    addTab,
    removeTab,
    switchTab,
    updateContent,
    setDirty,
    setCursorPosition,
    runCode,
    stopExecution,
    clearExecutionResult,
    getExecutionResult,
    getExecutionLog
  };

  return (
    <Layout className="notebook-layout">
      <Sider width={280} className="notebook-sider">
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          direction="vertical"
          className="notebook-tabs"
          type="rounded"
        >
          <TabPane key="files" title={<PythonIcon></PythonIcon>}>
            <FileManager
              type="files"
              onFileOpen={openFile}
              hasOpenFiles={state.files.fileTabs.length > 0}
            />
          </TabPane>
          <TabPane key="data" title={<DataIcon></DataIcon>}>
            {/* <NotebookTabContent type="data" /> */}
          </TabPane>
          <TabPane key="tools" title={<SuanziIcon></SuanziIcon>}>
            {/* <NotebookTabContent type="tools" /> */}
          </TabPane>
        </Tabs>
      </Sider>
      <Content className="notebook-content">
        <EditorContent
          state={state}
          addTab={addTab}
          removeTab={removeTab}
          switchTab={switchTab}
          updateContent={updateContent}
          setDirty={setDirty}
          setCursorPosition={setCursorPosition}
          runCode={runCode}
          stopExecution={stopExecution}
          clearExecutionResult={clearExecutionResult}
          getExecutionResult={getExecutionResult}
          getExecutionLog={getExecutionLog}
        />
      </Content>
    </Layout>
  );
}

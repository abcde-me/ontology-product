import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode
} from 'react';
import { Message } from '@arco-design/web-react';
import { PythonState, PythonAction } from '../types/index';
import { pythonReducer, initialState } from '../reducers/pythonReducer';
import {
  openPythonItem,
  savePythonItem,
  runPythonItem,
  getRunResult,
  getRunLog
} from '@/api/python';
import { OpenPythonItemRes } from '@/types/pythonApi';
import { RunningStatus } from '@/types/pythonApi';

// Context接口
interface PythonContextValue {
  state: PythonState;
  // 文件操作
  openFile: (fileId: string) => Promise<void>;
  closeFile: (fileId: string) => void;
  saveFile: (fileId: string, content: string) => Promise<void>;
  addTab: (tab: Omit<PythonState['files']['fileTabs'][0], 'isActive'>) => void;
  removeTab: (key: string) => void;
  switchTab: (key: string) => void;

  // 编辑器操作
  updateContent: (content: string) => void;
  setDirty: (dirty: boolean) => void;
  setCursorPosition: (line: number, ch: number) => void;

  // 执行操作
  runCode: (fileId: string) => Promise<void>;
  stopExecution: () => void;
  clearExecutionResult: () => void;
  getExecutionResult: (fileId: string, execId: string) => Promise<void>;
  getExecutionLog: (fileId: string, execId: string) => Promise<void>;
}

// 创建Context
const PythonContext = createContext<PythonContextValue | undefined>(undefined);

// Provider组件
interface PythonProviderProps {
  children: ReactNode;
}

export const PythonProvider: React.FC<PythonProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(pythonReducer, initialState);

  // 文件操作
  const openFile = useCallback(
    async (fileId: string) => {
      try {
        dispatch({ type: 'SET_FILES_LOADING', payload: true });
        dispatch({ type: 'SET_FILES_ERROR', payload: null });

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
            dispatch({
              type: 'UPDATE_FILE_TAB',
              payload: {
                key: newTabKey,
                updates: {
                  content: fileData.data,
                  lastModified: new Date().toISOString() // 使用当前时间
                }
              }
            });
          } else {
            // 创建新标签页 - 暂时使用文件ID作为标题，后续可以从文件列表获取文件名
            const newTab = {
              key: newTabKey,
              title: `文件 ${fileId}`,
              content: fileData.data,
              fileId: fileId,
              lastModified: new Date().toISOString() // 使用当前时间
            };
            dispatch({ type: 'ADD_FILE_TAB', payload: newTab });
          }

          // 设置当前文件ID和活动标签页
          dispatch({ type: 'SET_CURRENT_FILE_ID', payload: fileId });
          dispatch({ type: 'SET_ACTIVE_TAB', payload: newTabKey });

          // 更新编辑器内容
          dispatch({ type: 'UPDATE_EDITOR_CONTENT', payload: fileData.data });
          dispatch({
            type: 'SET_LAST_SAVED',
            payload: new Date().toISOString()
          }); // 使用当前时间
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('打开文件失败');
        dispatch({ type: 'SET_FILES_ERROR', payload: errorObj });
        Message.error('打开文件失败');
      } finally {
        dispatch({ type: 'SET_FILES_LOADING', payload: false });
      }
    },
    [state.files.fileTabs]
  );

  const closeFile = useCallback(
    (fileId: string) => {
      const tabToClose = state.files.fileTabs.find(
        (tab) => tab.fileId === fileId
      );
      if (tabToClose) {
        dispatch({ type: 'REMOVE_FILE_TAB', payload: tabToClose.key });
      }
    },
    [state.files.fileTabs]
  );

  const saveFile = useCallback(async (fileId: string, content: string) => {
    try {
      const response = await savePythonItem(fileId, {
        id: Number(fileId),
        data: content
      });

      if (response?.status === 200) {
        dispatch({
          type: 'SET_LAST_SAVED',
          payload: response.data.last_modified
        });
        dispatch({ type: 'SET_EDITOR_DIRTY', payload: false });
        Message.success('保存成功');
      }
    } catch (error) {
      Message.error('保存失败');
      throw error;
    }
  }, []);

  const addTab = useCallback((tab: PythonState['files']['fileTabs'][0]) => {
    dispatch({ type: 'ADD_FILE_TAB', payload: tab });
  }, []);

  const removeTab = useCallback((key: string) => {
    dispatch({ type: 'REMOVE_FILE_TAB', payload: key });
  }, []);

  const switchTab = useCallback(
    (key: string) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: key });

      // 更新编辑器内容
      const targetTab = state.files.fileTabs.find((tab) => tab.key === key);
      if (targetTab) {
        dispatch({ type: 'UPDATE_EDITOR_CONTENT', payload: targetTab.content });
        dispatch({ type: 'SET_EDITOR_DIRTY', payload: false });
      }
    },
    [state.files.fileTabs]
  );

  // 编辑器操作
  const updateContent = useCallback((content: string) => {
    dispatch({ type: 'UPDATE_EDITOR_CONTENT', payload: content });
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    dispatch({ type: 'SET_EDITOR_DIRTY', payload: dirty });
  }, []);

  const setCursorPosition = useCallback((line: number, ch: number) => {
    dispatch({ type: 'SET_CURSOR_POSITION', payload: { line, ch } });
  }, []);

  // 执行操作
  const runCode = useCallback(
    async (fileId: string) => {
      if (state.execution.status === RunningStatus.RUNNING) {
        return;
      }

      try {
        dispatch({
          type: 'SET_EXECUTION_STATUS',
          payload: RunningStatus.RUNNING
        });
        dispatch({ type: 'SET_EXECUTION_START_TIME', payload: new Date() });
        dispatch({ type: 'SET_EXECUTION_DURATION', payload: 0 });
        dispatch({ type: 'SET_EXECUTION_ERROR', payload: null });

        const response = await runPythonItem(fileId);
        if (response?.status === 200) {
          dispatch({ type: 'SET_EXECUTION_ID', payload: response.data.execid });
        } else {
          throw new Error('运行失败');
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('运行失败');
        dispatch({ type: 'SET_EXECUTION_ERROR', payload: errorObj });
        dispatch({
          type: 'SET_EXECUTION_STATUS',
          payload: RunningStatus.FAILED
        });
        Message.error('运行失败');
      }
    },
    [state.execution.status]
  );

  const stopExecution = useCallback(() => {
    dispatch({ type: 'SET_EXECUTION_STATUS', payload: RunningStatus.IDLE });
  }, []);

  const clearExecutionResult = useCallback(() => {
    dispatch({ type: 'RESET_EXECUTION' });
  }, []);

  const getExecutionResult = useCallback(
    async (fileId: string, execId: string) => {
      try {
        const response = await getRunResult(fileId, { execid: execId });
        if (response?.status === 200 && response.data) {
          dispatch({
            type: 'SET_EXECUTION_RESULT',
            payload: response.data.run_result
          });

          // 检查执行状态
          if (response.data.run_status !== RunningStatus.RUNNING) {
            const status =
              response.data.run_status === RunningStatus.SUCCESS
                ? RunningStatus.SUCCESS
                : RunningStatus.FAILED;
            dispatch({ type: 'SET_EXECUTION_STATUS', payload: status });

            // 计算执行时长
            if (state.execution.startTime) {
              const duration = Math.floor(
                (Date.now() - state.execution.startTime.getTime()) / 1000
              );
              dispatch({ type: 'SET_EXECUTION_DURATION', payload: duration });
            }
          }
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('获取执行结果失败');
        dispatch({ type: 'SET_EXECUTION_ERROR', payload: errorObj });
      }
    },
    [state.execution.startTime]
  );

  const getExecutionLog = useCallback(
    async (fileId: string, execId: string) => {
      try {
        const response = await getRunLog(fileId, { execid: execId });
        if (response?.status === 200 && response.data) {
          dispatch({ type: 'SET_EXECUTION_LOG', payload: response.data.log });
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('获取执行日志失败');
        dispatch({ type: 'SET_EXECUTION_ERROR', payload: errorObj });
      }
    },
    []
  );

  const contextValue: PythonContextValue = {
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
    <PythonContext.Provider value={contextValue}>
      {children}
    </PythonContext.Provider>
  );
};

// 自定义Hook
export const usePythonContext = (): PythonContextValue => {
  const context = useContext(PythonContext);
  if (context === undefined) {
    throw new Error('usePythonContext must be used within a PythonProvider');
  }
  return context;
};

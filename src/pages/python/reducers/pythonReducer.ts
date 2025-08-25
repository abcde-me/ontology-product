import { PythonState, PythonAction } from '../types/index';
import { RunningStatus } from '@/types/pythonApi';

// 初始状态
export const initialState: PythonState = {
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

// Reducer函数
export const pythonReducer = (
  state: PythonState,
  action: PythonAction
): PythonState => {
  switch (action.type) {
    // 文件相关actions
    case 'SET_CURRENT_FILE_ID':
      return {
        ...state,
        files: {
          ...state.files,
          currentFileId: action.payload
        }
      };

    case 'SET_FILE_TABS':
      return {
        ...state,
        files: {
          ...state.files,
          fileTabs: action.payload
        }
      };

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        files: {
          ...state.files,
          activeTab: action.payload
        }
      };

    case 'ADD_FILE_TAB':
      return {
        ...state,
        files: {
          ...state.files,
          fileTabs: [...state.files.fileTabs, action.payload],
          activeTab: action.payload.key
        }
      };

    case 'UPDATE_FILE_TAB':
      return {
        ...state,
        files: {
          ...state.files,
          fileTabs: state.files.fileTabs.map((tab) =>
            tab.key === action.payload.key
              ? { ...tab, ...action.payload.updates }
              : tab
          )
        }
      };

    case 'REMOVE_FILE_TAB':
      const remainingTabs = state.files.fileTabs.filter(
        (tab) => tab.key !== action.payload
      );
      let newActiveTab = state.files.activeTab;

      // 如果删除的是当前活动标签页，切换到下一个
      if (
        action.payload === state.files.activeTab &&
        remainingTabs.length > 0
      ) {
        const currentIndex = state.files.fileTabs.findIndex(
          (tab) => tab.key === action.payload
        );
        const nextIndex =
          currentIndex < remainingTabs.length ? currentIndex : currentIndex - 1;
        newActiveTab = remainingTabs[nextIndex]?.key || '';
      }

      return {
        ...state,
        files: {
          ...state.files,
          fileTabs: remainingTabs,
          activeTab: newActiveTab
        }
      };

    case 'SET_FILES_LOADING':
      return {
        ...state,
        files: {
          ...state.files,
          isLoading: action.payload
        }
      };

    case 'SET_FILES_ERROR':
      return {
        ...state,
        files: {
          ...state.files,
          error: action.payload
        }
      };

    // 编辑器相关actions
    case 'UPDATE_EDITOR_CONTENT':
      return {
        ...state,
        editor: {
          ...state.editor,
          content: action.payload,
          isDirty: true
        }
      };

    case 'SET_EDITOR_DIRTY':
      return {
        ...state,
        editor: {
          ...state.editor,
          isDirty: action.payload
        }
      };

    case 'SET_LAST_SAVED':
      return {
        ...state,
        editor: {
          ...state.editor,
          lastSaved: action.payload,
          isDirty: false
        }
      };

    case 'SET_EDITOR_READONLY':
      return {
        ...state,
        editor: {
          ...state.editor,
          readOnly: action.payload
        }
      };

    case 'SET_CURSOR_POSITION':
      return {
        ...state,
        editor: {
          ...state.editor,
          cursorPosition: action.payload
        }
      };

    // 执行相关actions
    case 'SET_EXECUTION_STATUS':
      return {
        ...state,
        execution: {
          ...state.execution,
          status: action.payload
        }
      };

    case 'SET_EXECUTION_ID':
      return {
        ...state,
        execution: {
          ...state.execution,
          execId: action.payload
        }
      };

    case 'SET_EXECUTION_START_TIME':
      return {
        ...state,
        execution: {
          ...state.execution,
          startTime: action.payload
        }
      };

    case 'SET_EXECUTION_DURATION':
      return {
        ...state,
        execution: {
          ...state.execution,
          duration: action.payload
        }
      };

    case 'SET_EXECUTION_RESULT':
      return {
        ...state,
        execution: {
          ...state.execution,
          result: action.payload
        }
      };

    case 'SET_EXECUTION_LOG':
      return {
        ...state,
        execution: {
          ...state.execution,
          log: action.payload
        }
      };

    case 'SET_EXECUTION_ERROR':
      return {
        ...state,
        execution: {
          ...state.execution,
          error: action.payload
        }
      };

    case 'RESET_EXECUTION':
      return {
        ...state,
        execution: {
          ...state.execution,
          status: RunningStatus.IDLE,
          execId: '',
          startTime: null,
          duration: 0,
          result: '',
          log: '',
          error: null
        }
      };

    default:
      return state;
  }
};

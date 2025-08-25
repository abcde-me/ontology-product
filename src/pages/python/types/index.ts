import { RunningStatus } from '@/types/pythonApi';

// 文件相关类型
export interface FileTab {
  key: string;
  title: string;
  content: string;
  fileId?: string;
  lastModified?: string;
}

export interface FileData {
  id: string;
  name: string;
  data: string;
  last_modified: string;
  type: string;
  path: string;
}

// 编辑器相关类型
export interface EditorState {
  content: string;
  isDirty: boolean;
  lastSaved: string;
  readOnly: boolean;
  cursorPosition: {
    line: number;
    ch: number;
  };
}

// 执行相关类型
export interface ExecutionState {
  status: RunningStatus;
  execId: string;
  startTime: Date | null;
  duration: number;
  result: string;
  log: string;
  error: Error | null;
}

// 全局状态类型
export interface PythonState {
  files: {
    currentFileId: string | null;
    fileTabs: FileTab[];
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
  };
  editor: EditorState;
  execution: ExecutionState;
}

// Action类型
export type PythonAction =
  | { type: 'SET_CURRENT_FILE_ID'; payload: string | null }
  | { type: 'SET_FILE_TABS'; payload: FileTab[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'ADD_FILE_TAB'; payload: FileTab }
  | {
      type: 'UPDATE_FILE_TAB';
      payload: { key: string; updates: Partial<FileTab> };
    }
  | { type: 'REMOVE_FILE_TAB'; payload: string }
  | { type: 'SET_FILES_LOADING'; payload: boolean }
  | { type: 'SET_FILES_ERROR'; payload: Error | null }
  | { type: 'UPDATE_EDITOR_CONTENT'; payload: string }
  | { type: 'SET_EDITOR_DIRTY'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: string }
  | { type: 'SET_EDITOR_READONLY'; payload: boolean }
  | { type: 'SET_CURSOR_POSITION'; payload: { line: number; ch: number } }
  | { type: 'SET_EXECUTION_STATUS'; payload: RunningStatus }
  | { type: 'SET_EXECUTION_ID'; payload: string }
  | { type: 'SET_EXECUTION_START_TIME'; payload: Date | null }
  | { type: 'SET_EXECUTION_DURATION'; payload: number }
  | { type: 'SET_EXECUTION_RESULT'; payload: string }
  | { type: 'SET_EXECUTION_LOG'; payload: string }
  | { type: 'SET_EXECUTION_ERROR'; payload: Error | null }
  | { type: 'RESET_EXECUTION' };

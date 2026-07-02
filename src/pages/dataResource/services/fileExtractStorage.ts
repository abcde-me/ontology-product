import type {
  FileExtractResultPayload,
  FileExtractTask,
  FileExtractTaskStatus,
  FileExtractType
} from '../types/fileExtract';

const STORAGE_KEY = 'DATA_RESOURCE_FILE_EXTRACT_TASKS';

const readTasks = (): FileExtractTask[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as FileExtractTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTasks = (tasks: FileExtractTask[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const sortTasksByCreatedAt = (tasks: FileExtractTask[]) =>
  [...tasks].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

export const listAllFileExtractTasks = (): FileExtractTask[] =>
  sortTasksByCreatedAt(readTasks());

export const listFileExtractTasksByFileId = (
  fileId: string
): FileExtractTask[] =>
  sortTasksByCreatedAt(readTasks().filter((task) => task.fileId === fileId));

export const getFileExtractTask = (taskId: string): FileExtractTask | null =>
  readTasks().find((task) => task.id === taskId) ?? null;

export const createFileExtractTasks = (params: {
  fileId: string;
  fileName: string;
  requirement: string;
  extractTypes: FileExtractType[];
  instanceTargetTableId?: string;
  instanceTargetTableName?: string;
}): FileExtractTask[] => {
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  const created = params.extractTypes.map((extractType) => ({
    id: `extract-${Date.now()}-${extractType}-${Math.random().toString(36).slice(2, 8)}`,
    fileId: params.fileId,
    fileName: params.fileName,
    extractType,
    requirement: params.requirement,
    ...(extractType === 'instance' && params.instanceTargetTableId
      ? {
          targetTableId: params.instanceTargetTableId,
          targetTableName: params.instanceTargetTableName
        }
      : {}),
    status: 'pending' as FileExtractTaskStatus,
    createdAt: now
  }));

  const tasks = [...created, ...readTasks()];
  writeTasks(tasks);
  return created;
};

export const updateFileExtractTask = (
  taskId: string,
  patch: Partial<FileExtractTask>
): FileExtractTask | null => {
  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index < 0) {
    return null;
  }

  const next = { ...tasks[index], ...patch };
  tasks[index] = next;
  writeTasks(tasks);
  return next;
};

export const saveFileExtractTaskResult = (
  taskId: string,
  result: FileExtractResultPayload
): FileExtractTask | null =>
  updateFileExtractTask(taskId, {
    result,
    status: 'completed',
    completedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    errorMessage: undefined
  });

export const markFileExtractTaskFailed = (
  taskId: string,
  errorMessage: string
): FileExtractTask | null =>
  updateFileExtractTask(taskId, {
    status: 'failed',
    errorMessage,
    completedAt: new Date().toLocaleString('zh-CN', { hour12: false })
  });

export const markFileExtractTaskRunning = (
  taskId: string
): FileExtractTask | null =>
  updateFileExtractTask(taskId, {
    status: 'running',
    errorMessage: undefined
  });

export const deleteFileExtractTask = (taskId: string): boolean => {
  const tasks = readTasks();
  const nextTasks = tasks.filter((task) => task.id !== taskId);
  if (nextTasks.length === tasks.length) {
    return false;
  }
  writeTasks(nextTasks);
  return true;
};

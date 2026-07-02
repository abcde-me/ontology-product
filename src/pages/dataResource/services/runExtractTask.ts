import { getFileResourceById, getFileResourceExtractSource } from './fileApi';
import { fetchDataResourceDetail } from './api';
import {
  getFileExtractTask,
  markFileExtractTaskFailed,
  markFileExtractTaskRunning,
  saveFileExtractTaskResult
} from './fileExtractStorage';
import { extractFileResourceWithLlm } from './fileResourceExtract';
import type { FileExtractTask } from '../types/fileExtract';

export const runExtractTask = async (
  taskId: string,
  options?: {
    onUpdate?: (task: FileExtractTask) => void;
    signal?: AbortSignal;
  }
): Promise<FileExtractTask | null> => {
  const task = getFileExtractTask(taskId);
  if (!task) {
    return null;
  }

  const running = markFileExtractTaskRunning(taskId);
  if (running) {
    options?.onUpdate?.(running);
  }

  try {
    const file = getFileResourceById(task.fileId);
    if (!file) {
      throw new Error('文件不存在或已被删除');
    }

    const source = await getFileResourceExtractSource(file);

    let targetTable;
    if (task.extractType === 'instance' && task.targetTableId) {
      targetTable =
        (await fetchDataResourceDetail(task.targetTableId)) ?? undefined;
      if (!targetTable) {
        throw new Error('目标数据资源表不存在或已被删除');
      }
    }

    const result = await extractFileResourceWithLlm({
      extractType: task.extractType,
      source,
      requirement: task.requirement,
      targetTable,
      signal: options?.signal
    });

    const completed = saveFileExtractTaskResult(taskId, result);
    if (completed) {
      options?.onUpdate?.(completed);
    }
    return completed;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return getFileExtractTask(taskId);
    }

    const message =
      error instanceof Error ? error.message : '信息提取失败，请稍后重试';
    const failed = markFileExtractTaskFailed(taskId, message);
    if (failed) {
      options?.onUpdate?.(failed);
    }
    return failed;
  }
};

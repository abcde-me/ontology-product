import { runExtractTask } from '../services/runExtractTask';
import type { FileExtractTask } from '../types/fileExtract';

export { runExtractTask };

export const runExtractTasks = async (
  tasks: FileExtractTask[],
  options?: {
    onTaskUpdate?: (task: FileExtractTask) => void;
    signal?: AbortSignal;
  }
) => {
  await Promise.all(
    tasks.map((task) =>
      runExtractTask(task.id, {
        onUpdate: options?.onTaskUpdate,
        signal: options?.signal
      })
    )
  );
};

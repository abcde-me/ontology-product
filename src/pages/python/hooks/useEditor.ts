import { useState, useEffect, useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { useRequest, useThrottleFn } from 'ahooks';
import { RunningStatus } from '@/types/pythonApi';
import { runPythonItem, getRunResult, savePythonItem } from '@/api/python';

interface UseEditorOptions {
  initialContent?: string;
  currentFileId?: string;
}

interface UseEditorReturn {
  // 编辑器状态
  editorContent: string;
  placeholderValue: string;
  runStatus: RunningStatus;
  runStartTime: Date | null;
  runDuration: number;
  lastAutoSave: string;
  execid: string;
  runLog: string;
  runResult: string;

  // 编辑器操作
  handleContentChange: (value: string) => void;
  handleRunCode: () => Promise<void>;
  handleStopRunCode: () => void;
}

export const useEditor = (options: UseEditorOptions = {}): UseEditorReturn => {
  const { initialContent = '', currentFileId } = options;

  // 状态管理
  const [editorContent, setEditorContent] = useState(initialContent);
  const [placeholderValue, setPlaceholderValue] = useState('请输入代码...');
  const [runStatus, setRunStatus] = useState<RunningStatus>(RunningStatus.IDLE);
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [runDuration, setRunDuration] = useState<number>(0);
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  const [execid, setExecid] = useState<string>('');
  const [runLog, setRunLog] = useState<string>('');
  const [runResult, setRunResult] = useState<string>('');

  // 当初始内容变化时，更新编辑器内容
  useEffect(() => {
    setEditorContent(initialContent);
  }, [initialContent]);

  // 当内容变化时，更新占位符
  useEffect(() => {
    if (editorContent && editorContent.trim() !== '') {
      setPlaceholderValue('请输入代码...');
    } else {
      setPlaceholderValue('请输入代码...');
    }
  }, [editorContent]);

  // 延时3秒自动保存
  const handleSaveThrottled = useThrottleFn(
    async (content: string) => {
      if (!currentFileId) {
        return null;
      }

      try {
        const res = await savePythonItem(currentFileId, {
          id: Number(currentFileId),
          data: content
        });

        if (res?.status === 200) {
          return res.data;
        }
        return null;
      } catch (error) {
        console.error('自动保存失败:', error);
        return null;
      }
    },
    { wait: 3000 }
  );

  // 处理内容变化
  const handleContentChange = useCallback(
    (value: string) => {
      setEditorContent(value);

      // 自动保存
      handleSaveThrottled.run(value);
    },
    [handleSaveThrottled]
  );

  // 运行代码
  const handleRunCode = useCallback(async () => {
    console.log('runStatus', runStatus);
    if (runStatus === RunningStatus.RUNNING) {
      return;
    }

    if (!currentFileId) {
      Message.error('请先保存文件');
      return;
    }

    setRunStatus(RunningStatus.RUNNING);
    setRunStartTime(new Date());
    setRunDuration(0);

    try {
      console.log('currentFileId', currentFileId);
      const res = await runPythonItem(currentFileId);
      if (res?.status === 200) {
        setExecid(res.data.execid);
      } else {
        throw new Error('运行失败');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('运行失败');
      setRunStatus(RunningStatus.FAILED);
      Message.error('运行失败');
    }
  }, [runStatus, currentFileId]);

  // 停止运行
  const handleStopRunCode = useCallback(() => {
    setRunStatus(RunningStatus.IDLE);
  }, []);

  // 轮询获取运行结果
  const { runAsync: getRunResultPolling, cancel: cancelGetRunResultPolling } =
    useRequest(getRunResult, {
      pollingInterval: 3000
    });

  // 监听运行状态变化，自动获取结果
  useEffect(() => {
    if (runStatus !== RunningStatus.RUNNING || !execid || !currentFileId) {
      return;
    }

    // 运行中时，轮询获取运行结果
    if (runStatus === RunningStatus.RUNNING) {
      cancelGetRunResultPolling();
      getRunResultPolling(currentFileId, { execid }).then((res) => {
        if (res?.status === 200 && res.data) {
          setRunResult(res.data.run_result);

          // 检查执行状态
          if (res.data.run_status !== RunningStatus.RUNNING) {
            const status =
              res.data.run_status === RunningStatus.SUCCESS
                ? RunningStatus.SUCCESS
                : RunningStatus.FAILED;

            setRunStatus(status);

            // 计算执行时长
            if (runStartTime) {
              const duration = Math.floor(
                (Date.now() - runStartTime.getTime()) / 1000
              );
              setRunDuration(duration);
            }
          }
        }
      });
    }
  }, [
    execid,
    runStatus,
    currentFileId,
    runStartTime,
    getRunResultPolling,
    cancelGetRunResultPolling
  ]);

  return {
    // 状态
    editorContent,
    placeholderValue,
    runStatus,
    runStartTime,
    runDuration,
    lastAutoSave,
    execid,
    runLog,
    runResult,

    // 操作
    handleContentChange,
    handleRunCode,
    handleStopRunCode
  };
};

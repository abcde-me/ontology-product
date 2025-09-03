import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { useRequest, useThrottleFn } from 'ahooks';
import { RunningStatus } from '@/types/pythonApi';
import {
  runPythonItem,
  getRunResult,
  savePythonItem,
  createSqlScript,
  updateSqlScript
} from '@/api/sql';
import { DEFAULT_SQL_PLACEHOLDER } from '../constant';
import { FileTab } from './useTabManager';
import { useUserInfo } from '@/store/userInfoStore';

interface UseEditorOptions {
  initialContent?: string;
  currentFileId?: string;
  tabKey?: string;
  onActiveUpdate?: (tabData: any) => void;
  hasRun?: boolean;
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

const defaultContent = DEFAULT_SQL_PLACEHOLDER;

export const useEditor = (options: UseEditorOptions = {}): UseEditorReturn => {
  const {
    initialContent = '',
    currentFileId,
    onActiveUpdate,
    tabKey,
    hasRun
  } = options;

  const userInfo = useUserInfo();

  // 状态管理
  const [editorContent, setEditorContent] = useState(initialContent);
  const [placeholderValue] = useState(defaultContent);
  const [runStatus, setRunStatus] = useState<RunningStatus>(RunningStatus.IDLE);
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [runDuration, setRunDuration] = useState<number>(0);
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  const [execid, setExecid] = useState<string>('');
  const [runLog, setRunLog] = useState<string>('');
  const [runResult, setRunResult] = useState<string>('');

  // 使用 ref 来跟踪初始内容，避免不必要的更新
  const initialContentRef = useRef(initialContent);
  const currentFileIdRef = useRef(currentFileId);

  // 当初始内容变化时，更新编辑器内容（只在真正需要时更新）
  useEffect(() => {
    if (initialContent !== initialContentRef.current) {
      initialContentRef.current = initialContent;
      setEditorContent(initialContent);
    }
  }, [initialContent]);

  // 更新 currentFileId ref
  useEffect(() => {
    currentFileIdRef.current = currentFileId;
  }, [currentFileId]);

  // 延时3秒自动保存 - 使用 useCallback 优化
  const handleSaveThrottled = useThrottleFn(
    useCallback(async (content: string) => {
      // 更新脚本内容
      onActiveUpdate && onActiveUpdate({ key: tabKey, content });

      const fileId = currentFileIdRef.current;
      if (!fileId) {
        try {
          const res = await createSqlScript({
            uid: userInfo?.id ?? '',
            script_name: tabKey ?? '',
            script_content: content
          });

          if (res?.status === 200) {
            setLastAutoSave(new Date().toLocaleTimeString());

            // 更新脚本ID
            onActiveUpdate &&
              onActiveUpdate({ key: tabKey, fileId: res.data.script_id });
            return res.data;
          }
          return null;
        } catch (error) {
          console.error('自动保存失败:', error);
          return null;
        }
      }

      try {
        const res = await updateSqlScript({
          uid: userInfo?.id ?? '',
          script_name: tabKey ?? '',
          script_content: content,
          script_id: fileId
        });

        if (res?.status === 200) {
          setLastAutoSave(new Date().toLocaleTimeString());
          return res.data;
        }
        return null;
      } catch (error) {
        console.error('自动保存失败:', error);
        return null;
      }
    }, []),
    { wait: 3000 }
  );

  // 处理内容变化 - 优化依赖项
  const handleContentChange = useCallback(
    (value: string) => {
      setRunStatus(RunningStatus.IDLE);
      setEditorContent(value);
      // 自动保存
      handleSaveThrottled.run(value);
    },
    [handleSaveThrottled]
  );

  // 运行代码 - 优化依赖项
  const handleRunCode = useCallback(async () => {
    if (runStatus === RunningStatus.RUNNING) {
      return;
    }

    const fileId = currentFileIdRef.current;
    if (!fileId) {
      Message.error('请先保存文件');
      return;
    }

    if (!hasRun) {
      onActiveUpdate && onActiveUpdate({ key: tabKey, hasRun: true });
    }

    setRunStatus(RunningStatus.RUNNING);
    setRunStartTime(new Date());
    setRunDuration(0);

    try {
      const res = await runPythonItem(fileId);
      if (res?.status === 200) {
        setExecid(res.data.execid);
      } else {
        throw new Error('运行失败');
      }
    } catch (error) {
      setRunStatus(RunningStatus.FAILED);
      Message.error('运行失败');
    }
  }, [runStatus]);

  // 停止运行
  const handleStopRunCode = useCallback(() => {
    setRunStatus(RunningStatus.IDLE);
  }, []);

  // 轮询获取运行结果
  const { runAsync: getRunResultPolling, cancel: cancelGetRunResultPolling } =
    useRequest(getRunResult, {
      pollingInterval: 3000,
      pollingWhenHidden: false,
      manual: true
    });

  // 监听运行状态变化，自动获取结果 - 优化依赖项
  useEffect(() => {
    if (runStatus !== RunningStatus.RUNNING) {
      cancelGetRunResultPolling();
    }

    if (
      runStatus !== RunningStatus.RUNNING ||
      !execid ||
      !currentFileIdRef.current
    ) {
      return;
    }

    // 运行中时，轮询获取运行结果
    const fetchResult = async () => {
      try {
        const res = await getRunResultPolling(currentFileIdRef.current!, {
          execid
        });
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
      } catch (error) {
        console.error('获取运行结果失败:', error);
      }
    };

    fetchResult();
  }, [execid, runStatus]);

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

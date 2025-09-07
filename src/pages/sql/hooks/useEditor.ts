import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { useRequest, useThrottleFn } from 'ahooks';
import { RunningStatus } from '@/types/sqlApi';
import {
  createSqlScript,
  updateSqlScript,
  runSqlScript,
  getRunResultSqlScript,
  runCancelSqlScript
} from '@/api/sql';
import { DEFAULT_SQL_PLACEHOLDER } from '../constant';
import { useUserInfo } from '@/store/userInfoStore';
import { RunResult } from '@/types/sqlApi';

export interface UseEditorOptions {
  initialContent?: string;
  currentFileId?: string;
  tabKey?: string;
  onActiveUpdate?: (tabData: any) => void;
  hasRun?: boolean;
}

export interface UseEditorReturn {
  // 编辑器状态
  editorContent: string;
  setEditorContent: (value: string) => void;
  placeholderValue: string;
  runStatus: RunningStatus;
  runStartTime: Date | null;
  runDuration: number;
  lastAutoSave: string;
  execid: string;
  size: string | number;
  setSize: (value: string | number) => void;
  runLog: string;
  runResult: RunResult[];

  // 表格数据处理
  columns: any[];
  data: any[];

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
  const [size, setSize] = useState<string | number>(100);
  const [runLog, setRunLog] = useState<string>('');
  const [runResult, setRunResult] = useState<RunResult[]>([]);

  // 动态生成表格列
  const generateTableColumns = (runResult: RunResult[]) => {
    if (
      !runResult ||
      runResult.length === 0 ||
      !runResult[0]?.list ||
      runResult[0].list.length === 0
    ) {
      return [];
    }

    // 从第一行数据中获取所有的 key 作为列头
    const firstRow = runResult[0].list[0];
    const keys = Object.keys(firstRow);

    return keys.map((key) => ({
      title: key,
      dataIndex: key,
      width: 150,
      ellipsis: true
    }));
  };

  // 动态生成表格数据
  const generateTableData = (runResult: RunResult[]) => {
    if (!runResult || runResult.length === 0 || !runResult[0]?.list) {
      return [];
    }

    // 将 runResult[0].list 转换为表格数据格式，添加 key 字段
    return runResult[0].list.map((row, index) => ({
      key: `${index}`,
      ...row
    }));
  };

  // 计算表格列和数据
  const columns = generateTableColumns(runResult);
  const data = generateTableData(runResult);

  // 使用 ref 来跟踪初始内容，避免不必要的更新
  const initialContentRef = useRef(initialContent);
  const currentFileIdRef = useRef(currentFileId);

  // 延时3秒自动保存 - 使用 useCallback 优化
  const handleSaveThrottled = useThrottleFn(
    useCallback(async (content: string) => {
      // 更新脚本内容
      onActiveUpdate && onActiveUpdate({ key: tabKey, content });

      console.log('执行到这里了吗？', content);

      const fileId = currentFileIdRef.current;
      if (!fileId) {
        try {
          const res = await createSqlScript({
            uid: userInfo?.id ?? '32020ad2-ef56-4e20-aa0b-4399429bb34c',
            script_name: tabKey ?? '',
            script_content: content
          });

          if (res?.status === 200) {
            // setLastAutoSave(new Date().toLocaleTimeString());

            // 更新脚本ID
            onActiveUpdate &&
              onActiveUpdate({ key: tabKey, fileId: res.data.script_id });
            return res.data;
          } else {
            Message.error(`自动保存失败: ${res.message || '未知错误'}`);
            console.error('自动保存失败:', res.message);
          }
          return null;
        } catch (error) {
          Message.error(`自动保存失败`);
          console.error('自动保存失败:', error);
          return null;
        }
      }

      try {
        const res = await updateSqlScript(Number(fileId), {
          uid: userInfo?.id ?? '',
          script_name: tabKey ?? '',
          script_content: content
        });

        if (res?.status === 200) {
          setLastAutoSave(new Date().toLocaleTimeString());
          return res.data;
        } else {
          Message.error(`自动保存失败: ${res.message || '未知错误'}`);
          console.error('自动保存失败:', res.message);
        }
        return null;
      } catch (error) {
        Message.error(`自动保存失败`);
        console.error('自动保存失败:', error);
        return null;
      }
    }, []),
    { wait: 3000, trailing: true }
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
    setRunDuration(0);

    try {
      const res = await runSqlScript(fileId);

      if (res?.status !== 200) {
        setRunStatus(RunningStatus.FAILED);
        return;
      }

      setExecid(res.data.script_execid);
    } catch (error) {
      setRunStatus(RunningStatus.FAILED);
    }
  }, [runStatus]);

  // 停止运行
  const handleStopRunCode = useCallback(async () => {
    try {
      const res = await runCancelSqlScript(currentFileIdRef.current!, {
        script_execid: execid
      });
      setRunStatus(RunningStatus.IDLE);
    } catch (error) {
      console.error('获取运行结果失败:', error);
    }
  }, []);

  // 轮询获取运行结果
  const { runAsync: getRunResultPolling, cancel: cancelGetRunResultPolling } =
    useRequest(getRunResultSqlScript, {
      pollingInterval: 5000,
      pollingWhenHidden: false,
      manual: true,
      onSuccess: (res) => {
        if (res.data.run_status !== RunningStatus.RUNNING) {
          console.log('运行结束，取消轮询');
          cancelGetRunResultPolling();
        }

        setRunStatus(res.data?.run_status);
        setRunResult(res.data?.sql_result_lists);
        setRunDuration(Number(res.data?.run_duration));
      },
      onError: (error) => {
        setRunStatus(RunningStatus.FAILED);
        cancelGetRunResultPolling();
      }
    });

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

  // 监听运行状态变化，自动获取结果 - 优化依赖项
  useEffect(() => {
    cancelGetRunResultPolling();

    if (!execid || !currentFileIdRef.current) {
      return;
    }

    getRunResultPolling(currentFileIdRef.current, {
      script_execid: execid,
      size: '100'
    });
  }, [execid, runStatus]);

  return {
    // 状态
    editorContent,
    setEditorContent,
    placeholderValue,
    runStatus,
    runStartTime,
    runDuration,
    lastAutoSave,
    execid,
    size,
    setSize,
    runLog,
    runResult,

    // 表格数据处理
    columns,
    data,

    // 操作
    handleContentChange,
    handleRunCode,
    handleStopRunCode
  };
};

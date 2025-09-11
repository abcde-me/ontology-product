import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { useRequest, useThrottleFn } from 'ahooks';
import { RunningStatus } from '@/types/sqlApi';
import {
  createSqlScript,
  updateSqlScript,
  runSqlScript,
  getRunResultSqlScript,
  runCancelSqlScript,
  getSqlScriptDetail
} from '@/api/sql';
import { DEFAULT_SQL_PLACEHOLDER } from '../constant';
import { useUserInfo } from '@/store/userInfoStore';
import { RunResult } from '@/types/sqlApi';
import { formatDateTime } from '../utils';
import { generateSqlDefaultName } from '../utils';

export interface UseEditorOptions {
  activeTab?: string;
  fileTabs?: Array<{
    key: string;
    title: string;
    content: string;
    fileId?: string;
  }>;
  onTabUpdate?: (
    tabKey: string,
    updates: { content?: string; fileId?: string; title?: string }
  ) => void;
}

export interface UseEditorReturn {
  // 编辑器状态
  editorContent: string;
  placeholderValue: string;
  runStatus: RunningStatus;
  runStartTime: Date | null;
  runDuration: number;
  lastAutoSave: string;
  execid: string;
  size: string;
  runLog: string;
  runResult: RunResult[];
  currentFileId?: string;
  runError: string;

  // 表格数据处理
  columns: Array<{
    title: string;
    dataIndex: string;
    width: number;
    ellipsis: boolean;
  }>;
  data: Array<Record<string, any> & { key: string }>;

  // 编辑器操作
  setSize: (size: string) => void;
  handleContentChange: (value: string) => void;
  handleRunCode: () => Promise<void>;
  handleStopRunCode: () => void;
  getRunResultPolling: (id: string, params: any) => void;
  cancelGetRunResultPolling: () => void;
}

const defaultContent = DEFAULT_SQL_PLACEHOLDER;

export const useEditor = (options: UseEditorOptions = {}): UseEditorReturn => {
  const { activeTab, fileTabs = [], onTabUpdate } = options;

  const userInfo = useUserInfo();
  // 状态管理
  const [editorContent, setEditorContent] = useState('');
  const [placeholderValue] = useState(defaultContent);
  const [runStatus, setRunStatus] = useState<RunningStatus>(RunningStatus.IDLE);
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [runDuration, setRunDuration] = useState<number>(0);
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  const [execid, setExecid] = useState<string>('');
  const [runResult, setRunResult] = useState<RunResult[]>([]);
  const [size, setSize] = useState<string>('100');
  const [runLog, setRunLog] = useState<string>('');
  const [runError, setRunError] = useState<string>('');

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

  // 当前文件ID，从 activeTab 对应的标签页获取
  const currentFile = fileTabs.find((tab) => tab.key === activeTab);

  // 轮询获取运行结果
  const { runAsync: getRunResultPolling, cancel: cancelGetRunResultPolling } =
    useRequest(getRunResultSqlScript, {
      pollingInterval: 10000,
      pollingWhenHidden: false,
      manual: true,
      onSuccess: (res) => {
        if (res?.status !== 200) {
          setRunStatus(RunningStatus.FAILED);
          cancelGetRunResultPolling();
          setRunError(res?.message ?? '获取运行结果失败');
          setRunResult([]);
          return;
        }

        if (res.data.run_status !== RunningStatus.RUNNING) {
          console.log('运行结束，取消轮询');
          cancelGetRunResultPolling();
        }

        setRunStatus(res.data?.run_status);
        setRunResult(res.data?.sql_result_lists);
        setRunError('');
        setRunDuration(Number(res.data?.run_duration));
        setRunStartTime(new Date(res.data?.run_end_time ?? ''));
      },
      onError: (error) => {
        setRunStatus(RunningStatus.FAILED);
        cancelGetRunResultPolling();
        setRunResult([]);
        setRunError('获取运行结果失败');
      }
    });

  // 清空编辑器状态的函数
  const clearEditorState = useCallback(() => {
    setRunStatus(RunningStatus.IDLE);
    setExecid('');
    setRunStartTime(null);
    setRunDuration(0);
    setRunResult([]);
    setRunLog('');
    setRunError('');
    setLastAutoSave('');
    // 取消正在进行的轮询
    cancelGetRunResultPolling();
  }, [cancelGetRunResultPolling]);

  // 延时自动保存 - 使用 useCallback 优化
  const handleSaveThrottled = useThrottleFn(
    async (content: string) => {
      if (!currentFile?.fileId) {
        try {
          const res = await createSqlScript({
            uid: userInfo?.id ?? '32020ad2-ef56-4e20-aa0b-4399429bb34c',
            script_name: generateSqlDefaultName(new Date()),
            script_content: content
          });

          if (res?.status === 200) {
            setLastAutoSave(new Date().toLocaleTimeString());

            // 更新脚本ID到标签页
            if (onTabUpdate && currentFile) {
              onTabUpdate(currentFile.key, {
                content,
                fileId: res.data.script_id,
                title: currentFile.title // 保持原有标题
              });
            }
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
        const res = await updateSqlScript(Number(currentFile?.fileId), {
          uid: userInfo?.id ?? '32020ad2-ef56-4e20-aa0b-4399429bb34c',
          script_name: currentFile.title ?? '',
          script_content: content
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
    },
    { wait: 5000 }
  );

  // 处理内容变化 - 优化依赖项
  const handleContentChange = useCallback(
    (value: string) => {
      clearEditorState();
      setEditorContent(value);
      handleSaveThrottled.cancel();
      // 自动保存
      handleSaveThrottled.run(value);
    },
    [handleSaveThrottled, clearEditorState]
  );

  // 运行代码 - 优化依赖项
  const handleRunCode = useCallback(async () => {
    if (runStatus === RunningStatus.RUNNING) {
      return;
    }

    if (!currentFile?.fileId) {
      Message.error('请先保存文件');
      return;
    }

    setRunStatus(RunningStatus.RUNNING);
    setRunResult([]);
    setRunLog('');
    setRunError('');
    setExecid('');
    setRunStartTime(new Date());
    setRunDuration(0);

    try {
      const res = await runSqlScript(currentFile?.fileId ?? '');
      if (res?.status === 200) {
        setExecid(res.data.script_execid);
        setRunLog(res.data.warning_msg);
      } else {
        setRunError(res.message);
        throw new Error('运行失败');
      }
    } catch (error) {
      setRunStatus(RunningStatus.FAILED);
      Message.error('运行失败');
    }
  }, [runStatus, currentFile?.fileId]);

  // 停止运行
  const handleStopRunCode = async () => {
    const res = await runCancelSqlScript(currentFile?.fileId ?? '', {
      script_execid: execid
    });

    if (res?.status !== 200 || Number(res?.code) !== 0) {
      Message.error(res?.message ?? '停止运行失败');
      return;
    }

    cancelGetRunResultPolling();
    setRunStatus(RunningStatus.IDLE);
  };

  // 获取运行日志

  // 监听运行状态变化，自动获取结果 - 优化依赖项
  useEffect(() => {
    if (runStatus !== RunningStatus.RUNNING) {
      console.log('取消轮询');
      cancelGetRunResultPolling();
    }

    if (!execid || !currentFile?.fileId) {
      return;
    }

    // 运行中时，轮询获取运行结果
    const fetchResult = () => {
      try {
        setRunStatus(RunningStatus.RUNNING);
        getRunResultPolling(currentFile?.fileId ?? '', {
          script_execid: execid,
          size: size
        });
      } catch (error) {
        console.error('获取运行结果失败:', error);
        setRunStatus(RunningStatus.FAILED);
      }
    };

    fetchResult();
  }, [execid]);

  // 监听 activeTab 变化，重新更新编辑器状态
  useEffect(() => {
    if (!activeTab || !fileTabs.length) {
      return;
    }

    const currentTab = fileTabs.find((tab) => tab.key === activeTab);
    if (!currentTab) {
      return;
    }

    // 如果有 fileId，重新加载文件内容以获取最新状态
    if (currentTab.fileId) {
      const loadFileContent = async () => {
        try {
          const response = await getSqlScriptDetail(currentTab.fileId!);

          if (response.status === 200 && response.data) {
            const fileData = response.data;

            // 更新编辑器内容
            setEditorContent(fileData.script_content);

            // 更新运行状态
            // setExecid(String(fileData.script_execid));

            // 通知父组件更新标签页内容
            if (onTabUpdate) {
              onTabUpdate(currentTab.key, {
                content: fileData.script_content,
                fileId: String(fileData.script_id),
                title: currentTab.title
              });
            }
          } else {
            Message.error(response?.message ?? '加载文件失败');
          }
        } catch (error) {
          console.error('加载文件失败:', error);
          Message.error('加载文件失败');
        }
      };

      loadFileContent();
    }
  }, [activeTab]); // 只依赖 activeTab，避免不必要的重复更新

  // 当 currentFileId 变化时，重置运行相关状态
  useEffect(() => {
    clearEditorState();
  }, [currentFile?.fileId, clearEditorState]);

  return {
    // 状态
    editorContent,
    placeholderValue,
    runStatus,
    runStartTime,
    runDuration,
    lastAutoSave,
    execid,
    runResult,
    size,
    runLog,
    currentFileId: currentFile?.fileId,
    runError,

    // 表格数据处理
    columns,
    data,

    // 操作
    setSize,
    handleContentChange,
    handleRunCode,
    handleStopRunCode,
    getRunResultPolling,
    cancelGetRunResultPolling
  };
};

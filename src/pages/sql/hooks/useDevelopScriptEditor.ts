import { useState, useEffect, useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { useRequest, useThrottleFn } from 'ahooks';
import { RunLogStatus, RunningStatus } from '@/types/sqlApi';
import {
  createSqlScript,
  updateSqlScript,
  runSqlScript,
  getRunResultSqlScript,
  runCancelSqlScript,
  getSqlScriptDetail,
  getRunLogSqlScript
} from '@/api/sql';
import { createDevelopScript, editDevelopScript } from '@/api/sql-develop';
import { DEFAULT_SQL_PLACEHOLDER } from '../constant';
import { useUserInfo } from '@/store/userInfoStore';
import { RunResult } from '@/types/sqlApi';
import timeFormattig from '@/utils/timeFormatting';
import { generateSqlDefaultName } from '../utils';
import { EditDevelopScriptResponse, ScriptParam } from '@/types/sqlDevelopApi';

export interface UseEditorOptions {
  activeTab?: string;
  fileTabs?: Array<{
    key: string;
    title: string;
    content: string;
    fileId?: string;
    scriptId?: string;
  }>;
  onTabUpdate?: (
    tabKey: string,
    updates: {
      content?: string;
      fileId?: string;
      title?: string;
      scriptId?: string;
    }
  ) => void;
  refreshDirectory?: () => void;
  selectFile?: (fileId: string) => void;
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
  currentScriptId?: string;
  runError: string;
  runWarning: string;
  resultLoading: boolean;
  lastScriptRunStatus: RunningStatus;
  hasFetchedResult: boolean;
  hasFetchedLog: boolean;
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
  handleSaveScript: (
    value: string
  ) => Promise<EditDevelopScriptResponse | null>;
  handleRunCode: () => Promise<void>;
  handleStopRunCode: () => void;
  getRunResultPolling: (id: string, params: any) => void;
  cancelGetRunResultPolling: () => void;
  loadRunResult: (execid: string, size: string) => void;
  handleGetRunLog: () => Promise<void>;

  // 面板状态管理
  isPanelOpen: boolean;
  handlePanelStateChange: (isOpen: boolean) => void;
  getPrevRunStatus: () => RunningStatus;
}

const defaultContent = DEFAULT_SQL_PLACEHOLDER;

export const useEditor = (options: UseEditorOptions = {}): UseEditorReturn => {
  const {
    activeTab,
    fileTabs = [],
    onTabUpdate,
    refreshDirectory,
    selectFile
  } = options;

  const userInfo = useUserInfo();
  // 状态管理
  const [editorContent, setEditorContent] = useState('');
  const [placeholderValue] = useState(defaultContent);
  const [runStatus, setRunStatus] = useState<RunningStatus>(RunningStatus.IDLE);
  const [runLogStatus, setRunLogStatus] = useState<RunLogStatus>(
    RunLogStatus.STOP
  );
  const [prevRunStatus, setPrevRunStatus] = useState<RunningStatus>(
    RunningStatus.IDLE
  ); // 添加前一个运行状态跟踪
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [runDuration, setRunDuration] = useState<number>(0);
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  const [execid, setExecid] = useState<string>('');
  const [runResult, setRunResult] = useState<RunResult[]>([]);
  const [size, setSize] = useState<string>('100');
  const [runLog, setRunLog] = useState<string>('');
  const [runError, setRunError] = useState<string>('');
  const [runWarning, setRunWarning] = useState<string>('');
  const [resultLoading, setResultLoading] = useState(false);
  // 新增脚本最后执行结果
  const [lastScriptRunStatus, setLastScriptRunStatus] = useState<RunningStatus>(
    RunningStatus.IDLE
  );
  // 面板状态管理
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  // 跟踪是否已获取过结果和日志
  const [hasFetchedResult, setHasFetchedResult] = useState<boolean>(false);
  const [hasFetchedLog, setHasFetchedLog] = useState<boolean>(false);
  const [scriptParams, setScriptParams] = useState<ScriptParam[]>([]);

  // 获取前一个运行状态的函数
  const getPrevRunStatus = useCallback(() => {
    return prevRunStatus;
  }, [prevRunStatus]);

  // 更新运行状态的包装函数
  const updateRunStatus = useCallback(
    (newStatus: RunningStatus) => {
      setPrevRunStatus(runStatus);
      setRunStatus(newStatus);
    },
    [runStatus]
  );

  // 面板状态变化处理
  const handlePanelStateChange = useCallback((isOpen: boolean) => {
    setIsPanelOpen(isOpen);
  }, []);

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
      width: 240,
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
      pollingInterval: 5000,
      pollingWhenHidden: true,
      manual: true,
      onSuccess: (res) => {
        if (res?.status !== 200) {
          updateRunStatus(RunningStatus.FAILED);
          cancelGetRunResultPolling();
          setRunError(res?.message ?? '获取运行结果失败');
          setRunResult([]);
          return;
        }

        if (res.data.run_status !== RunningStatus.RUNNING) {
          console.log('运行结束，取消轮询');
          cancelGetRunResultPolling();
        }

        updateRunStatus(res.data?.run_status);
        setRunResult(res.data?.sql_result_lists);
        setRunError('');
        setRunDuration(Number(res.data?.run_duration));
        setRunStartTime(new Date(res.data?.run_end_time ?? ''));
      },
      onError: () => {
        updateRunStatus(RunningStatus.FAILED);
        cancelGetRunResultPolling();
        setRunResult([]);
        setRunError('获取运行结果失败');
      }
    });

  // 轮询获取日志
  const { runAsync: getRunLogPolling, cancel: cancelGetRunLogPolling } =
    useRequest(getRunLogSqlScript, {
      pollingInterval: 2000,
      pollingWhenHidden: true,
      manual: true,
      onSuccess: (res) => {
        if (res?.status !== 200) {
          setRunLogStatus(RunLogStatus.STOP);
          console.log('111111');
          cancelGetRunLogPolling();
          setRunLog(res?.message ?? '获取日志失败');
          setHasFetchedLog(true);
          return;
        }

        setRunLogStatus(res?.data?.status ?? RunLogStatus.STOP);
        setRunLog(res?.data?.run_log ?? '');
        setHasFetchedLog(true);

        if (res?.data?.status === RunLogStatus.STOP) {
          console.log('停止轮询获取日志', res?.data?.status);
          console.log('2222222');
          cancelGetRunLogPolling();
        }
      },
      onError: () => {
        setRunLogStatus(RunLogStatus.STOP);
        console.log('3333333');
        cancelGetRunLogPolling();
        setRunLog('获取日志失败');
        setHasFetchedLog(true);
      }
    });

  const loadRunResult = async (execid: string, size: string) => {
    setResultLoading(true);
    try {
      const res = await getRunResultSqlScript(currentFile?.scriptId || '', {
        script_execid: execid,
        size: size || '100'
      });
      if (res?.status === 200) {
        setRunResult(res.data?.sql_result_lists);
        setHasFetchedResult(true);
        setRunStatus(res.data?.run_status);
      } else {
        setRunResult([]);
        setHasFetchedResult(true);
      }

      setResultLoading(false);
    } catch (error) {
      setResultLoading(false);
    }
  };

  // 获取运行日志
  const handleGetRunLog = useCallback(async () => {
    if (!currentFile?.scriptId || !execid) {
      return;
    }
    const res = await getRunLogSqlScript(currentFile?.scriptId || '', {
      script_execid: execid
    });

    if (res?.status !== 200) {
      setRunLog(res.message ?? '获取日志失败');
      setHasFetchedLog(true);
      return;
    }

    setRunLog(res?.data?.run_log ?? '');
    setHasFetchedLog(true);
  }, [currentFile?.fileId, execid]);

  // 清空编辑器状态的函数
  const clearEditorState = useCallback(() => {
    updateRunStatus(RunningStatus.IDLE);
    setExecid('');
    setRunStartTime(null);
    setRunDuration(0);
    setRunResult([]);
    setRunLog('');
    setRunError(''); /*  */
    setRunWarning('');
    // setLastAutoSave('');
    setLastScriptRunStatus(RunningStatus.IDLE);
    setHasFetchedResult(false);
    setHasFetchedLog(false);
    // 取消正在进行的轮询
    cancelGetRunResultPolling();
    // 取消正在进行的轮询获取日志
    cancelGetRunLogPolling();
  }, [cancelGetRunResultPolling, cancelGetRunLogPolling]);

  const handleSaveScript = useCallback(
    async (content: string) => {
      try {
        const res = await editDevelopScript({
          script_name: currentFile?.title ?? generateSqlDefaultName(new Date()),
          script_content: content,
          script_id: Number(currentFile?.scriptId) ?? 0,
          scriptParams: []
        });

        if (res?.status !== 200) {
          Message.error(res?.message ?? '保存失败');
          return null;
        }

        return res.data;
      } catch (error) {
        Message.error('保存失败');
        return null;
      }
    },
    [currentFile?.scriptId]
  );

  const createScript = useCallback(
    async (content: string) => {
      try {
        const res = await createDevelopScript({
          script_name: currentFile?.title ?? generateSqlDefaultName(new Date()),
          script_context: content,
          script_desc: '',
          script_params: scriptParams
        });

        if (res?.status !== 200) {
          Message.error(res?.message ?? '创建失败');
          return null;
        }

        return res.data;
      } catch (error) {
        Message.error('创建失败');
        return null;
      }
    },
    [currentFile?.scriptId]
  );

  // 处理内容变化 - 优化依赖项
  const handleContentChange = useCallback(
    (value: string) => {
      setEditorContent(value);
      // 自动保存
      // handleSaveThrottled.run(value);
    },
    [clearEditorState]
  );

  // 运行代码 - 优化依赖项
  const handleRunCode = useCallback(async () => {
    if (runStatus === RunningStatus.RUNNING) {
      return;
    }

    if (!currentFile?.scriptId) {
      Message.error('请先保存文件');
      return;
    }

    const saveRes = await updateSqlScript(Number(currentFile?.scriptId), {
      uid: userInfo?.id ?? '32020ad2-ef56-4e20-aa0b-4399429bb34c',
      script_name: currentFile.title ?? '',
      script_content: editorContent
    });

    if (saveRes?.status !== 200) {
      Message.error(saveRes?.message ?? '保存文件失败');
      return;
    }

    setLastAutoSave(timeFormattig(new Date(saveRes.data.update_time)));

    setExecid('');

    try {
      // 将上一次运行结果置为未运行， 重新获取结果
      setLastScriptRunStatus(RunningStatus.IDLE);
      const res = await runSqlScript(currentFile?.scriptId ?? '');
      if (res?.status === 200) {
        setExecid(res.data.script_execid);
        if (res.data?.warning_msg) {
          setRunWarning(res.data.warning_msg);
        }
      } else {
        setRunError(res.message);
        Message.error(res.message);
      }
    } catch (error) {
      updateRunStatus(RunningStatus.FAILED);
    }
  }, [runStatus, currentFile?.scriptId, editorContent]);

  // 停止运行
  const handleStopRunCode = async () => {
    const res = await runCancelSqlScript(currentFile?.scriptId ?? '', {
      script_execid: execid
    });

    if (res?.status !== 200 || Number(res?.code) !== 0) {
      Message.error(res?.message ?? '停止运行失败');
      return;
    }

    cancelGetRunResultPolling();
    cancelGetRunLogPolling();
    updateRunStatus(RunningStatus.IDLE);
    // 将该面板的最后状态也设置为未运行
    setLastScriptRunStatus(RunningStatus.IDLE);
  };

  // 获取运行日志

  // 监听运行状态变化，自动获取结果 - 优化依赖项
  useEffect(() => {
    if (!execid || !currentFile?.scriptId) {
      return;
    }

    if (runStatus !== RunningStatus.RUNNING) {
      console.log('取消轮询', runStatus, execid);
      // cancelGetRunResultPolling();
      // cancelGetRunLogPolling();
    }

    updateRunStatus(RunningStatus.RUNNING);
    setRunResult([]);
    setRunError('');
    setRunStartTime(new Date());
    setRunDuration(0);

    // 运行中时，轮询获取运行结果
    const fetchResult = () => {
      try {
        updateRunStatus(RunningStatus.RUNNING);
        getRunResultPolling(currentFile?.scriptId ?? '', {
          script_execid: execid,
          size: size
        });

        getRunLogPolling(currentFile?.scriptId ?? '', {
          script_execid: execid
        });
      } catch (error) {
        console.error('获取运行结果失败:', error);
        updateRunStatus(RunningStatus.FAILED);
      }
    };

    fetchResult();
  }, [execid]);

  // 页面卸载时停止轮询
  useEffect(() => {
    return () => {
      cancelGetRunResultPolling();
      cancelGetRunLogPolling();
    };
  }, [cancelGetRunResultPolling, cancelGetRunLogPolling]);

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
    if (currentTab.scriptId) {
      const loadFileContent = async () => {
        try {
          const response = await getSqlScriptDetail(currentTab.scriptId!);

          if (response.status === 200 && response.data) {
            const fileData = response.data;
            setLastScriptRunStatus(fileData?.run_status);
            // 更新编辑器内容
            setEditorContent(fileData.script_content);

            // 更新运行状态
            setExecid(String(fileData.script_execid));

            setLastAutoSave(timeFormattig(new Date(response.data.update_time)));

            // 通知父组件更新标签页内容
            if (onTabUpdate) {
              onTabUpdate(currentTab.key, {
                content: fileData.script_content,
                fileId: String(currentTab.fileId),
                scriptId: String(fileData.script_id),
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

    return () => {
      // handleSaveThrottled.cancel();
    };
  }, [activeTab]); // 只依赖 activeTab，避免不必要的重复更新

  // 当 currentFileId 变化时，重置运行相关状态
  useEffect(() => {
    clearEditorState();
  }, [currentFile?.scriptId, clearEditorState]);

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
    currentScriptId: currentFile?.scriptId,
    runError,
    runWarning,
    resultLoading,
    lastScriptRunStatus,
    hasFetchedResult,
    hasFetchedLog,
    // 表格数据处理
    columns,
    data,
    // 操作
    setSize,
    handleContentChange,
    handleSaveScript,
    handleRunCode,
    handleStopRunCode,
    getRunResultPolling,
    cancelGetRunResultPolling,
    loadRunResult,
    handleGetRunLog,

    // 面板状态管理
    isPanelOpen,
    handlePanelStateChange,
    getPrevRunStatus
  };
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { useRequest, useThrottleFn } from 'ahooks';
import { RunningStatus } from '@/types/pythonApi';
import {
  runPythonItem,
  getRunResult,
  savePythonItem,
  openPythonItem,
  stopRunPythonItem,
  getRunLog
} from '@/api/pyspark';

interface UseEditorOptions {
  activeTab?: string;
  fileTabs?: Array<{
    key: string;
    title: string;
    content: string;
    fileId?: string;
  }>;
  onTabContentUpdate?: (tabKey: string, content: string) => void;
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
  isPanelOpen: boolean;
  activeKey: string;

  // 编辑器操作
  setActiveKey: (key: string) => void;
  handleContentChange: (value: string) => void;
  handleRunCode: () => Promise<void>;
  handleGetRunLog: () => Promise<void>;
  handleStopRunCode: () => void;
  handlePanelStateChange: (isOpen: boolean) => void;
  getPrevRunStatus: () => RunningStatus;
  handleGetRunResult: () => Promise<void>;
}

const defaultContent = `
  🎉 欢迎使用多模态数据治理平台
     ⚡️快速开始
    这里是您的笔记本工作区，您可以在这里进行数据分析和处理工作。

    💡 使用指南
  创建新笔记本 - 在左侧文件面板点击"+ 笔记本"创建您的专属笔记本
  添加单元格   点击下方按钮添加代码或文档单元格
  导入数据源 - 在左侧"开发工具"中选择数据源并导入
  使用算子库 - 从算子库中选择预制的数据处理算子
 
    🚀 开始您的数据治理之旅！
`;

export const useEditor = (options: UseEditorOptions = {}): UseEditorReturn => {
  const { activeTab, fileTabs = [], onTabContentUpdate } = options;

  // 状态管理
  const [editorContent, setEditorContent] = useState('');
  const [placeholderValue] = useState(defaultContent);
  const [runStatus, setRunStatus] = useState<RunningStatus>(RunningStatus.IDLE);
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [runDuration, setRunDuration] = useState<number>(0);
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  const [execid, setExecid] = useState<string>('');
  const [runLog, setRunLog] = useState<string>('');
  const [runResult, setRunResult] = useState<string>('');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('result');

  // 跟踪前一个 runStatus 状态
  const prevRunStatusRef = useRef<RunningStatus>(RunningStatus.IDLE);

  // 监听 runStatus 变化，更新前一个状态
  useEffect(() => {
    prevRunStatusRef.current = runStatus;
  }, [runStatus]);

  // 获取前一个 runStatus 状态的函数
  const getPrevRunStatus = useCallback(() => {
    return prevRunStatusRef.current;
  }, []);

  // 当前文件ID，从 activeTab 对应的标签页获取
  const currentFileId = fileTabs.find((tab) => tab.key === activeTab)?.fileId;

  // 轮询获取运行结果
  const { runAsync: getRunResultPolling, cancel: cancelGetRunResultPolling } =
    useRequest(getRunResult, {
      pollingInterval: 10000,
      pollingWhenHidden: false,
      manual: true,
      onSuccess: (res) => {
        if (res?.status !== 200) {
          setRunStatus(RunningStatus.FAILED);
          cancelGetRunResultPolling();
          setRunResult(res?.message ?? '获取运行结果失败');
          return;
        }

        if (res?.data?.run_status !== RunningStatus.RUNNING) {
          cancelGetRunResultPolling();
        }

        setRunResult(res?.data?.run_result ?? '');
        setRunStatus(res?.data?.run_status ?? RunningStatus.IDLE);
        setRunDuration(res?.data?.run_duration ?? 0);
        setRunStartTime(new Date(res?.data?.run_end_time) ?? '');
      },
      onError: (error) => {
        setRunStatus(RunningStatus.FAILED);
        cancelGetRunResultPolling();
        setRunResult(error?.message ?? '获取运行结果失败');
      }
    });

  // 轮询获取日志
  const { runAsync: getRunLogPolling, cancel: cancelGetRunLogPolling } =
    useRequest(getRunLog, {
      pollingInterval: 10000,
      pollingWhenHidden: false,
      manual: true,
      onSuccess: (res) => {
        if (res?.status !== 200) {
          setRunStatus(RunningStatus.FAILED);
          cancelGetRunResultPolling();
          setRunLog(res?.message ?? '获取日志失败');
          return;
        }

        if (res?.data?.log) {
          cancelGetRunResultPolling();
        }

        setRunLog(res?.data?.log ?? '');
      },
      onError: (error) => {
        setRunStatus(RunningStatus.FAILED);
        cancelGetRunResultPolling();
        setRunResult(error?.message ?? '获取运行结果失败');
      }
    });

  // 清空编辑器状态的函数
  // const clearEditorState = useCallback(() => {
  //   setRunStatus(RunningStatus.IDLE);
  //   setExecid('');
  //   setRunStartTime(null);
  //   setRunDuration(0);
  //   setRunLog('');
  //   setRunResult('');
  //   setLastAutoSave('');
  //   setIsPanelOpen(false); // 重置面板状态为关闭
  //   // 取消正在进行的轮询
  //   cancelGetRunResultPolling();
  // }, [cancelGetRunResultPolling]);

  // 监听 activeTab 变化，重新更新编辑器状态
  useEffect(() => {
    if (!activeTab || !fileTabs.length) {
      return;
    }

    const currentTab = fileTabs.find((tab) => tab.key === activeTab);
    if (!currentTab) {
      return;
    }

    // 标签页切换时重置面板状态为关闭
    setActiveKey('result');
    setRunStatus(RunningStatus.IDLE);
    setExecid('');
    setRunStartTime(null);
    setRunDuration(0);
    setRunLog('');
    setRunResult('');
    setLastAutoSave('');
    setIsPanelOpen(false); // 重置面板状态为关闭
    // 取消正在进行的轮询
    cancelGetRunResultPolling();

    // 如果有 fileId，重新加载文件内容以获取最新状态
    if (currentTab.fileId) {
      const loadFileContent = async () => {
        try {
          const response = await openPythonItem(currentTab.fileId!);

          if (response.status === 200 && response.data) {
            const fileData = response.data;

            // 更新编辑器内容
            setEditorContent(fileData.data);

            // 更新运行状态
            setExecid(String(fileData.execid));

            // 通知父组件更新标签页内容
            if (onTabContentUpdate) {
              onTabContentUpdate(currentTab.key, fileData.data);
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
    } else if (currentTab.content) {
      // 如果没有 fileId 但有内容，直接使用标签页内容
      setEditorContent(currentTab.content);
    }

    () => {
      handleSaveThrottled.cancel();
    };
  }, [activeTab]); // 只依赖 activeTab，避免不必要的重复更新

  // 延时自动保存 - 使用 useCallback 优化
  const handleSaveThrottled = useThrottleFn(
    useCallback(
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
            setLastAutoSave(new Date().toLocaleTimeString());
            return res.data;
          }
          return null;
        } catch (error) {
          console.error('自动保存失败:', error);
          return null;
        }
      },
      [currentFileId]
    ),
    { wait: 5000, leading: true, trailing: true }
  );

  // 处理内容变化 - 优化依赖项
  const handleContentChange = useCallback(
    (value: string) => {
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

    if (!currentFileId) {
      Message.error('请先保存文件');
      return;
    }

    setExecid('');

    try {
      const res = await runPythonItem(currentFileId);

      if (res?.status !== 200) {
        Message.error(res?.message ?? '运行失败');
        return;
      }

      setExecid(res.data.execid);
    } catch (error) {
      Message.error('运行失败');
    }
  }, [runStatus, currentFileId]);

  // 停止运行
  const handleStopRunCode = async () => {
    const res = await stopRunPythonItem(currentFileId ?? '', { execid });

    if (res?.status !== 200 || Number(res?.code) !== 0) {
      Message.error(res?.message ?? '停止运行失败');
      return;
    }

    cancelGetRunResultPolling();
    setRunStatus(RunningStatus.IDLE);
  };

  // 获取运行日志
  const handleGetRunLog = useCallback(async () => {
    if (!currentFileId || !execid) {
      return;
    }
    const res = await getRunLog(currentFileId, { execid });

    if (res?.status === 200) {
      setRunLog(res.data.log);
    }
  }, [currentFileId, execid]);

  const handleGetRunResult = useCallback(async () => {
    if (!currentFileId || !execid) {
      return;
    }
    const res = await getRunResult(currentFileId, { execid });

    if (res?.status !== 200) {
      setRunResult(res.message ?? '获取运行结果失败');
      return;
    }

    setRunResult(res?.data?.run_result ?? '');
  }, [currentFileId, execid]);

  // 处理面板状态变化
  const handlePanelStateChange = useCallback((isOpen: boolean) => {
    setIsPanelOpen(isOpen);
  }, []);

  // 监听运行状态变化，自动获取结果 - 优化依赖项
  useEffect(() => {
    if (runStatus !== RunningStatus.RUNNING) {
      cancelGetRunResultPolling();
    }

    if (!execid || !currentFileId) {
      return;
    }

    // 运行中时，轮询获取运行结果
    const fetchResult = () => {
      try {
        setRunStatus(RunningStatus.RUNNING);
        getRunResultPolling(currentFileId, {
          execid
        });
      } catch (error) {
        console.error('获取运行结果失败:', error);
        setRunStatus(RunningStatus.FAILED);
      }
    };

    fetchResult();
  }, [execid]);

  // 当 currentFileId 变化时，重置运行相关状态
  // useEffect(() => {
  //   // 标签页切换时重置面板状态为关闭
  //   setActiveKey('result');
  //   setRunStatus(RunningStatus.IDLE);
  //   setExecid('');
  //   setRunStartTime(null);
  //   setRunDuration(0);
  //   setRunLog('');
  //   setRunResult('');
  //   setLastAutoSave('');
  //   setIsPanelOpen(false); // 重置面板状态为关闭
  //   // 取消正在进行的轮询
  //   cancelGetRunResultPolling();
  // }, [currentFileId]);

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
    isPanelOpen,
    activeKey,
    setActiveKey,

    // 操作
    handleContentChange,
    handleRunCode,
    handleGetRunLog,
    handleStopRunCode,
    handlePanelStateChange,
    handleGetRunResult,
    getPrevRunStatus
  };
};

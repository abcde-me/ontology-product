import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import {
  useAsyncEffect,
  useRequest,
  useThrottleFn,
  useDebounceFn
} from 'ahooks';
import { RunningStatus } from '@/types/pythonApi';
import {
  runPythonItem,
  getRunResult,
  savePythonItem,
  openPythonItem,
  stopRunPythonItem,
  getRunLog
} from '@/api/pyspark';
import { formatTime } from '@/utils/format';
import timeFormattig from '@/utils/timeFormatting';

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
  hasFetchedResult: boolean;

  // 编辑器操作
  setActiveKey: (key: string) => void;
  handleContentChange: (value: string) => void;
  handleRunCode: () => Promise<void>;
  handleGetRunLog: () => Promise<void>;
  handleStopRunCode: () => void;
  handlePanelStateChange: (isOpen: boolean) => void;
  getPrevRunStatus: () => RunningStatus;
  handleGetRunResult: () => Promise<void>;

  // 防抖版本的按钮点击函数
  debouncedButtonClick: () => void;
}

const defaultContent = `🎉 欢迎使用多模态数据治理平台
⚡️ 快速开始
这里是您的PySpark编辑区，您可以在这里进行数据分析和处理工作。
💡 使用指南
创建pyspark脚本 － 在左侧文件面板点击"+新建pyspark"创建代码脚本
导入数据源 － 在左侧"数据目录"中选择数据源并导入
使用算子库 － 从算子库中选择预制的数据处理算子
导出数据集 － 运行后可点击导出数据集按钮创建
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
  const [hasFetchedResult, setHasFetchedResult] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('result');

  // 跟踪前一个 runStatus 状态
  const prevRunStatusRef = useRef<RunningStatus>(RunningStatus.IDLE);

  // 跟踪前一个 activeTab 状态，用于检测变化
  const prevActiveTabRef = useRef<string | undefined>(activeTab);

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
          setHasFetchedResult(true);
          return;
        }

        if (res?.data?.run_status !== RunningStatus.RUNNING) {
          cancelGetRunResultPolling();
        }

        setRunResult(res?.data?.run_result ?? '');
        setRunStatus(res?.data?.run_status ?? RunningStatus.IDLE);
        setRunDuration(res?.data?.run_duration ?? 0);
        setRunStartTime(new Date(res?.data?.run_end_time) ?? '');

        if (res?.data?.run_status !== RunningStatus.RUNNING) {
          setHasFetchedResult(true);
        }
      },
      onError: (error) => {
        setRunStatus(RunningStatus.FAILED);
        cancelGetRunResultPolling();
        setRunResult(error?.message ?? '获取运行结果失败');
        setHasFetchedResult(true);
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

  const handleActiveTabChange = async () => {
    console.log('handleActiveTabChange', prevActiveTabRef.current, activeTab);
    // 如果 activeTab 发生变化，且不是初始化
    if (
      prevActiveTabRef.current !== undefined &&
      prevActiveTabRef.current !== activeTab &&
      prevActiveTabRef.current
    ) {
      // 保存前一个标签页的内容
      const prevTab = fileTabs.find(
        (tab) => tab.key === prevActiveTabRef.current
      );
      if (prevTab?.fileId && editorContent.trim() !== '') {
        try {
          console.log('标签页切换前保存内容:', prevActiveTabRef.current);
          const saveRes = await savePythonItem(prevTab.fileId, {
            id: Number(prevTab.fileId),
            data: editorContent
          });

          if (saveRes?.status === 200) {
            console.log('标签页切换前保存成功');
            // 通知父组件更新标签页内容
            // if (onTabContentUpdate) {
            //   onTabContentUpdate(prevActiveTabRef.current, editorContent);
            // }
          } else {
            console.warn('标签页切换前保存失败:', saveRes?.message);
          }
        } catch (error) {
          console.error('标签页切换前保存出错:', error);
        }
      }
    }

    // 更新前一个 activeTab 引用
    prevActiveTabRef.current = activeTab;
  };

  // 监听 activeTab 变化，重新更新编辑器状态
  useAsyncEffect(async () => {
    await handleActiveTabChange();

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

            setLastAutoSave(response?.data?.last_modified);

            // 更新运行状态
            setExecid(String(fileData.execid));

            setRunStatus(response?.data?.run_status ?? RunningStatus.IDLE);

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
            setLastAutoSave(
              res?.data?.last_modified ?? timeFormattig(new Date())
            );
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

    // 运行之前，手动保存文件
    const saveRes = await savePythonItem(currentFileId, {
      id: Number(currentFileId),
      data: editorContent
    });

    if (saveRes?.status !== 200) {
      Message.error(saveRes?.message ?? '保存文件失败');
      return;
    }

    setRunStatus(RunningStatus.RUNNING);
    setRunResult('');
    setLastAutoSave(saveRes.data.last_modified ?? timeFormattig(new Date()));
    setExecid('');
    setHasFetchedResult(false);

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
  }, [runStatus, currentFileId, editorContent]);

  // 停止运行
  const handleStopRunCode = useCallback(async () => {
    const res = await stopRunPythonItem(currentFileId ?? '', { execid });

    if (res?.status !== 200 || Number(res?.code) !== 0) {
      Message.error(res?.message ?? '停止运行失败');
      return;
    }

    cancelGetRunResultPolling();
    setRunStatus(RunningStatus.IDLE);
    setHasFetchedResult(true);
  }, [currentFileId, execid, cancelGetRunResultPolling]);

  // 统一的按钮点击处理函数（带防抖）
  const handleButtonClick = useCallback(() => {
    if (runStatus === RunningStatus.RUNNING) {
      handleStopRunCode();
    } else {
      handleRunCode().catch(console.error);
    }
  }, [runStatus, handleStopRunCode, handleRunCode]);

  const { run: debouncedButtonClick } = useDebounceFn(handleButtonClick, {
    wait: 1000, // 1秒防抖
    leading: true, // 立即执行第一次调用
    trailing: false // 不执行最后一次调用
  });

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
        // setRunStatus(RunningStatus.RUNNING);
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
    hasFetchedResult,

    // 操作
    handleContentChange,
    handleRunCode,
    handleGetRunLog,
    handleStopRunCode,
    handlePanelStateChange,
    handleGetRunResult,
    getPrevRunStatus,

    // 防抖版本的按钮点击函数
    debouncedButtonClick
  };
};

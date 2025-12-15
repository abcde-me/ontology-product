import React, { useState, useEffect, useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import { useRequest, useThrottleFn } from 'ahooks';
import { RunningStatus } from '@/types/sqlApi';
import {
  //   // runSqlScript,
  //   getRunResultSqlScript,
  runCancelSqlScript
  //   getRunLogSqlScript
} from '@/api/sql';
import {
  createDevelopScript,
  editDevelopScript,
  getDevelopScriptInfo,
  lockDevelopScript,
  unlockDevelopScript,
  releaseDevelopScript,
  runDevelopScript,
  getDevelopScriptRunLog
} from '@/api/sql-develop';
import { DEFAULT_SQL_PLACEHOLDER } from '../constant';
import { useUserInfo } from '@/store/userInfoStore';
import { RunResult } from '@/types/sqlApi';
import timeFormattig from '@/utils/timeFormatting';
import { generateSqlDefaultName } from '../utils';
import {
  EditDevelopScriptResponse,
  GetDevelopScriptInfoResponse,
  ScriptParam,
  ScriptStatus,
  ScriptStatusName,
  RunLogStatus
} from '@/types/sqlDevelopApi';

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

export type ScriptInfo = Partial<GetDevelopScriptInfoResponse> & {
  /**
   * 是否是当前用户编辑的
   */
  isSelfEditing: boolean;
};

export interface UseEditorReturn {
  // 编辑器状态
  // 脚本信息
  scriptInfo: ScriptInfo | null;
  // editorContent: string;
  placeholderValue: string;
  runLogStatus: RunLogStatus;
  // runStatus: RunningStatus;
  runStartTime: string;
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
  // lastScriptRunStatus: RunningStatus;
  hasFetchedResult: boolean;
  hasFetchedLog: boolean;
  // // 表格数据处理
  // columns: Array<{
  //   title: string;
  //   dataIndex: string;
  //   width: number;
  //   ellipsis: boolean;
  // }>;
  // data: Array<Record<string, any> & { key: string }>;

  // 编辑器操作
  setScriptInfo: React.Dispatch<React.SetStateAction<ScriptInfo | null>>;
  setSize: (size: string) => void;
  handleContentChange: (value: string) => void;
  handleSaveScript: (
    value: string
  ) => Promise<EditDevelopScriptResponse | null>;
  handleRunCode: () => Promise<void>;
  handleStopRunCode: () => void;
  // getRunResultPolling: (id: string, params: any) => void;
  // cancelGetRunResultPolling: () => void;
  // loadRunResult: (execid: string, size: string) => void;
  handleGetRunLog: () => Promise<void>;
  handleEditScript: () => Promise<boolean>;
  handleUnlockScript: () => Promise<boolean>;
  handleReleaseScript: (script_desc: string) => Promise<boolean>;

  // 面板状态管理
  isPanelOpen: boolean;
  handlePanelStateChange: (isOpen: boolean) => void;
  getPrevRunStatus: () => RunningStatus;

  // 参数列表
  // scriptParams: ScriptParam[];
  // setScriptParams: React.Dispatch<React.SetStateAction<ScriptParam[]>>;
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
  const [scriptInfo, setScriptInfo] = useState<ScriptInfo | null>(null);
  // const [editorContent, setEditorContent] = useState('');
  const [placeholderValue] = useState(defaultContent);
  // const [runStatus, setRunStatus] = useState<RunningStatus>(RunningStatus.IDLE);
  const [runLogStatus, setRunLogStatus] = useState<RunLogStatus>(
    RunLogStatus.CANCEL
  );
  const [prevRunStatus, setPrevRunStatus] = useState<RunningStatus>(
    RunningStatus.IDLE
  ); // 添加前一个运行状态跟踪
  const [runStartTime, setRunStartTime] = useState<string>('');
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
  // const [lastScriptRunStatus, setLastScriptRunStatus] = useState<RunningStatus>(
  //   RunningStatus.IDLE
  // );
  // 面板状态管理
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  // 跟踪是否已获取过结果和日志
  const [hasFetchedResult, setHasFetchedResult] = useState<boolean>(false);
  const [hasFetchedLog, setHasFetchedLog] = useState<boolean>(false);
  // const [scriptParams, setScriptParams] = useState<ScriptParam[]>([]);

  // 获取前一个运行状态的函数
  const getPrevRunStatus = useCallback(() => {
    return prevRunStatus;
  }, [prevRunStatus]);

  // 更新运行状态的包装函数
  // const updateRunStatus = useCallback(
  //   (newStatus: RunningStatus) => {
  //     setPrevRunStatus(runStatus);
  //     setRunStatus(newStatus);
  //   },
  //   [runStatus]
  // );

  // 面板状态变化处理
  const handlePanelStateChange = useCallback((isOpen: boolean) => {
    setIsPanelOpen(isOpen);
  }, []);

  // 动态生成表格列
  // const generateTableColumns = (runResult: RunResult[]) => {
  //   if (
  //     !runResult ||
  //     runResult.length === 0 ||
  //     !runResult[0]?.list ||
  //     runResult[0].list.length === 0
  //   ) {
  //     return [];
  //   }

  //   // 从第一行数据中获取所有的 key 作为列头
  //   const firstRow = runResult[0].list[0];
  //   const keys = Object.keys(firstRow);

  //   return keys.map((key) => ({
  //     title: key,
  //     dataIndex: key,
  //     width: 240,
  //     ellipsis: true
  //   }));
  // };

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
  // const columns = generateTableColumns(runResult);
  // const data = generateTableData(runResult);

  // 当前文件ID，从 activeTab 对应的标签页获取
  const currentFile = fileTabs.find((tab) => tab.key === activeTab);

  // 编辑脚本
  const handleEditScript = useCallback(async () => {
    try {
      const res = await lockDevelopScript(Number(currentFile?.scriptId));
      // code==='2' 代表其他人在编辑
      if (res?.status !== 200 || res?.code === '2') {
        Message.error(res?.message ?? '编辑失败');
        return false;
      }

      setScriptInfo((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isSelfEditing: true,
          status: ScriptStatus.Editing
        };
      });
      return true;
    } catch (error) {
      console.error(error);
      Message.error('编辑失败');
      return false;
    }
  }, [currentFile?.scriptId]);

  const handleReleaseScript = useCallback(
    async (script_desc: string) => {
      try {
        const res = await releaseDevelopScript({
          script_id: Number(currentFile?.scriptId),
          script_desc
        });

        if (res?.status !== 200) {
          Message.error(res?.message ?? '发布失败');
          return false;
        }

        // 发版成功重新请求接口详情获取最新脚本信息
        loadFileContent(currentFile?.scriptId ?? '');

        // getDevelopScriptInfo(Number(currentFile?.scriptId));
        // if (res?.status !== 200) {
        //   Message.error(res?.message ?? '获取脚本信息失败');
        //   return false;
        // }
        // setScriptInfo(res.data);

        Message.success('发布成功');
        return true;
      } catch (error) {
        console.error(error);
        Message.error('发布失败');
        return false;
      }
    },
    [currentFile?.scriptId, scriptInfo?.script_desc]
  );

  // 解锁脚本
  const handleUnlockScript = useCallback(async () => {
    try {
      const res = await unlockDevelopScript(Number(currentFile?.scriptId));
      if (res?.status !== 200) {
        Message.error(res?.message ?? '解锁失败');
        return false;
      }

      setScriptInfo((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isSelfEditing: false,
          status: ScriptStatus.EditCompleted
        };
      });
      return true;
    } catch (error) {
      console.error(error);
      Message.error('解锁失败');
      return false;
    }
  }, [currentFile?.scriptId]);

  // 轮询获取日志
  const { runAsync: getRunLogPolling, cancel: cancelGetRunLogPolling } =
    useRequest(getDevelopScriptRunLog, {
      pollingInterval: 2000,
      pollingWhenHidden: true,
      manual: true,
      onSuccess: (res) => {
        if (res?.status !== 200) {
          setRunLogStatus(RunLogStatus.FAILED);
          cancelGetRunLogPolling();
          setRunLog(res?.message ?? '获取日志失败');
          setHasFetchedLog(true);
          return;
        }

        setRunLogStatus(res?.data?.run_status ?? RunLogStatus.CANCEL);
        setRunLog(res?.data?.run_log ?? '');
        setRunStartTime(res?.data?.start_time ?? '');
        setHasFetchedLog(true);

        if (res?.data?.run_status !== RunLogStatus.RUNNING) {
          cancelGetRunLogPolling();
        }
      },
      onError: () => {
        setRunLogStatus(RunLogStatus.FAILED);
        cancelGetRunLogPolling();
        setRunLog('获取日志失败');
        setHasFetchedLog(true);
      }
    });

  // const loadRunResult = async (execid: string, size: string) => {
  //   setResultLoading(true);
  //   try {
  //     const res = await getRunResultSqlScript(currentFile?.scriptId || '', {
  //       script_execid: execid,
  //       size: size || '100'
  //     });
  //     if (res?.status === 200) {
  //       setRunResult(res.data?.sql_result_lists);
  //       setHasFetchedResult(true);
  //       setRunStatus(res.data?.run_status);
  //     } else {
  //       setRunResult([]);
  //       setHasFetchedResult(true);
  //     }

  //     setResultLoading(false);
  //   } catch (error) {
  //     setResultLoading(false);
  //   }
  // };

  // 获取运行日志
  const handleGetRunLog = useCallback(async () => {
    if (!currentFile?.scriptId || !execid) {
      return;
    }
    const res = await getDevelopScriptRunLog({
      script_id: Number(currentFile?.scriptId),
      exec_id: execid
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
    // updateRunStatus(RunningStatus.IDLE);
    setExecid('');
    setRunStartTime('');
    setRunDuration(0);
    setRunResult([]);
    setRunLog('');
    setRunLogStatus(RunLogStatus.CANCEL);
    setRunError(''); /*  */
    setRunWarning('');
    // setLastAutoSave('');
    // setLastScriptRunStatus(RunningStatus.IDLE);
    setHasFetchedResult(false);
    setHasFetchedLog(false);
    // 取消正在进行的轮询
    // cancelGetRunResultPolling();
    // 取消正在进行的轮询获取日志
    cancelGetRunLogPolling();
  }, [cancelGetRunLogPolling]);

  const handleSaveScript = useCallback(
    async (content: string) => {
      try {
        const res = await editDevelopScript({
          script_name: currentFile?.title ?? generateSqlDefaultName(new Date()),
          script_context: content,
          script_id: Number(currentFile?.scriptId) ?? 0,
          script_params: scriptInfo?.script_params ?? []
        });

        if (res?.status !== 200) {
          Message.error(res?.message ?? '保存失败');
          return null;
        }

        setScriptInfo((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            update_time: res.data.update_time
          };
        });

        return res.data;
      } catch (error) {
        Message.error('保存失败');
        return null;
      }
    },
    [currentFile?.scriptId, currentFile?.title, scriptInfo]
  );

  const createScript = useCallback(
    async (content: string) => {
      try {
        const res = await createDevelopScript({
          script_name: currentFile?.title ?? generateSqlDefaultName(new Date()),
          script_context: content,
          script_desc: '',
          script_params: []
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
    [currentFile?.scriptId, currentFile?.title]
  );

  // 处理内容变化 - 优化依赖项
  const handleContentChange = useCallback(
    (value: string) => {
      setScriptInfo((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          script_context: value
        };
      });
      // setEditorContent(value);
      // 自动保存
      // handleSaveThrottled.run(value);
    },
    [clearEditorState]
  );

  // 运行代码 - 优化依赖项
  const handleRunCode = useCallback(async () => {
    if (runLogStatus === RunLogStatus.RUNNING) {
      return;
    }

    if (!currentFile?.scriptId) {
      Message.error('请先保存文件');
      return;
    }

    // const saveRes = await editDevelopScript({
    //   script_context: scriptInfo?.script_context ?? '',
    //   script_id: Number(currentFile?.scriptId),
    //   script_name: currentFile.title ?? '',
    //   script_params: scriptInfo?.script_params ?? []
    // });

    // if (saveRes?.status !== 200) {
    //   Message.error(saveRes?.message ?? '保存文件失败');
    //   return;
    // }

    // setLastAutoSave(timeFormattig(new Date(saveRes.data.update_time)));

    setExecid('');

    try {
      // 将上一次运行结果置为未运行， 重新获取结果
      // setLastScriptRunStatus(RunningStatus.IDLE);
      const res = await runDevelopScript({
        script_id: Number(currentFile?.scriptId)
      });
      if (res?.status === 200) {
        setExecid(res.data.exec_id);
        if (res.data?.warning_msg) {
          setRunWarning(res.data.warning_msg);
        }
      } else {
        setRunError(res.message);
        Message.error(res.message);
      }
    } catch (error) {
      setRunLogStatus(RunLogStatus.FAILED);
      // updateRunStatus(RunningStatus.FAILED);
    }
  }, [runLogStatus, currentFile?.scriptId, scriptInfo]);

  // 停止运行
  const handleStopRunCode = async () => {
    const res = await runCancelSqlScript(currentFile?.scriptId ?? '', {
      script_execid: execid
    });

    if (res?.status !== 200 || Number(res?.code) !== 0) {
      Message.error(res?.message ?? '停止运行失败');
      return;
    }

    // cancelGetRunResultPolling();
    cancelGetRunLogPolling();
    // setRunLogStatus();
    // updateRunStatus(RunningStatus.IDLE);
    // 将该面板的最后状态也设置为未运行
    // setLastScriptRunStatus(RunningStatus.IDLE);
  };

  const loadFileContent = async (scriptId: string) => {
    try {
      const response = await getDevelopScriptInfo({
        script_id: Number(scriptId)
      });

      if (response.status === 200 && response.data) {
        const fileData = response.data;
        // setLastScriptRunStatus(fileData?.run_status);
        // 更新编辑器内容
        // setEditorContent(fileData.script_context ?? '');
        // setScriptParams(fileData.script_params ?? []);

        setScriptInfo({
          script_id: fileData.script_id,
          script_name: fileData.script_name,
          script_context: fileData.script_context,
          script_params: fileData.script_params,
          status: fileData.status,
          status_name: fileData.status_name,
          update_user: fileData.update_user,
          update_time: fileData.update_time,
          max_version_name: fileData.max_version_name,
          max_version: fileData.max_version,
          release_user: fileData.release_user,
          release_time: fileData.release_time,
          script_desc: fileData.script_desc,
          isSelfEditing:
            fileData.status === ScriptStatus.Editing &&
            fileData.update_user === userInfo?.account
        });

        return fileData;
        // 更新运行状态
        // setExecid(String(fileData.script_execid));

        // setLastAutoSave(timeFormattig(new Date(response.data.update_time)));

        // 通知父组件更新标签页内容
        // if (onTabUpdate) {
        //   onTabUpdate(currentTab.key, {
        //     content: fileData.script_context ?? '',
        //     fileId: String(currentTab.fileId),
        //     scriptId: String(fileData.script_id),
        //     title: currentTab.title
        //   });
        // }
      } else {
        Message.error(response?.message ?? '加载文件失败');
      }
    } catch (error) {
      console.error('加载文件失败:', error);
      Message.error('加载文件失败');
    }
  };

  // 获取运行日志

  // 监听运行状态变化，自动获取结果 - 优化依赖项
  useEffect(() => {
    if (!execid || !currentFile?.scriptId) {
      return;
    }

    if (runLogStatus !== RunLogStatus.RUNNING) {
      // console.log('取消轮询', runStatus, execid);
      // cancelGetRunResultPolling();
      cancelGetRunLogPolling();
    }

    // updateRunStatus(RunningStatus.RUNNING);
    setRunLogStatus(RunLogStatus.RUNNING);
    setRunResult([]);
    setRunError('');
    setRunDuration(0);

    // 运行中时，轮询获取运行结果
    const fetchResult = () => {
      try {
        // updateRunStatus(RunningStatus.RUNNING);
        // getRunResultPolling(currentFile?.scriptId ?? '', {
        //   script_execid: execid,
        //   size: size
        // });

        getRunLogPolling({
          script_id: Number(currentFile?.scriptId ?? ''),
          exec_id: execid
        });
      } catch (error) {
        setRunLogStatus(RunLogStatus.FAILED);
        console.error('获取运行结果失败:', error);
        // updateRunStatus(RunningStatus.FAILED);
      }
    };

    fetchResult();
  }, [execid]);

  // 页面卸载时停止轮询
  useEffect(() => {
    return () => {
      // cancelGetRunResultPolling();
      cancelGetRunLogPolling();
    };
  }, [cancelGetRunLogPolling]);

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
      loadFileContent(currentTab.scriptId).then((res) => {
        if (!res) {
          return;
        }

        // 通知父组件更新标签页内容
        if (onTabUpdate) {
          onTabUpdate(currentTab.key, {
            content: res.script_context ?? '',
            fileId: String(currentTab.fileId),
            scriptId: String(res.script_id),
            title: currentTab.title
          });
        }
      });
    }

    // return () => {
    //   // handleSaveThrottled.cancel();
    // };
  }, [activeTab]); // 只依赖 activeTab，避免不必要的重复更新

  // 当 currentFileId 变化时，重置运行相关状态
  useEffect(() => {
    clearEditorState();
  }, [currentFile?.scriptId, clearEditorState]);

  return {
    // 状态
    scriptInfo,
    // editorContent,
    placeholderValue,
    // runStatus,
    runLogStatus,
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
    // lastScriptRunStatus,
    hasFetchedResult,
    hasFetchedLog,
    // 表格数据处理
    // columns,
    // data,
    // 操作
    setScriptInfo,
    setSize,
    handleContentChange,
    handleSaveScript,
    handleRunCode,
    handleStopRunCode,
    // getRunResultPolling,
    // cancelGetRunResultPolling,
    // loadRunResult,
    handleGetRunLog,
    handleEditScript,
    handleUnlockScript,
    handleReleaseScript,

    // 面板状态管理
    isPanelOpen,
    handlePanelStateChange,
    getPrevRunStatus

    // 参数列表
    // scriptParams,
    // setScriptParams
  };
};

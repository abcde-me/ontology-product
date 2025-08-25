import React, { useState, useRef, useEffect } from 'react';
import { Button, Space, Tag, Message } from '@arco-design/web-react';
import {
  IconPlayArrow,
  IconUpload,
  IconList,
  IconSettings,
  IconFile,
  IconInfoCircle,
  IconCheckCircle,
  IconCloseCircle,
  IconLoading,
  IconRefresh
} from '@arco-design/web-react/icon';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { lintGutter } from '@codemirror/lint';
import {
  syntaxHighlighting,
  defaultHighlightStyle
} from '@codemirror/language';
import './EditorWorkspace.scss';
import createTheme from '@uiw/codemirror-themes';
import { type SavePythonItemRes, RunningStatus } from '@/types/pythonApi';
import RunIcon from '@/assets/python/run.svg';
import StopIcon from '@/assets/python/stop-run.svg';
import { useRequest, useThrottleFn } from 'ahooks';
import {
  runPythonItem,
  getRunResult,
  getRunLog,
  savePythonItem
} from '@/api/python';
import RunningInfoPanel, { ActiveKey } from './RunningInfoPanel';

interface NotebookWorkspaceProps {
  content: string;
  fileName: string;
  currentFileId?: string; // 使currentFileId可选
}

const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = ({
  content,
  fileName,
  currentFileId
}) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [editorContent, setEditorContent] = useState(content);
  const [placeholderValue, setPlaceholderValue] = useState('请输入代码...');
  const [runStatus, setRunStatus] = useState<RunningStatus>(RunningStatus.IDLE);
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [runDuration, setRunDuration] = useState<number>(0);
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  const [execid, setExecid] = useState<string>('');
  const [runLog, setRunLog] = useState<string>('');
  const [runResult, setRunResult] = useState<string>('');
  const [runResultLoading, setRunResultLoading] = useState(false);
  const [runResultError, setRunResultError] = useState<Error | null>(null);

  const myTheme = createTheme({
    theme: 'light',
    settings: {
      background: '#ffffff',
      backgroundImage: '',
      foreground: '#5d00ff',
      lineHighlight: '#8a91991a'
    },
    styles: []
  });

  // 当content prop变化时，更新编辑器内容
  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  // 当placeholder prop变化时，更新占位符
  useEffect(() => {
    if (content && content.trim() !== '') {
      setPlaceholderValue('请输入代码...');
    } else {
      setPlaceholderValue('请输入代码...');
    }
  }, [content]);

  // 延时30s保存
  const handleSaveThrottled = useThrottleFn(
    async (content) => {
      // 如果没有currentFileId，则跳过保存
      if (!currentFileId) {
        return null;
      }

      const res = await savePythonItem(currentFileId, {
        id: Number(currentFileId),
        data: content
      });

      if (res?.status === 200) {
        return res.data;
      }

      return null;
    },
    { wait: 3000 }
  );

  const handleContentChange = async (value: string) => {
    setEditorContent(value);

    const res = await handleSaveThrottled.run(value);
    if (!res) {
      Message.error('自动保存失败');
      return;
    }
    setLastAutoSave(res.last_modified);
  };

  const handleRunCode = async () => {
    if (runStatus === RunningStatus.RUNNING) {
      return;
    }

    // 如果没有currentFileId，则跳过运行
    if (!currentFileId) {
      Message.error('请先保存文件');
      return;
    }

    setRunStatus(RunningStatus.RUNNING);
    setRunStartTime(new Date());
    setRunDuration(0);

    const res = await runPythonItem(currentFileId);

    if (!res) {
      Message.error('运行失败');
      setRunStatus(RunningStatus.IDLE);
      return;
    }

    setExecid(res.data.execid);
  };

  const handleStopRunCode = () => {
    setRunStatus(RunningStatus.IDLE);
  };

  const handleExportDataset = () => {
    console.log('Exporting dataset...');
  };

  const handleExportList = () => {
    console.log('Exporting list...');
  };

  const handleCallOperator = () => {
    console.log('Calling operator...');
  };

  const getRunStatusDisplay = () => {
    switch (runStatus) {
      case RunningStatus.RUNNING:
        return (
          <div className="run-status running-status">
            <span className="mr-[4px]">运行中</span>
            <IconLoading
              className="loading-icon"
              style={{ color: '#007DFA' }}
            />
          </div>
        );
      case RunningStatus.SUCCESS:
        return (
          <div className="run-status success-status">
            <span className="mr-[4px]">运行成功</span>
            <IconCheckCircle style={{ color: '#10B981' }} />
          </div>
        );
      case RunningStatus.FAILED:
        return (
          <div className="run-status failed-status">
            <span className="mr-[4px]">运行失败</span>
            <IconCloseCircle style={{ color: '#EF4444' }} />
          </div>
        );
      default:
        return null;
    }
  };

  const getRunResultInfo = () => {
    if (
      runStatus === RunningStatus.SUCCESS &&
      runStartTime &&
      runDuration > 0
    ) {
      const endTime = new Date(runStartTime.getTime() + runDuration * 1000);
      return (
        <div className="run-result-info">
          <span className="run-time">
            {endTime.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
          <span className="run-duration">({runDuration}s)</span>
        </div>
      );
    }
    return null;
  };

  // 轮询获取运行结果
  const { runAsync: getRunResultPolling, cancel: cancelGetRunResultPolling } =
    useRequest(getRunResult, {
      pollingInterval: 3000
    });

  const handleActiveKeyChange = async (activeKey: string) => {
    // 如果没有currentFileId，则跳过
    if (!currentFileId) {
      return;
    }

    if (activeKey === ActiveKey.RESULT) {
      const res = await getRunResult(currentFileId, {
        execid
      });

      if (res?.status === 200 && res.data) {
        setRunResult(res.data.run_result);
      }
    } else if (activeKey === ActiveKey.LOG) {
      const res = await getRunLog(currentFileId, {
        execid
      });

      if (res?.status === 200 && res.data) {
        setRunLog(res.data.log);
      }
    }
  };

  useEffect(() => {
    if (runStatus !== RunningStatus.RUNNING || !execid || !currentFileId) {
      return;
    }

    // 运行中时，轮询获取运行结果
    if (runStatus === RunningStatus.RUNNING) {
      cancelGetRunResultPolling();
      getRunResultPolling(currentFileId, {
        execid
      }).then((res) => {
        if (res?.status === 200 && res.data) {
          setRunResult(res.data.run_result);
        }
      });
    }

    // 非运行时，任务id存在时，手动获取运行结果
    if (runStatus !== RunningStatus.RUNNING && execid) {
      getRunResult(currentFileId, {
        execid
      }).then((res) => {
        if (res?.status === 200 && res.data) {
          setRunResult(res.data.run_result);
        }
      });
    }
  }, [execid, runStatus, currentFileId]);

  return (
    <div className="notebook-content">
      {/* 顶部工具栏 */}
      <div className="notebook-toolbar">
        <div className="toolbar-left">
          <Space size={12}>
            <Button
              type="primary"
              icon={
                runStatus === RunningStatus.RUNNING ? (
                  <StopIcon className="mr-[4px]" />
                ) : (
                  <RunIcon className="mr-[4px]" />
                )
              }
              onClick={
                runStatus === RunningStatus.RUNNING
                  ? handleStopRunCode
                  : handleRunCode
              }
              className={`h-[26px]${runStatus === RunningStatus.RUNNING || editorContent.trim() === '' ? ' btn-running' : ''}`}
            >
              {runStatus === RunningStatus.RUNNING ? '停止运行' : '运行'}
            </Button>
            <Button
              icon={<IconUpload />}
              className="h-[26px]"
              onClick={handleExportDataset}
              disabled={
                runStatus === RunningStatus.RUNNING ||
                editorContent.trim() === ''
              }
            >
              导出数据集
            </Button>
            <Button
              type="text"
              onClick={handleExportList}
              style={{ color: '#0F172A', padding: '0px' }}
            >
              导出列表
            </Button>
            <Button
              type="text"
              icon={<IconSettings />}
              onClick={handleCallOperator}
              style={{ color: '#0F172A', padding: '0px' }}
            >
              调用算子
            </Button>
          </Space>
        </div>
        <div className="toolbar-right">
          <Space size={8}>
            {getRunStatusDisplay()}
            {getRunResultInfo()}
            {lastAutoSave && (
              <span className="auto-save-status">自动保存：{lastAutoSave}</span>
            )}
          </Space>
        </div>
      </div>

      {/* 代码编辑器 */}
      <div className="editor-container">
        <CodeMirror
          ref={editorRef}
          value={editorContent}
          theme={myTheme}
          placeholder={placeholderValue}
          extensions={[
            python(),
            lintGutter(),
            syntaxHighlighting(defaultHighlightStyle)
          ]}
          onChange={handleContentChange}
          readOnly={runStatus === RunningStatus.RUNNING}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: false
          }}
        />
      </div>

      {/* 运行信息面板 */}
      <RunningInfoPanel
        runResult={runResult}
        runLog={runLog}
        loading={runResultLoading}
        error={runResultError}
        onActiveKeyChange={handleActiveKeyChange}
      />
    </div>
  );
};

export default NotebookWorkspace;

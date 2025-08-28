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
  IconLoading
} from '@arco-design/web-react/icon';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { lintGutter } from '@codemirror/lint';
import {
  syntaxHighlighting,
  defaultHighlightStyle
} from '@codemirror/language';
import './NotebookWorkspace.scss';
import createTheme from '@uiw/codemirror-themes';
import timeFormatting from '@/utils/timeFormatting';
import { useRafInterval } from 'ahooks';

interface NotebookWorkspaceProps {
  content: string;
  fileName: string;
  onContentChange?: (content: string) => void;
}

// 运行状态枚举
enum RunStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed'
}

const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = ({
  content,
  fileName,
  onContentChange
}) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [editorContent, setEditorContent] = useState(content);
  const [placeholderValue, setPlaceholderValue] = useState('请输入代码...');
  const [runStatus, setRunStatus] = useState<RunStatus>(RunStatus.IDLE);
  const [runStartTime, setRunStartTime] = useState<Date | null>(null);
  const [runDuration, setRunDuration] = useState<number>(0);
  const [lastAutoSave, setLastAutoSave] = useState<Date>(new Date());

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

  // 使用 useRafInterval 进行自动保存，每30秒执行一次
  useRafInterval(() => {
    setLastAutoSave(new Date());
    console.log('Auto saved at:', new Date().toLocaleString());
  }, 30000);

  const handleContentChange = (value: string) => {
    setEditorContent(value);
    if (onContentChange) {
      onContentChange(value);
    }
  };

  const handleRunCode = async () => {
    if (runStatus === RunStatus.RUNNING) {
      Message.warning('代码正在运行中，请稍候...');
      return;
    }

    setRunStatus(RunStatus.RUNNING);
    setRunStartTime(new Date());
    setRunDuration(0);

    try {
      // 模拟代码运行
      await new Promise((resolve, reject) => {
        const startTime = Date.now();

        // 随机模拟运行时间（2-8秒）
        const runTime = Math.random() * 6000 + 2000;

        setTimeout(() => {
          const endTime = Date.now();
          const duration = Math.round((endTime - startTime) / 1000);
          setRunDuration(duration);

          // 90%概率成功，10%概率失败
          if (Math.random() > 0.1) {
            setRunStatus(RunStatus.SUCCESS);
            Message.success(`代码运行成功！耗时 ${duration} 秒`);
          } else {
            setRunStatus(RunStatus.FAILED);
            Message.error('代码运行失败，请检查代码语法');
          }
        }, runTime);
      });
    } catch (error) {
      setRunStatus(RunStatus.FAILED);
      setRunDuration(0);
      Message.error('代码运行出错');
    }
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
      case RunStatus.RUNNING:
        return (
          <div className="run-status running-status">
            <span className="mr-[4px]">运行中</span>
            <IconLoading
              className="loading-icon"
              style={{ color: '#007DFA' }}
            />
          </div>
        );
      case RunStatus.SUCCESS:
        return (
          <div className="run-status success-status">
            <span className="mr-[4px]">运行成功</span>
            <IconCheckCircle style={{ color: '#10B981' }} />
          </div>
        );
      case RunStatus.FAILED:
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
    if (runStatus === RunStatus.SUCCESS && runStartTime && runDuration > 0) {
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

  return (
    <div className="notebook-content">
      {/* 顶部工具栏 */}
      <div className="notebook-toolbar">
        <div className="toolbar-left">
          <Space size={8}>
            <Button
              type="primary"
              icon={<IconPlayArrow />}
              onClick={handleRunCode}
              loading={runStatus === RunStatus.RUNNING}
              disabled={runStatus === RunStatus.RUNNING}
            >
              运行
            </Button>
            <Button icon={<IconUpload />} onClick={handleExportDataset}>
              导出数据集
            </Button>
            <Button
              type="text"
              onClick={handleExportList}
              style={{ color: '#0F172A' }}
            >
              导出列表
            </Button>
            <Button
              type="text"
              icon={<IconSettings />}
              onClick={handleCallOperator}
              style={{ color: '#0F172A' }}
            >
              调用算子
            </Button>
          </Space>
        </div>
        <div className="toolbar-right">
          <Space size={8}>
            {getRunStatusDisplay()}
            {getRunResultInfo()}
            <span className="auto-save-status">
              自动保存：{timeFormatting(lastAutoSave)}
            </span>
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
          readOnly={runStatus === RunStatus.RUNNING}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: false
          }}
        />
      </div>
    </div>
  );
};

export default NotebookWorkspace;

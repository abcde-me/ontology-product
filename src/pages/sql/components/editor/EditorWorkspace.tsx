import React, { useRef, memo } from 'react';
import { Button, Space } from '@arco-design/web-react';
import {
  IconUpload,
  IconSettings,
  IconPlayArrow,
  IconStop
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
import { RunningStatus } from '@/types/pythonApi';

import RunningInfoPanel from './RunningInfoPanel';
import { useEditor } from '../../hooks/useEditor';
import { FileTab } from '../../hooks/useTabManager';

interface NotebookWorkspaceProps {
  content: string;
  fileName: string;
  currentFileId?: string;
  hasRun?: boolean;
  tabKey?: string;
  onActiveUpdate?: (tabData: FileTab) => void;
}

const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = memo(
  ({ content, fileName, currentFileId, hasRun, onActiveUpdate, tabKey }) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);

    // 使用useEditor hook管理编辑器状态
    const {
      runStatus,
      handleStopRunCode,
      handleRunCode,
      lastAutoSave,
      editorContent,
      handleContentChange,
      placeholderValue,
      runResult,
      runLog
    } = useEditor({
      initialContent: content,
      currentFileId,
      tabKey: tabKey,
      onActiveUpdate: onActiveUpdate,
      hasRun
    });

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

    const handleExportDataset = () => {
      console.log('Exporting dataset...');
    };

    const handleExportList = () => {
      console.log('Exporting list...');
    };

    const handleCallOperator = () => {
      console.log('Calling operator...');
    };

    const handleRunClick = () => {
      if (runStatus === RunningStatus.RUNNING) {
        handleStopRunCode();
      } else {
        handleRunCode().catch(console.error);
      }
    };

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
                    <IconStop className="mr-[4px]" />
                  ) : (
                    <IconPlayArrow className="mr-[4px]" />
                  )
                }
                disabled={editorContent.trim() === ''}
                onClick={handleRunClick}
                className={`h-[26px]${runStatus === RunningStatus.RUNNING ? ' btn-running' : ''}`}
              >
                {runStatus === RunningStatus.RUNNING ? '停止运行' : '运行'}
              </Button>
              <Button
                icon={<IconUpload />}
                onClick={handleExportDataset}
                className="h-[26px]"
                disabled={editorContent.trim() === ''}
              >
                导出数据集
              </Button>
              <Button
                type="text"
                icon={<IconSettings />}
                onClick={handleCallOperator}
                className="h-[26px]"
              >
                调用算子
              </Button>
            </Space>
          </div>
          {lastAutoSave && (
            <div className="toolbar-right">
              <Space size={12}>
                <span className="text-sm text-gray-500">
                  自动保存: {lastAutoSave || '未保存'}
                </span>
              </Space>
            </div>
          )}
        </div>

        {/* 编辑器区域 */}
        <div className="editor-container">
          <CodeMirror
            ref={editorRef}
            value={editorContent}
            onChange={handleContentChange}
            placeholder={placeholderValue}
            extensions={[
              python(),
              lintGutter(),
              syntaxHighlighting(defaultHighlightStyle, { fallback: true })
            ]}
            theme={myTheme}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: false
            }}
            className="code-editor"
          />
        </div>

        {/* 运行信息面板 */}
        {hasRun && (
          <RunningInfoPanel
            runResult={runResult}
            runLog={runLog}
            runStatus={runStatus}
          />
        )}
      </div>
    );
  }
);

NotebookWorkspace.displayName = 'NotebookWorkspace';

export default NotebookWorkspace;

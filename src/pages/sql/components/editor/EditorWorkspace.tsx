import React, { useRef, memo } from 'react';
import { Button, Space } from '@arco-design/web-react';
import {
  IconUpload,
  IconSettings,
  IconPlayArrow,
  IconStop,
  IconMenu
} from '@arco-design/web-react/icon';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { format } from 'sql-formatter';
import { lintGutter } from '@codemirror/lint';
import './EditorWorkspace.scss';
import createTheme from '@uiw/codemirror-themes';
import { RunningStatus } from '@/types/sqlApi';

import RunningInfoPanel from './RunningInfoPanel';
import { EditorProvider, useEditorContext } from '../../contexts/EditorContext';
import { FileTab } from '../../hooks/useTabManager';

interface NotebookWorkspaceProps {
  content: string;
  fileName: string;
  currentFileId?: string;
  hasRun?: boolean;
  tabKey?: string;
  onActiveUpdate?: (tabData: FileTab) => void;
}

// 内部组件，使用 EditorContext
const EditorWorkspaceContent: React.FC = memo(() => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // 从 Context 获取编辑器状态
  const {
    runStatus,
    runDuration,
    runStartTime,
    handleStopRunCode,
    handleRunCode,
    lastAutoSave,
    editorContent,
    setEditorContent,
    handleContentChange,
    placeholderValue,
    runResult,
    runLog,
    size,
    setSize
  } = useEditorContext();

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

  const handleRunClick = () => {
    if (runStatus === RunningStatus.RUNNING) {
      handleStopRunCode();
    } else {
      handleRunCode().catch(console.error);
    }
  };

  const handleFormatCode = () => {
    if (editorContent) {
      try {
        const formattedCode = format(editorContent, { language: 'sql' });
        setEditorContent(formattedCode);
      } catch (e) {
        console.error(e);
      }
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
              type="text"
              icon={<IconMenu />}
              onClick={handleFormatCode}
              className="h-[26px]"
            >
              格式化
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
          extensions={[sql({ upperCaseKeywords: true }), lintGutter()]}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: false
          }}
          className="code-editor"
        />
      </div>

      {/* 运行信息面板 */}
      <RunningInfoPanel />
    </div>
  );
});

// 主组件，提供 EditorContext
const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = memo(
  ({ content, fileName, currentFileId, hasRun, onActiveUpdate, tabKey }) => {
    const editorOptions = {
      initialContent: content,
      currentFileId,
      tabKey: tabKey,
      onActiveUpdate: onActiveUpdate,
      hasRun
    };

    return (
      <EditorProvider options={editorOptions}>
        <EditorWorkspaceContent />
      </EditorProvider>
    );
  }
);

NotebookWorkspace.displayName = 'NotebookWorkspace';

export default NotebookWorkspace;

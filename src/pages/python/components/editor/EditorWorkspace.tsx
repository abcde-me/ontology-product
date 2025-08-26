import React, { useRef } from 'react';
import { Button, Space } from '@arco-design/web-react';
import { IconUpload, IconSettings } from '@arco-design/web-react/icon';
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
import RunIcon from '@/assets/python/run.svg';
import StopIcon from '@/assets/python/stop-run.svg';
import RunningInfoPanel from './RunningInfoPanel';
import { useEditor } from '../../hooks/useEditor';

interface NotebookWorkspaceProps {
  content: string;
  fileName: string;
  currentFileId?: string;
}

const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = ({
  content,
  fileName,
  currentFileId
}) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // 使用useEditor hook管理编辑器状态
  const editorHook = useEditor({
    initialContent: content,
    currentFileId
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

  return (
    <div className="notebook-content">
      {/* 顶部工具栏 */}
      <div className="notebook-toolbar">
        <div className="toolbar-left">
          <Space size={12}>
            <Button
              type="primary"
              icon={
                editorHook.runStatus === RunningStatus.RUNNING ? (
                  <StopIcon className="mr-[4px]" />
                ) : (
                  <RunIcon className="mr-[4px]" />
                )
              }
              onClick={
                editorHook.runStatus === RunningStatus.RUNNING
                  ? editorHook.handleStopRunCode
                  : () => editorHook.handleRunCode().catch(console.error)
              }
              className={`h-[26px]${editorHook.runStatus === RunningStatus.RUNNING || content.trim() === '' ? ' btn-running' : ''}`}
            >
              {editorHook.runStatus === RunningStatus.RUNNING
                ? '停止运行'
                : '运行'}
            </Button>
            <Button
              icon={<IconUpload />}
              onClick={handleExportDataset}
              className="h-[26px]"
            >
              导出数据集
            </Button>
            <Button
              icon={<IconUpload />}
              onClick={handleExportList}
              className="h-[26px]"
            >
              导出列表
            </Button>
            <Button
              icon={<IconSettings />}
              onClick={handleCallOperator}
              className="h-[26px]"
            >
              调用算子
            </Button>
          </Space>
        </div>
        <div className="toolbar-right">
          <Space size={12}>
            <span className="text-sm text-gray-500">
              最后保存: {editorHook.lastAutoSave || '未保存'}
            </span>
          </Space>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="editor-container">
        <CodeMirror
          ref={editorRef}
          value={editorHook.editorContent}
          onChange={editorHook.handleContentChange}
          placeholder={editorHook.placeholderValue}
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
      <RunningInfoPanel
        runResult={editorHook.runResult}
        runLog={editorHook.runLog}
      />
    </div>
  );
};

export default NotebookWorkspace;

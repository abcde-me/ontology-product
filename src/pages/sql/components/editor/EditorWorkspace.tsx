import React, { useRef, memo, useCallback, useEffect } from 'react';
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
import { EditorView } from '@codemirror/view';
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
  onInsertContent?: (insertFn: (content: string) => void) => void;
  onEditorFocusChange?: (isFocused: boolean) => void;
}

// 内部组件，使用 EditorContext
const EditorWorkspaceContent: React.FC<{
  onInsertContent?: (insertFn: (content: string) => void) => void;
  onEditorFocusChange?: (isFocused: boolean) => void;
}> = memo(({ onInsertContent, onEditorFocusChange }) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [lastCursorPosition, setLastCursorPosition] = React.useState<number>(0);
  const [isEditorFocused, setIsEditorFocused] = React.useState<boolean>(false);

  // 从 Context 获取编辑器状态
  const {
    runStatus,
    runDuration,
    runStartTime,
    handleStopRunCode,
    handleRunCode,
    lastAutoSave,
    editorContent,
    handleContentChange,
    placeholderValue,
    runResult
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
        handleContentChange(formattedCode);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 处理光标位置变化
  const handleCursorChange = useCallback((view: EditorView) => {
    const pos = view.state.selection.main.head;
    setLastCursorPosition(pos);
  }, []);

  // 处理编辑器聚焦状态变化
  const handleFocusChange = useCallback(
    (focused: boolean) => {
      setIsEditorFocused(focused);
      if (onEditorFocusChange) {
        onEditorFocusChange(focused);
      }
    },
    [onEditorFocusChange]
  );

  // 插入内容到光标位置
  const insertContentAtCursor = useCallback((contentToInsert: string) => {
    if (!editorRef.current?.view) return;

    const view = editorRef.current.view;
    const currentPos = view.state.selection.main.head;

    // 在当前位置插入内容
    view.dispatch({
      changes: {
        from: currentPos,
        to: currentPos,
        insert: contentToInsert
      },
      selection: {
        anchor: currentPos + contentToInsert.length
      }
    });
  }, []);

  // 监听插入内容事件
  useEffect(() => {
    if (onInsertContent) {
      // 将插入函数暴露给父组件
      onInsertContent(insertContentAtCursor);
    }
  }, [insertContentAtCursor, onInsertContent]);

  return (
    <div className="sql-content">
      {/* 顶部工具栏 */}
      <div className="sql-toolbar">
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
              disabled={editorContent?.trim() === ''}
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
          extensions={[
            sql({ upperCaseKeywords: true }),
            lintGutter(),
            EditorView.updateListener.of((update) => {
              if (update.selectionSet) {
                handleCursorChange(update.view);
              }
              if (update.focusChanged) {
                handleFocusChange(update.view.hasFocus);
              }
            })
          ]}
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
  ({
    content,
    fileName,
    currentFileId,
    hasRun,
    onActiveUpdate,
    tabKey,
    onInsertContent,
    onEditorFocusChange
  }) => {
    const editorOptions = {
      activeTab: tabKey,
      fileTabs: [
        {
          key: tabKey || 'default',
          title: fileName,
          content: content,
          fileId: currentFileId
        }
      ],
      onTabUpdate: (
        tabKey: string,
        updates: { content?: string; fileId?: string; title?: string }
      ) => {
        if (onActiveUpdate) {
          onActiveUpdate({
            key: tabKey,
            title: updates.title || fileName,
            content: updates.content || content,
            fileId: updates.fileId || currentFileId,
            hasRun
          });
        }
      }
    };

    return (
      <EditorProvider options={editorOptions}>
        <EditorWorkspaceContent
          onInsertContent={onInsertContent}
          onEditorFocusChange={onEditorFocusChange}
        />
      </EditorProvider>
    );
  }
);

NotebookWorkspace.displayName = 'NotebookWorkspace';

export default NotebookWorkspace;

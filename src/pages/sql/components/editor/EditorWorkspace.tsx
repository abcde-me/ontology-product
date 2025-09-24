import React, { useRef, memo, useCallback, useEffect } from 'react';
import { Button, Message, Space, Spin } from '@arco-design/web-react';
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
import { tags as t } from '@lezer/highlight';

import RunningInfoPanel from './RunningInfoPanel';
import { EditorProvider, useEditorContext } from '../../contexts/EditorContext';
import { FileTab } from '../../hooks/useTabManager';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';

interface NotebookWorkspaceProps {
  content: string;
  fileName: string;
  currentFileId?: string;
  currentScriptId?: string;
  hasRun?: boolean;
  tabKey?: string;
  onActiveUpdate?: (tabData: FileTab) => void;
  onInsertContent?: (insertFn: (content: string) => void) => void;
  onEditorFocusChange?: (isFocused: boolean) => void;
  refreshDirectory?: () => void;
  selectFile?: (fileId: string) => void;
}

// 内部组件，使用 EditorContext
const EditorWorkspaceContent: React.FC<{
  onInsertContent?: (insertFn: (content: string) => void) => void;
  onEditorFocusChange?: (isFocused: boolean) => void;
}> = memo(({ onInsertContent, onEditorFocusChange }) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [lastCursorPosition, setLastCursorPosition] = React.useState<number>(0);
  const [isEditorFocused, setIsEditorFocused] = React.useState<boolean>(false);

  const hasRunPermission = useHasPermission(SQL_PERMISSIONS.CAN_RUN);
  const hasUpdatePermission = useHasPermission(SQL_PERMISSIONS.CAN_UPDATE);
  const hasCancelRunPermission = useHasPermission(
    SQL_PERMISSIONS.CAN_CANCEL_RUN
  );

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
    runResult,
    execid,
    isPanelOpen,
    handlePanelStateChange,
    getPrevRunStatus,
    lastScriptRunStatus
  } = useEditorContext();

  const myTheme = createTheme({
    theme: 'light',
    settings: {
      background: '#ffffff',
      backgroundImage: '',
      foreground: '#75baff',
      caret: '#5d00ff',
      selection: '#036dd626',
      selectionMatch: '#036dd626',
      lineHighlight: '#8a91991a',
      gutterBackground: '#fff',
      gutterForeground: '#8a919966'
    },
    styles: [
      { tag: t.comment, color: '#6a737d', fontStyle: 'italic' },
      { tag: t.keyword, color: '#9a42a7', fontWeight: 'bold' },
      { tag: t.definition(t.typeName), color: '#194a7b' },
      { tag: t.typeName, color: '#194a7b' },
      { tag: t.tagName, color: '#008a02' },
      { tag: t.variableName, color: '#1a00db' },
      { tag: t.string, color: '#047013' },
      { tag: t.number, color: '#29a0aa' },
      { tag: t.bool, color: '#2d2aee' }
    ]
  });

  const handleRunClick = () => {
    if (runStatus === RunningStatus.RUNNING) {
      handleStopRunCode();
    } else {
      handleRunCode().catch(console.error);
    }
  };

  const handleFormatCode = () => {
    if (runStatus === RunningStatus.RUNNING) {
      Message.warning('SQL 正在执行中，暂不支持格式化');
      return;
    }

    if (editorContent) {
      try {
        const formattedCode = format(editorContent, { language: 'sql' });
        handleContentChange(formattedCode);
        Message.success('格式化成功');
      } catch (e) {
        console.error(e);
        Message.error('格式化失败');
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

    // 检查权限
    if (!hasUpdatePermission) {
      Message.warning('没有编辑权限，无法插入内容');
      return;
    }

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
            {((hasRunPermission && runStatus !== RunningStatus.RUNNING) ||
              (hasCancelRunPermission &&
                runStatus === RunningStatus.RUNNING)) && (
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
                className={`h-[26px] ${runStatus === RunningStatus.RUNNING ? 'btn-running' : ''}`}
              >
                {runStatus === RunningStatus.RUNNING ? '停止运行' : '运行'}
              </Button>
            )}

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

      <div
        className={`editor-container ${hasUpdatePermission ? '' : 'running-code-mirror'}`}
      >
        <Spin
          style={{
            width: '100%',
            height: '100%'
          }}
          tip={
            lastScriptRunStatus === RunningStatus.SUCCESS ||
            lastScriptRunStatus === RunningStatus.FAILED
              ? '结果加载中...'
              : '运行中...'
          }
          loading={runStatus === RunningStatus.RUNNING}
        >
          <CodeMirror
            ref={editorRef}
            value={editorContent}
            onChange={handleContentChange}
            placeholder={placeholderValue}
            readOnly={
              !hasUpdatePermission || runStatus === RunningStatus.RUNNING
            }
            theme={myTheme}
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
        </Spin>
      </div>

      {/* 运行信息面板 */}
      {execid && (
        <RunningInfoPanel
          isPanelOpen={isPanelOpen}
          onPanelStateChange={handlePanelStateChange}
          getPrevRunStatus={getPrevRunStatus}
        />
      )}
    </div>
  );
});

// 主组件，提供 EditorContext
const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = memo(
  ({
    content,
    fileName,
    currentFileId,
    currentScriptId,
    hasRun,
    onActiveUpdate,
    tabKey,
    onInsertContent,
    onEditorFocusChange,
    refreshDirectory,
    selectFile
  }) => {
    const editorOptions = {
      activeTab: tabKey,
      fileTabs: [
        {
          key: tabKey || 'default',
          title: fileName,
          content: content,
          fileId: currentFileId,
          scriptId: currentScriptId
        }
      ],
      onTabUpdate: (
        tabKey: string,
        updates: {
          content?: string;
          fileId?: string;
          scriptId?: string;
          title?: string;
        }
      ) => {
        if (onActiveUpdate) {
          onActiveUpdate({
            key: tabKey,
            title: updates.title || fileName,
            content: updates.content || content,
            fileId: updates.fileId || currentFileId,
            scriptId: updates.scriptId || currentScriptId,
            hasRun
          });
        }
      },
      refreshDirectory,
      selectFile
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

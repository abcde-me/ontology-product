import React, { useRef, memo, useCallback, useEffect } from 'react';
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
import { EditorView } from '@codemirror/view';
import './EditorWorkspace.scss';
import createTheme from '@uiw/codemirror-themes';
import { RunningStatus } from '@/types/pythonApi';

import RunningInfoPanel from './RunningInfoPanel';
import { useEditor } from '../../hooks/useEditor';
import { useExportDaset } from '../../hooks/useExportDaset';
import DatasetForm from '../daset-export/AddDatasetForm';

interface NotebookWorkspaceProps {
  content: string;
  fileName: string;
  currentFileId?: string;
  activeTab?: string;
  fileTabs?: Array<{
    key: string;
    title: string;
    content: string;
    fileId?: string;
  }>;
  onTabContentUpdate?: (tabKey: string, content: string) => void;
  onSidebarTabChange?: (tabKey: 'files' | 'tools' | 'data' | 'daset') => void;
  onInsertContent?: (insertFn: (content: string) => void) => void;
  onEditorFocusChange?: (isFocused: boolean) => void;
}

const NotebookWorkspace: React.FC<NotebookWorkspaceProps> = memo(
  ({
    content,
    fileName,
    currentFileId,
    activeTab,
    fileTabs,
    onTabContentUpdate,
    onSidebarTabChange,
    onInsertContent,
    onEditorFocusChange
  }) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);
    const [lastCursorPosition, setLastCursorPosition] =
      React.useState<number>(0);
    const [isEditorFocused, setIsEditorFocused] =
      React.useState<boolean>(false);
    // 使用useEditor hook管理编辑器状态
    const {
      runStatus,
      handleStopRunCode,
      handleRunCode,
      handleGetRunLog,
      lastAutoSave,
      editorContent,
      handleContentChange,
      placeholderValue,
      runResult,
      runLog,
      isPanelOpen,
      handlePanelStateChange,
      execid
    } = useEditor({
      activeTab,
      fileTabs,
      onTabContentUpdate
    });

    const {
      modalDatasetVisible,
      handleSubmit,
      setModalDatasetVisible,
      childRef
    } = useExportDaset(currentFileId, execid);

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
      setModalDatasetVisible(true);
    };

    const handleCancelDatasetModal = () => {
      setModalDatasetVisible(false);
    };

    const handleExportList = () => {
      console.log('Exporting list...');
    };

    const handleCallOperator = () => {
      // 切换到左侧tools菜单
      if (onSidebarTabChange) {
        onSidebarTabChange('tools');
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
                onClick={
                  runStatus === RunningStatus.RUNNING
                    ? handleStopRunCode
                    : () => handleRunCode().catch(console.error)
                }
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
              syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
              EditorView.updateListener.of((update) => {
                if (update.selectionSet) {
                  handleCursorChange(update.view);
                }
                if (update.focusChanged) {
                  handleFocusChange(update.view.hasFocus);
                }
              })
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
          key={currentFileId}
          runResult={runResult}
          runLog={runLog}
          runStatus={runStatus}
          onGetRunLog={handleGetRunLog}
          isPanelOpen={isPanelOpen}
          onPanelStateChange={handlePanelStateChange}
        />

        {/* 新建数据集弹框 */}
        {modalDatasetVisible && (
          <DatasetForm
            pysparkId={Number(currentFileId)}
            execid={execid}
            visible={modalDatasetVisible}
            onSubmit={handleSubmit}
            onCancel={handleCancelDatasetModal}
            ref={childRef}
          />
        )}
      </div>
    );
  }
);

NotebookWorkspace.displayName = 'NotebookWorkspace';

export default NotebookWorkspace;

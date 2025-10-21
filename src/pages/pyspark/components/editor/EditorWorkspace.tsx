import React, { useRef, memo, useCallback, useEffect, useState } from 'react';
import { Button, Message, Space } from '@arco-design/web-react';
import { IconUpload, IconPlayArrowFill } from '@arco-design/web-react/icon';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { lintGutter } from '@codemirror/lint';
import {
  syntaxHighlighting,
  defaultHighlightStyle
} from '@codemirror/language';
import createPythonLinter from '../../utils/createPythonLinter';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import './EditorWorkspace.scss';
import createTheme from '@uiw/codemirror-themes';
import { RunningStatus } from '@/types/pythonApi';

import RunningInfoPanel from './RunningInfoPanel';
import { useEditor } from '../../hooks/useEditor';
import { useExportDaset } from '../../hooks/useExportDaset';
import DatasetForm from '../daset-export/AddDatasetForm';
import ExampleCodeModal from './ExampleCodeModal';
import { PYSPARK_PERMISSIONS } from '@/config/permissions';
import ExampleIcon from '@/assets/python/example.svg';
import SuanZiIcon from '@/assets/python/diaoyongsuanzi.svg';
import IconStop from '@/assets/sql/sql-stop-icon.svg';
import copy from 'copy-to-clipboard';
import { PermissionWrapper } from '@/components/PermissionGuard';

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
    currentFileId,
    activeTab,
    fileTabs,
    onTabContentUpdate,
    onSidebarTabChange,
    onInsertContent,
    onEditorFocusChange
  }) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);
    const [exampleModalVisible, setExampleModalVisible] =
      useState<boolean>(false);
    // 使用useEditor hook管理编辑器状态
    const {
      runStatus,
      runStartTime,
      runDuration,
      activeKey,
      setActiveKey,
      handleGetRunLog,
      handleGetRunResult,
      lastAutoSave,
      editorContent,
      handleContentChange,
      placeholderValue,
      runResult,
      runLog,
      isPanelOpen,
      handlePanelStateChange,
      execid,
      getPrevRunStatus,
      hasFetchedResult,
      debouncedButtonClick
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
    } = useExportDaset(currentFileId, execid, () => {
      // 切换到导出列表tab
      if (onSidebarTabChange) {
        onSidebarTabChange('daset');
      }
    });

    // console.log('看一看编辑器卡顿的事情～');

    // const myTheme = createTheme({
    //   theme: 'light',
    //   settings: {
    //     background: '#ffffff',
    //     backgroundImage: '',
    //     foreground: '#5d00ff',
    //     lineHighlight: '#8a91991a'
    //   },
    //   styles: []
    // });

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

    const handleExportDataset = () => {
      setModalDatasetVisible(true);
    };

    const handleCancelDatasetModal = () => {
      setModalDatasetVisible(false);
    };

    const handleCallOperator = () => {
      // 切换到左侧tools菜单
      if (onSidebarTabChange) {
        onSidebarTabChange('tools');
      }
    };

    const handleShowExampleCode = () => {
      setExampleModalVisible(true);
    };

    const handleCloseExampleModal = () => {
      setExampleModalVisible(false);
    };

    const handleCopyExampleCode = (exampleCode: string) => {
      const isSuccess = copy(exampleCode);
      if (isSuccess) {
        Message.success('复制成功');
        setExampleModalVisible(false);
      } else {
        Message.error('复制失败，请重新复制');
      }
    };

    // 处理编辑器聚焦状态变化
    const handleFocusChange = useCallback(
      (focused: boolean) => {
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
              <PermissionWrapper permission={PYSPARK_PERMISSIONS.CAN_RUN}>
                <Button
                  type="primary"
                  icon={
                    runStatus === RunningStatus.RUNNING ? (
                      <IconStop className="mr-[4px]" />
                    ) : (
                      <IconPlayArrowFill className="mr-[4px]" />
                    )
                  }
                  disabled={editorContent.trim() === ''}
                  onClick={debouncedButtonClick}
                  className={`h-[26px]${runStatus === RunningStatus.RUNNING ? ' btn-running' : ''}`}
                >
                  {runStatus === RunningStatus.RUNNING ? '停止运行' : '运行'}
                </Button>
              </PermissionWrapper>
              <PermissionWrapper permission={PYSPARK_PERMISSIONS.CAN_EXPORT}>
                <Button
                  icon={<IconUpload />}
                  onClick={handleExportDataset}
                  className="h-[26px]"
                  disabled={runStatus !== RunningStatus.SUCCESS}
                >
                  导出数据集
                </Button>
              </PermissionWrapper>
              <Button
                type="text"
                icon={<SuanZiIcon />}
                onClick={handleCallOperator}
                className="h-[22px]"
              >
                调用算子
              </Button>
              <Button
                type="text"
                icon={<ExampleIcon />}
                className="h-[22px]"
                onClick={handleShowExampleCode}
              >
                示例代码
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
        <div className="pyspark-editor-container">
          <CodeMirror
            ref={editorRef}
            value={editorContent}
            onChange={handleContentChange}
            placeholder={placeholderValue}
            extensions={[
              python(),
              lintGutter(),
              createPythonLinter({
                checkSyntax: true,
                checkStyle: true,
                checkImports: true,
                checkIndentation: true
              }),
              syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
              EditorView.updateListener.of((update) => {
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

        {/* 运行信息面板 - 只在execid不为空时展示 */}
        {execid && (
          <RunningInfoPanel
            key={currentFileId}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            runResult={runResult}
            runLog={runLog}
            runStatus={runStatus}
            runStartTime={runStartTime}
            runDuration={runDuration}
            hasFetchedResult={hasFetchedResult}
            onGetRunLog={handleGetRunLog}
            onGetRunResult={handleGetRunResult}
            isPanelOpen={isPanelOpen}
            onPanelStateChange={handlePanelStateChange}
            getPrevRunStatus={getPrevRunStatus}
          />
        )}

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

        {/* 示例代码弹窗 */}
        {exampleModalVisible && (
          <ExampleCodeModal
            visible={exampleModalVisible}
            onCancel={handleCloseExampleModal}
            onCopyCode={handleCopyExampleCode}
          />
        )}
      </div>
    );
  }
);

NotebookWorkspace.displayName = 'NotebookWorkspace';

export default NotebookWorkspace;

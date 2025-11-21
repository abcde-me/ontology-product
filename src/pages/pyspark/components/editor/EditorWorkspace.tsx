import React, { useRef, memo, useCallback, useEffect, useState } from 'react';
import { Button, Message, Space, ResizeBox } from '@arco-design/web-react';
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
import { useHasPermission } from '@/store/userInfoStore';
import classNames from 'classnames';

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
    const [resizeBoxContainer, setResizeBoxContainer] =
      useState<HTMLDivElement | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const [resizeSize, setResizeSize] = useState<string>('500px');
    const [exampleModalVisible, setExampleModalVisible] =
      useState<boolean>(false);
    const hasUpdatePermission = useHasPermission(PYSPARK_PERMISSIONS.MODIFY);
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

    // 计算尺寸的函数
    const calculateSize = useCallback(
      (container: HTMLDivElement) => {
        if (!container) return;

        const containerHeight = container.clientHeight;
        if (containerHeight === 0) return;

        // 当 isPanelOpen 为 true 时，size = 容器高度 - 300px
        // 当 isPanelOpen 为 false 时，size = 容器高度 - 41px
        const offset = isPanelOpen ? 300 : 41;
        const calculatedSize = containerHeight - offset;

        // 确保 size 是正数，并转换为像素字符串
        if (calculatedSize > 0) {
          setResizeSize(`${calculatedSize}px`);
        }
      },
      [isPanelOpen]
    );

    // 使用回调 ref：当容器 DOM 元素被设置时，立即计算尺寸并设置 ResizeObserver
    const setResizeBoxContainerRef = useCallback(
      (element: HTMLDivElement | null) => {
        // 清理之前的 ResizeObserver
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }

        // 更新状态
        setResizeBoxContainer(element);

        if (element) {
          // 立即计算尺寸（此时 DOM 已经渲染完成）
          calculateSize(element);

          // 设置 ResizeObserver 监听容器尺寸变化
          const resizeObserver = new ResizeObserver(() => {
            calculateSize(element);
          });
          resizeObserver.observe(element);
          resizeObserverRef.current = resizeObserver;
        }
      },
      [calculateSize]
    );

    // 监听插入内容事件
    useEffect(() => {
      if (onInsertContent) {
        // 将插入函数暴露给父组件
        onInsertContent(insertContentAtCursor);
      }
    }, [insertContentAtCursor, onInsertContent]);

    // 当 isPanelOpen 变化时，重新计算尺寸
    useEffect(() => {
      if (resizeBoxContainer) {
        calculateSize(resizeBoxContainer);
      }
    }, [isPanelOpen, calculateSize, resizeBoxContainer]);

    // 清理 ResizeObserver
    useEffect(() => {
      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }
      };
    }, []);

    // 计算编辑器是否为只读状态
    const isReadOnly =
      !hasUpdatePermission || runStatus === RunningStatus.RUNNING;

    const editorPanel = (
      <div
        className={classNames('pyspark-editor-container', {
          'running-code-mirror': isReadOnly
        })}
        style={{ height: '100%', overflow: 'auto' }}
      >
        <CodeMirror
          ref={editorRef}
          value={editorContent}
          onChange={handleContentChange}
          placeholder={placeholderValue}
          readOnly={isReadOnly}
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
    );

    const runningInfoPanel = (
      <div style={{ height: '100%', overflow: 'hidden' }}>
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
      </div>
    );

    return (
      <div className="notebook-content">
        {/* 顶部工具栏 */}
        <div className="notebook-toolbar">
          <div className="toolbar-left">
            <Space size={12}>
              <PermissionWrapper permission={PYSPARK_PERMISSIONS.RUN}>
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
              <PermissionWrapper permission={PYSPARK_PERMISSIONS.EXPORT}>
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

        {/* 编辑器区域和运行信息面板 - 使用ResizeBox.Split分割 */}
        {execid ? (
          <div className="resize-box-container" ref={setResizeBoxContainerRef}>
            <ResizeBox.Split
              direction="vertical"
              size={resizeSize}
              style={{ height: '100%', minHeight: 'max-content' }}
              panes={[editorPanel, runningInfoPanel]}
              disabled={!isPanelOpen}
            />
          </div>
        ) : (
          /* 没有execid时只显示编辑器 */
          <div
            className={classNames('pyspark-editor-container', {
              'running-code-mirror': isReadOnly
            })}
          >
            <CodeMirror
              ref={editorRef}
              value={editorContent}
              onChange={handleContentChange}
              placeholder={placeholderValue}
              readOnly={isReadOnly}
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

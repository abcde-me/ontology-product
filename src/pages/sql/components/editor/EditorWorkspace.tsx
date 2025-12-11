import { RunningStatus } from '@/types/sqlApi';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Space,
  Spin
} from '@arco-design/web-react';
import {
  IconBook,
  IconCaretRight,
  IconSave,
  IconStorage,
  IconTag
} from '@arco-design/web-react/icon';
import { sql } from '@codemirror/lang-sql';
import { lintGutter } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import createTheme from '@uiw/codemirror-themes';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'sql-formatter';
import { useUserInfo } from '@/store/userInfoStore';
import styles from './EditorWorkspace.module.scss';

import SQLFormatIcon from '@/assets/sql/sql-format-ico.svg';
import IconStop from '@/assets/sql/sql-stop-icon.svg';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';
import { EditorProvider, useEditorContext } from '../../contexts/EditorContext';
import { FileTab } from '../../hooks/useTabManager';
import RunningInfoPanel from './RunningInfoPanel';
import classNames from 'classnames';
import ModalParamList from '../data-manager/ModalParamList';
import ScriptUpBtn from '@/assets/sql/script-up-btn.svg';
import ScriptSaveBtn from '@/assets/sql/script-save-btn.svg';
import DrawerContent from '../drawer-content';
import { updateSqlScript } from '@/api/sql';
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
  onToScriptList?: (key: string) => void;
  curActiveTab: string;
}

// 内部组件，使用 EditorContext
const EditorWorkspaceContent: React.FC<{
  fileName: string;
  scriptId?: string;
  content: string;
  onInsertContent?: (insertFn: (content: string) => void) => void;
  onEditorFocusChange?: (isFocused: boolean) => void;
  onToScriptList?: (key: string) => void;
  curActiveTab: string;
}> = memo(
  ({
    onInsertContent,
    onEditorFocusChange,
    fileName,
    onToScriptList,
    curActiveTab,
    scriptId,
    content
  }) => {
    const FormItem = Form.Item;
    const userInfo = useUserInfo();
    const [form] = Form.useForm();
    const TextArea = Input.TextArea;
    const editorRef = useRef<ReactCodeMirrorRef>(null);
    const [lastCursorPosition, setLastCursorPosition] =
      React.useState<number>(0);
    const [isEditorFocused, setIsEditorFocused] =
      React.useState<boolean>(false);
    const hasRunPermission = useHasPermission(SQL_PERMISSIONS.RUN);
    const hasUpdatePermission = useHasPermission(SQL_PERMISSIONS.MODIFY);
    const hasCancelRunPermission = useHasPermission(SQL_PERMISSIONS.RUN);
    const [visible, setVisible] = React.useState<boolean>(false);
    const editorContentRef = useRef(null);
    useEffect(() => {
      form.setFieldsValue({
        fileName: fileName
      });
    }, [fileName, form]);
    // 从 Context 获取编辑器状态
    const {
      runStatus,
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
    const handleSeeScriptList = () => {
      if (onToScriptList) {
        onToScriptList('script');
      }
    };
    // 监听插入内容事件
    useEffect(() => {
      if (onInsertContent) {
        // 将插入函数暴露给父组件
        onInsertContent(insertContentAtCursor);
      }
    }, [insertContentAtCursor, onInsertContent]);
    const handleSave = async () => {
      const res = await updateSqlScript(Number(scriptId), {
        uid: userInfo?.id ?? '32020ad2-ef56-4e20-aa0b-4399429bb34c',
        script_name: fileName ?? '',
        script_content: content,
        script_desc: form.getFieldValue('fileDesc')
      });
      if (res?.status === 200) {
        Message.success('保存成功');
        setVisible(false);
      } else {
        Message.error('保存失败');
      }
    };
    return (
      <div className={styles['sql-content']}>
        {/* 顶部工具栏 */}
        <div className={styles['sql-toolbar']}>
          <div className={styles['toolbar-left']}>
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
                      <IconCaretRight className="mr-[4px]" />
                    )
                  }
                  disabled={editorContent?.trim() === ''}
                  onClick={handleRunClick}
                  className={classNames('h-[26px]', {
                    [styles['btn-running']]: runStatus === RunningStatus.RUNNING
                  })}
                >
                  {runStatus === RunningStatus.RUNNING ? '停止运行' : '运行'}
                </Button>
              )}

              <Button
                type="text"
                icon={<SQLFormatIcon />}
                onClick={handleFormatCode}
                className="h-[26px]"
              >
                格式化
              </Button>
            </Space>
          </div>
          <div className={styles['toolbar-right']}>
            {lastAutoSave && (
              <div className={styles['toolbar-right-item']}>
                <Space size={12}>
                  <span className="text-sm text-gray-500">
                    保存时间: {lastAutoSave || '未保存'}
                  </span>
                </Space>
              </div>
            )}
            {curActiveTab === 'files' && (
              <>
                <Button
                  onClick={() => {}}
                  className={styles['toolbar-btn']}
                  icon={<ScriptSaveBtn />}
                  style={{ marginRight: '8px' }}
                >
                  保存
                </Button>
                <Button
                  onClick={() => {}}
                  icon={<ScriptUpBtn />}
                  className={styles['toolbar-btn']}
                >
                  发版
                </Button>
              </>
            )}
            {curActiveTab === 'data' && (
              <Button
                onClick={() => {
                  handleSeeScriptList();
                }}
                className={styles['btn-script-list']}
                disabled={runStatus === RunningStatus.RUNNING}
                icon={<IconStorage />}
              >
                脚本列表
              </Button>
            )}
            {curActiveTab === 'data' && (
              <Button
                className={styles['btn-save']}
                onClick={() => {
                  setVisible(true);
                }}
                icon={<IconSave />}
              >
                保存
              </Button>
            )}
          </div>
        </div>

        {/* 编辑器区域 */}

        <div
          ref={editorContentRef}
          className={classNames(styles['sql-editor-container'], {
            [styles['running-code-mirror']]: !hasUpdatePermission
          })}
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
              className={styles['code-editor']}
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
        {/* 保存查询列表 */}
        <Modal
          title="保存到查询脚本列表"
          visible={visible}
          onOk={() => setVisible(false)}
          onCancel={() => setVisible(false)}
          autoFocus={false}
          focusLock={true}
          footer={[
            <>
              <Button onClick={() => setVisible(false)}>取消</Button>
              <Button onClick={handleSave} type="primary" htmlType="submit">
                保存
              </Button>
            </>
          ]}
        >
          <Form form={form}>
            <FormItem label="SQL脚本名称:" required={true} field="fileName">
              <Input
                defaultValue={fileName}
                style={{ width: 300 }}
                placeholder="请输入脚本名称"
              />
            </FormItem>
            <FormItem label="脚本说明:" field="fileDesc">
              <Input style={{ width: 300 }} placeholder="请输入脚本说明" />
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
);

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
    selectFile,
    onToScriptList,
    curActiveTab
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
          curActiveTab={curActiveTab}
          fileName={fileName}
          scriptId={currentScriptId}
          content={content}
          onToScriptList={onToScriptList}
          onInsertContent={onInsertContent}
          onEditorFocusChange={onEditorFocusChange}
        />
      </EditorProvider>
    );
  }
);

NotebookWorkspace.displayName = 'NotebookWorkspace';

export default NotebookWorkspace;

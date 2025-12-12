import { RunningStatus } from '@/types/sqlApi';
import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  Message,
  Modal,
  Space,
  Spin
} from '@arco-design/web-react';
import {
  IconBook,
  IconCaretRight,
  IconClose,
  IconCopy,
  IconDown,
  IconEdit,
  IconSave,
  IconStop,
  IconStorage
} from '@arco-design/web-react/icon';
import { sql } from '@codemirror/lang-sql';
import { lintGutter } from '@codemirror/lint';
import { EditorView, Decoration } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';
import createTheme from '@uiw/codemirror-themes';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { format } from 'sql-formatter';
import styles from './EditorWorkspace.module.scss';
import { ScriptStatus } from '@/types/sqlDevelopApi';

import SQLFormatIcon from '@/assets/sql/sql-format-ico.svg';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';
import { copyDevelopScript } from '@/api/sql-develop';
import {
  EditorProvider,
  useEditorContext
} from '../../contexts/DevelopScriptEditorContext';
import { FileTab } from '../../hooks/useDevelopScriptTabManager';
import RunningInfoPanel from './RunningInfoPanel';
import classNames from 'classnames';
import ModalParamList from '../data-manager/ModalParamList';
import ReleaseVersionModal from './ReleaseVersionModal';
import ParameterSidebar from './ParameterSidebar';
import SpecificationsModal from './SpecificationsModal';
import { ScriptParam } from '@/types/sqlDevelopApi';
import ReleaseIcon from '../../assets/release-icon.svg';
import dayjs from 'dayjs';

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

// 定义用于高亮参数的效果
const highlightParameterEffect = StateEffect.define<string | null>();

// 创建参数高亮的装饰样式
const parameterHighlightMark = Decoration.mark({
  attributes: { style: 'background-color: rgba(0, 125, 250, 0.2);' }
});

// 存储当前高亮的参数名
const currentHighlightedParam = StateField.define<string | null>({
  create() {
    return null;
  },
  update(value, tr) {
    // 检查是否有高亮效果
    for (const effect of tr.effects) {
      if (effect.is(highlightParameterEffect)) {
        return effect.value;
      }
    }
    return value;
  }
});

// 创建参数高亮的StateField
const parameterHighlightField = StateField.define({
  create(state) {
    return Decoration.none;
  },
  update(decorations, tr) {
    // 获取当前高亮的参数名
    const paramName = tr.state.field(currentHighlightedParam);

    // 如果有文档变化或参数变化，重新计算高亮
    if (
      tr.docChanged ||
      tr.effects.some((e) => e.is(highlightParameterEffect))
    ) {
      if (!paramName) {
        // 清除高亮
        return Decoration.none;
      }

      // 查找所有匹配的参数引用
      const text = tr.state.doc.toString();
      const regex = new RegExp(
        `\\$\\{${paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`,
        'g'
      );
      const ranges: Array<{ from: number; to: number }> = [];
      let match;

      while ((match = regex.exec(text)) !== null) {
        const from = match.index;
        const to = from + match[0].length;
        ranges.push({ from, to });
      }

      return Decoration.set(
        ranges.map(({ from, to }) => parameterHighlightMark.range(from, to))
      );
    }

    // 如果没有文档变化，只需要更新装饰位置
    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f)
});

// 内部组件，使用 EditorContext
const EditorWorkspaceContent: React.FC<{
  fileName: string;
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
    curActiveTab
  }) => {
    const FormItem = Form.Item;
    const [form] = Form.useForm();
    const editorRef = useRef<ReactCodeMirrorRef>(null);
    const [lastCursorPosition, setLastCursorPosition] =
      React.useState<number>(0);
    const [isEditorFocused, setIsEditorFocused] =
      React.useState<boolean>(false);
    const hasRunPermission = useHasPermission(SQL_PERMISSIONS.RUN);
    const hasUpdatePermission = useHasPermission(SQL_PERMISSIONS.MODIFY);
    const hasCancelRunPermission = useHasPermission(SQL_PERMISSIONS.RUN);
    const [visible, setVisible] = React.useState<boolean>(false);
    const [specificationsVisible, setSpecificationsVisible] =
      React.useState<boolean>(false);
    const [specificationsContent, setSpecificationsContent] =
      React.useState<string>('');
    const [paramVisible, setParamVisible] = React.useState<boolean>(false);
    const [releaseVersionVisible, setReleaseVersionVisible] =
      React.useState<boolean>(false);
    const [sidebarVisible, setSidebarVisible] = React.useState<boolean>(false);
    const [sidebarCollapsed, setSidebarCollapsed] =
      React.useState<boolean>(false);
    const [systemParamKeys, setSystemParamKeys] = React.useState<Set<string>>(
      new Set()
    );
    const [editLoading, setEditLoading] = React.useState<boolean>(false);
    const [saveLoading, setSaveLoading] = React.useState<boolean>(false);
    const [copyLoading, setCopyLoading] = React.useState<boolean>(false);
    const [copyDropdownVisible, setCopyDropdownVisible] =
      React.useState<boolean>(false);

    // 从 Context 获取编辑器状态
    const {
      scriptInfo,
      setScriptInfo,
      runStatus,
      runDuration,
      runStartTime,
      handleStopRunCode,
      handleRunCode,
      lastAutoSave,
      // editorContent,
      handleContentChange,
      handleSaveScript,
      handleEditScript,
      handleUnlockScript,
      placeholderValue,
      runResult,
      execid,
      isPanelOpen,
      handlePanelStateChange,
      handleReleaseScript,
      getPrevRunStatus,
      lastScriptRunStatus
      // scriptParams,
      // setScriptParams
    } = useEditorContext();

    // 处理参数hover事件
    const handleParameterHover = useCallback((paramName: string | null) => {
      if (!editorRef.current?.view) return;

      const view = editorRef.current.view;
      view.dispatch({
        effects: highlightParameterEffect.of(paramName)
      });
    }, []);

    // 处理参数变化：直接更新 scriptParams
    const handleParameterChange = useCallback(
      (params: ScriptParam[]) => {
        setScriptInfo((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            script_params: params
          };
        });
      },
      [setScriptInfo]
    );

    // 使用 useMemo 稳定 initialParams 的引用，避免不必要的重新渲染
    // 使用 JSON.stringify 来比较内容，而不是引用
    // const scriptParamsStr = useMemo(
    //   () => JSON.stringify(scriptParams),
    //   [scriptParams]
    // );
    // const initialParams = useMemo(() => {
    //   console.log('scriptParams-----', scriptParams);
    //   return scriptParams;
    // }, [scriptParamsStr]);

    useEffect(() => {
      form.setFieldsValue({
        fileName: fileName
      });
    }, [fileName, form]);

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

      if (scriptInfo?.script_context) {
        try {
          const formattedCode = format(scriptInfo?.script_context ?? '', {
            language: 'sql'
          });
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

    const handleSpecificationsSave = (content: string) => {
      setSpecificationsContent(content);
    };

    // 处理复制脚本为新版本/新脚本
    const handleCopyScript = async (type: 'newVersion' | 'newScript') => {
      if (!scriptInfo?.script_id) {
        Message.warning('暂无可复制的脚本');
        return;
      }

      const params: { script_id: number; version?: number } = {
        script_id: scriptInfo.script_id
      };

      if (type === 'newVersion' && scriptInfo?.max_version) {
        params.version = scriptInfo.max_version;
      }

      try {
        setCopyLoading(true);
        const res = await copyDevelopScript(params);
        if (res.status === 200) {
          Message.success(
            type === 'newVersion' ? '复制为新版本成功' : '复制为新脚本成功'
          );
        } else {
          Message.error(res.message || '复制失败');
        }
      } catch (error) {
        console.error('复制失败:', error);
        Message.error('复制失败');
      } finally {
        setCopyLoading(false);
        setCopyDropdownVisible(false);
      }
    };

    // 处理开始编辑
    const handleStartEdit = async () => {
      setEditLoading(true);
      await handleEditScript();
      setEditLoading(false);
    };

    // 处理取消编辑
    const handleCancelEdit = async () => {
      setEditLoading(true);
      await handleUnlockScript();
      setEditLoading(false);
    };

    const handleSave = async () => {
      setSaveLoading(true);
      await handleSaveScript(scriptInfo?.script_context ?? '');
      setSaveLoading(false);
    };

    // 格式化时间显示
    // const formatTime = (timeStr?: string) => {
    //   return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss');
    // };

    // 根据状态判断是否可编辑
    // 如果没有 scriptInfo，默认视为编辑状态且可编辑（新创建的脚本）
    // const canEdit = !scriptInfo || (scriptInfo?.status === ScriptStatus.Editing && scriptInfo?.isSelfEditing);
    // const isEditing = !scriptInfo || scriptInfo?.status === ScriptStatus.Editing;
    // const isEditCompleted = scriptInfo?.status === ScriptStatus.EditCompleted;
    // const isReleased = scriptInfo?.status === ScriptStatus.Released;
    // const isScheduling = scriptInfo?.status === ScriptStatus.Scheduling;

    // 根据 status 渲染工具栏
    const renderToolbar = () => {
      const status = scriptInfo?.status ?? ScriptStatus.Editing;
      const canEdit =
        scriptInfo?.status === ScriptStatus.Editing ||
        scriptInfo?.status === ScriptStatus.EditCompleted;
      const isEditing = status === ScriptStatus.Editing;
      const isEditCompleted = status === ScriptStatus.EditCompleted;
      const copyMenu = (
        <Menu
          onClickMenuItem={(key) =>
            handleCopyScript(key as 'newVersion' | 'newScript')
          }
          className={styles['copy-dropdown']}
          selectable={false}
        >
          <Menu.Item key="newVersion">
            <div className="flex h-[22px] items-center text-[14px] text-[var(--color-text-1)]">
              <IconCopy className="mr-[4px]" />
              <span className="font-bold">复制为新版本</span>
            </div>
            <div className="mt-[4px] h-[18px] text-[12px] text-[var(--color-text-3)]">
              以此脚本为基础迭代新版本
            </div>
          </Menu.Item>
          <Menu.Item key="newScript">
            <div className="flex h-[22px] items-center text-[14px] text-[var(--color-text-1)]">
              <IconCopy className="mr-[4px]" />
              <span className="font-bold">复制为新脚本</span>
            </div>
            <div className="mt-[4px] h-[18px] text-[12px] text-[var(--color-text-3)]">
              以此脚本为基础新建脚本
            </div>
          </Menu.Item>
        </Menu>
      );

      const renderCopyDropdown = () => (
        <Dropdown
          trigger={['hover', 'click']}
          droplist={copyMenu}
          position="br"
          onVisibleChange={setCopyDropdownVisible}
        >
          <Button
            loading={copyLoading}
            disabled={!scriptInfo?.script_id}
            className="h-[24px]"
          >
            <span>复制</span>
            <IconDown className="text-[14px]" />
          </Button>
        </Dropdown>
      );

      // status = 0 (编辑中) 或 status = 1 (编辑完成)
      if (
        status === ScriptStatus.Editing ||
        status === ScriptStatus.EditCompleted
      ) {
        return (
          <>
            <div className={styles['toolbar-left']}>
              <Space size={12}>
                {/* 运行按钮 - status=0且isSelfEditing=true时可用，否则置灰 */}
                {canEdit &&
                  ((hasRunPermission && runStatus !== RunningStatus.RUNNING) ||
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
                      disabled={scriptInfo?.script_context?.trim() === ''}
                      onClick={handleRunClick}
                      className={classNames('h-[26px]', {
                        [styles['btn-running']]:
                          runStatus === RunningStatus.RUNNING
                      })}
                    >
                      {runStatus === RunningStatus.RUNNING
                        ? '停止运行'
                        : '运行'}
                    </Button>
                  )}
                {/* {canEdit && (
                  <Button
                    type="primary"
                    disabled={!scriptInfo?.isSelfEditing}
                    icon={<IconCaretRight className="mr-[4px]" />}
                    className="h-[26px]"
                  >
                    运行
                  </Button>
                )} */}

                {/* 格式化按钮 - status=0且isSelfEditing=true时可用，否则置灰 */}
                <Button
                  type="text"
                  icon={<SQLFormatIcon />}
                  onClick={handleFormatCode}
                  disabled={!scriptInfo?.isSelfEditing}
                  className="h-[26px]"
                >
                  格式化
                </Button>

                {/* 开发规范按钮 - 始终显示 */}
                {curActiveTab === 'files' && (
                  <>
                    <Button
                      type="text"
                      icon={<IconBook />}
                      onClick={() => setSpecificationsVisible(true)}
                      className="h-[26px]"
                    >
                      开发规范
                    </Button>
                    {/* 参数列表按钮 - 始终显示 */}
                    <Button
                      type="text"
                      icon={<IconStorage />}
                      onClick={() => setParamVisible(true)}
                      className="h-[26px]"
                    >
                      参数列表
                    </Button>
                  </>
                )}
              </Space>
            </div>
            <div className={styles['toolbar-right']}>
              {/* 保存时间 - 始终显示 */}
              {scriptInfo?.update_time && (
                <div className={styles['toolbar-right-item']}>
                  <Space size={12}>
                    <span className="text-sm text-gray-500">
                      保存时间:{' '}
                      {dayjs(scriptInfo?.update_time).format(
                        'YYYY-MM-DD HH:mm:ss'
                      ) || '未保存'}
                    </span>
                  </Space>
                </div>
              )}
              {/* 保存按钮 - status=0且isSelfEditing=true时可用，否则置灰 */}
              <Button
                className={classNames(styles['btn-save'], 'mr-[8px]')}
                loading={saveLoading}
                onClick={handleSave}
                disabled={!canEdit}
                icon={<IconSave />}
              >
                保存
              </Button>
              {/* 发版按钮 - status=0且isSelfEditing=true时可用，否则置灰 */}
              <Button
                className={styles['btn-save']}
                onClick={() => {
                  setReleaseVersionVisible(true);
                }}
                disabled={!canEdit}
                icon={<ReleaseIcon />}
              >
                发版
              </Button>
              {/* 取消编辑按钮 - status=0且isSelfEditing=true时显示 */}
              {scriptInfo?.isSelfEditing && (
                <Button
                  className={classNames(styles['btn-save'], 'ml-[8px]')}
                  loading={editLoading}
                  onClick={handleCancelEdit}
                  icon={<IconClose />}
                >
                  取消编辑
                </Button>
              )}
              {/* 编辑按钮 - status=0且isSelfEditing=false或status=1时显示 */}
              {!scriptInfo?.isSelfEditing && (
                <Button
                  className={classNames(styles['btn-save'], 'ml-[8px]')}
                  onClick={handleStartEdit}
                  loading={editLoading}
                  icon={<IconEdit />}
                >
                  编辑
                </Button>
              )}
            </div>
          </>
        );
      }

      // status = 2 (已发版)
      if (status === ScriptStatus.Released) {
        return (
          <>
            <div className={styles['toolbar-left']}>
              <Space size={12}>
                <span className="text-sm">已发版</span>
                <span className="text-sm text-gray-500">
                  发版人: {scriptInfo?.release_user || '-'}
                </span>
                <span className="text-sm text-gray-500">
                  发版时间:{' '}
                  {scriptInfo?.release_time
                    ? dayjs(scriptInfo.release_time).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )
                    : '-'}
                </span>
              </Space>
            </div>
            <div
              className={classNames(
                styles['toolbar-right'],
                styles['copy-dropdown-container']
              )}
            >
              {renderCopyDropdown()}
            </div>
          </>
        );
      }

      // status = 3 (调度中)
      if (status === ScriptStatus.Scheduling) {
        return (
          <>
            <div className={styles['toolbar-left']}>
              <Space size={12}>
                <span className="text-sm">调度中</span>
                <span className="text-sm text-gray-500">
                  发版人: {scriptInfo?.release_user || '-'}
                </span>
                <span className="text-sm text-gray-500">
                  发版时间:{' '}
                  {scriptInfo?.release_time
                    ? dayjs(scriptInfo.release_time).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )
                    : '-'}
                </span>
              </Space>
            </div>
            <div
              className={classNames(
                styles['toolbar-right'],
                styles['copy-dropdown-container']
              )}
            >
              {renderCopyDropdown()}
            </div>
          </>
        );
      }

      // 默认情况（不应该到达这里，但为了安全起见）
      return null;
    };

    return (
      <div className={styles['sql-content']}>
        {/* 顶部工具栏 */}
        <div className={styles['sql-toolbar']}>{renderToolbar()}</div>

        {/* 编辑器区域 */}

        <div
          className={classNames(styles['sql-editor-container'], {
            [styles['running-code-mirror']]: !hasUpdatePermission,
            [styles['with-sidebar']]: sidebarVisible && !sidebarCollapsed
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
              value={scriptInfo?.script_context ?? ''}
              onChange={handleContentChange}
              placeholder={placeholderValue}
              readOnly={
                !hasUpdatePermission ||
                runStatus === RunningStatus.RUNNING ||
                !scriptInfo?.isSelfEditing
              }
              theme={myTheme}
              extensions={[
                sql({ upperCaseKeywords: true }),
                lintGutter(),
                currentHighlightedParam,
                parameterHighlightField,
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

          {/* 参数侧边栏 */}
          {
            // sidebarVisible && (
            <ParameterSidebar
              canEdit={scriptInfo?.isSelfEditing ?? false}
              content={scriptInfo?.script_context ?? ''}
              onParameterChange={handleParameterChange}
              onVisibleChange={setSidebarVisible}
              onCollapsedChange={setSidebarCollapsed}
              onParameterHover={handleParameterHover}
              initialParams={scriptInfo?.script_params ?? []}
              systemParamKeys={systemParamKeys}
            />
            // )
          }
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
              <Button type="primary" htmlType="submit">
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
        {/* 开发规范 */}
        {specificationsVisible && (
          <SpecificationsModal
            visible={specificationsVisible}
            onCancel={() => setSpecificationsVisible(false)}
            initialContent={specificationsContent}
            onSave={handleSpecificationsSave}
          />
        )}
        {paramVisible && (
          <ModalParamList
            paramVisible={paramVisible}
            onCancel={() => setParamVisible(false)}
          />
        )}
        {/* 发布版本弹窗 */}
        {releaseVersionVisible && (
          <ReleaseVersionModal
            visible={releaseVersionVisible}
            onCancel={() => setReleaseVersionVisible(false)}
            onSubmit={async (values) => {
              const res = await handleReleaseScript(values.versionDesc ?? '');
              if (res) {
                // 成功再关闭弹窗
                setReleaseVersionVisible(false);
              }
            }}
            initialValues={{
              scriptName: scriptInfo?.script_name || '',
              version: scriptInfo?.max_version_name || 'V1',
              versionDesc: scriptInfo?.script_desc ?? ''
            }}
          />
        )}
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

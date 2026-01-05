import React, { memo, useRef, useCallback } from 'react';
import { Tabs, Message, Modal } from '@arco-design/web-react';
import EditorWorkspace from './EditorWorkspace';
import NoData from '@/components/no-data';
import { FileTab } from '../../hooks/useTabManager';
import styles from './index.module.scss';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';
import { NoDataCard } from '@ceai-front/arco-material';

const { TabPane } = Tabs;

interface EditorContentProps {
  fileTabs: Array<FileTab>;
  activeTab: string;
  onTabChange: (key: string) => void;
  onAddTab: (newFileInfo: any) => void;
  onRemoveTab: (key: string) => void;
  onCreate?: (finalName: string, node?: any) => Promise<any>; // 修改：改为 onCreate 以匹配父组件
  onActiveUpdate?: (tabData: any) => void;
  onInsertContent?: (insertFn: (content: string) => void) => void;
  onEditorFocusChange?: (isFocused: boolean) => void;
  // refreshDirectory?: () => void;
  // selectFile?: (fileId: string) => void;
  onToScriptList?: (key: string) => void;
  curActiveTab: string;
  fileManagerSelectedKeys: string[];
  // openFile: (scriptId: string) => void;
}

const EditorContent: React.FC<EditorContentProps> = memo(
  ({
    fileTabs,
    activeTab,
    onTabChange,
    onAddTab,
    onRemoveTab,
    onCreate,
    onActiveUpdate,
    onInsertContent,
    onEditorFocusChange,
    // refreshDirectory,
    // selectFile,
    onToScriptList,
    curActiveTab,
    fileManagerSelectedKeys
    // openFile
  }) => {
    // 获取当前活动标签页
    const activeTabData = fileTabs.find((tab) => tab.key === activeTab);

    const hasCreatePermission = useHasPermission(
      SQL_PERMISSIONS.QUERY_SCRIPT_CREATE
    );

    // 用于存储检查未保存更改的函数
    const checkUnsavedChangesRef = useRef<(() => boolean) | null>(null);

    // 显示确认框的通用函数
    const showConfirmModal = useCallback((onConfirm: () => void) => {
      Modal.confirm({
        title: '确定关闭此脚本吗?',
        content: '关闭后,将不会保存本次编辑',
        okText: '确定',
        cancelText: '取消',
        onOk: onConfirm,
        onCancel: () => {
          // 取消操作，不做任何处理
        }
      });
    }, []);

    const handleTabChange = (key: string) => {
      onTabChange(key);
    };

    // 创建 SQL查询文件（等同于 DirectoryTree 的新建功能）
    const handleCreateSqlQuery = async () => {
      // 检查标签页数量限制
      if (fileTabs.length >= 20) {
        Message.error('最多只能打开20个标签页，请先关闭一些标签页');
        return;
      }

      if (!onCreate) {
        Message.error('创建功能未配置');
        return;
      }

      try {
        // 调用父组件的创建逻辑
        await onCreate('', {}); // 传递空字符串和空对象作为默认参数
      } catch (error) {
        console.error('创建 SQL查询文件失败:', error);
        Message.error('创建失败');
      }
    };

    const handleCloseTab = (key: string) => {
      // 检查是否有未保存的更改
      if (checkUnsavedChangesRef.current && checkUnsavedChangesRef.current()) {
        showConfirmModal(() => {
          onRemoveTab(key);
        });
      } else {
        onRemoveTab(key);
      }
    };

    // 处理检查函数变化
    const handleHasUnsavedChangesChange = useCallback(
      (checkFn: (() => boolean) | null) => {
        checkUnsavedChangesRef.current = checkFn;
      },
      []
    );

    // useEffect(() => {
    //   if (fileManagerSelectedKeys.length > 0) {
    //     openFile && openFile(fileManagerSelectedKeys[0]);
    //   }
    // }, [fileManagerSelectedKeys]);

    // 如果没有活动标签页，显示空状态
    if (!activeTabData) {
      return (
        <div className={styles['sql-main-content']}>
          {/* 头部标签页区域 - 即使没有内容也保留 */}
          <Tabs
            activeTab={activeTab}
            onChange={handleTabChange}
            className={`${styles['sql-tabs']} ${styles['empty-tabs']}`}
            type="card"
            showAddButton={hasCreatePermission}
            onAddTab={handleCreateSqlQuery}
            onDeleteTab={handleCloseTab}
            editable
          >
            {fileTabs.map((tab) => (
              <TabPane
                key={tab.key}
                title={tab.title}
                closable={fileTabs.length > 1}
              >
                {/* 标签页内容为空，实际内容在工作区 */}
              </TabPane>
            ))}
          </Tabs>

          {/* 无数据状态显示区域 */}
          <div className={styles['empty-content-area']}>
            <NoDataCard
              title="未选择查询脚本"
              {...(hasCreatePermission && {
                primaryBtnProps: {
                  text: '新建查询脚本',
                  onClick: handleCreateSqlQuery
                }
              })}
            />
          </div>
        </div>
      );
    }

    function handleActiveUpdate(tabData) {
      onActiveUpdate && onActiveUpdate({ ...tabData });
    }

    return (
      <div className={styles['sql-main-content']}>
        {/* 头部标签页区域 */}
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          className={styles['sql-tabs']}
          type="card"
          showAddButton={hasCreatePermission}
          onAddTab={handleCreateSqlQuery}
          onDeleteTab={handleCloseTab}
          editable
          destroyOnHide
        >
          {fileTabs.map((tab) => (
            <TabPane
              key={tab.key}
              title={tab.title}
              closable={fileTabs.length > 1}
            >
              {/* 标签页内容为空，实际内容在工作区 */}
            </TabPane>
          ))}
        </Tabs>
        {/* 工作区 */}
        <div className={styles['sql-main-workspace']}>
          <EditorWorkspace
            key={activeTabData.key} // 使用activeTabData.key作为key，确保组件正确更新
            content={activeTabData.content}
            fileName={activeTabData.title || '未命名文件'}
            currentFileId={activeTabData.fileId}
            currentScriptId={activeTabData.scriptId}
            hasRun={activeTabData.hasRun}
            tabKey={activeTabData.key}
            onActiveUpdate={handleActiveUpdate}
            onInsertContent={onInsertContent}
            onEditorFocusChange={onEditorFocusChange}
            // refreshDirectory={refreshDirectory}
            // selectFile={selectFile}
            onToScriptList={onToScriptList}
            curActiveTab={curActiveTab}
            onHasUnsavedChangesChange={handleHasUnsavedChangesChange}
            onRemoveTab={onRemoveTab}
          />
        </div>
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';

export default EditorContent;

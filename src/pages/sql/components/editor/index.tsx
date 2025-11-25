import React, { memo } from 'react';
import { Tabs, Message } from '@arco-design/web-react';
import EditorWorkspace from './EditorWorkspace';
import NoData from '@/components/no-data';
import { FileTab } from '../../hooks/useTabManager';
import styles from './index.module.scss';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { useHasPermission } from '@/store/userInfoStore';

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
  refreshDirectory?: () => void;
  selectFile?: (fileId: string) => void;
  onToScriptList?: (key: string) => void;
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
    refreshDirectory,
    selectFile,
    onToScriptList
  }) => {
    // 获取当前活动标签页
    const activeTabData = fileTabs.find((tab) => tab.key === activeTab);

    const hasCreatePermission = useHasPermission(SQL_PERMISSIONS.CREATE);

    const handleTabChange = (key: string) => {
      onTabChange(key);
    };

    // 创建 SQL查询文件（等同于 DirectoryTree 的新建功能）
    const handleCreateSqlQuery = () => {
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
        onCreate('', {}); // 传递空字符串和空对象作为默认参数
      } catch (error) {
        console.error('创建 SQL查询文件失败:', error);
        Message.error('创建失败');
      }
    };

    const handleCloseTab = (key: string) => {
      onRemoveTab(key);
    };

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
            <NoData
              description="暂无数据"
              btnText="新建SQL查询"
              handleBtn={handleCreateSqlQuery}
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
            refreshDirectory={refreshDirectory}
            selectFile={selectFile}
            onToScriptList={onToScriptList}
          />
        </div>
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';

export default EditorContent;

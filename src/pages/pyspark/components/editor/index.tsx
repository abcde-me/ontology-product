import React, { memo } from 'react';
import { Tabs, Message } from '@arco-design/web-react';
import EditorWorkspace from './EditorWorkspace';
import NoData from '@/components/no-data';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import './index.scss';

const { TabPane } = Tabs;

// 简化的props接口
interface EditorContentProps {
  fileTabs: Array<{
    key: string;
    title: string;
    content: string;
    fileId?: string;
    perms?: Array<string>;
  }>;
  activeTab: string;
  onTabChange: (key: string) => void;
  onAddTab: (newFileInfo: any) => void;
  onRemoveTab: (key: string) => void;
  onCreate?: (finalName: string, node?: any) => Promise<any>;
  onTabContentUpdate?: (tabKey: string, content: string) => void;
  onSidebarTabChange?: (tabKey: 'files' | 'tools' | 'data' | 'daset') => void;
  onInsertContent?: (insertFn: (content: string) => void) => void;
  onEditorFocusChange?: (isFocused: boolean) => void;
  refreshDirectory?: () => Promise<void>;
  selectFile?: (fileId: string) => void;
  isCanCreate?: boolean; // 添加创建权限属性
}

const EditorContent: React.FC<EditorContentProps> = memo(
  ({
    fileTabs,
    activeTab,
    onTabChange,
    onRemoveTab,
    onCreate,
    onTabContentUpdate,
    onSidebarTabChange,
    onInsertContent,
    onEditorFocusChange,
    isCanCreate = true // 添加 isCanCreate 参数，默认值为 true
  }) => {
    // 获取当前活动标签页
    const activeTabData = fileTabs.find((tab) => tab.key === activeTab);

    const handleTabChange = (key: string) => {
      onTabChange(key);
    };

    // 创建 PySpark 文件（与标签页新建逻辑一致，但固定使用根目录）
    const handleCreatePySpark = async () => {
      if (!onCreate) {
        Message.error('创建功能未配置');
        return;
      }

      try {
        // 生成默认文件名
        const defaultName = `新建PySpark_${Date.now()}`;

        // 调用父组件的创建逻辑，传递默认文件名和根目录信息
        // handleCreate 方法内部已经包含了刷新目录、选中文件和打开文件的逻辑
        await onCreate(defaultName, { id: '0' }); // 固定使用根目录ID为'0'
      } catch (error) {
        console.error('创建 PySpark 文件失败:', error);
        Message.error('创建失败');
      }
    };

    const handleCloseTab = (key: string) => {
      onRemoveTab(key);
    };

    // isCanCreate 现在通过 props 传入

    // 如果没有活动标签页，显示空状态
    if (!activeTabData) {
      return (
        <div className="notebook-main-content">
          {/* 头部标签页区域 - 即使没有内容也保留 */}
          <Tabs
            activeTab={activeTab}
            onChange={handleTabChange}
            className="notebook-tabs"
            type="card"
            showAddButton={isCanCreate}
            onAddTab={handleCreatePySpark}
            onDeleteTab={handleCloseTab}
            editable
          >
            {fileTabs.map((tab) => (
              <TabPane
                key={tab.key}
                title={
                  <EllipsisPopover
                    value={tab.title}
                    // preferTypography
                    className="tab-title-ellipsis"
                    ellipsis={{
                      rows: 1,
                      showTooltip: true
                    }}
                  />
                }
                closable={fileTabs.length > 1}
              >
                {/* 标签页内容为空，实际内容在工作区 */}
              </TabPane>
            ))}
          </Tabs>

          {/* 无数据状态显示区域 */}
          <div className="empty-content-area">
            <NoData
              description="暂无数据"
              btnText={isCanCreate ? '新建PySpark文件' : ''}
              handleBtn={handleCreatePySpark}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="notebook-main-content">
        {/* 头部标签页区域 */}
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          className="notebook-tabs"
          type="card"
          showAddButton={isCanCreate}
          onAddTab={handleCreatePySpark}
          onDeleteTab={handleCloseTab}
          editable
        >
          {fileTabs.map((tab) => (
            <TabPane
              key={tab.key}
              title={
                <EllipsisPopover
                  value={tab.title}
                  // preferTypography
                  className="tab-title-ellipsis"
                // ellipsis={{
                //   rows: 1,
                //   showTooltip: true
                // }}
                />
              }
              closable={fileTabs.length > 1}
            >
              {/* 标签页内容为空，实际内容在工作区 */}
            </TabPane>
          ))}
        </Tabs>

        {/* 工作区 */}
        <div className="main-workspace">
          <EditorWorkspace
            key={activeTabData.key}
            content={activeTabData.content}
            fileName={activeTabData.title || '未命名文件'}
            currentFileId={activeTabData.fileId}
            activeTab={activeTab}
            fileTabs={fileTabs}
            onTabContentUpdate={onTabContentUpdate}
            onSidebarTabChange={onSidebarTabChange}
            onInsertContent={onInsertContent}
            onEditorFocusChange={onEditorFocusChange}
          />
        </div>
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';

export default EditorContent;

import React, { useEffect } from 'react';
import { Spin } from '@arco-design/web-react';
import { useAIWorkbenchStore } from './store';
import { useOntologyManagement } from './hooks/useOntologyManagement';
import SceneModal from '@/pages/ontologyScene/modules/list/components/SceneModal';
import EmptyState from './components/EmptyState';
import OntologySelector from './components/OntologySelector';
import ChatPanel from './components/ChatPanel';
import GraphPanel from './components/GraphPanel';
import ResizableLayout from './components/ResizableLayout';

/**
 * AI 本体工作台
 */
const AIOntoWorkbench: React.FC = () => {
  const { ontologyList, ontologyListLoading, currentOntology } =
    useAIWorkbenchStore();

  const {
    createModalVisible,
    createLoading,
    loadOntologyList,
    handleCreateOntology,
    openCreateModal,
    closeCreateModal
  } = useOntologyManagement();

  // 初始化
  useEffect(() => {
    // TODO: 收起左侧菜单 - 需要与布局组件集成
    // setLeftMenuCollapsed(true);

    // 加载本体列表
    loadOntologyList();

    // 组件卸载时恢复左侧菜单
    // return () => {
    //   setLeftMenuCollapsed(false);
    // };
  }, [loadOntologyList]);

  // 判断是否为空状态
  const isEmpty = !ontologyListLoading && ontologyList.length === 0;

  // Loading 状态
  if (ontologyListLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <Spin />
      </div>
    );
  }

  // 空状态
  if (isEmpty) {
    return (
      <>
        <EmptyState onCreateClick={openCreateModal} />
        <SceneModal
          visible={createModalVisible}
          mode="create"
          onSubmit={handleCreateOntology}
          onCancel={closeCreateModal}
          loading={createLoading}
          existingSceneIcons={ontologyList.map((item) => item.icon || '')}
        />
      </>
    );
  }

  // 有数据状态
  return (
    <div className="flex h-full w-full flex-col bg-[#f8f9fc]">
      {/* 顶部工具栏 */}
      <div
        className="flex h-[56px] items-center px-[24px]"
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.08))' }}
      >
        <OntologySelector />
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden p-[24px] pb-[16px] pt-[0px]">
        <ResizableLayout
          leftContent={
            <ChatPanel
              appId="app-0k38vxsv"
              onConversationCreated={(conversationId) => {
                console.log('会话创建:', conversationId);
                // TODO: 保存会话 ID
              }}
            />
          }
          rightContent={<GraphPanel />}
          defaultLeftWidth={400}
          minLeftWidth={300}
          maxLeftWidth={600}
        />
      </div>
    </div>
  );
};

export default AIOntoWorkbench;

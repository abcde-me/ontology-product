import React, { useEffect } from 'react';
import { Spin } from '@arco-design/web-react';
import { useAIWorkbenchStore } from './store';
import { useOntologyManagement } from './hooks/useOntologyManagement';
import { useUserInfoStore } from '@/store/userInfoStore';
import SceneModal from '@/pages/ontologyScene/modules/list/components/SceneModal';
import EmptyState from './components/EmptyState';
import OntologySelector from './components/OntologySelector';
import ChatPanel from './components/ChatPanel';
import GraphPanel from './components/GraphPanel';
import ResizableLayout from './components/ResizableLayout';
import { useAIWorkbenchGraphStore } from './components/AIWorkbenchGraph/store';

/**
 * AI 本体工作台
 */
const AIOntoWorkbench: React.FC = () => {
  const { ontologyList, ontologyListLoading, currentOntology } =
    useAIWorkbenchStore();

  // 从 userInfoStore 获取 projectId
  const projectId = useUserInfoStore((state) => state.projectId);

  const {
    createModalVisible,
    createLoading,
    loadOntologyList,
    handleCreateOntology,
    openCreateModal,
    closeCreateModal,
    ensureOntologyAgent
  } = useOntologyManagement();

  // 图谱刷新 key
  const [graphRefreshKey, setGraphRefreshKey] = React.useState(0);

  // 当前本体的 appID
  const [currentAppID, setCurrentAppID] = React.useState<string | undefined>(
    undefined
  );

  // 图谱刷新回调
  const handleGraphRefresh = React.useCallback(() => {
    console.log('[AIOntoWorkbench] 触发图谱刷新');
    setGraphRefreshKey((prev) => prev + 1);
  }, []);

  // 节点定位回调
  const handleLocateNode = React.useCallback((code: string) => {
    console.log('[AIOntoWorkbench] 定位节点，code:', code);
    // 通过图谱 store 触发高亮
    const { highlightNode } = useAIWorkbenchGraphStore.getState();
    highlightNode(code);
  }, []);

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

  // 监听当前本体变化，检查并创建 Agent
  useEffect(() => {
    if (currentOntology) {
      console.log(
        '[AIOntoWorkbench] 当前本体变化:',
        currentOntology.id,
        currentOntology.name,
        'appID:',
        currentOntology.appID
      );

      // 如果本体已经有 appID，直接使用
      if (currentOntology.appID) {
        console.log(
          '[AIOntoWorkbench] 本体已有 appID，直接使用:',
          currentOntology.appID
        );
        setCurrentAppID(currentOntology.appID);
      } else {
        // 如果没有 appID，调用接口创建
        console.log('[AIOntoWorkbench] 本体没有 appID，开始创建...');
        ensureOntologyAgent(currentOntology).then((appID) => {
          if (appID) {
            console.log('[AIOntoWorkbench] Agent 创建成功，appID:', appID);
            setCurrentAppID(appID);
          } else {
            console.error('[AIOntoWorkbench] Agent 创建失败');
            setCurrentAppID(undefined);
          }
        });
      }
    } else {
      console.log('[AIOntoWorkbench] 没有当前本体，清空 appID');
      setCurrentAppID(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOntology?.id, currentOntology?.appID]); // 只依赖 id 和 appID，避免无限循环

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
        {console.log('[AIOntoWorkbench] currentOntology:', currentOntology)}
        {console.log('[AIOntoWorkbench] projectId from store:', projectId)}
        {console.log(
          '[AIOntoWorkbench] projectId[1] (实际projectId):',
          projectId?.[1]
        )}
        {console.log('[AIOntoWorkbench] currentAppID:', currentAppID)}
        <ResizableLayout
          leftContent={
            currentAppID ? (
              <ChatPanel
                appId={currentAppID}
                appConfigId="appconfig-e8b9wqn0"
                projectId={projectId?.[1]}
                channel="Preview"
                source="debugger"
                onConversationCreated={(conversationId) => {
                  console.log('会话创建:', conversationId);
                  // TODO: 保存会话 ID
                }}
                onGraphRefresh={handleGraphRefresh}
                onLocateNode={handleLocateNode}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Spin tip="正在初始化 Agent..." />
              </div>
            )
          }
          rightContent={<GraphPanel key={graphRefreshKey} />}
          defaultLeftWidth={400}
          minLeftWidth={300}
          maxLeftWidth={600}
        />
      </div>
    </div>
  );
};

export default AIOntoWorkbench;

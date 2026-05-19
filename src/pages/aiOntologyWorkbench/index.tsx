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
import { OntologyAction, OntologyTargetType } from '@/hooks/chat/types';

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
    // 通过图谱 store 触发高亮，并设置缩放比例为 75%
    const { highlightNode } = useAIWorkbenchGraphStore.getState();
    highlightNode(code, { zoom: 0.75 });
  }, []);

  // 节点查看回调 - 根据 target_type 跳转到不同路由
  const handleViewNode = React.useCallback(
    (action: OntologyAction) => {
      console.log('[AIOntoWorkbench] 查看节点，action:', action);

      if (!currentOntology?.id) {
        console.warn('[AIOntoWorkbench] 没有当前本体，无法跳转');
        return;
      }

      const { target_type, name } = action;
      const ontologyId = currentOntology.id;

      // 根据 target_type 生成不同的路由
      let targetPath = '';

      switch (target_type) {
        case OntologyTargetType.OBJECT_TYPE:
          // 对象类型：/onto/tenant/compute/onto/ontologyScene/detail/{ontologyId}/objectType/list?search={name}
          targetPath = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyId}/objectType/list?search=${encodeURIComponent(name)}`;
          break;

        case OntologyTargetType.LINK:
          // 链接：/onto/tenant/compute/onto/ontologyScene/detail/{ontologyId}/links/list?search={name}
          targetPath = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyId}/links/list?search=${encodeURIComponent(name)}`;
          break;

        case OntologyTargetType.FUNCTION:
          // 函数：/onto/tenant/compute/onto/ontologyScene/detail/{ontologyId}/functions?search={name}
          targetPath = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyId}/functions?search=${encodeURIComponent(name)}`;
          break;

        case OntologyTargetType.ACTION:
          // 行为：/onto/tenant/compute/onto/ontologyScene/detail/{ontologyId}/behaviorActions?search={name}
          targetPath = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyId}/behaviorActions?search=${encodeURIComponent(name)}`;
          break;

        default:
          console.warn('[AIOntoWorkbench] 未知的 target_type:', target_type);
          return;
      }

      console.log('[AIOntoWorkbench] 跳转路由:', targetPath);

      // 在新窗口打开
      window.open(targetPath, '_blank');
    },
    [currentOntology]
  );

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
    <div className="flex h-full w-full flex-col bg-white">
      {/* 顶部工具栏 */}
      <div
        className="flex h-[56px] items-center border-b border-solid border-[#dfe2eb] px-[24px]"
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.08))' }}
      >
        <OntologySelector />
      </div>

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
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
                key={currentAppID} // 添加 key，确保 appId 变化时重新挂载组件
                appId={currentAppID}
                // appId="app-4th0ybq9"
                appConfigId={null}
                projectId={projectId?.[1]}
                channel="WebPage"
                source="debugger"
                onConversationCreated={(conversationId) => {
                  console.log('会话创建:', conversationId);
                  // TODO: 保存会话 ID
                }}
                onGraphRefresh={handleGraphRefresh}
                onLocateNode={handleLocateNode}
                onViewNode={handleViewNode}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Spin tip="正在初始化 Agent..." />
              </div>
            )
          }
          rightContent={<GraphPanel key={graphRefreshKey} />}
          defaultLeftWidth={400}
          minLeftWidth={400}
          maxLeftWidth={500}
        />
      </div>
    </div>
  );
};

export default AIOntoWorkbench;

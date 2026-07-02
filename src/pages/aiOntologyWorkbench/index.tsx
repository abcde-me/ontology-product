import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Spin } from '@arco-design/web-react';
import { useAIWorkbenchStore } from './store';
import { useOntologyManagement } from './hooks/useOntologyManagement';
import { useUserInfoStore } from '@/store/userInfoStore';
import SceneModal from '@/pages/ontologyScene/modules/list/components/SceneModal';
import EmptyState from './components/EmptyState';
import OntologySelector from './components/OntologySelector';
import ChatPanel from './components/ChatPanel';
import ResizableLayout from './components/ResizableLayout';
import { useAIWorkbenchGraphStore } from './components/AIWorkbenchGraph/store';
import { OntologyAction, OntologyTargetType } from '@/hooks/chat/types';
import { isDevAppId } from '@/utils/devChatStore';
import { shouldUseDirectLlmChat } from './config/llm';
import { DIRECT_LLM_APP_ID } from './services/directLlmChat';

const GraphPanel = React.lazy(() => import('./components/GraphPanel'));

const GraphPanelPlaceholder: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#f8f9fc]">
    <Spin />
  </div>
);

/**
 * AI 本体工作台
 */
const AIOntoWorkbench: React.FC = () => {
  const {
    ontologyList,
    ontologyListLoading,
    currentOntology,
    setCurrentOntology
  } = useAIWorkbenchStore();

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

  const [graphRefreshKey, setGraphRefreshKey] = React.useState(0);
  const [graphReady, setGraphReady] = React.useState(false);
  const [agentAppId, setAgentAppId] = React.useState<string | undefined>(
    undefined
  );
  const [agentError, setAgentError] = React.useState<string | null>(null);

  const isFirstProjectEffectRef = useRef(true);

  const resolvedAppId = useMemo(() => {
    if (!currentOntology) {
      return undefined;
    }
    if (shouldUseDirectLlmChat()) {
      return DIRECT_LLM_APP_ID;
    }
    if (currentOntology.appID && !isDevAppId(currentOntology.appID)) {
      return currentOntology.appID;
    }
    return agentAppId;
  }, [currentOntology, agentAppId]);

  const needsAsyncAgentInit = useMemo(() => {
    if (!currentOntology || shouldUseDirectLlmChat()) {
      return false;
    }
    return !currentOntology.appID || isDevAppId(currentOntology.appID);
  }, [currentOntology]);

  const handleGraphRefresh = React.useCallback(() => {
    setGraphRefreshKey((prev) => prev + 1);
  }, []);

  const handleLocateNode = React.useCallback((code: string) => {
    const { highlightNode } = useAIWorkbenchGraphStore.getState();
    highlightNode(code, { zoom: 0.75 });
  }, []);

  const handleViewNode = React.useCallback(
    (action: OntologyAction) => {
      if (!currentOntology?.id) {
        return;
      }

      const { target_type, name } = action;
      const ontologyId = currentOntology.id;
      let targetPath = '';

      switch (target_type) {
        case OntologyTargetType.OBJECT_TYPE:
          targetPath = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyId}/objectType/list?search=${encodeURIComponent(name)}`;
          break;
        case OntologyTargetType.LINK:
          targetPath = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyId}/links/list?search=${encodeURIComponent(name)}`;
          break;
        case OntologyTargetType.FUNCTION:
          targetPath = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyId}/functions?search=${encodeURIComponent(name)}`;
          break;
        case OntologyTargetType.ACTION:
          targetPath = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyId}/behaviorActions?search=${encodeURIComponent(name)}`;
          break;
        default:
          return;
      }

      window.open(targetPath, '_blank');
    },
    [currentOntology]
  );

  useEffect(() => {
    loadOntologyList(1, 20, true);
    void useUserInfoStore.getState().ensureProjectReady();

    return () => {
      useAIWorkbenchGraphStore.getState().reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstProjectEffectRef.current) {
      isFirstProjectEffectRef.current = false;
      return;
    }

    if (!projectId || projectId.length === 0) {
      return;
    }

    useAIWorkbenchStore.setState({ graphData: null });
    useAIWorkbenchGraphStore.getState().reset();

    loadOntologyList(1, 20, false).then((result) => {
      const current = useAIWorkbenchStore.getState().currentOntology;
      if (!current && result.list.length > 0) {
        setCurrentOntology(result.list[0]);
        return;
      }

      if (current) {
        const stillExists = result.list.some((item) => item.id === current.id);
        if (!stillExists && result.list.length > 0) {
          setCurrentOntology(result.list[0]);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId?.[1]]);

  useEffect(() => {
    const timer = window.setTimeout(() => setGraphReady(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  const agentInitSeqRef = useRef(0);

  useEffect(() => {
    if (!needsAsyncAgentInit || !currentOntology) {
      setAgentAppId(undefined);
      setAgentError(null);
      return;
    }

    const initSeq = ++agentInitSeqRef.current;
    let timeoutId: number | undefined;

    const initializeAgent = async () => {
      setAgentAppId(undefined);
      setAgentError(null);

      timeoutId = window.setTimeout(() => {
        if (initSeq !== agentInitSeqRef.current) {
          return;
        }
        setAgentError('Agent 初始化超时，请检查网络后重试');
      }, 45000);

      try {
        const appID = await ensureOntologyAgent(currentOntology);

        if (initSeq !== agentInitSeqRef.current) {
          return;
        }

        if (appID) {
          setAgentAppId(appID);
          setAgentError(null);

          const updatedOntology = useAIWorkbenchStore
            .getState()
            .ontologyList.find((o) => o.id === currentOntology.id);

          if (updatedOntology?.appID) {
            setCurrentOntology(updatedOntology);
          }
        } else {
          setAgentAppId(undefined);
          setAgentError('Agent 创建失败，请重试');
        }
      } catch (error: any) {
        if (initSeq !== agentInitSeqRef.current) {
          return;
        }
        setAgentAppId(undefined);
        setAgentError(error?.message || 'Agent 初始化失败，请重试');
      } finally {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      }
    };

    void initializeAgent();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOntology?.id, projectId?.[1], needsAsyncAgentInit]);

  const isInitialLoading = ontologyListLoading && ontologyList.length === 0;
  const isEmpty = !ontologyListLoading && ontologyList.length === 0;

  if (isInitialLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <Spin />
      </div>
    );
  }

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

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div
        className="flex h-[56px] items-center border-b border-solid border-[#dfe2eb] px-[24px]"
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.08))' }}
      >
        <OntologySelector />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ResizableLayout
          leftContent={
            agentError ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6">
                <div className="text-center">
                  <div className="mb-2 text-[14px] text-red-500">
                    {agentError}
                  </div>
                  <button
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    onClick={() => {
                      if (currentOntology) {
                        setAgentError(null);
                        setAgentAppId(undefined);
                        ensureOntologyAgent(currentOntology).then((appID) => {
                          if (appID) {
                            setAgentAppId(appID);
                            setAgentError(null);
                          } else {
                            setAgentError('Agent 创建失败，请重试');
                          }
                        });
                      }
                    }}
                  >
                    重试
                  </button>
                </div>
              </div>
            ) : resolvedAppId ? (
              <ChatPanel
                key={resolvedAppId}
                appId={resolvedAppId}
                appConfigId={null}
                projectId={projectId?.[1]}
                channel="Preview"
                source="debugger"
                ensureOntologyAgent={ensureOntologyAgent}
                onConversationCreated={() => {}}
                onGraphRefresh={handleGraphRefresh}
                onLocateNode={handleLocateNode}
                onViewNode={handleViewNode}
              />
            ) : !currentOntology ? (
              <div className="flex h-full w-full items-center justify-center text-[14px] text-[#86909c]">
                请选择本体
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Spin tip="正在初始化 Agent..." />
              </div>
            )
          }
          rightContent={
            graphReady ? (
              <Suspense fallback={<GraphPanelPlaceholder />}>
                <GraphPanel key={graphRefreshKey} />
              </Suspense>
            ) : (
              <GraphPanelPlaceholder />
            )
          }
          defaultLeftWidth={400}
          minLeftWidth={400}
          maxLeftWidth={500}
        />
      </div>
    </div>
  );
};

export default AIOntoWorkbench;

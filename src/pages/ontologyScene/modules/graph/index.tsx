import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef
} from 'react';
import {
  AIWorflow,
  AIWorkflowProvider,
  BlockEnum,
  GenerateNewNode
} from '@ceai-front/workflow';
import '@ceai-front/workflow/dist/es/ai-workflow.css';
import useUrlState from '@ahooksjs/use-url-state';
import { MyNode, MyNodePanel, MyNodeDefault } from './nodes';
import {
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  setDraft,
  setActiveWorkflowSceneId
} from './common/api';
import { getOntologyTopology } from '@/api/ontologySceneLibrary/graph';
import type { GetOntologyTopologyResponse } from '@/types/graphApi';
import styles from './index.module.scss';
import { CustomLabel, EdgePanel } from './edges';
import { Button, Spin } from '@arco-design/web-react';
import SubHeader from './subHeader';
import classNames from 'classnames';
import { WORKFLOW_EDGE_MARKER_END } from './utils/topologyEdgeIdentity';
import type { Node } from 'reactflow';
import { useDemoStore } from './common/store';
import { useHistory, useParams } from 'react-router-dom';
import { OBJECT_TYPE_ICON_OPTIONS } from '../../common/constants';
import { GraphCreateProvider } from './context/GraphCreateContext';
import GraphContextMenuHandler from './components/GraphContextMenuHandler';
import GraphEmptyCanvas from './components/GraphEmptyCanvas';
import GraphNodeSelectionSync from './components/GraphNodeSelectionSync';
import GraphEdgeSelectionSync from './components/GraphEdgeSelectionSync';
import GraphClickSelectionHandler from './components/GraphClickSelectionHandler';
import GraphDeleteKeyHandler from './components/GraphDeleteKeyHandler';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import { usePermission } from '@/hooks/usePermission';
import { isDevBypassEnabled } from '@/utils/devFallback';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { layoutOntologyGraphWithDagre } from './utils/layoutOntologyGraph';
import { scheduleOverlayCleanup } from '@/utils/removeStaleArcoOverlays';

const createNodesConfig = (
  OSId: string,
  history: ReturnType<typeof useHistory>
) => [
  {
    type: 'default', // 节点类型
    node: MyNode, // 画布展示的节点
    panel: MyNodePanel, // 节点配置面板
    nodeDefault: MyNodeDefault, // 节点默认配置
    classification: 'ontology', // 节点分类
    title: '本体节点', // 节点标题
    showDefaultSourceHandle: true, // 是否显示默认的源连接点
    showDefaultTargetHandle: true, // 是否显示默认的目标连接点
    showNodeControl: false, // 是否显示节点控制按钮
    iconRender: (data, { type }) => {
      const iconItem = OBJECT_TYPE_ICON_OPTIONS.find(
        (option) => option.value === data.icon
      );
      const IconComponent = iconItem?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;
      return (
        <IconComponent
          className={`mr-[8px] flex-shrink-0 ${type === 'node' ? 'h-[24px] w-[24px]' : 'h-[20px] w-[20px]'}`}
        />
      );
    },
    panelBeforeCloseExtra: (data) => {
      const { id: resolvedObjectTypeId } = data;

      const handleEdit = () => {
        if (resolvedObjectTypeId) {
          history.push(
            `/tenant/compute/onto/ontologyScene/detail/${OSId}/objectType/edit/${resolvedObjectTypeId}`
          );
        }
      };

      return (
        <>
          <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
            <Button
              size="small"
              type="outline"
              className="px-[12px]"
              onClick={() => {
                handleEdit();
              }}
            >
              编辑
            </Button>
            <div className="ml-[16px] mr-[12px] h-[16px] w-[1px] bg-[#CBD5E1]"></div>
          </PermissionWrapper>
        </>
      );
    }
  }
];

const MENU_WIDTH = 200;

// 创建基于接口数据的 initWorkflow
const createInitWorkflow = (
  topologyData: GetOntologyTopologyResponse | null,
  selectedObjectTypeCode?: string
) => {
  return (newNode: GenerateNewNode) => {
    if (!topologyData) {
      // 如果没有数据，返回默认的空工作流
      return {
        nodes: [],
        edges: [],
        draft: true
      };
    }

    return layoutOntologyGraphWithDagre({
      topologyData,
      newNode,
      selectedObjectType: selectedObjectTypeCode
        ? { code: selectedObjectTypeCode }
        : undefined,
      sidebarOffset: MENU_WIDTH,
      buildNodeData: (topologyNode, selectedObjectType) => ({
        ...MyNodeDefault.defaultValue,
        // @ts-expect-error
        type: 'default',
        desc: topologyNode.description ?? '',
        title: topologyNode.name || '未命名节点',
        selected: Boolean(
          selectedObjectType?.code &&
            String(topologyNode.code ?? '') === String(selectedObjectType.code)
        ),
        attributes: topologyNode.ontologyPhysicalPropertiesList || [],
        syncStatus: topologyNode.syncStatus,
        code: topologyNode.code ?? '',
        icon: topologyNode.icon ?? ''
      })
    });
  };
};

// 本体图谱拓扑（基于 AIWorkflow 工作流组件）
export default function OntologySceneGraph() {
  const [topologyData, setTopologyData] =
    useState<GetOntologyTopologyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [topologyRevision, setTopologyRevision] = useState(0);
  const loadGenerationRef = useRef(0);
  const [urlState, setUrlState] = useUrlState<{ objectTypeCode: string }>(
    { objectTypeCode: '' },
    { navigateMode: 'replace' }
  );
  const objectTypeCodeFromUrl = urlState.objectTypeCode
    ? String(urlState.objectTypeCode)
    : '';
  // 只在页面首次加载时读取一次 URL 的初始值，用于初始化节点面板打开状态
  const initialObjectTypeCodeFromUrl = useMemo(() => objectTypeCodeFromUrl, []);
  const showCustomEdgePanel = useDemoStore((s) => s.showCustomEdgePanel);
  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const setSelectedEdgeId = useDemoStore((s) => s.setSelectedEdgeId);
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const sceneId = Number(OSId);
  const { hasPermission } = usePermission();
  const canCreate =
    hasPermission(ONTOLOGY_PERMISSIONS.CREATE) || isDevBypassEnabled();
  const canDeleteNode =
    hasPermission(ONTOLOGY_PERMISSIONS.DELETE) || isDevBypassEnabled();
  const nodesConfig = useMemo(
    () => createNodesConfig(OSId, history),
    [OSId, history]
  );

  const isEmpty =
    !loading &&
    topologyData !== null &&
    (!topologyData.nodes || topologyData.nodes.length === 0) &&
    (!topologyData.edges || topologyData.edges.length === 0);

  const reloadTopology = useCallback(async () => {
    if (!Number.isFinite(sceneId) || sceneId <= 0) {
      setTopologyData({ nodes: [], edges: [] });
      setLoading(false);
      return;
    }

    setShowCustomEdgePanel(false);
    setLoading(true);
    setActiveWorkflowSceneId(sceneId);
    setDraft(null, sceneId);
    const loadGeneration = loadGenerationRef.current + 1;
    loadGenerationRef.current = loadGeneration;

    try {
      const res = await getOntologyTopology({ id: sceneId });
      if (loadGenerationRef.current !== loadGeneration) {
        return;
      }

      if (isOntologyApiSuccess(res) && res.data) {
        setTopologyData(res.data);
      } else {
        setTopologyData({ nodes: [], edges: [] });
      }
    } catch (err) {
      if (loadGenerationRef.current !== loadGeneration) {
        return;
      }
      console.error('获取本体拓扑数据失败:', err);
      setTopologyData({ nodes: [], edges: [] });
    } finally {
      if (loadGenerationRef.current !== loadGeneration) {
        return;
      }
      setTopologyRevision((revision) => revision + 1);
      setLoading(false);
    }
  }, [sceneId, setShowCustomEdgePanel]);

  useEffect(() => {
    setActiveWorkflowSceneId(sceneId);

    const panelState = useDemoStore.getState().showCustomEdgePanel;
    if (typeof panelState !== 'boolean') {
      setShowCustomEdgePanel(false);
    }
    reloadTopology();
    // 仅在场景切换时重新拉取拓扑，避免其它页面操作触发图谱重载
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  useEffect(() => {
    return () => {
      setActiveWorkflowSceneId(null);
      scheduleOverlayCleanup();
    };
  }, []);

  const nodesReadonlyChecker = useCallback(() => {
    return true;
  }, []);

  const workflowApi = useMemo(
    () => ({
      workflowNotExistedMarks: ['ResourceNotFound', '资源不存在'],
      getWorkflow,
      createWorkflow,
      updateWorkflow
    }),
    []
  );

  const workflowEdge = useMemo(
    () => ({
      markerEnd: WORKFLOW_EDGE_MARKER_END,
      targetXOffset: -8,
      labelRenderer: CustomLabel
    }),
    []
  );

  const handleWorkflowNodeClick = useCallback(
    (node: Node) => {
      setShowCustomEdgePanel(false);
      setSelectedEdgeId(null);
      const nodeData = node?.data as { code?: string } | undefined;
      const clickedObjectTypeCode = nodeData?.code ? String(nodeData.code) : '';
      setUrlState({ objectTypeCode: clickedObjectTypeCode });
    },
    [setSelectedEdgeId, setShowCustomEdgePanel, setUrlState]
  );

  const workflowEvents = useMemo(
    () => ({
      onNodeClick: handleWorkflowNodeClick
    }),
    [handleWorkflowNodeClick]
  );

  const workflowSubHeader = useMemo(
    () => ({ fullyCustomSubheader: <SubHeader /> }),
    []
  );

  const showEdgePanel =
    typeof showCustomEdgePanel === 'boolean' && showCustomEdgePanel;

  const workflowRightPanels = useMemo(
    () => [
      {
        id: 'custom-edge-panel',
        isShow: showEdgePanel,
        panel: EdgePanel
      }
    ],
    [showEdgePanel]
  );

  const graphOtherComponents = useMemo(
    () => [
      <GraphNodeSelectionSync key="graph-node-selection-sync" />,
      <GraphEdgeSelectionSync key="graph-edge-selection-sync" />,
      <GraphClickSelectionHandler key="graph-click-selection" />,
      <GraphContextMenuHandler key="graph-context-menu" />,
      <GraphDeleteKeyHandler key="graph-delete-key" />
    ],
    []
  );

  useEffect(() => {
    if (!objectTypeCodeFromUrl || !topologyData?.nodes?.length) {
      return;
    }

    const exists = topologyData.nodes.some(
      (node) => String(node.code ?? '') === objectTypeCodeFromUrl
    );

    if (!exists) {
      setUrlState({ objectTypeCode: '' });
    }
  }, [objectTypeCodeFromUrl, setUrlState, topologyData]);

  // 基于获取的数据创建 initWorkflow
  const initWorkflow = useCallback(
    createInitWorkflow(topologyData, initialObjectTypeCodeFromUrl),
    [topologyData, initialObjectTypeCodeFromUrl]
  );

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spin block />
      </div>
    );
  }

  return (
    <GraphCreateProvider
      sceneId={sceneId}
      canCreate={canCreate}
      canDeleteNode={canDeleteNode}
      topologyData={topologyData}
      onCreated={reloadTopology}
    >
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
        {isEmpty ? (
          <GraphEmptyCanvas />
        ) : (
          <AIWorkflowProvider
            key={`ontology-graph-${sceneId}-${topologyRevision}`}
            nodes={nodesConfig}
            initWorkflow={initWorkflow}
            nodesDraggableWhenReadonly
            autoRefreshWhenTabVisible={false}
            api={workflowApi}
            nodesReadonlyChecker={nodesReadonlyChecker}
            headerHeight={0}
            edge={workflowEdge}
            events={workflowEvents}
            subHeader={workflowSubHeader}
            rightPanels={workflowRightPanels}
            otherComponents={graphOtherComponents}
          >
            <AIWorflow
              className={classNames(
                styles['ai-workflow'],
                styles['edge-style']
              )}
            />
          </AIWorkflowProvider>
        )}
      </div>
    </GraphCreateProvider>
  );
}

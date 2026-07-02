import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AIWorflow,
  AIWorkflowProvider,
  GenerateNewNode
} from '@ceai-front/workflow';
import '@ceai-front/workflow/dist/es/ai-workflow.css';
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
import graphStyles from './index.module.scss';
import { CustomLabel, EdgePanel } from './edges';
import { Button, Spin } from '@arco-design/web-react';
import SubHeader from './subHeader';
import classNames from 'classnames';
import type { Node } from 'reactflow';
import { WORKFLOW_EDGE_MARKER_END } from './utils/topologyEdgeIdentity';
import { useDemoStore } from './common/store';
import { useHistory } from 'react-router-dom';
import { OBJECT_TYPE_ICON_OPTIONS } from '../../common/constants';
import {
  filterTopologyNeighbors,
  resolveTopologyFocusNodeId
} from './utils/topologyFocus';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import { OntologyGraphBrowseProvider } from './context/OntologyGraphBrowseContext';
import { GraphCreateProvider } from './context/GraphCreateContext';
import GraphContextMenuHandler from './components/GraphContextMenuHandler';
import GraphEmptyCanvas from './components/GraphEmptyCanvas';
import GraphClickSelectionHandler from './components/GraphClickSelectionHandler';
import GraphDeleteKeyHandler from './components/GraphDeleteKeyHandler';
import GraphEdgeSelectionSync from './components/GraphEdgeSelectionSync';
import GraphNodeSelectionSync from './components/GraphNodeSelectionSync';
import { usePermission } from '@/hooks/usePermission';
import { isDevBypassEnabled } from '@/utils/devFallback';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { layoutOntologyGraphWithDagre } from './utils/layoutOntologyGraph';

const createNodesConfig = (
  sceneId: string,
  history: ReturnType<typeof useHistory>
) => [
  {
    type: 'default',
    node: MyNode,
    panel: MyNodePanel,
    nodeDefault: MyNodeDefault,
    classification: 'ontology',
    title: '本体节点',
    showDefaultSourceHandle: true,
    showDefaultTargetHandle: true,
    showNodeControl: false,
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
            `/tenant/compute/onto/ontologyScene/detail/${sceneId}/objectType/edit/${resolvedObjectTypeId}`
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
              onClick={handleEdit}
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

const PAGE_MENU_WIDTH = 200;

export interface OntologyGraphBrowseConfig {
  objectTypeId?: number;
  objectTypeCode?: string;
  focusNeighbors?: boolean;
  instanceId?: string | number;
}

export interface OntologyGraphViewProps {
  sceneId: number;
  browseParams?: OntologyGraphBrowseConfig;
  embedMode?: boolean;
  className?: string;
  zoomToolbarRef?: React.RefObject<HTMLDivElement | null>;
  onObjectTypeCodeChange?: (objectTypeCode: string) => void;
}

const createInitWorkflow = (
  topologyData: GetOntologyTopologyResponse | null,
  selectedObjectType?: {
    code?: string;
    id?: number;
  },
  sidebarOffset = PAGE_MENU_WIDTH
) => {
  return (newNode: GenerateNewNode) => {
    if (!topologyData) {
      return {
        nodes: [],
        edges: [],
        draft: true
      };
    }

    return layoutOntologyGraphWithDagre({
      topologyData,
      newNode,
      selectedObjectType,
      sidebarOffset,
      buildNodeData: (topologyNode, selected) => ({
        ...MyNodeDefault.defaultValue,
        // @ts-expect-error
        type: 'default',
        desc: topologyNode.description ?? '',
        title: topologyNode.name || '未命名节点',
        selected: Boolean(
          (selected?.id != null &&
            String(topologyNode.id ?? '') === String(selected.id)) ||
            (selected?.code &&
              String(topologyNode.code ?? '') === String(selected.code))
        ),
        attributes: topologyNode.ontologyPhysicalPropertiesList || [],
        syncStatus: topologyNode.syncStatus,
        code: topologyNode.code ?? '',
        icon: topologyNode.icon ?? ''
      })
    });
  };
};

export const OntologyGraphView: React.FC<OntologyGraphViewProps> = ({
  sceneId,
  browseParams,
  embedMode = false,
  className,
  zoomToolbarRef,
  onObjectTypeCodeChange
}) => {
  const [topologyData, setTopologyData] =
    useState<GetOntologyTopologyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const showCustomEdgePanel = useDemoStore((s) => s.showCustomEdgePanel);
  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const setSelectedEdgeId = useDemoStore((s) => s.setSelectedEdgeId);
  const history = useHistory();
  const sceneIdText = String(sceneId);
  const sidebarOffset = embedMode ? 0 : PAGE_MENU_WIDTH;
  const { hasPermission } = usePermission();
  const canCreate =
    hasPermission(ONTOLOGY_PERMISSIONS.CREATE) || isDevBypassEnabled();
  const canDeleteNode =
    hasPermission(ONTOLOGY_PERMISSIONS.DELETE) || isDevBypassEnabled();

  const selectedObjectType = useMemo(
    () => ({
      code: browseParams?.objectTypeCode || undefined,
      id: browseParams?.objectTypeId
    }),
    [browseParams?.objectTypeCode, browseParams?.objectTypeId]
  );

  const browseContextValue = useMemo(
    () => ({
      sceneId,
      objectTypeId: browseParams?.objectTypeId,
      objectTypeCode: browseParams?.objectTypeCode,
      focusNeighbors: browseParams?.focusNeighbors,
      instanceId:
        browseParams?.instanceId != null && browseParams.instanceId !== ''
          ? String(browseParams.instanceId)
          : undefined,
      compactPanel: embedMode
    }),
    [browseParams, embedMode, sceneId]
  );

  const nodesConfig = useMemo(
    () => createNodesConfig(sceneIdText, history),
    [history, sceneIdText]
  );

  const displayTopology = useMemo(() => {
    if (!topologyData) {
      return null;
    }

    if (!browseParams?.focusNeighbors) {
      return topologyData;
    }

    const focusNodeId = resolveTopologyFocusNodeId(topologyData, {
      objectTypeId:
        browseParams.objectTypeId != null
          ? String(browseParams.objectTypeId)
          : undefined,
      objectTypeCode: browseParams.objectTypeCode
    });

    if (focusNodeId == null) {
      return topologyData;
    }

    return filterTopologyNeighbors(topologyData, focusNodeId);
  }, [browseParams, topologyData]);

  const isEmpty =
    !loading &&
    displayTopology !== null &&
    (!displayTopology.nodes || displayTopology.nodes.length === 0) &&
    (!displayTopology.edges || displayTopology.edges.length === 0);

  const reloadTopology = useCallback(async () => {
    setShowCustomEdgePanel(false);
    setLoading(true);
    setActiveWorkflowSceneId(sceneId);
    setDraft(null, sceneId);

    try {
      const res = await getOntologyTopology({ id: sceneId });
      if (isOntologyApiSuccess(res) && res.data) {
        setTopologyData(res.data);
      } else {
        setTopologyData({ nodes: [], edges: [] });
      }
    } catch (err) {
      console.error('获取本体拓扑数据失败:', err);
      setTopologyData({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  }, [sceneId, setShowCustomEdgePanel]);

  useEffect(() => {
    setActiveWorkflowSceneId(sceneId);
    reloadTopology();
  }, [reloadTopology, sceneId]);

  const nodesReadonlyChecker = useCallback(() => true, []);

  const initWorkflow = useCallback(
    createInitWorkflow(displayTopology, selectedObjectType, sidebarOffset),
    [displayTopology, selectedObjectType, sidebarOffset]
  );

  const showEdgePanel =
    typeof showCustomEdgePanel === 'boolean' && showCustomEdgePanel;

  const useIntegratedZoom = embedMode && zoomToolbarRef;

  const graphOtherComponents = useMemo(
    () =>
      [
        <GraphNodeSelectionSync key="graph-node-selection-sync" />,
        <GraphEdgeSelectionSync key="graph-edge-selection-sync" />,
        <GraphClickSelectionHandler key="graph-click-selection" />,
        <GraphContextMenuHandler key="graph-context-menu" />,
        <GraphDeleteKeyHandler key="graph-delete-key" />,
        useIntegratedZoom ? (
          <SubHeader
            key="integrated-zoom-subheader"
            embedToolbarRef={zoomToolbarRef}
          />
        ) : null
      ].filter(Boolean),
    [useIntegratedZoom, zoomToolbarRef]
  );

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

  const workflowSubHeader = useMemo(
    () =>
      embedMode
        ? { hidden: true }
        : {
            fullyCustomSubheader: <SubHeader />
          },
    [embedMode]
  );

  const workflowEvents = useMemo(
    () => ({
      onNodeClick: (node: Node) => {
        setShowCustomEdgePanel(false);
        setSelectedEdgeId(null);
        const nodeData = node?.data;
        const clickedObjectTypeCode = nodeData?.code
          ? String(nodeData.code)
          : '';
        onObjectTypeCodeChange?.(clickedObjectTypeCode);
      }
    }),
    [onObjectTypeCodeChange, setSelectedEdgeId, setShowCustomEdgePanel]
  );

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

  const graphCanvas = loading ? (
    <div className="flex h-full w-full items-center justify-center">
      <Spin block />
    </div>
  ) : (
    <div
      className={classNames(
        'relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden',
        embedMode ? 'bg-transparent' : 'bg-white'
      )}
    >
      {isEmpty ? (
        <GraphEmptyCanvas />
      ) : (
        <AIWorkflowProvider
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
              graphStyles['ai-workflow'],
              graphStyles['edge-style']
            )}
          />
        </AIWorkflowProvider>
      )}
    </div>
  );

  return (
    <GraphCreateProvider
      sceneId={sceneId}
      canCreate={canCreate}
      canDeleteNode={canDeleteNode}
      topologyData={displayTopology}
      onCreated={reloadTopology}
    >
      <OntologyGraphBrowseProvider value={browseContextValue}>
        <div
          className={classNames(
            'relative h-full min-h-[480px] w-full',
            className
          )}
        >
          {graphCanvas}
        </div>
      </OntologyGraphBrowseProvider>
    </GraphCreateProvider>
  );
};

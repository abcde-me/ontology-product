import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Message } from '@arco-design/web-react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  ObjectSelectDrawer,
  OperationGuideModal,
  RelationInsightCanvas,
  RelationInsightToolbar
} from './components';
import { DEFAULT_CANVAS_MODE } from './constants';
import {
  buildRelationGraph,
  enrichSelectedObjectContexts,
  rebuildRelationGraph
} from './services/relationGraph';
import type {
  CanvasModeKey,
  GraphAlgorithmKey,
  GraphLayoutKey,
  QueryResultItem,
  RelationGraphEdge,
  RelationGraphNode,
  RelationLoadMode,
  SelectedObjectContext
} from './types';
import { isFavorite, toggleFavorite } from './utils/favorites';
import {
  buildInstanceKey,
  toSelectedObjectContext
} from './utils/queryResultRow';
import {
  buildRelationInsightSearchParams,
  parseRelationInsightUrlParams
} from './utils/urlParams';
import styles from './index.module.scss';

export default function RelationInsight() {
  const location = useLocation();
  const history = useHistory();

  const [selectedObjects, setSelectedObjects] = useState<
    SelectedObjectContext[]
  >([]);
  const [loadedInstanceKeys, setLoadedInstanceKeys] = useState<Set<string>>(
    () => new Set()
  );
  const [algorithm, setAlgorithm] = useState<GraphAlgorithmKey>('neighbor-2');
  const [canvasMode, setCanvasMode] =
    useState<CanvasModeKey>(DEFAULT_CANVAS_MODE);
  const [layout, setLayout] = useState<GraphLayoutKey>('force');
  const [nodes, setNodes] = useState<RelationGraphNode[]>([]);
  const [edges, setEdges] = useState<RelationGraphEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [selectVisible, setSelectVisible] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);
  const [graphRevision, setGraphRevision] = useState(0);
  const hasGraphRef = useRef(false);
  const selectedObjectsRef = useRef(selectedObjects);

  selectedObjectsRef.current = selectedObjects;

  const urlParams = useMemo(
    () => parseRelationInsightUrlParams(location.search),
    [location.search]
  );

  const primarySelectedObject = selectedObjects[0] ?? null;

  const syncUrl = useCallback(
    (contexts: SelectedObjectContext[]) => {
      if (contexts.length === 0) {
        history.replace({
          pathname: location.pathname,
          search: ''
        });
        return;
      }

      const searchParams = buildRelationInsightSearchParams(contexts);
      history.replace({
        pathname: location.pathname,
        search: `?${searchParams.toString()}`
      });
    },
    [history, location.pathname]
  );

  const mergeSelectedObjects = useCallback(
    (
      contexts: SelectedObjectContext[],
      loadMode: RelationLoadMode
    ): SelectedObjectContext[] => {
      const nextMap = new Map(
        selectedObjects.map((item) => [buildInstanceKey(item), item])
      );

      contexts.forEach((context) => {
        const key = buildInstanceKey(context);
        const existing = nextMap.get(key);
        nextMap.set(key, {
          ...context,
          loadedAsGraph:
            loadMode === 'graph' ? true : (existing?.loadedAsGraph ?? false)
        });
      });

      return Array.from(nextMap.values());
    },
    [selectedObjects]
  );

  const markResultsLoaded = useCallback((keys: string[]) => {
    setLoadedInstanceKeys((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => next.add(key));
      return next;
    });
  }, []);

  const loadToCanvas = useCallback(
    async (contexts: SelectedObjectContext[], mode: RelationLoadMode) => {
      if (contexts.length === 0) {
        return;
      }

      setLoading(true);
      setCleared(false);

      try {
        const existingGraph =
          cleared || nodes.length === 0 ? undefined : { nodes, edges };
        const graphAlgorithm = mode === 'graph' ? 'neighbor-2' : algorithm;
        const graph = await buildRelationGraph({
          selectedObjects: contexts,
          algorithm: graphAlgorithm,
          layout,
          loadMode: mode,
          existingGraph
        });

        const mergedObjects = mergeSelectedObjects(contexts, mode);
        setSelectedObjects(mergedObjects);
        setFavorited(
          mergedObjects.length === 1 ? isFavorite(mergedObjects[0]) : false
        );
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setGraphRevision((revision) => revision + 1);
        markResultsLoaded(contexts.map((item) => buildInstanceKey(item)));
        syncUrl(mergedObjects);
        hasGraphRef.current = true;
      } catch (error) {
        console.error(error);
        Message.error(error instanceof Error ? error.message : '载入画布失败');
      } finally {
        setLoading(false);
      }
    },
    [
      algorithm,
      cleared,
      edges,
      layout,
      markResultsLoaded,
      mergeSelectedObjects,
      nodes,
      syncUrl
    ]
  );

  const handleLoadFromResults = useCallback(
    (rows: QueryResultItem[], mode: RelationLoadMode) => {
      const contexts = rows.map((item) =>
        toSelectedObjectContext(item, mode === 'graph')
      );
      loadToCanvas(contexts, mode);
    },
    [loadToCanvas]
  );

  const rebuildCanvas = useCallback(async () => {
    const objects = selectedObjectsRef.current;
    if (objects.length === 0 || cleared) {
      return;
    }

    setLoading(true);
    try {
      const graph = await rebuildRelationGraph({
        selectedObjects: objects,
        algorithm,
        layout
      });
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setGraphRevision((revision) => revision + 1);
    } catch (error) {
      console.error(error);
      Message.error(error instanceof Error ? error.message : '关系分析失败');
    } finally {
      setLoading(false);
    }
  }, [algorithm, cleared, layout]);

  const handleCanvasModeChange = (value: CanvasModeKey) => {
    if (value === 'detail') {
      Message.info('详情模式待开发');
      return;
    }
    setCanvasMode(value);
  };

  useEffect(() => {
    if (initializedFromUrl) {
      return;
    }

    const { sceneId, objectTypeId, instanceIds } = urlParams;
    if (!sceneId || !objectTypeId || !instanceIds?.length) {
      setInitializedFromUrl(true);
      return;
    }

    const bootstrap = async () => {
      try {
        const contexts = await enrichSelectedObjectContexts(
          instanceIds.map((instanceId) => ({
            sceneId,
            objectTypeId,
            instanceId
          }))
        );

        setLoading(true);
        setCleared(false);
        const graph = await buildRelationGraph({
          selectedObjects: contexts.map((context) => ({
            ...context,
            loadedAsGraph: true
          })),
          algorithm: 'neighbor-2',
          layout,
          loadMode: 'graph'
        });

        const loadedContexts = contexts.map((context) => ({
          ...context,
          loadedAsGraph: true
        }));
        setSelectedObjects(loadedContexts);
        setFavorited(
          loadedContexts.length === 1 ? isFavorite(loadedContexts[0]) : false
        );
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setGraphRevision((revision) => revision + 1);
        setLoadedInstanceKeys(
          new Set(loadedContexts.map((item) => buildInstanceKey(item)))
        );
        hasGraphRef.current = true;
      } catch (error) {
        console.error(error);
        Message.error('加载 URL 上下文失败');
      } finally {
        setLoading(false);
        setInitializedFromUrl(true);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializedFromUrl, urlParams]);

  useEffect(() => {
    if (
      !hasGraphRef.current ||
      selectedObjectsRef.current.length === 0 ||
      cleared
    ) {
      return;
    }

    rebuildCanvas();
  }, [algorithm, cleared, layout, rebuildCanvas]);

  const resetCanvasState = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCleared(true);
    hasGraphRef.current = false;
    setLoadedInstanceKeys(new Set());
    setGraphRevision((revision) => revision + 1);
  }, []);

  const handleClearCanvas = useCallback(() => {
    resetCanvasState();
    setSelectedObjects((prev) =>
      prev.map((item) => ({ ...item, loadedAsGraph: false }))
    );
  }, [resetCanvasState]);

  const handleToggleFavorite = () => {
    if (!primarySelectedObject || selectedObjects.length !== 1) {
      return;
    }

    const result = toggleFavorite(primarySelectedObject);
    setFavorited(result.favorited);
  };

  return (
    <div className={styles['insight-page']}>
      <div className={styles['canvas-stage']}>
        <RelationInsightToolbar
          selectedCount={selectedObjects.length}
          algorithm={algorithm}
          canvasMode={canvasMode}
          layout={layout}
          favorited={favorited}
          onOpenSelect={() => setSelectVisible(true)}
          onAlgorithmChange={setAlgorithm}
          onCanvasModeChange={handleCanvasModeChange}
          onLayoutChange={setLayout}
          onClearCanvas={handleClearCanvas}
          onToggleFavorite={handleToggleFavorite}
          onOpenGuide={() => setGuideVisible(true)}
        />

        <RelationInsightCanvas
          loading={loading}
          cleared={cleared}
          canvasMode={canvasMode}
          nodes={nodes}
          edges={edges}
          hasSelectedObjects={selectedObjects.length > 0}
          graphRevision={graphRevision}
        />
      </div>

      <ObjectSelectDrawer
        visible={selectVisible}
        initialValues={{
          sceneId: primarySelectedObject?.sceneId ?? urlParams.sceneId,
          objectTypeId:
            primarySelectedObject?.objectTypeId ?? urlParams.objectTypeId,
          instanceIds: selectedObjects.length
            ? selectedObjects.map((item) => item.instanceId)
            : urlParams.instanceIds
        }}
        loadedInstanceKeys={loadedInstanceKeys}
        onClose={() => setSelectVisible(false)}
        onLoad={handleLoadFromResults}
        loading={loading}
      />

      <OperationGuideModal
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
      />
    </div>
  );
}

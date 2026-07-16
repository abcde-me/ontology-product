import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AIWorflow,
  AIWorkflowProvider,
  GenerateNewNode
} from '@ceai-front/workflow';
import '@ceai-front/workflow/dist/es/ai-workflow.css';
import classNames from 'classnames';
import { Spin } from '@arco-design/web-react';
import { MarkerType } from 'reactflow';
import { createDataTaskNodesConfig } from '@/pages/dataTask/editor/nodes';
import editorStyles from '@/pages/dataTask/editor/index.module.scss';
import { loadWorkflowDraft } from '@/pages/dataTask/services/api';
import { normalizeWorkflowDraft } from '@/pages/dataTask/utils/workflowDraft';
import type { WorkflowDraft } from '@/pages/dataTask/types';

const createInitWorkflow =
  (draft: WorkflowDraft | null) => (newNode: GenerateNewNode) => {
    if (!draft?.graph?.nodes?.length) {
      return {
        nodes: [],
        edges: [],
        draft: true,
        viewport: draft?.graph?.viewport ?? { x: 0, y: 0, zoom: 1 }
      };
    }

    const nodes = (draft.graph.nodes as any[]).map((node) => {
      const nodeType = String(node?.data?.type ?? node?.type ?? 'default');
      const { newNode: workflowNode } = newNode({
        id: String(node.id),
        data: {
          ...node.data,
          type: nodeType,
          title: node.data?.title ?? nodeType
        },
        position: node.position
      });
      return workflowNode;
    });

    return {
      nodes,
      edges: draft.graph.edges ?? [],
      draft: true,
      viewport: draft.graph.viewport
    };
  };

interface WorkflowCanvasPreviewProps {
  taskId: string;
  processId?: string;
  styles: Record<string, string>;
}

export default function WorkflowCanvasPreview({
  taskId,
  processId,
  styles
}: WorkflowCanvasPreviewProps) {
  const [draft, setDraft] = useState<WorkflowDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDraft = async () => {
      setLoading(true);
      setCanvasReady(false);

      try {
        const loaded = normalizeWorkflowDraft(
          await loadWorkflowDraft(taskId, processId),
          taskId
        );
        if (cancelled) {
          return;
        }
        setDraft(loaded);
        setCanvasReady(true);
      } catch (error) {
        console.error('加载工作流画布失败:', error);
        if (!cancelled) {
          setDraft(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDraft();

    return () => {
      cancelled = true;
      setCanvasReady(false);
    };
  }, [taskId, processId]);

  const nodesConfig = useMemo(() => createDataTaskNodesConfig(), []);
  const initWorkflow = useCallback(createInitWorkflow(draft), [draft]);
  const nodesReadonlyChecker = useCallback(() => true, []);

  const workflowApi = useMemo(
    () => ({
      workflowNotExistedMarks: ['ResourceNotFound', '资源不存在'],
      getWorkflow: () => Promise.resolve({ data: draft }),
      createWorkflow: () =>
        Promise.resolve({
          code: 'ResourceNotFound',
          data: null,
          message: ''
        }),
      updateWorkflow: () =>
        Promise.resolve({
          code: 'ResourceNotFound',
          data: null,
          message: ''
        })
    }),
    [draft]
  );

  const workflowEdge = useMemo(
    () => ({
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: '#184ff2'
      },
      targetXOffset: -8
    }),
    []
  );

  const workflowEvents = useMemo(
    () => ({
      onNodeClick: (node: { data?: { selected?: boolean } }) => {
        if (node.data) {
          node.data.selected = false;
        }
      }
    }),
    []
  );

  if (loading) {
    return (
      <div className={styles['workflow-canvas-loading']}>
        <Spin size={16} />
        <span>正在加载画布信息...</span>
      </div>
    );
  }

  if (!draft?.graph?.nodes?.length) {
    return <div className={styles['workflow-canvas-empty']}>暂无画布信息</div>;
  }

  return (
    <div className={styles['workflow-canvas-preview']}>
      {canvasReady ? (
        <AIWorkflowProvider
          key={`workflow-preview-${taskId}`}
          nodes={nodesConfig}
          initWorkflow={initWorkflow}
          api={workflowApi}
          nodesReadonlyChecker={nodesReadonlyChecker}
          nodesDraggableWhenReadonly={false}
          headerHeight={0}
          edge={workflowEdge}
          events={workflowEvents}
          showDefaultNodes={false}
          autoRefreshWhenTabVisible={false}
        >
          <AIWorflow
            className={classNames(
              editorStyles['ai-workflow'],
              editorStyles['edge-style']
            )}
          />
        </AIWorkflowProvider>
      ) : (
        <div className={styles['workflow-canvas-loading']}>
          <Spin size={16} />
        </div>
      )}
    </div>
  );
}

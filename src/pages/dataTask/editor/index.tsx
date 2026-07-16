import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  AIWorflow,
  AIWorkflowProvider,
  GenerateNewNode
} from '@ceai-front/workflow';
import '@ceai-front/workflow/dist/es/ai-workflow.css';
import { Message, Spin } from '@arco-design/web-react';
import classNames from 'classnames';
import { useHistory, useParams } from 'react-router-dom';
import { MarkerType } from 'reactflow';
import SubHeader from '@/pages/ontologyScene/modules/graph/subHeader';
import {
  fetchDataTaskDetail,
  loadWorkflowDraft,
  persistWorkflowDraft,
  updateDataTask
} from '../services/api';
import { normalizeWorkflowDraft } from '../utils/workflowDraft';
import type { DataTaskDetail, ScheduleType, WorkflowDraft } from '../types';
import CanvasEmptyHint from './components/CanvasEmptyHint';
import { EditorHeader } from './components/EditorHeader';
import { createDataTaskNodesConfig } from './nodes';
import {
  createWorkflow,
  getWorkflow,
  setActiveDataTaskId,
  setWorkflowDraft,
  updateWorkflow
} from './services/draftApi';
import styles from './index.module.scss';

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

export default function DataTaskEditor() {
  const history = useHistory();
  const { taskId } = useParams<{ taskId?: string }>();
  const isCreateMode = !taskId;
  const [task, setTask] = useState<DataTaskDetail | null>(null);
  const [initialDraft, setInitialDraft] = useState<WorkflowDraft | null>(null);
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [draftRevision, setDraftRevision] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const activeTaskIdRef = useRef<string | null>(null);

  const nodesConfig = useMemo(() => createDataTaskNodesConfig(), []);

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

  const workflowSubHeader = useMemo(
    () => ({
      fullyCustomSubheader: (
        <>
          <SubHeader />
          <CanvasEmptyHint />
        </>
      )
    }),
    []
  );

  const initWorkflow = useCallback(createInitWorkflow(initialDraft), [
    initialDraft
  ]);

  const workflowProviderProps = useMemo(
    () => ({
      nodes: nodesConfig,
      initWorkflow,
      api: workflowApi,
      headerHeight: 0,
      edge: workflowEdge,
      subHeader: workflowSubHeader,
      // 仅关闭内置工具节点（含 HTTP/API 工具）与 IF/ELSE；
      // 分支器使用自定义 control 节点，数据源中的 API 接口类型保留
      showDefaultNodes: false,
      autoRefreshWhenTabVisible: false
    }),
    [nodesConfig, initWorkflow, workflowApi, workflowEdge, workflowSubHeader]
  );

  useEffect(() => {
    let cancelled = false;

    if (isCreateMode) {
      history.replace('/tenant/compute/onto/dataConnection/dataTask2?create=1');
      return undefined;
    }

    const bootstrap = async () => {
      setLoading(true);
      setCanvasReady(false);

      try {
        if (!taskId) {
          return;
        }

        const detail = await fetchDataTaskDetail(taskId);
        if (cancelled) {
          return;
        }

        const draft = normalizeWorkflowDraft(
          await loadWorkflowDraft(taskId, detail.processId),
          detail.id
        );

        if (cancelled) {
          return;
        }

        activeTaskIdRef.current = detail.id;
        setActiveDataTaskId(detail.id);
        setWorkflowDraft(draft, detail.id);
        setTask(detail);
        setInitialDraft(draft);
        setDraftRevision((revision) => revision + 1);
        setCanvasReady(true);
      } catch (error: any) {
        if (!cancelled) {
          Message.error(error?.message || '加载数据任务失败');
          history.replace('/tenant/compute/onto/dataConnection/dataTask2');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
      setActiveDataTaskId(null);
      setCanvasReady(false);
    };
  }, [history, isCreateMode, taskId]);

  const handleBack = () => {
    history.push('/tenant/compute/onto/dataConnection/dataTask2');
  };

  const handleSave = async (values: {
    name: string;
    description?: string;
    scheduleType: ScheduleType;
    cron?: string;
  }) => {
    if (!task) {
      Message.warning('任务信息不存在');
      return;
    }

    setSaving(true);

    try {
      const currentTask = await updateDataTask({
        id: task.id,
        name: values.name,
        description: values.description,
        scheduleType: values.scheduleType,
        cron: values.cron
      });

      const workflowResponse = await getWorkflow();
      const draft = normalizeWorkflowDraft(
        (workflowResponse?.data as WorkflowDraft) ?? initialDraft,
        currentTask.id
      );

      await persistWorkflowDraft(currentTask.id, draft, currentTask.processId);
      setWorkflowDraft(draft, currentTask.id);
      setInitialDraft(draft);
      setDraftRevision((revision) => revision + 1);
      setTask(currentTask);
      Message.success('保存成功');
    } catch (error: any) {
      Message.error(error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (isCreateMode) {
    return (
      <div className={styles['loading-container']}>
        <Spin block />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles['loading-container']}>
        <Spin block />
      </div>
    );
  }

  return (
    <div className={styles['data-task-editor']} data-task-editor="true">
      <EditorHeader
        task={task}
        saving={saving}
        onBack={handleBack}
        onSave={handleSave}
      />

      <div className={styles['canvas-container']}>
        {canvasReady ? (
          <AIWorkflowProvider
            key={`data-task-editor-${activeTaskIdRef.current ?? task?.id ?? 'edit'}-${draftRevision}`}
            {...workflowProviderProps}
          >
            <AIWorflow
              className={classNames(
                styles['ai-workflow'],
                styles['edge-style']
              )}
            />
          </AIWorkflowProvider>
        ) : (
          <div className={styles['loading-container']}>
            <Spin block />
          </div>
        )}
      </div>
    </div>
  );
}

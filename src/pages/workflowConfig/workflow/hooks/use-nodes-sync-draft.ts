import { useCallback } from 'react';
import produce from 'immer';
import { Edge, Node, useStoreApi } from 'reactflow';
import { useStore, useWorkflowStore } from '../store';
import { BlockEnum } from '../types';
import { useWorkflowUpdate } from '../hooks';
import { useNodesReadOnly } from './use-workflow';
import { createWorkflowDraft } from '@/api/workflowV2';
import { PrefixV2, PrefixAimdp } from '@/api/endpoints';
import { updateQueryParams, useParams } from '@/utils/url';
import { useHistory } from 'react-router';
import { flowIsStruct } from '@/pages/workflowConfig/workflow/utils';
import { Message } from '@arco-design/web-react';
import { useLocation, useParams as useRouterParams } from 'react-router-dom';
import { getWorkflowDetail } from '@/api/workflow';

/**
 * 查找画布中没有没有前置节点的节点，并给edge中加入一条"没有source"描述的edge数据
 * 后端需要这个东西
 */
function addRootEdges(nodes: Node[], edges: Edge[]): Edge[] {
  // 先对连线数据进行清理，清除source为空的连线
  const relations = edges.filter(({ source }) => !!source);
  // 1️⃣ 收集所有有入度的节点（target）
  const targetSet = new Set<string>();

  for (const relation of relations) {
    if (relation.target) {
      targetSet.add(relation.target);
    }
  }
  // 2️⃣ 找出没有上级节点的 node
  const newEdges: Edge[] = [];

  for (const node of nodes) {
    if (!targetSet.has(node.id)) {
      newEdges.push({
        source: '',
        target: node.id,
        id: `root-source-${node.id}-target` // 可选，保证唯一
      });
    }
  }

  // 3️⃣ 返回合并后的 edges
  return relations.concat(newEdges);
}

export const useNodesSyncDraft = () => {
  const store = useStoreApi();
  const workflowStore = useWorkflowStore();
  const history = useHistory();

  const { getNodesReadOnly } = useNodesReadOnly();
  const { handleRefreshWorkflowDraft } = useWorkflowUpdate();
  const debouncedSyncWorkflowDraft = useStore(
    (s) => s.debouncedSyncWorkflowDraft
  );

  const appId = useParams('workflow_uuid');
  const dsAppId = useParams('ds_workflow_id');
  const workflowVersion = useParams('workflow_version');
  const { type: flowType = 'noStruct' } =
    useRouterParams<Record<string, string>>();
  const getPostParams = useCallback(() => {
    const { getNodes, edges, transform } = store.getState();
    const [x, y, zoom] = transform;
    const {
      appId,
      conversationVariables,
      environmentVariables,
      syncWorkflowDraftHash
    } = workflowStore.getState();

    if (appId) {
      const nodes = getNodes();
      const hasStartNode = nodes.find(
        (node) => node.data.type === BlockEnum.Start
      );
      const isStruct = flowType === 'struct';
      // 非结构化工作流才必须有开始节点
      if (!hasStartNode && !isStruct) return;

      const features = {} as any;
      const producedNodes = produce(nodes, (draft) => {
        draft.forEach((node) => {
          Object.keys(node.data).forEach((key) => {
            if (key.startsWith('_')) delete node.data[key];
          });
        });
      });
      const producedEdges = produce(edges, (draft) => {
        draft.forEach((edge) => {
          Object.keys(edge.data).forEach((key) => {
            if (key.startsWith('_')) delete edge.data[key];
          });
        });
      });
      return {
        params: {
          graph: {
            nodes: producedNodes,
            edges:
              flowType !== 'struct'
                ? producedEdges
                : addRootEdges(producedNodes, producedEdges),
            viewport: {
              x,
              y,
              zoom
            }
          },
          features: {
            opening_statement: features.opening?.enabled
              ? features.opening?.opening_statement || ''
              : '',
            suggested_questions: features.opening?.enabled
              ? features.opening?.suggested_questions || []
              : [],
            suggested_questions_after_answer: features.suggested,
            text_to_speech: features.text2speech,
            speech_to_text: features.speech2text,
            retriever_resource: features.citation,
            sensitive_word_avoidance: features.moderation,
            file_upload: features.file
          },
          environment_variables: environmentVariables,
          conversation_variables: conversationVariables,
          hash: syncWorkflowDraftHash,
          workflow_type: flowType === 'struct' ? 'struct' : 'no_struct'
        }
      };
    }
  }, [store, workflowStore, flowType]);

  const syncWorkflowDraftWhenPageClose = useCallback(() => {
    if (getNodesReadOnly()) return;
    const postParams = getPostParams();
    if (postParams) {
      navigator.sendBeacon(
        `${PrefixAimdp}/workflow/draft/${appId}/${dsAppId}${workflowVersion ? '/' + workflowVersion : ''}`,
        JSON.stringify({ ...postParams.params, version: 'draft' })
        // new Blob([JSON.stringify({...postParams.params, version: "draft"})], {type: 'application/json'})
      );
    }
  }, [
    getPostParams,
    flowType,
    appId,
    dsAppId,
    workflowVersion,
    getNodesReadOnly
  ]);

  const doSyncWorkflowDraft = useCallback(
    async (
      notRefreshWhenSyncError?: boolean,
      callback?: {
        onSuccess?: (res: any) => void;
        onError?: (error?: any) => void;
        onSettled?: () => void;
      },
      params = {}
    ) => {
      const isNodesReadOnly = getNodesReadOnly();
      console.log('节点是否是只读的：', isNodesReadOnly);
      if (isNodesReadOnly) return;
      const postParams = getPostParams();
      if (postParams) {
        const { setSyncWorkflowDraftHash, setDraftUpdatedAt } =
          workflowStore.getState();
        try {
          const flowDetail = await getWorkflowDetail({
            workflow_uuid: appId!,
            workflow_version: workflowVersion || null
          });
          if (!!flowDetail?.data?.is_online) return;
          const { data: res, message } = await createWorkflowDraft(
            Object.assign({}, postParams.params, {
              version: 'draft',
              ...params
            })
          );
          if (!res) {
            throw new Error(message);
          }
          setSyncWorkflowDraftHash(res.hash);
          setDraftUpdatedAt(res.updated_at);
          updateQueryParams(history, {
            ds_workflow_id: res.ds_workflow_id
          });
          callback?.onSuccess?.(res);
        } catch (error: any) {
          if (error && error.json && !error.bodyUsed) {
            error.json().then((err: any) => {
              if (
                err.code === 'draft_workflow_not_sync' &&
                !notRefreshWhenSyncError
              )
                handleRefreshWorkflowDraft();
            });
          }
          callback?.onError && callback.onError(error);
        } finally {
          callback?.onSettled && callback.onSettled();
        }
      } else {
        Message.error('至少添加一个节点');
      }
    },
    [
      appId,
      workflowStore,
      getPostParams,
      getNodesReadOnly,
      handleRefreshWorkflowDraft
    ]
  );

  const handleSyncWorkflowDraft = useCallback(
    (
      sync?: boolean,
      notRefreshWhenSyncError?: boolean,
      callback?: {
        onSuccess?: () => void;
        onError?: (error?: any) => void;
        onSettled?: () => void;
      },
      params = {}
    ) => {
      if (getNodesReadOnly()) return;
      if (sync) doSyncWorkflowDraft(notRefreshWhenSyncError, callback, params);
      else debouncedSyncWorkflowDraft(doSyncWorkflowDraft);
    },
    [debouncedSyncWorkflowDraft, doSyncWorkflowDraft, getNodesReadOnly]
  );

  return {
    doSyncWorkflowDraft,
    handleSyncWorkflowDraft,
    syncWorkflowDraftWhenPageClose
  };
};

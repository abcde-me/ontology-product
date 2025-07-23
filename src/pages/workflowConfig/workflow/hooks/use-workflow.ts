import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { uniqBy } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useContext } from 'use-context-selector';
import { getIncomers, getOutgoers, useStoreApi } from 'reactflow';
import type { Connection } from 'reactflow';
import type { Edge, Node, ValueSelector } from '../types';
import { BlockEnum, WorkflowRunningStatus } from '../types';
import { useStore, useWorkflowStore } from '../store';
import { getParallelInfo } from '../utils';
import {
  PARALLEL_DEPTH_LIMIT,
  PARALLEL_LIMIT,
  SUPPORT_OUTPUT_VARS_NODE
} from '../constants';
import { CUSTOM_NOTE_NODE } from '../note-node/constants';
import {
  findUsedVarNodes,
  getNodeOutputVars,
  updateNodeVars
} from '../nodes/_base/components/variable/utils';
import { useNodesExtraData } from './use-nodes-data';
import { useWorkflowTemplate } from './use-workflow-template';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import {
  getWorkflowDraft,
  createWorkflowDraft,
  getWorkflowPublish,
  getWorkflowBlockConfig
} from '@/api/workflowV2';
import type { FetchWorkflowDraftResponse } from '@/pages/workflowConfig/types/workflow';
// import {
//   fetchAllBuiltInTools,
//   fetchAllCustomTools,
//   fetchAllWorkflowTools,
// } from '@/service/tools'
import I18n from '@/pages/workflowConfig/context/i18n';
import { CollectionType } from '@/pages/workflowConfig/tools/types';
import { CUSTOM_ITERATION_START_NODE } from '@/pages/workflowConfig/workflow/nodes/iteration-start/constants';
import { CUSTOM_LOOP_START_NODE } from '@/pages/workflowConfig/workflow/nodes/loop-start/constants';
// import { useWorkflowConfig } from '@/service/use-workflow'
import { canFindTool } from '@/pages/workflowConfig/utils';
import workflowsDraftConfig from '@/pages/workflowConfig/mockData/workflowsDraftConfig.json';
import { IsOnline } from '@/types/workflowApi';
// import defaultWorkflowBlockConfigs from '@/pages/workflowConfig/mockData/defaultWorkflowBlockConfigs.json'
// import workflowsPublish from '@/pages/workflowConfig/mockData/workflowsPublish.json'
// import workflowDraft from '@/pages/workflowConfig/mockData/workflowDraft.json'
import { useLocation } from 'react-router-dom';
import { useParams } from '@/utils/url';

export const useIsChatMode = () => {
  const appDetail = useTaskStore((s) => s.workflowDetail);

  // TODO: 删除无用代码
  // @ts-expect-error
  return appDetail?.mode === 'advanced-chat';
};

export const useWorkflow = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { locale } = useContext(I18n);
  const store = useStoreApi();
  const workflowStore = useWorkflowStore();
  const appId = useStore((s) => s.appId);
  const nodesExtraData = useNodesExtraData();
  // const { data: workflowConfig } = useWorkflowConfig(appId)
  console.warn('API NOT IMPLEMENTED', 'useWorkflowConfig');

  const workflowConfig = workflowsDraftConfig;
  const setPanelWidth = useCallback(
    (width: number) => {
      localStorage.setItem('workflow-node-panel-width', `${width}`);
      workflowStore.setState({ panelWidth: width });
    },
    [workflowStore]
  );

  const getTreeLeafNodes = useCallback(
    (nodeId: string) => {
      const { getNodes, edges } = store.getState();
      const nodes = getNodes();
      let startNode = nodes.find((node) => node.data.type === BlockEnum.Start);
      const currentNode = nodes.find((node) => node.id === nodeId);

      if (currentNode?.parentId)
        startNode = nodes.find(
          (node) =>
            node.parentId === currentNode.parentId &&
            (node.type === CUSTOM_ITERATION_START_NODE ||
              node.type === CUSTOM_LOOP_START_NODE)
        );

      if (!startNode) return [];

      const list: Node[] = [];
      const preOrder = (root: Node, callback: (node: Node) => void) => {
        if (root.id === nodeId) return;
        const outgoers = getOutgoers(root, nodes, edges);

        if (outgoers.length) {
          outgoers.forEach((outgoer) => {
            preOrder(outgoer, callback);
          });
        } else {
          if (root.id !== nodeId) callback(root);
        }
      };
      preOrder(startNode, (node) => {
        list.push(node);
      });

      const incomers = getIncomers({ id: nodeId } as Node, nodes, edges);

      list.push(...incomers);

      return uniqBy(list, 'id').filter((item) => {
        return SUPPORT_OUTPUT_VARS_NODE.includes(item.data.type);
      });
    },
    [store]
  );

  const getBeforeNodesInSameBranch = useCallback(
    (nodeId: string, newNodes?: Node[], newEdges?: Edge[]) => {
      const { getNodes, edges } = store.getState();
      const nodes = newNodes || getNodes();
      const currentNode = nodes.find((node) => node.id === nodeId);

      const list: Node[] = [];

      if (!currentNode) return list;

      if (currentNode.parentId) {
        const parentNode = nodes.find(
          (node) => node.id === currentNode.parentId
        );
        if (parentNode) {
          const parentList = getBeforeNodesInSameBranch(parentNode.id);

          list.push(...parentList);
        }
      }

      const traverse = (root: Node, callback: (node: Node) => void) => {
        if (root) {
          const incomers = getIncomers(root, nodes, newEdges || edges);

          if (incomers.length) {
            incomers.forEach((node) => {
              if (!list.find((n) => node.id === n.id)) {
                callback(node);
                traverse(node, callback);
              }
            });
          }
        }
      };
      traverse(currentNode, (node) => {
        list.push(node);
      });

      const length = list.length;
      if (length) {
        return uniqBy(list, 'id')
          .reverse()
          .filter((item) => {
            return SUPPORT_OUTPUT_VARS_NODE.includes(item.data.type);
          });
      }

      return [];
    },
    [store]
  );

  const getBeforeNodesInSameBranchIncludeParent = useCallback(
    (nodeId: string, newNodes?: Node[], newEdges?: Edge[]) => {
      const nodes = getBeforeNodesInSameBranch(nodeId, newNodes, newEdges);
      const { getNodes } = store.getState();
      const allNodes = getNodes();
      const node = allNodes.find((n) => n.id === nodeId);
      const parentNodeId = node?.parentId;
      const parentNode = allNodes.find((n) => n.id === parentNodeId);
      if (parentNode) nodes.push(parentNode);

      return nodes;
    },
    [getBeforeNodesInSameBranch, store]
  );

  const getAfterNodesInSameBranch = useCallback(
    (nodeId: string) => {
      const { getNodes, edges } = store.getState();
      const nodes = getNodes();
      const currentNode = nodes.find((node) => node.id === nodeId)!;

      if (!currentNode) return [];
      const list: Node[] = [currentNode];

      const traverse = (root: Node, callback: (node: Node) => void) => {
        if (root) {
          const outgoers = getOutgoers(root, nodes, edges);

          if (outgoers.length) {
            outgoers.forEach((node) => {
              callback(node);
              traverse(node, callback);
            });
          }
        }
      };
      traverse(currentNode, (node) => {
        list.push(node);
      });

      return uniqBy(list, 'id');
    },
    [store]
  );

  const getBeforeNodeById = useCallback(
    (nodeId: string) => {
      const { getNodes, edges } = store.getState();
      const nodes = getNodes();
      const node = nodes.find((node) => node.id === nodeId)!;

      return getIncomers(node, nodes, edges);
    },
    [store]
  );

  const getIterationNodeChildren = useCallback(
    (nodeId: string) => {
      const { getNodes } = store.getState();
      const nodes = getNodes();

      return nodes.filter((node) => node.parentId === nodeId);
    },
    [store]
  );

  const getLoopNodeChildren = useCallback(
    (nodeId: string) => {
      const { getNodes } = store.getState();
      const nodes = getNodes();

      return nodes.filter((node) => node.parentId === nodeId);
    },
    [store]
  );

  const isFromStartNode = useCallback(
    (nodeId: string) => {
      const { getNodes } = store.getState();
      const nodes = getNodes();
      const currentNode = nodes.find((node) => node.id === nodeId);

      if (!currentNode) return false;

      if (currentNode.data.type === BlockEnum.Start) return true;

      const checkPreviousNodes = (node: Node) => {
        const previousNodes = getBeforeNodeById(node.id);

        for (const prevNode of previousNodes) {
          if (prevNode.data.type === BlockEnum.Start) return true;
          if (checkPreviousNodes(prevNode)) return true;
        }

        return false;
      };

      return checkPreviousNodes(currentNode);
    },
    [store, getBeforeNodeById]
  );

  const handleOutVarRenameChange = useCallback(
    (
      nodeId: string,
      oldValeSelector: ValueSelector,
      newVarSelector: ValueSelector
    ) => {
      const { getNodes, setNodes } = store.getState();
      const afterNodes = getAfterNodesInSameBranch(nodeId);
      const effectNodes = findUsedVarNodes(oldValeSelector, afterNodes);
      if (effectNodes.length > 0) {
        const newNodes = getNodes().map((node) => {
          if (effectNodes.find((n) => n.id === node.id))
            return updateNodeVars(node, oldValeSelector, newVarSelector);

          return node;
        });
        setNodes(newNodes);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [store]
  );

  const isVarUsedInNodes = useCallback(
    (varSelector: ValueSelector) => {
      const nodeId = varSelector[0];
      const afterNodes = getAfterNodesInSameBranch(nodeId);
      const effectNodes = findUsedVarNodes(varSelector, afterNodes);
      return effectNodes.length > 0;
    },
    [getAfterNodesInSameBranch]
  );

  const removeUsedVarInNodes = useCallback(
    (varSelector: ValueSelector) => {
      const nodeId = varSelector[0];
      const { getNodes, setNodes } = store.getState();
      const afterNodes = getAfterNodesInSameBranch(nodeId);
      const effectNodes = findUsedVarNodes(varSelector, afterNodes);
      if (effectNodes.length > 0) {
        const newNodes = getNodes().map((node) => {
          if (effectNodes.find((n) => n.id === node.id))
            return updateNodeVars(node, varSelector, []);

          return node;
        });
        setNodes(newNodes);
      }
    },
    [getAfterNodesInSameBranch, store]
  );

  const isNodeVarsUsedInNodes = useCallback(
    (node: Node, isChatMode: boolean) => {
      const outputVars = getNodeOutputVars(node, isChatMode);
      const isUsed = outputVars.some((varSelector) => {
        return isVarUsedInNodes(varSelector);
      });
      return isUsed;
    },
    [isVarUsedInNodes]
  );

  const checkParallelLimit = useCallback(
    (nodeId: string, nodeHandle = 'source') => {
      const { edges } = store.getState();
      const connectedEdges = edges.filter(
        (edge) => edge.source === nodeId && edge.sourceHandle === nodeHandle
      );
      if (connectedEdges.length > PARALLEL_LIMIT - 1) {
        const { setShowTips } = workflowStore.getState();
        setShowTips(
          t('workflow.common.parallelTip.limit', { num: PARALLEL_LIMIT })
        );
        return false;
      }

      return true;
    },
    [store, workflowStore, t]
  );

  const checkNestedParallelLimit = useCallback(
    (nodes: Node[], edges: Edge[], parentNodeId?: string) => {
      const { parallelList, hasAbnormalEdges } = getParallelInfo(
        nodes,
        edges,
        parentNodeId
      );

      if (hasAbnormalEdges) return false;

      for (let i = 0; i < parallelList.length; i++) {
        const parallel = parallelList[i];

        if (
          parallel.depth >
          (workflowConfig?.parallel_depth_limit || PARALLEL_DEPTH_LIMIT)
        ) {
          const { setShowTips } = workflowStore.getState();
          setShowTips(
            t('workflow.common.parallelTip.depthLimit', {
              num: workflowConfig?.parallel_depth_limit || PARALLEL_DEPTH_LIMIT
            })
          );
          return false;
        }
      }

      return true;
    },
    [t, workflowStore, workflowConfig?.parallel_depth_limit]
  );

  const isValidConnection = useCallback(
    ({ source, sourceHandle, target }: Connection) => {
      const { edges, getNodes } = store.getState();
      const nodes = getNodes();
      const sourceNode: Node = nodes.find((node) => node.id === source)!;
      const targetNode: Node = nodes.find((node) => node.id === target)!;

      if (!checkParallelLimit(source!, sourceHandle || 'source')) return false;

      if (
        sourceNode.type === CUSTOM_NOTE_NODE ||
        targetNode.type === CUSTOM_NOTE_NODE
      )
        return false;

      if (sourceNode.parentId !== targetNode.parentId) return false;

      if (sourceNode && targetNode) {
        const sourceNodeAvailableNextNodes =
          nodesExtraData[sourceNode.data.type].availableNextNodes;
        const targetNodeAvailablePrevNodes = [
          ...nodesExtraData[targetNode.data.type].availablePrevNodes,
          BlockEnum.Start
        ];

        if (!sourceNodeAvailableNextNodes.includes(targetNode.data.type))
          return false;

        if (!targetNodeAvailablePrevNodes.includes(sourceNode.data.type))
          return false;
      }

      const hasCycle = (node: Node, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      return !hasCycle(targetNode);
    },
    [store, nodesExtraData, checkParallelLimit]
  );

  const formatTimeFromNow = useCallback(
    (time: number) => {
      return dayjs(time)
        .locale(locale === 'zh-Hans' ? 'zh-cn' : locale)
        .fromNow();
    },
    [locale]
  );

  const getNode = useCallback(
    (nodeId?: string) => {
      const { getNodes } = store.getState();
      const nodes = getNodes();

      return (
        nodes.find((node) => node.id === nodeId) ||
        nodes.find((node) => node.data.type === BlockEnum.Start)
      );
    },
    [store]
  );

  return {
    setPanelWidth,
    getTreeLeafNodes,
    getBeforeNodesInSameBranch,
    getBeforeNodesInSameBranchIncludeParent,
    getAfterNodesInSameBranch,
    handleOutVarRenameChange,
    isVarUsedInNodes,
    removeUsedVarInNodes,
    isNodeVarsUsedInNodes,
    checkParallelLimit,
    checkNestedParallelLimit,
    isValidConnection,
    isFromStartNode,
    formatTimeFromNow,
    getNode,
    getBeforeNodeById,
    getIterationNodeChildren,
    getLoopNodeChildren
  };
};

export const useFetchToolsData = () => {
  const workflowStore = useWorkflowStore();

  const handleFetchAllTools = useCallback(
    (type: string) => {
      // if (type === 'builtin') {
      //   const buildInTools = await fetchAllBuiltInTools()

      //   workflowStore.setState({
      //     buildInTools: buildInTools || [],
      //   })
      // }
      if (type === 'custom') {
        console.warn(
          'API NOT IMPLEMENTED',
          'fetchAllCustomTools',
          'fetchAllWorkflowTools'
        );
        // const customTools = await fetchAllCustomTools()
        const customTools = [] as any;

        workflowStore.setState({
          customTools: customTools || []
        });
      }
      if (type === 'workflow') {
        // const workflowTools = await fetchAllWorkflowTools()
        const workflowTools = [] as any;

        workflowStore.setState({
          workflowTools: workflowTools || []
        });
      }
    },
    [workflowStore]
  );

  return {
    handleFetchAllTools
  };
};

export const useWorkflowInit = () => {
  const workflowStore = useWorkflowStore();
  // TODO: ts错误
  // @ts-expect-error
  const { nodes: nodesTemplate, edges: edgesTemplate } = useWorkflowTemplate();
  const { handleFetchAllTools } = useFetchToolsData();
  const appDetail = useTaskStore((state) => state.workflowDetail);
  const setSyncWorkflowDraftHash = useStore((s) => s.setSyncWorkflowDraftHash);
  const [data, setData] = useState<FetchWorkflowDraftResponse>();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    workflowStore.setState({ appId: appDetail?.workflow_uuid });
  }, [appDetail?.workflow_uuid, workflowStore]);

  const location = useLocation(); // 获取当前路由信息
  // 只有在作业详情的时候处理
  const isShowChatMode =
    location.pathname === '/tenant/compute/modaforge/workflowTaskDetail';
  const handleGetInitialWorkflowData = useCallback(async () => {
    try {
      const result = await getWorkflowDraft();
      if (result.code.indexOf('WorkflowDraftNotFound') > -1) {
        workflowStore.setState({ notInitialWorkflow: true });
        createWorkflowDraft({
          graph: {
            nodes: nodesTemplate,
            edges: edgesTemplate
          },
          features: {
            retriever_resource: { enabled: true }
          },
          environment_variables: [],
          conversation_variables: [],
          version: 'draft'
        }).then(({ data: res }) => {
          workflowStore.getState().setDraftUpdatedAt(res.updated_at);
          handleGetInitialWorkflowData();
        });
      } else {
        const res = result.data;
        if (appDetail?.is_online !== IsOnline.online && !isShowChatMode) {
          // 每次刷新或者重新打开页面，不是上线模式则重置用户反选的文件
          result?.data?.graph?.nodes
            ?.filter((n) =>
              [
                BlockEnum.Text,
                BlockEnum.Pic,
                BlockEnum.Video,
                BlockEnum.Audio
              ].includes(n.data.type)
            )
            .forEach((node) => {
              node.data.files = [];
              node.data.selected_files_num = 0;
            });
        }
        const setRes = result?.data?.graph?.nodes?.map((node, index) => {
          return {
            ...node,
            selected: false,
            data: {
              ...node?.data,
              selected: false
            },
            position: {
              ...node.position,
              y: node?.position?.y - 180
            },
            positionAbsolute: {
              ...node.positionAbsolute,
              y: node?.positionAbsolute?.y - 180
            }
          };
        });
        const newRes = {
          ...res,
          graph: {
            ...res?.graph,
            nodes: setRes
          }
        };
        // 在作业详情的时候修改节点位置，其他情况还是原始数据不处理
        setData(isShowChatMode ? newRes : res);
        workflowStore.setState({
          envSecrets: (res.environment_variables || [])
            .filter((env) => env.value_type === 'secret')
            .reduce(
              (acc, env) => {
                acc[env.id] = env.value;
                return acc;
              },
              {} as Record<string, string>
            ),
          environmentVariables:
            res.environment_variables?.map((env) =>
              env.value_type === 'secret'
                ? { ...env, value: '[__HIDDEN__]' }
                : env
            ) || [],
          conversationVariables: res.conversation_variables || []
        });
        setSyncWorkflowDraftHash(res.hash);
        setIsLoading(false);
      }
    } catch (error: any) {
      if (error && error.json && !error.bodyUsed && appDetail) {
        error.json().then((err: any) => {
          if (err.code === 'draft_workflow_not_exist') {
            workflowStore.setState({ notInitialWorkflow: true });
            createWorkflowDraft({
              graph: {
                nodes: nodesTemplate,
                edges: edgesTemplate
              },
              features: {
                retriever_resource: { enabled: true }
              },
              environment_variables: [],
              conversation_variables: [],
              version: 'draft'
            }).then(({ data: res }) => {
              workflowStore.getState().setDraftUpdatedAt(res.updated_at);
              handleGetInitialWorkflowData();
            });
          }
        });
      }
    }
  }, [
    appDetail,
    nodesTemplate,
    edgesTemplate,
    workflowStore,
    setSyncWorkflowDraftHash
  ]);

  useEffect(() => {
    handleGetInitialWorkflowData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchPreloadData = useCallback(async () => {
    // try {
    //   const { data: nodesDefaultConfigsData } = await getWorkflowBlockConfig(appDetail?.id)
    //   const { data: publishedWorkflow } = await getWorkflowPublish(appDetail?.id)
    //   workflowStore.setState({
    //     nodesDefaultConfigs: nodesDefaultConfigsData.reduce((acc, block) => {
    //       if (!acc[block.type])
    //         acc[block.type] = { ...block.config }
    //       return acc
    //     }, {} as Record<string, any>),
    //   })
    //   workflowStore.getState().setPublishedAt(publishedWorkflow?.created_at)
    // }
    // catch (e) {
    //   console.error(e)
    // }
  }, [workflowStore, appDetail]);

  useEffect(() => {
    handleFetchPreloadData();
    handleFetchAllTools('builtin');
    handleFetchAllTools('custom');
    handleFetchAllTools('workflow');
  }, [handleFetchPreloadData, handleFetchAllTools]);

  useEffect(() => {
    if (data) {
      workflowStore.getState().setDraftUpdatedAt(data.updated_at);
      workflowStore.getState().setToolPublished(data.tool_published);
    }
  }, [data, workflowStore]);

  return {
    data,
    isLoading
  };
};

export const useWorkflowReadOnly = () => {
  const workflowStore = useWorkflowStore();
  const workflowRunningData = useStore((s) => s.workflowRunningData);

  const getWorkflowReadOnly = useCallback(() => {
    return (
      workflowStore.getState().workflowRunningData?.result.status ===
      WorkflowRunningStatus.Running
    );
  }, [workflowStore]);

  return {
    workflowReadOnly:
      workflowRunningData?.result.status === WorkflowRunningStatus.Running,
    getWorkflowReadOnly
  };
};
export const useNodesReadOnly = () => {
  const workflowStore = useWorkflowStore();
  const workflowRunningData = useStore((s) => s.workflowRunningData);
  const historyWorkflowData = useStore((s) => s.historyWorkflowData);
  const isRestoring = useStore((s) => s.isRestoring);
  const currentUrl = window.location.pathname;
  const appDetail = useTaskStore((s) => s.workflowDetail);
  // url上携带版本，不支持工作流编辑，主要场景：作业详情跳转到工作流详情
  const workflowVersion = useParams('workflow_version');

  const getNodesReadOnly = useCallback(() => {
    const { workflowRunningData, historyWorkflowData, isRestoring } =
      workflowStore.getState();

    return (
      workflowRunningData?.result.status === WorkflowRunningStatus.Running ||
      currentUrl === '/tenant/compute/modaforge/workflowTaskDetail' ||
      historyWorkflowData ||
      isRestoring ||
      appDetail?.is_online === IsOnline.online ||
      !!workflowVersion
    );
  }, [workflowStore, appDetail]);

  return {
    nodesReadOnly: !!(
      workflowRunningData?.result.status === WorkflowRunningStatus.Running ||
      currentUrl === '/tenant/compute/modaforge/workflowTaskDetail' ||
      historyWorkflowData ||
      isRestoring ||
      appDetail?.is_online === IsOnline.online ||
      !!workflowVersion
    ),
    getNodesReadOnly
  };
};

export const useToolIcon = (data: Node['data']) => {
  const buildInTools = useStore((s) => s.buildInTools);
  const customTools = useStore((s) => s.customTools);
  const workflowTools = useStore((s) => s.workflowTools);
  const toolIcon = useMemo(() => {
    if (data.type === BlockEnum.Tool) {
      let targetTools = buildInTools;
      if (data.provider_type === CollectionType.builtIn)
        targetTools = buildInTools;
      else if (data.provider_type === CollectionType.custom)
        targetTools = customTools;
      else targetTools = workflowTools;
      return targetTools.find((toolWithProvider) =>
        canFindTool(toolWithProvider.id, data.provider_id)
      )?.icon;
    }
  }, [data, buildInTools, customTools, workflowTools]);

  return toolIcon;
};

export const useIsNodeInIteration = (iterationId: string) => {
  const store = useStoreApi();

  const isNodeInIteration = useCallback(
    (nodeId: string) => {
      const { getNodes } = store.getState();
      const nodes = getNodes();
      const node = nodes.find((node) => node.id === nodeId);

      if (!node) return false;

      if (node.parentId === iterationId) return true;

      return false;
    },
    [iterationId, store]
  );
  return {
    isNodeInIteration
  };
};

export const useIsNodeInLoop = (loopId: string) => {
  const store = useStoreApi();

  const isNodeInLoop = useCallback(
    (nodeId: string) => {
      const { getNodes } = store.getState();
      const nodes = getNodes();
      const node = nodes.find((node) => node.id === nodeId);

      if (!node) return false;

      if (node.parentId === loopId) return true;

      return false;
    },
    [loopId, store]
  );
  return {
    isNodeInLoop
  };
};

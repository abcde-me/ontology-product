import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStoreApi } from 'reactflow';
import type { Edge, Node } from '../types';
import { BlockEnum } from '../types';
import { useStore } from '../store';
import { flowIsStruct, getValidTreeNodes } from '../utils';
import { CUSTOM_NODE, MAX_TREE_DEPTH } from '../constants';
import { useNodesExtraData } from './use-nodes-data';
import { useToastContext } from '@/pages/workflowConfig/components/toast';
import { useGetLanguage } from '@/pages/workflowConfig/context/i18n';

export const useChecklist = (nodes: Node[], edges: Edge[]) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const isStruct = flowIsStruct(nodes);
  const language = useGetLanguage();
  const nodesExtraData = useNodesExtraData();
  const isChatMode = false;
  const buildInTools = useStore((s) => s.buildInTools);
  const customTools = useStore((s) => s.customTools);
  const workflowTools = useStore((s) => s.workflowTools);
  console.warn('API NOT IMPLEMENTED', 'useStrategyProviders');
  const strategyProviders = [] as any;

  const needWarningNodes = useMemo(() => {
    const list = [];
    const { validNodes } = getValidTreeNodes(
      nodes.filter((node) => node.type === CUSTOM_NODE),
      edges
    );

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      let toolIcon;
      let moreDataForCheckValid;

      if (node.type === CUSTOM_NODE) {
        const { errorMessage } = nodesExtraData[node.data.type].checkValid(
          node.data,
          t,
          moreDataForCheckValid
        );

        if (errorMessage || !validNodes.find((n) => n.id === node.id)) {
          // TODO: ts错误
          // @ts-expect-error
          list.push({
            id: node.id,
            type: node.data.type,
            title: node.data.title,
            toolIcon,
            unConnected:
              !validNodes.find((n) => n.id === node.id) &&
              node.data.flow_type !== 'struct',
            errorMessage
          });
        }
      }
    }

    if (
      !isChatMode &&
      !nodes.find((node) => node.data.type === BlockEnum.End) &&
      !isStruct
    ) {
      // @ts-expect-error
      list.push({
        id: 'end-need-added',
        type: BlockEnum.End,
        title: t('workflow.blocks.end'),
        errorMessage: t('workflow.common.needEndNode')
      });
    }

    return list;
  }, [
    nodes,
    edges,
    isChatMode,
    buildInTools,
    customTools,
    workflowTools,
    language,
    nodesExtraData,
    t,
    strategyProviders
  ]);

  return needWarningNodes;
};

export const useChecklistBeforePublish = () => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const language = useGetLanguage();
  const buildInTools = useStore((s) => s.buildInTools);
  const customTools = useStore((s) => s.customTools);
  const workflowTools = useStore((s) => s.workflowTools);
  const { notify } = useToastContext();
  const store = useStoreApi();
  const nodesExtraData = useNodesExtraData();
  // const { data: strategyProviders } = useStrategyProviders()
  const strategyProviders = [] as any;

  const handleCheckBeforePublish = useCallback(() => {
    const { getNodes, edges } = store.getState();
    const nodes = getNodes().filter((node) => node.type === CUSTOM_NODE);
    const { validNodes, maxDepth } = getValidTreeNodes(
      nodes.filter((node) => node.type === CUSTOM_NODE),
      edges
    );

    if (maxDepth > MAX_TREE_DEPTH) {
      notify({
        type: 'error',
        message: t('workflow.common.maxTreeDepth', { depth: MAX_TREE_DEPTH })
      });
      return false;
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      let moreDataForCheckValid;

      const { errorMessage } = nodesExtraData[
        node.data.type as BlockEnum
      ].checkValid(node.data, t, moreDataForCheckValid);

      if (errorMessage) {
        notify({
          type: 'error',
          message: `[${node.data.title}] ${errorMessage}`
        });
        return false;
      }

      if (!validNodes.find((n) => n.id === node.id)) {
        notify({
          type: 'error',
          message: `[${node.data.title}] ${t('workflow.common.needConnectTip')}`
        });
        return false;
      }
    }

    if (!nodes.find((node) => node.data.type === BlockEnum.End)) {
      notify({ type: 'error', message: t('workflow.common.needEndNode') });
      return false;
    }

    return true;
  }, [
    store,
    notify,
    t,
    buildInTools,
    customTools,
    workflowTools,
    language,
    nodesExtraData,
    strategyProviders
  ]);

  return {
    handleCheckBeforePublish
  };
};

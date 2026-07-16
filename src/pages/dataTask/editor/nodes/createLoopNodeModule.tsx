import React from 'react';
import { ErrorHandleMode } from '@ceai-front/workflow';
import type { NodeDefault } from '@ceai-front/workflow';
import loopNodeDefault from '@ceai-front/workflow/dist/es/workflow/nodes/loop/default';
import type { DataTaskNodeMeta } from '../../constants/nodeTypes';
import { LoopNode, LoopPanel } from './Loop';
import {
  collectUsedVarSelectors,
  replaceUsedVarSelectors
} from './_shared/nodeIoUtils';

export const createLoopNodeModule = (meta: DataTaskNodeMeta) => {
  const nodeDefault: NodeDefault<Record<string, unknown>> = {
    defaultValue: {
      _isSingleRun: true,
      variables: [],
      outputs: [],
      width: 420,
      height: 220,
      start_node_id: '',
      break_conditions: [],
      loop_count: 10,
      _children: [],
      logical_operator: 'and',
      error_handle_mode: ErrorHandleMode.Terminated,
      ...meta.defaultConfig,
      type: meta.type,
      title: meta.title,
      desc: meta.description
    },
    getAvailablePrevNodes: loopNodeDefault.getAvailablePrevNodes,
    getAvailableNextNodes: loopNodeDefault.getAvailableNextNodes,
    getUsedVars(payload) {
      return collectUsedVarSelectors(payload?.variables);
    },
    updateUsedVars(payload, oldSelector, newSelector) {
      if (!payload || typeof payload !== 'object') {
        return;
      }
      payload.variables = replaceUsedVarSelectors(
        payload.variables,
        oldSelector,
        newSelector
      );
    },
    checkValid(payload, t) {
      return loopNodeDefault.checkValid(
        payload as Parameters<typeof loopNodeDefault.checkValid>[0],
        t
      );
    }
  };

  return {
    Node: React.memo(LoopNode),
    Panel: LoopPanel,
    nodeDefault
  };
};

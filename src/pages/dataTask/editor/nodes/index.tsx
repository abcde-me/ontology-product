import React from 'react';
import { DATA_TASK_NODE_METAS } from '../../constants/nodeTypes';
import { DataTaskNodeType } from '../../types';
import { createDataTaskNodeModule } from './createNodeModule';
import { createLoopNodeModule } from './createLoopNodeModule';
import nodeCanvasStyles from '../nodeCanvas.module.scss';

export const createDataTaskNodesConfig = () =>
  DATA_TASK_NODE_METAS.map((meta) => {
    const { Node, Panel, nodeDefault } =
      meta.type === DataTaskNodeType.LOOP
        ? createLoopNodeModule(meta)
        : createDataTaskNodeModule(meta);

    return {
      type: meta.type,
      node: Node,
      panel: Panel,
      nodeDefault,
      classification: meta.classification,
      title: meta.title,
      about: meta.description,
      showDefaultSourceHandle: meta.showSourceHandle,
      showDefaultTargetHandle: meta.showTargetHandle,
      showNodeControl: true,
      canNodeResize: meta.canNodeResize ?? false,
      iconRender: (_data, { type }: { type: 'node' | 'panel' }) =>
        type === 'panel' ? (
          <span className={nodeCanvasStyles['panel-icon']}>{meta.icon}</span>
        ) : (
          <span
            className={`${nodeCanvasStyles['node-icon-box']} data-task-node-icon-box`}
          >
            {meta.icon}
          </span>
        )
    };
  });

import React, { memo, useMemo } from 'react';
import type { NodeProps } from 'reactflow';
import type { Node } from '../types';
import { CUSTOM_NODE } from '../constants';
import { NodeComponentMap, PanelComponentMap } from './constants';
import BaseNode from './_base/node';
import BasePanel from './_base/panel';
import { useStore as useTaskStore } from '@/pages/workflowConfig/task/store';
import { useShallow } from 'zustand/react/shallow';
import { TaskNodeStatus } from '@/types/workflowTaskApi';
import { nodeIsRunning } from '@/pages/workflowConfig/workflow/nodes/utils';

const CustomNode = (props: NodeProps) => {
  const nodeData = props.data;
  const NodeComponent = NodeComponentMap[nodeData.type];

  return (
    <>
      <BaseNode {...props}>
        <NodeComponent />
      </BaseNode>
    </>
  );
};
CustomNode.displayName = 'CustomNode';

export const Panel = memo((props: Node) => {
  const nodeClass = props.type;
  const nodeData = props.data;
  const PanelComponent = useMemo(() => {
    if (nodeClass === CUSTOM_NODE) return PanelComponentMap[nodeData.type];

    return () => null;
  }, [nodeClass, nodeData.type]);

  const { showMessageLogModal, nodesProcessData } = useTaskStore(
    useShallow((state) => ({
      showMessageLogModal: state.showMessageLogModal,
      nodesProcessData: state.nodesProcessDetail
    }))
  );
  const nodeProcessIng = useMemo(() => {
    if (!props.id) return;
    const state = nodesProcessData?.find((process) => {
      return process.task_code.toString() === props.id.toString();
    })?.state;
    return nodeIsRunning(state as TaskNodeStatus);
  }, [nodesProcessData, props.id]);

  if (nodeClass === CUSTOM_NODE) {
    return (
      <BasePanel key={props.id} {...props}>
        <PanelComponent readonly={nodeProcessIng} />
      </BasePanel>
    );
  }

  return null;
});

Panel.displayName = 'Panel';

export default memo(CustomNode);

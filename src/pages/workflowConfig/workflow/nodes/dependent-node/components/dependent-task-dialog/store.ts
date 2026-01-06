import { WorkflowDetailRes } from '@/types/workflowApi';
import { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { DependItem } from '@/pages/workflowConfig/workflow/nodes/dependent-node/types';
import { create } from 'zustand';
import React from 'react';

type TaskData = WorkflowDetailRes | NodeProps;

const generateNewDependentTasks = (
  data: TaskData,
  flow?: WorkflowDetailRes
): DependItem => {
  if ('workflow_uuid' in data) {
    return {
      dependentType: 'DEPENDENT_ON_WORKFLOW',
      definitionCode: data.ds_workflow_id,
      depTaskCode: 0,
      parameterPassing: false,
      title: data.workflow_name,
      desc: data.description || ''
    };
  }
  return {
    dependentType: 'DEPENDENT_ON_TASK',
    definitionCode: +data.id,
    depTaskCode: 0,
    parameterPassing: false,
    title: data.data.title,
    task_type: data.data.type,
    desc: `所属工作流：${flow!.workflow_name}`,
    parentFlow: flow!.ds_workflow_id
  };
};

interface DependentTaskActions {
  setCurrentFlow: (flow?: WorkflowDetailRes) => void;
  cacheNodes: (nodes: NodeTaskMap) => void;
  selectWorkflow: (flow: WorkflowDetailRes) => void;
  unselectWorkflow: (flowId: React.Key) => void;
  selectNode: (node: NodeProps) => void;
  unselectNode: (node: React.Key) => void;
  unselectTask: (task: DependItem) => void;
  clearAll: () => void;
  selectAll: () => void;
  clearCurrentNodes: () => void;
  initDependentTasks: (tasks?: DependItem[]) => void;
}

interface NodeTaskMap {
  all: NodeProps[];
  current: NodeProps[];
}

interface DependentTaskState {
  /**
   * 当前查看节点的工作流
   */
  currentFlow?: WorkflowDetailRes;
  /**
   * 当前选中的工作流
   */
  selectedFlowTask: Map<React.Key, DependItem>;
  /**
   * 当前选中的节点
   */
  selectedNodeTask: Map<React.Key, DependItem>;
  /**
   * 当前的工作流节点列表
   */
  nodesDataCache: NodeTaskMap;
}

export const useDependentTaskStore = create<
  DependentTaskState & DependentTaskActions
>((set, get) => ({
  currentFlow: undefined,

  selectedFlowTask: new Map(),
  selectedNodeTask: new Map(),

  nodesDataCache: { all: [], current: [] },

  setCurrentFlow(flow) {
    set({ currentFlow: flow });
  },

  cacheNodes(nodes) {
    set({ nodesDataCache: nodes });
  },

  selectWorkflow(flow) {
    const flowId = flow.ds_workflow_id;

    set((state) => {
      const flowMap = new Map(state.selectedFlowTask);
      flowMap.set(flowId, generateNewDependentTasks(flow));

      const nodeMap = new Map(state.selectedNodeTask);
      for (const [key, val] of nodeMap) {
        if (val.parentFlow === flowId) {
          nodeMap.delete(key);
        }
      }

      return {
        selectedFlowTask: flowMap,
        selectedNodeTask: nodeMap
      };
    });
  },

  unselectWorkflow(flowId) {
    set((state) => {
      const flowMap = new Map(state.selectedFlowTask);
      flowMap.delete(flowId);
      return { selectedFlowTask: flowMap };
    });
  },

  selectNode(node) {
    set((state) => {
      const flowMap = new Map(state.selectedFlowTask);
      const nodeMap = new Map(state.selectedNodeTask);
      const { all: allNodes } = state.nodesDataCache;
      const { ds_workflow_id: flowId } = state.currentFlow!;

      // 若已选 workflow，先降级
      if (flowMap.has(flowId)) {
        flowMap.delete(flowId);
      }
      const nodeId = Number(node.id);
      nodeMap.set(nodeId, generateNewDependentTasks(node, state.currentFlow));

      const isCheckAll = allNodes.every(({ id }) => nodeMap.has(+id));

      if (isCheckAll) {
        flowMap.set(
          flowId,
          generateNewDependentTasks(state.currentFlow as WorkflowDetailRes)
        );

        allNodes.forEach(({ id }) => nodeMap.delete(+id));
      }

      return {
        selectedFlowTask: flowMap,
        selectedNodeTask: nodeMap
      };
    });
  },

  unselectNode(nodeId: React.Key) {
    set((state) => {
      const flowMap = new Map(state.selectedFlowTask);
      const nodeMap = new Map(state.selectedNodeTask);
      const { ds_workflow_id: flowId } = state.currentFlow!;

      const wasFlowSelected = flowMap.has(flowId);

      if (wasFlowSelected) {
        flowMap.delete(flowId);
        state.nodesDataCache.all.forEach((n) => {
          if (n.id.toString() !== nodeId.toString()) {
            nodeMap.set(+n.id, generateNewDependentTasks(n, state.currentFlow));
          }
        });
      }

      nodeMap.delete(+nodeId);

      return {
        selectedFlowTask: flowMap,
        selectedNodeTask: nodeMap
      };
    });
  },
  unselectTask(dependent) {
    const { task_type, definitionCode } = dependent;
    const { unselectWorkflow, unselectNode } = get();
    // 工作流节点不存在task_type字段
    const unselectFunc = !task_type ? unselectWorkflow : unselectNode;
    unselectFunc(definitionCode);
  },
  clearAll() {
    set({
      selectedFlowTask: new Map(),
      selectedNodeTask: new Map()
    });
  },
  clearCurrentNodes() {
    const { nodesDataCache, unselectNode } = get();
    nodesDataCache.current.forEach(({ id }) => {
      unselectNode(id);
    });
  },
  selectAll() {
    const { nodesDataCache, selectNode } = get();
    nodesDataCache.current.forEach((node) => {
      selectNode(node);
    });
  },
  initDependentTasks(tasks?: DependItem[]) {
    set(() => {
      if (!tasks?.length)
        return {
          selectedFlowTask: new Map(),
          selectedNodeTask: new Map()
        };
      return tasks.reduce(
        (prev, current) => {
          const prop = !!current.task_type
            ? 'selectedNodeTask'
            : 'selectedFlowTask';
          prev[prop].set(current.definitionCode, current);
          return prev;
        },
        {
          selectedFlowTask: new Map(),
          selectedNodeTask: new Map()
        }
      );
    });
  }
}));

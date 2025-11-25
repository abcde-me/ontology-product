import { useState, useCallback } from 'react';
import { TreeNodeData } from '../types';
import { InputNodeType } from '../constants';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import { getInputNodeKey } from '../utils/nodeTypeUtils';

/**
 * 输入节点状态类型
 */
export interface InputNodesState {
  catalog: Map<string, TreeNodeData>;
  db: Map<string, TreeNodeData>;
  datasource: Map<string, TreeNodeData>;
  metadata: Map<string, TreeNodeData>;
}

/**
 * 管理输入节点状态的自定义Hook
 * 用于管理数据库、数据卷、元数据三种类型的输入节点
 */
export const useInputNodes = () => {
  // inputNodes的结构为：{ db: Map<string, TreeNodeData>, datasource: Map<string, TreeNodeData>, metadata: Map<string, TreeNodeData>, catalog: Map<string, TreeNodeData> }
  // 需要根据type来设置对应的Map,Map的key是对应新建节点的父节点的id
  const [inputNodes, setInputNodes] = useState<InputNodesState>({
    catalog: new Map(),
    db: new Map(),
    datasource: new Map(),
    metadata: new Map()
  });

  /**
   * 获取指定类型的输入节点
   */
  const getInputNode = useCallback(
    (type: InputNodeType, key: string): TreeNodeData | undefined => {
      return inputNodes[type].get(key);
    },
    [inputNodes]
  );

  /**
   * 设置指定类型的输入节点
   */
  const setInputNode = useCallback(
    (type: InputNodeType, key: string, node: TreeNodeData) => {
      // inputNodes的结构为：{ db: Map<string, TreeNodeData>, datasource: Map<string, TreeNodeData>, metadata: Map<string, TreeNodeData>, catalog: Map<string, TreeNodeData> }
      // 需要根据type来设置对应的Map,Map的key是对应新建节点的父节点的id
      setInputNodes((prev) => {
        const newMap = new Map(prev[type]);
        newMap.set(key, node);
        return { ...prev, [type]: newMap };
      });
    },
    []
  );

  /**
   * 删除指定类型的输入节点
   */
  const deleteInputNode = useCallback((type: InputNodeType, key: string) => {
    setInputNodes((prev) => {
      // if (!key) {
      //     return { ...prev, [type]: new Map() };
      // }

      const newMap = new Map(prev[type]);
      newMap.delete(key);
      return { ...prev, [type]: newMap };
    });
  }, []);

  /**
   * 判断节点是否为输入节点，并返回其类型
   */
  const getInputNodeType = useCallback(
    (dataRef: TreeNodeData | TreeDataType): InputNodeType | null => {
      if (!dataRef?.parentId) return 'catalog';
      const parentId = dataRef.parentId;
      if (inputNodes.db.has(`${parentId}-db`)) return 'db';
      if (inputNodes.datasource.has(`${parentId}-datasource`))
        return 'datasource';
      if (inputNodes.metadata.has(`${parentId}-metadata`)) return 'metadata';
      return null;
    },
    [inputNodes]
  );

  /**
   * 清理输入节点
   */
  const cleanupInputNode = useCallback(
    (
      inputType: InputNodeType | null,
      parentId: string | number,
      parentType: string
    ) => {
      if (inputType && parentId) {
        const nodeKey = getInputNodeKey(parentId, parentType);
        if (nodeKey) {
          deleteInputNode(inputType, nodeKey);
        }
      }
    },
    [deleteInputNode]
  );

  return {
    inputNodes,
    getInputNode,
    setInputNode,
    deleteInputNode,
    getInputNodeType,
    cleanupInputNode
  };
};

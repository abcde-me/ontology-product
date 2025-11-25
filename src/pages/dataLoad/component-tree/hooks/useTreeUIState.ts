import { useState, useCallback } from 'react';
import { TreeNodeData } from '../types';

/**
 * 管理树组件UI状态的自定义Hook
 * 用于管理悬浮节点、展开的节点keys、下拉框可见性等UI状态
 */
export const useTreeUIState = () => {
  const [hoverNode, setHoverNode] = useState<TreeNodeData | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  /**
   * 设置悬浮节点
   */
  const setHoverNodeState = useCallback((node: TreeNodeData | null) => {
    setHoverNode(node);
  }, []);

  /**
   * 添加展开的节点key
   */
  const addExpandedKey = useCallback((key: string) => {
    setExpandedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  /**
   * 设置展开的节点keys
   * 支持直接传入数组或函数形式
   */
  const setExpandedKeysState = useCallback(
    (keys: string[] | ((prev: string[]) => string[])) => {
      setExpandedKeys(keys);
    },
    []
  );

  /**
   * 设置下拉框可见性
   */
  const setDropdownVisibleState = useCallback((visible: boolean) => {
    setDropdownVisible(visible);
  }, []);

  return {
    hoverNode,
    expandedKeys,
    dropdownVisible,
    setHoverNode: setHoverNodeState,
    setExpandedKeys: setExpandedKeysState,
    addExpandedKey,
    setDropdownVisible: setDropdownVisibleState
  };
};

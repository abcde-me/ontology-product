import { useRef, useState, useCallback } from 'react';
import { RefInputType } from '@arco-design/web-react/es/Input/interface';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import { TreeNodeData } from '../types';
import { InputNodeType } from '../constants';
import { getInputNodeKey, getNodeTypeConfig } from '../utils/nodeTypeUtils';
import { deleteNodeRecursively } from '../utils/dataTransform';

interface UseEditingStateParams {
  getInputNodeType: (dataRef: TreeNodeData | TreeDataType) => string | null;
  deleteInputNode: (inputType: InputNodeType, nodeKey: string) => void;
  directoryData: TreeNodeData[];
  onDirectoryDataChange: (data: TreeNodeData[]) => void;
}

/**
 * 管理编辑状态的自定义Hook
 * 用于管理输入框的值、编辑状态和输入框引用
 */
export const useEditingState = (params?: UseEditingStateParams) => {
  const inputRef = useRef<RefInputType>(null);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  /**
   * 聚焦输入框并选中文本
   */
  const focusAndSelectInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.dom?.select();
      }
    }, 100);
  }, []);

  /**
   * 重置编辑状态
   */
  const resetEditingState = useCallback(() => {
    setIsEditing(false);
    setInputValue('');
  }, []);

  /**
   * 开始编辑
   */
  const startEditing = useCallback(
    (value = '') => {
      setInputValue(value);
      setIsEditing(true);
      // 延迟聚焦，确保DOM更新完成
      setTimeout(() => {
        focusAndSelectInput();
      }, 100);
    },
    [focusAndSelectInput]
  );

  /**
   * 清理输入框状态
   */
  const clearInputState = useCallback(
    (dataRef: TreeNodeData | TreeDataType) => {
      if (!params) {
        resetEditingState();
        return;
      }

      const { getInputNodeType, deleteInputNode } = params;
      const inputType = getInputNodeType(dataRef);
      if (inputType) {
        // 如果是catalog类型，也就是根目录，不存在parentId, 存在Map里的key是id
        deleteInputNode(
          inputType as InputNodeType,
          dataRef.parentId ? `${dataRef.parentId}-${inputType}` : dataRef.id
        );
      }
      // 重置编辑状态
      resetEditingState();
    },
    [params, resetEditingState]
  );

  return {
    inputRef,
    inputValue,
    isEditing,
    setInputValue,
    setIsEditing,
    resetEditingState,
    focusAndSelectInput,
    startEditing,
    clearInputState
  };
};

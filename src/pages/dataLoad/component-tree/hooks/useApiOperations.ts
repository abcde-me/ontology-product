import { useCallback } from 'react';
import { Message } from '@arco-design/web-react';
import {
  addCatalog,
  addVolume,
  renameCatalog,
  addDb,
  addMetaData
} from '@/api/dataCatalog';
import { RootTypeEnum } from '../../../dataCatalog/consts';
import { TreeNodeData } from '../types';
import { NODE_TYPES } from '../constants';
import { InputNodeType } from '../constants';
import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';

interface UseApiOperationsParams {
  activeTab: 'src' | 'dest';
  onDataRefresh?: () => Promise<TreeNodeData[]>;
  onDirectoryDataChange: (data: TreeNodeData[]) => void;
  cleanupInputNode: (
    inputType: InputNodeType | null,
    parentId: string | number,
    parentType: string
  ) => void;
  resetEditingState: () => void;
  clearInputState: (dataRef: TreeNodeData | TreeDataType) => void;
}

/**
 * API 操作相关的 Hook
 * 封装所有与后端 API 交互的逻辑
 */
export const useApiOperations = ({
  activeTab,
  onDataRefresh,
  onDirectoryDataChange,
  cleanupInputNode,
  resetEditingState,
  clearInputState
}: UseApiOperationsParams) => {
  const root_type = RootTypeEnum[activeTab];

  /**
   * API 错误处理的统一函数
   */
  const handleApiError = useCallback(
    (
      res: Partial<ApiRes<any>>,
      errorMessage: string,
      dataRef: TreeNodeData | TreeDataType
    ): boolean => {
      if (res.status !== 200) {
        Message.error(res?.message ?? errorMessage);
        clearInputState(dataRef);
        return true; // 表示有错误
      }
      return false;
    },
    [clearInputState]
  );

  /**
   * 创建目录
   */
  const createCatalog = useCallback(
    async (name: string): Promise<Partial<ApiRes<any>>> => {
      return await addCatalog({ name, root_type });
    },
    [root_type]
  );

  /**
   * 创建数据库
   */
  const createDatabase = useCallback(
    async (
      name: string,
      parentId: string | number
    ): Promise<Partial<ApiRes<any>>> => {
      return await addDb({
        name,
        parent_id: Number(parentId)
      });
    },
    []
  );

  /**
   * 创建数据卷
   */
  const createVolume = useCallback(
    async (
      name: string,
      parentId: string | number
    ): Promise<Partial<ApiRes<any>>> => {
      return await addVolume({
        name,
        parent_id: Number(parentId),
        root_type
      });
    },
    [root_type]
  );

  /**
   * 创建元数据
   */
  const createMetadata = useCallback(
    async (
      name: string,
      parentId: string | number
    ): Promise<Partial<ApiRes<any>>> => {
      return await addMetaData({
        name,
        parent_id: Number(parentId)
      });
    },
    []
  );

  /**
   * 重命名节点
   */
  const renameNode = useCallback(
    async (
      nodeId: string | number,
      newName: string,
      nodeType?: number,
      parentId?: string | number
    ): Promise<Partial<ApiRes<any>>> => {
      return await renameCatalog(String(nodeId), {
        new_name: newName,
        root_type,
        type: nodeType,
        parent_id: parentId
      });
    },
    [root_type]
  );

  /**
   * 刷新数据
   */
  const refreshData = useCallback(async () => {
    if (onDataRefresh) {
      const newTreeData = await onDataRefresh();
      onDirectoryDataChange(newTreeData);
    }
    resetEditingState();
  }, [onDataRefresh, onDirectoryDataChange, resetEditingState]);

  /**
   * 处理新建节点的 API 调用
   */
  const handleCreateNode = useCallback(
    async (
      nodeType: string,
      fileName: string,
      dataRef: TreeNodeData | TreeDataType,
      inputType: InputNodeType | null
    ): Promise<boolean> => {
      // 类型转换：确保 dataRef 是 TreeNodeData
      const nodeData = dataRef as TreeNodeData;
      let res: Partial<ApiRes<any>> = {};

      switch (nodeType) {
        case NODE_TYPES.CATALOG:
          res = await createCatalog(fileName);
          if (handleApiError(res, '新增目录失败', nodeData)) {
            return false;
          }
          break;
        case NODE_TYPES.DB_ITEM:
          res = await createDatabase(fileName, nodeData.parentId!);
          if (handleApiError(res, '新建数据库失败', nodeData)) {
            return false;
          }
          // 清理输入节点状态
          cleanupInputNode(inputType, nodeData.parentId!, NODE_TYPES.DB_PARENT);
          break;
        case NODE_TYPES.DATASOURCE_ITEM:
          res = await createVolume(fileName, nodeData.parentId!);
          if (handleApiError(res, '新建数据卷失败', nodeData)) {
            return false;
          }
          // 清理输入节点状态
          cleanupInputNode(
            inputType,
            nodeData.parentId!,
            NODE_TYPES.DATASOURCE_PARENT
          );
          break;
        case NODE_TYPES.METADATA:
          res = await createMetadata(fileName, nodeData.parentId!);
          if (handleApiError(res, '新建元数据失败', nodeData)) {
            return false;
          }
          // 清理输入节点状态
          cleanupInputNode(
            inputType,
            nodeData.parentId!,
            NODE_TYPES.METADATA_PARENT
          );
          break;
        default:
          break;
      }

      return true;
    },
    [
      createCatalog,
      createDatabase,
      createVolume,
      createMetadata,
      handleApiError,
      cleanupInputNode
    ]
  );

  /**
   * 处理编辑现有节点的 API 调用
   */
  const handleUpdateNode = useCallback(
    async (
      fileName: string,
      dataRef: TreeNodeData | TreeDataType
    ): Promise<boolean> => {
      // 类型转换：确保 dataRef 是 TreeNodeData
      const nodeData = dataRef as TreeNodeData;
      if (fileName !== nodeData?.name) {
        const res = await renameNode(
          nodeData?.id,
          fileName,
          nodeData?.type,
          nodeData?.parentId
        );
        if (res.status !== 200) {
          Message.error(res?.message ?? '重命名目录失败');
          resetEditingState();
          return false;
        }
      }
      return true;
    },
    [renameNode, resetEditingState]
  );

  return {
    handleApiError,
    createCatalog,
    createDatabase,
    createVolume,
    createMetadata,
    renameNode,
    refreshData,
    handleCreateNode,
    handleUpdateNode
  };
};

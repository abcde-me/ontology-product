import React, { useState, useCallback, useMemo } from 'react';
import {
  DatasetListItem,
  DatasetVersionFileItem
} from '@/types/datasetManagement';

export interface TreeNodeData {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  data?: DatasetListItem | DatasetVersionFileItem;
  type: 'dataset' | 'file';
  loading?: boolean;
}

interface UseDatasetTreeStateProps {
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
  onLoadDatasetFiles: (
    dataset: DatasetListItem
  ) => Promise<DatasetVersionFileItem[]>;
}

export const useDatasetTreeState = ({
  onViewDatasetDetail,
  onLoadDatasetFiles
}: UseDatasetTreeStateProps) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [loadedChildren, setLoadedChildren] = useState<
    Map<string, TreeNodeData[]>
  >(new Map());

  // 将数据集列表转换为树节点
  const convertDatasetToTreeNode = useCallback(
    (dataset: DatasetListItem): TreeNodeData => {
      return {
        key: `dataset-${dataset.id}`,
        title: dataset.name,
        icon: <div className="dataset-icon" />,
        isLeaf: false,
        data: dataset,
        type: 'dataset'
      };
    },
    []
  );

  // 将文件列表转换为树节点
  const convertFileToTreeNode = useCallback(
    (file: DatasetVersionFileItem, datasetId: number): TreeNodeData => {
      return {
        key: `file-${datasetId}-${file.file_name}`,
        title: file.file_name,
        icon: <div className="file-icon" />,
        isLeaf: true,
        data: file,
        type: 'file'
      };
    },
    []
  );

  // 处理节点展开
  const handleExpand = useCallback(
    async (expandedKeys: string[], { node }: any) => {
      setExpandedKeys(expandedKeys);

      const nodeKey = node.key;
      const nodeData = node.data;

      // 如果是数据集节点且还没有加载过子节点
      if (nodeData?.type === 'dataset' && !loadedChildren.has(nodeKey)) {
        setLoadingKeys((prev) => new Set(prev).add(nodeKey));

        try {
          const dataset = nodeData.data as DatasetListItem;
          const fileList = await onLoadDatasetFiles(dataset);

          if (fileList && fileList.length > 0) {
            const children = fileList.map((file) =>
              convertFileToTreeNode(file, dataset.id)
            );
            setLoadedChildren((prev) => new Map(prev).set(nodeKey, children));
          }
        } catch (error) {
          console.error('Failed to load dataset files:', error);
        } finally {
          setLoadingKeys((prev) => {
            const newSet = new Set(prev);
            newSet.delete(nodeKey);
            return newSet;
          });
        }
      }
    },
    [onLoadDatasetFiles, convertFileToTreeNode, loadedChildren]
  );

  // 处理节点选择
  const handleSelect = useCallback(
    (selectedKeys: string[], { node }: any) => {
      setSelectedKeys(selectedKeys);

      const nodeData = node.data;
      if (nodeData?.type === 'dataset') {
        onViewDatasetDetail?.(nodeData.data);
      }
    },
    [onViewDatasetDetail]
  );

  // 渲染树节点
  const renderTreeNode = useCallback(
    (nodeData: TreeNodeData) => {
      const children = loadedChildren.get(nodeData.key) || [];
      const isLoading = loadingKeys.has(nodeData.key);

      return {
        ...nodeData,
        children: children.length > 0 ? children : undefined,
        loading: isLoading
      };
    },
    [loadedChildren, loadingKeys]
  );

  // 构建完整的树数据
  const buildTreeData = useCallback(
    (datasetList: DatasetListItem[]) => {
      return datasetList.map(convertDatasetToTreeNode).map(renderTreeNode);
    },
    [convertDatasetToTreeNode, renderTreeNode]
  );

  return {
    expandedKeys,
    selectedKeys,
    handleExpand,
    handleSelect,
    buildTreeData
  };
};

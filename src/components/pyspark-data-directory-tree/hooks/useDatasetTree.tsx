import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  getDatasetVersionFile,
  searchDatasetList
} from '@/api/datasetManagement';
import {
  DatasetListItem,
  DatasetVersionFileItem
} from '@/types/datasetManagement';
import { NodeInstance } from '@arco-design/web-react/es/Tree/interface';
import DasetFileIcon from '../assets/daset-file-icon.svg';
import DasetIcon from '../assets/daset-icon.svg';

export interface TreeNodeData {
  key: string;
  title: string;
  latest_size?: number;
  id?: number;
  version_id?: string;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  data?: DatasetListItem | DatasetVersionFileItem;
  type: 'dataset' | 'file';
  loading?: boolean;
}

interface UseDatasetTreeProps {
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
}

export const useDatasetTree = ({
  onViewDatasetDetail
}: UseDatasetTreeProps = {}) => {
  // 数据集相关状态
  const [dasetList, setDasetList] = useState<DatasetListItem[]>([]);
  const [dasetFileList, setDasetFileList] = useState<DatasetVersionFileItem[]>(
    []
  );
  const [searchKeyword, setSearchKeyword] = useState('');

  // 树状态管理
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);

  // 获取数据集目录列表
  const getDasetList = async (keyword?: string) => {
    const targetParams: any = {
      storage_type_list: ['file', 'jsonl'],
      name: keyword
    };

    const res = await searchDatasetList(targetParams);

    if (res?.status !== 200) {
      return;
    }

    // 只更新数据集列表，不直接覆盖 treeData
    setDasetList(res?.data?.list ?? []);
  };

  // 获取数据集单个目录下的文件列表
  const getDasetVersionFile = async (
    id: number,
    version_id: string,
    page = 1,
    page_size = 1000
  ) => {
    const res = await getDatasetVersionFile({
      id,
      version_id,
      page,
      page_size
    });

    if (res?.status !== 200) {
      return [];
    }

    const fileList = res?.data?.list ?? [];
    setDasetFileList(fileList);
    return fileList;
  };

  // 将数据集列表转换为树节点
  const convertDatasetToTreeNode = useCallback(
    (dataset: DatasetListItem): TreeNodeData => {
      return {
        key: `dataset-${dataset.id}`,
        id: dataset.id,
        version_id: dataset.latest_version,
        icon: <DasetIcon />,
        title: dataset.name,
        latest_size: dataset.latest_size,
        isLeaf: false,
        data: dataset,
        type: 'dataset',
        children: []
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
        latest_size: Number(file.file_size),
        icon: <DasetFileIcon />,
        isLeaf: true,
        data: file,
        type: 'file'
      };
    },
    []
  );

  // 构建完整的树数据
  const buildTreeData = useCallback(
    (datasetList: DatasetListItem[]) => {
      return datasetList.map(convertDatasetToTreeNode);
    },
    [convertDatasetToTreeNode]
  );

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    // 搜索时收起所有父节点
    setExpandedKeys([]);
  };

  // 处理加载更多（预留接口）
  const loadMore = useCallback(
    (node: NodeInstance): Promise<void> => {
      return new Promise(async (resolve) => {
        try {
          const nodeData = node.props.dataRef as TreeNodeData;
          if (!nodeData?.id || !nodeData?.version_id) {
            return resolve();
          }

          const fileList = await getDasetVersionFile(
            nodeData.id,
            nodeData.version_id,
            1,
            1000
          );

          if (fileList?.length > 0) {
            // 更新已加载的子节点数据
            const children = fileList.map((file) =>
              convertFileToTreeNode(file, nodeData.id!)
            );

            // 更新 treeData 中的对应节点
            setTreeData((prevTreeData) => {
              return prevTreeData.map((item) => {
                if (item.key === nodeData.key) {
                  return {
                    ...item,
                    children: children
                  };
                }
                return item;
              });
            });
          }
        } catch (error) {
          console.error('Failed to load more data:', error);
        } finally {
          resolve();
        }
      });
    },
    [getDasetVersionFile, convertFileToTreeNode]
  );

  // 根据 dasetList 更新 treeData
  useEffect(() => {
    const newTreeData = dasetList.map(convertDatasetToTreeNode);
    setTreeData(newTreeData);
  }, [dasetList, convertDatasetToTreeNode]);

  // 初始化加载数据集列表
  useEffect(() => {
    getDasetList(searchKeyword);
  }, [searchKeyword]);

  return {
    // 数据集相关
    dasetList,
    dasetFileList,
    searchKeyword,
    setSearchKeyword,
    getDasetList,
    getDasetVersionFile,

    // 树状态相关
    expandedKeys,
    setExpandedKeys,
    treeData,

    // 树交互相关
    handleSearch,
    loadMore,
    buildTreeData,
    convertDatasetToTreeNode,
    convertFileToTreeNode
  };
};

import { searchDatasetList } from '@/api/datasetManagement';
import {
  DatasetListItem,
  DatasetVersionFileItem
} from '@/types/datasetManagement';
import React, { useCallback, useEffect, useState } from 'react';
import DasetFileIcon from '../assets/daset-file-icon.svg';
import DasetIcon from '../assets/daset-icon.svg';

export interface TreeNodeData {
  key: string;
  title: string;
  latest_size?: number;
  id?: number | string;
  version_id?: string;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  data?: DatasetListItem | DatasetVersionFileItem;
  type: 'dataset' | 'scheam';
  loading?: boolean;
}

export const useDatasetTree = () => {
  // 数据集市相关状态
  const [dasetList, setDasetList] = useState<DatasetListItem[]>([]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [treeDataLoading, setTreeDataLoading] = useState(false);

  // 树状态管理
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);

  // 获取数据集市目录列表
  const getDataSetList = async (keyword?: string, showLoading = true) => {
    if (showLoading) {
      setTreeDataLoading(true);
    }
    try {
      const dataSetParams: any = {
        storage_type_list: ['table'],
        page: 1,
        limit: 1000
      };
      if (!!keyword) {
        dataSetParams['search_name_latest_table'] = keyword;
      } else {
        delete dataSetParams['search_name_latest_table'];
      }

      const res = await searchDatasetList(dataSetParams);

      if (res?.status !== 200) {
        return;
      }

      // 只更新数据集市列表，不直接覆盖 treeData
      setDasetList(res?.data?.list ?? []);
    } finally {
      setTreeDataLoading(false);
    }
  };

  // 将数据集市列表转换为树
  const convertDatasetToTreeNode = useCallback((dataset: any): TreeNodeData => {
    return {
      key: `dataset-${dataset.id}`,
      id: dataset.id,
      version_id: dataset.latest_version,
      icon: <DasetIcon />,
      title: `${dataset.name}(${dataset.table})`,
      latest_size: dataset.latest_size,
      isLeaf: false,
      data: dataset,
      type: 'dataset',
      children: (dataset?.scheams || [])?.map((scheam) => ({
        key: `scheam-${dataset.id}-${scheam?.name}`,
        icon: <DasetFileIcon />,
        id: scheam?.name,
        title: scheam?.name,
        isLeaf: true,
        data: scheam?.name,
        scheam: scheam,
        type: 'scheam'
      }))
    };
  }, []);

  // 根据 dasetList 更新 treeData
  useEffect(() => {
    const newTreeData = dasetList.map(convertDatasetToTreeNode);
    setTreeData(newTreeData);
  }, [dasetList, convertDatasetToTreeNode]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    // 搜索时收起所有父节点
    setExpandedKeys([]);
  };

  // 初始化加载数据集市列表
  useEffect(() => {
    // 如果有搜索关键词，则不显示loading（搜索时不加载）
    // 如果没有搜索关键词，则显示loading（初始加载）
    getDataSetList(searchKeyword, !searchKeyword);
  }, [searchKeyword]);

  return {
    // 数据集市相关
    dasetList,
    searchKeyword,
    setSearchKeyword,
    getDataSetList,
    treeDataLoading,

    // 树状态相关
    expandedKeys,
    setExpandedKeys,
    treeData,

    // 树交互相关
    handleSearch
  };
};

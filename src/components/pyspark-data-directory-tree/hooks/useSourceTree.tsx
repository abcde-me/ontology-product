import React, { useState, useCallback, useMemo, useEffect } from 'react';

export interface TreeNodeData {
  key: string;
  title: string;
  id?: number;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  loading?: boolean;
}

export const useSourceTree = () => {
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  return {
    treeData,
    setTreeData,
    handleSearch
  };
};

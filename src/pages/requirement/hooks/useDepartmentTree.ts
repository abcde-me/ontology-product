import { useState, useEffect, useCallback } from 'react';
import { getDepartmentTreeList } from '@/api/individualAndDepartment';

// 树节点处理工具函数
export const processTreeNode = (node: any): any => {
  return {
    ...node,
    actionOnClick: 'check',
    // 递归处理子节点，将childList转换为children
    children: node.childList?.map((child: any) => processTreeNode(child))
  };
};

// 处理树数据的工具函数
export const processTreeData = (data: any[]): any[] => {
  return data?.map((item) => processTreeNode(item)) || [];
};

// 只保留有权限数据的节点
export const filterTreeDataByPerms = (data: any[]): any[] => {
  if (!data?.length) return [];

  return data.reduce((result: any[], item) => {
    // 递归过滤子节点
    const filteredChildren = item.children?.length
      ? filterTreeDataByPerms(item.children)
      : undefined;

    // 如果当前节点有权限，保留该节点（即使子节点被过滤为空也要保留）
    if (item.isPermission) {
      result.push({
        ...item,
        children: filteredChildren
      });
    } else if (filteredChildren?.length) {
      // 如果当前节点没有权限但有过滤后的子节点，提升子节点层级
      result.push(...filteredChildren);
    }
    // 既没有权限也没有有效子节点的节点被忽略

    return result;
  }, []);
};

// 搜索树数据
export const searchTreeData = (
  searchValue: string,
  originalTreeData: any[]
): any[] => {
  const loop = (data: any[]): any[] => {
    const result: any[] = [];
    data.forEach((item) => {
      const isMatch =
        item.title?.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
      const childrenResult = item.children ? loop(item.children) : [];
      if (isMatch || childrenResult.length > 0) {
        result.push({
          ...item,
          children: childrenResult.length > 0 ? childrenResult : undefined
        });
      }
    });
    return result;
  };
  return loop(originalTreeData);
};

// 查找父节点ID
export const findParentIds = (treeNodes: any[], targetIds: string[]) => {
  const allIds = [...targetIds];
  const targetSet = new Set(targetIds);

  // 递归查找父节点
  const traverse = (nodes: any[], parentIds: string[] = []) => {
    for (const node of nodes) {
      const currentParentIds = [...parentIds];

      // 如果当前节点的任何子节点在目标ID列表中，或者当前节点本身在目标ID列表中
      const hasSelectedChild =
        node.children &&
        node.children.some(
          (child: any) =>
            targetSet.has(child.id) ||
            (child.children &&
              child.children.some((c: any) => targetSet.has(c.id)))
        );

      if (hasSelectedChild || targetSet.has(node.id)) {
        if (!allIds.includes(node.id)) {
          allIds.push(node.id);
        }
      }

      if (node.children) {
        traverse(node.children, currentParentIds);
      }
    }
  };

  traverse(treeNodes);
  return allIds;
};

// 自定义 hook：获取部门树数据
export const useDepartmentTree = (shouldFetch = false) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [originalTreeData, setOriginalTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const fetchTreeData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDepartmentTreeList();
      const newTreeData = processTreeData(res?.data || []);
      const filteredData = filterTreeDataByPerms(newTreeData);
      setTreeData(filteredData);
      setOriginalTreeData(filteredData);
      return filteredData;
    } catch (err) {
      console.error('Failed to fetch department tree:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 搜索功能
  useEffect(() => {
    if (!searchValue) {
      setTreeData(originalTreeData);
    } else {
      const result = searchTreeData(searchValue, originalTreeData);
      setTreeData(result);
    }
  }, [searchValue, originalTreeData]);

  useEffect(() => {
    if (shouldFetch) {
      fetchTreeData();
    }
  }, [shouldFetch, fetchTreeData]);

  return {
    treeData,
    setTreeData,
    originalTreeData,
    loading,
    searchValue,
    setSearchValue,
    fetchTreeData
  };
};

export default useDepartmentTree;

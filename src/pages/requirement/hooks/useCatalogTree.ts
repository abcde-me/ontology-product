import { useState, useEffect, useCallback } from 'react';
import { CatalogItemType, getCatalogList } from '@/api/dataCatalog';

interface TreeItem {
  id: number;
  parent_id: number;
  type: number;
  type_name: string;
  name: string;
  base_dir: string;
  children: Record<string, TreeItem[]>;
}

interface TreeNode {
  title: string;
  key: string;
  id?: number;
  level?: number;
  allowClick?: boolean;
  actionOnClick?: string;
  children?: TreeNode[];
}

// 格式化目录树数据
export const formatCatalogTree = (rawData: any[]): TreeItem[] => {
  const handleChildren = (
    children: TreeItem['children']
  ): TreeItem['children'] => {
    if (!children) return {};
    const newChildren: TreeItem['children'] = {};
    Object.entries(children).forEach(([childType, childItems]) => {
      const targetType = childType === 'volume' ? '数据卷' : childType;
      const formattedItems = childItems.map((item) => ({
        ...item,
        children: handleChildren(item.children)
      }));
      newChildren[targetType] = formattedItems;
    });
    return newChildren;
  };
  return rawData.map((catalog) => ({
    ...catalog,
    children: handleChildren(catalog.children)
  }));
};

// 将格式化后的数据转换为树形结构
export const transformToTreeData = (
  formattedData: TreeItem[],
  options?: { includeActionProps?: boolean }
): TreeNode[] => {
  const includeActionProps = options?.includeActionProps ?? false;

  return formattedData.map((item) => {
    const baseNode: TreeNode = {
      title: item.name,
      key: String(item.id)
    };

    if (includeActionProps) {
      baseNode.allowClick = false;
      baseNode.level = 1;
      baseNode.actionOnClick = 'expand';
    }

    if (item.children) {
      const volumeChildren = item.children?.数据卷;
      if (volumeChildren && volumeChildren.length > 0) {
        const volumeNode: TreeNode = {
          title: '数据卷',
          key: String(item.id) + '数据卷',
          children: volumeChildren.map((subItem) => ({
            title: subItem.name,
            key: `${item.id},${item.id}数据卷,${subItem.id}`,
            id: subItem.id,
            ...(includeActionProps ? { level: 3, actionOnClick: 'select' } : {})
          }))
        };

        if (includeActionProps) {
          volumeNode.actionOnClick = 'expand';
          volumeNode.level = 2;
          volumeNode.allowClick = false;
        }

        baseNode.children = [volumeNode];
      }
    }

    return baseNode;
  });
};

// 根据 dir_name 获取完整的目录路径
export const getDirectoryPath = (
  dirPathKey: string,
  treeData: TreeNode[]
): string => {
  if (!dirPathKey || !treeData.length) return dirPathKey || '';

  const keys = dirPathKey.split(',');
  if (keys.length < 3) return dirPathKey;

  const catalogId = keys[0];
  const volumeKey = keys[1];
  const volumeId = keys[2];

  const findPath = (
    nodes: TreeNode[],
    path: string[] = []
  ): string[] | null => {
    for (const node of nodes) {
      const currentPath = [...path, node.title];
      if (node.key === catalogId) {
        if (node.children) {
          for (const child of node.children) {
            if (child.key === volumeKey) {
              if (child.children) {
                for (const volume of child.children) {
                  if (volume.id === Number(volumeId)) {
                    return [...currentPath, child.title, volume.title];
                  }
                }
              }
            }
          }
        }
      }
      if (node.children) {
        const found = findPath(node.children, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const pathArray = findPath(treeData);
  return pathArray ? pathArray.join('/') : dirPathKey;
};

// 自定义 hook：获取目录树数据
export const useCatalogTree = (shouldFetch = true) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTreeData = useCallback(
    async (options?: { includeActionProps?: boolean }) => {
      setLoading(true);
      try {
        const res = await getCatalogList({ dir_type: CatalogItemType.Volume });
        if (res.status === 200) {
          const formatted = formatCatalogTree(res.data?.src || []);
          const transformed = transformToTreeData(formatted, options);
          setTreeData(transformed);
          return transformed;
        }
      } catch (error) {
        console.error('Failed to fetch catalog tree:', error);
      } finally {
        setLoading(false);
      }
      return [];
    },
    []
  );

  useEffect(() => {
    if (shouldFetch) {
      fetchTreeData();
    }
  }, [shouldFetch, fetchTreeData]);

  const getPath = useCallback(
    (dirPathKey: string) => {
      return getDirectoryPath(dirPathKey, treeData);
    },
    [treeData]
  );

  return {
    treeData,
    setTreeData,
    loading,
    fetchTreeData,
    getPath
  };
};

export default useCatalogTree;

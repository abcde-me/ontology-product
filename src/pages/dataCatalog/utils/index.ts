import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';

/**
 * 搜索树形数据，保持树形结构
 * @param treeData 原始树形数据
 * @param searchValue 搜索值
 * @returns 过滤后的数据和需要展开的节点key列表
 */
export function searchTreeData(
  treeData: TreeDataType[],
  searchValue: string
): {
  filteredData: TreeDataType[];
  expandedKeys: string[];
} {
  const expandedKeys: string[] = [];

  // 辅助函数：检查节点及其所有子节点是否包含搜索值
  const hasMatchInSubtree = (
    node: TreeDataType,
    searchLower: string
  ): boolean => {
    const nodeTitle = String(node.title || '').toLowerCase();
    if (nodeTitle.includes(searchLower)) {
      return true;
    }

    if (node.children && node.children.length > 0) {
      return node.children.some((child) =>
        hasMatchInSubtree(child, searchLower)
      );
    }

    return false;
  };

  const filterNode = (node: TreeDataType): TreeDataType | null => {
    const nodeTitle = String(node.title || '').toLowerCase();
    const searchLower = searchValue.toLowerCase();

    // 检查当前节点是否匹配
    const currentMatches = nodeTitle.includes(searchLower);

    // 递归过滤子节点
    let filteredChildren: TreeDataType[] = [];
    let hasMatchingChildren = false;

    if (node.children && node.children.length > 0) {
      // 如果当前节点匹配，检查子节点中是否有匹配的
      if (currentMatches) {
        const hasChildrenMatch = node.children.some((child) =>
          hasMatchInSubtree(child, searchLower)
        );

        // 如果当前节点匹配但子节点都不匹配，保留所有子节点
        if (!hasChildrenMatch) {
          filteredChildren = [...node.children];
        } else {
          // 如果子节点中有匹配的，则正常过滤
          filteredChildren = node.children
            .map((child) => filterNode(child))
            .filter((child) => child !== null) as TreeDataType[];
        }
      } else {
        // 如果当前节点不匹配，正常过滤子节点
        filteredChildren = node.children
          .map((child) => filterNode(child))
          .filter((child) => child !== null) as TreeDataType[];
      }

      hasMatchingChildren = filteredChildren.length > 0;

      // 如果有匹配的子节点，将当前节点添加到展开列表
      if (hasMatchingChildren) {
        expandedKeys.push(String(node.key));
      }
    }

    // 如果当前节点匹配或有匹配的子节点，则保留该节点
    if (currentMatches || hasMatchingChildren) {
      // 如果当前节点匹配，也要展开其父节点路径
      if (currentMatches) {
        expandedKeys.push(String(node.key));
      }

      return {
        ...node,
        children: filteredChildren
      };
    }

    return null;
  };

  const filteredData = treeData
    .map((node) => filterNode(node))
    .filter((node) => node !== null) as TreeDataType[];

  // 去重展开的keys
  const uniqueExpandedKeys = Array.from(new Set(expandedKeys));

  return {
    filteredData,
    expandedKeys: uniqueExpandedKeys
  };
}

// 递归查找节点路径的标题
export function getNodePathTitles(treeData, targetKey) {
  const path = [];

  function traverse(nodes) {
    for (const node of nodes) {
      path.push(node.title); // 将当前节点加入路径
      if (node.key === targetKey) {
        return true; // 找到目标，停止搜索
      }
      if (node.children && traverse(node.children)) {
        return true; // 子节点中找到，保留路径
      }
      path.pop(); // 当前分支未找到，回溯
    }
    return false;
  }

  traverse(treeData);
  return path;
}

export function findParentByKeyIterative(tree, targetKey) {
  const stack = [...tree.map((node) => ({ node, parent: null }))];

  while (stack.length) {
    const { node, parent } = stack.pop();
    if (node.key === targetKey) return parent;
    if (node.children) {
      stack.push(
        ...node.children.map((child) => ({
          node: child,
          parent: node
        }))
      );
    }
  }
  return null;
}

// 获取父节点的路径标题
export function getParentNodePathTitles(treeData, targetKey) {
  const parent = findParentByKeyIterative(treeData, targetKey);
  if (!parent) {
    return []; // 如果没有父节点，返回空数组
  }
  return getNodePathTitles(treeData, parent.key);
}

export function addDisabledField(nodes) {
  return nodes.map((node) => {
    // 检查当前节点perms是否包含任意目标权限
    const hasValidPerm =
      node.perms &&
      (node.perms.includes('can_create') ||
        node.perms.includes('can_update') ||
        node.perms.includes('can_delete'));

    // 创建新节点（保留原有属性）
    const newNode = {
      ...node,
      disabled: !hasValidPerm, // 包含任意权限则启用，否则禁用
      key: node.key || node.id // 确保有 key 字段，优先使用 key，否则使用 id
    };

    // 递归处理子节点
    if (node.children && node.children.length) {
      newNode.children = addDisabledField(node.children);
    }

    return newNode;
  });
}

// 递归查找节点路径的标题
export function getNodePathTitles(treeData, targetKey) {
  const path = [];

  function traverse(nodes) {
    for (const node of nodes) {
      // @ts-expect-error
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

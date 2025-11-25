// 定义TreeNodeData类型（避免循环依赖）
export interface TreeNodeData {
  id: string | number;
  key: string;
  name: string;
  value: string;
  label: string;
  title: string;
  type_name?:
    | 'volume'
    | 'db_item'
    | 'volume_item'
    | 'catalog'
    | 'db'
    | 'db_parent'
    | 'datasource_parent'
    | 'datasource_item'
    | 'metadata_parent'
    | 'metadata';
  type?: number;
  level?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  isLastLeaf?: boolean;
  showInput?: boolean;
  isNew?: boolean;
  parentId?: string | number;
  children?: TreeNodeData[];
  perms?: string[];
}

/**
 * 规范化children数据，将对象形式转换为数组形式
 */
export const normalizeChildren = (children: any): TreeNodeData[] => {
  if (!children) {
    return [];
  }
  if (Array.isArray(children)) {
    // 递归处理数组中的每个子节点
    return children.map((child) => {
      if (child && typeof child === 'object') {
        return {
          ...child,
          children: normalizeChildren(child.children)
        };
      }
      return child;
    });
  }
  if (typeof children === 'object') {
    // 如果是对象形式（如 { volume: [...], db_item: [...] }），转换为数组
    const childrenArray: TreeNodeData[] = [];
    Object.values(children).forEach((value: any) => {
      if (Array.isArray(value)) {
        childrenArray.push(...value);
      } else if (value) {
        childrenArray.push(value);
      }
    });
    // 递归处理转换后的数组中的每个子节点
    return childrenArray.map((child) => {
      if (child && typeof child === 'object') {
        return {
          ...child,
          children: normalizeChildren(child.children)
        };
      }
      return child;
    });
  }
  return [];
};

/**
 * 从路径 key 中提取原始的 id
 * 例如: "1/2/3" -> "3", "42" -> "42"
 */
export const extractIdFromPathKey = (pathKey: string): string => {
  if (!pathKey) return '';
  const parts = pathKey.split('/');
  return parts[parts.length - 1];
};

/**
 * 递归查找节点
 */
export const findNodeById = <T extends TreeNodeData>(
  data: T[],
  id: string | number
): T | null => {
  for (const item of data) {
    if (String(item.id) === String(id)) {
      return item;
    }
    if (item.children && Array.isArray(item.children)) {
      const found = findNodeById(item.children as T[], id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 根据路径 key 查找节点（支持路径形式的 key）
 */
export const findNodeByPathKey = <T extends TreeNodeData>(
  data: T[],
  pathKey: string,
  treeData?: TreeSelectNodeData[]
): T | null => {
  // 如果 treeData 存在，先尝试从 treeData 中查找
  if (treeData) {
    const findInTreeData = (
      nodes: TreeSelectNodeData[],
      key: string
    ): TreeSelectNodeData | null => {
      for (const node of nodes) {
        if (node.key === key && node.dataRef) {
          return node.dataRef as T;
        }
        if (node.children && Array.isArray(node.children)) {
          const found = findInTreeData(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };
    const found = findInTreeData(treeData, pathKey);
    if (found) return found as T;
  }

  // 如果找不到，尝试提取 id 并查找
  const id = extractIdFromPathKey(pathKey);
  if (id) {
    return findNodeById(data, id);
  }
  return null;
};

/**
 * 在 treeData 中根据 id 查找对应的路径 key
 */
export const findPathKeyById = (
  treeData: TreeSelectNodeData[],
  id: string | number
) => {
  const findKey = (
    nodes: TreeSelectNodeData[],
    targetId: string
  ): string | null => {
    for (const node of nodes) {
      if (
        String(node.value) === targetId ||
        String(node.dataRef?.id) === targetId
      ) {
        return node.key;
      }
      if (node.children && Array.isArray(node.children)) {
        const found = findKey(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  return findKey(treeData, String(id));
};

/**
 * 将基于 id 的 selectedKeys 转换为路径形式的 key
 */
export const convertSelectedKeysToPathKeys = (
  selectedKeys: string[],
  treeData: TreeSelectNodeData[]
): string[] => {
  return selectedKeys
    .map((id) => findPathKeyById(treeData, id))
    .filter((key): key is string => key !== null);
};

/**
 * 递归更新节点
 */
export const updateNodeRecursively = (
  data: TreeNodeData[],
  targetId: string | number,
  updater: (node: TreeNodeData) => TreeNodeData | null
): TreeNodeData[] => {
  return data
    .map((item) => {
      if (String(item.id) === String(targetId)) {
        return updater(item);
      } else if (item.children && Array.isArray(item.children)) {
        const updatedChildren = updateNodeRecursively(
          item.children,
          targetId,
          updater
        ).filter((child): child is TreeNodeData => child !== null);
        return {
          ...item,
          children: updatedChildren
        };
      }
      return item;
    })
    .filter((item): item is TreeNodeData => item !== null);
};

/**
 * 递归删除节点
 */
export const deleteNodeRecursively = (
  data: TreeNodeData[],
  targetId: string | number
): TreeNodeData[] => {
  return updateNodeRecursively(data, targetId, () => null);
};

/**
 * 根据节点类型判断icon类型（预先计算，避免每次hover时判断）
 */
export const getNodeIconType = (
  nodeData: TreeNodeData
): 'switcher' | 'storage' | 'none' => {
  // 如果是叶子节点，不显示三角标
  if (nodeData?.isLastLeaf) {
    return 'none';
  }

  // volume类型节点显示存储图标
  if (nodeData?.type_name === 'volume') {
    return 'storage';
  }

  // 以下类型不显示任何图标
  if (
    nodeData?.type_name === 'db' ||
    nodeData?.type_name === 'db_item' ||
    nodeData?.type_name === 'volume_item' ||
    nodeData?.type_name === 'datasource_item' ||
    nodeData?.type_name === 'metadata'
  ) {
    return 'none';
  }

  // 如果没有子节点，不显示三角标
  if (
    !nodeData?.hasChildren &&
    (!nodeData?.children || nodeData?.children?.length === 0)
  ) {
    return 'none';
  }

  // 其他情况显示三角标
  return 'switcher';
};

/**
 * 检查节点是否可选
 * 只有数据库、元数据或者数据卷下面的节点才支持可选
 */
export const isNodeSelectable = (
  item: TreeNodeData | null | undefined,
  selectableNodeTypes: readonly string[]
): boolean => {
  if (!item) {
    return false;
  }
  const typeName = item.type_name;
  return selectableNodeTypes.includes(typeName as any);
};

/**
 * 检查节点是否为数据库节点且包含数据库子项
 */
export const hasDataBaseNode = (
  item: TreeNodeData | null | undefined,
  selectedKeys?: string[]
): boolean => {
  if (!item) {
    return false;
  }
  const currentId = item?.id ?? item?.key;
  if (currentId != null && selectedKeys?.includes(String(currentId))) {
    return false;
  }
  if (item.type_name !== 'db') {
    return false;
  }
  const children = item.children;
  if (!children) {
    return false;
  }
  // 处理对象形式的children（如 { db_item: [...] }）
  if (typeof children === 'object' && !Array.isArray(children)) {
    const hasDbItems = Boolean((children as any).db_item?.length);
    return hasDbItems;
  }
  // 处理数组形式的children
  const hasArrayChildren = Array.isArray(children) && children.length > 0;
  return hasArrayChildren;
};

/**
 * 检查元数据节点是否已绑定元数据
 */
export const hasMetadataBound = (
  item: TreeNodeData | null | undefined,
  selectedKeys?: string[]
): boolean => {
  if (!item) return false;
  const currentId = item?.id ?? item?.key;
  if (currentId != null && selectedKeys?.includes(String(currentId))) {
    return false;
  }
  if (item.type_name !== 'metadata') return false;
  const ext = (item as any)?.extends || (item as any)?.extend;
  const dbName = ext?.db_name;
  const tableName = ext?.table_name;
  return Boolean(dbName) && Boolean(tableName);
};

/**
 * 判断节点是否实际可选（综合判断）
 */
export const isNodeActuallySelectable = (
  item: TreeNodeData | null | undefined,
  selectableNodeTypes: readonly string[],
  selectedKeys?: string[]
): boolean => {
  return (
    isNodeSelectable(item, selectableNodeTypes) &&
    !hasDataBaseNode(item, selectedKeys) &&
    !hasMetadataBound(item, selectedKeys)
  );
};

/**
 * TreeSelect 节点类型（扩展了 TreeNodeData）
 */
export interface TreeSelectNodeData extends TreeNodeData {
  selectable?: boolean;
  dataRef?: TreeNodeData;
  iconType?: 'switcher' | 'storage' | 'none';
}

/**
 * 递归为节点添加 TreeSelect 需要的属性
 * 在初始化时就完成转换，避免二次处理
 * @param node 节点数据
 * @param selectableNodeTypes 可选节点类型
 * @param selectedKeys 已选中的keys
 * @param parentPath 父节点路径，用于生成唯一的key
 */
export const enrichTreeNodeForTreeSelect = (
  node: TreeNodeData,
  selectableNodeTypes: readonly string[],
  selectedKeys?: string[],
  parentPath = ''
): TreeSelectNodeData | null => {
  if (!node) {
    return null;
  }

  // 使用路径生成唯一的 key，避免不同分支中相同 id 导致的 key 重复
  const nodeName = String(node.name);
  const uniqueKey = parentPath ? `${parentPath}/${nodeName}` : nodeName;

  // 确保 key、title、value 是字符串格式
  const treeNode: TreeSelectNodeData = {
    ...node,
    key: uniqueKey,
    title: node.name || node.label || node.title || '',
    label: uniqueKey,
    value: String(node.id), // value 仍然使用原始 id，用于业务逻辑
    selectable: isNodeActuallySelectable(
      node,
      selectableNodeTypes,
      selectedKeys
    ),
    dataRef: node, // 保留原始数据引用
    iconType: getNodeIconType(node) // 预先计算icon类型
  };

  // 递归处理 children
  if (
    node.children &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    treeNode.children = node.children
      .map((child) =>
        enrichTreeNodeForTreeSelect(
          child,
          selectableNodeTypes,
          selectedKeys,
          uniqueKey
        )
      )
      .filter((child): child is TreeSelectNodeData => child !== null);
  }

  return treeNode;
};

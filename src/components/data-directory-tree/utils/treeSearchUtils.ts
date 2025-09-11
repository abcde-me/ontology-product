/**
 * Tree搜索工具函数
 * 用于简化Tree组件的搜索逻辑
 */

/**
 * 通用树节点搜索函数
 * @param keyword 搜索关键词
 * @param data 要搜索的数据数组
 * @param searchFields 搜索字段名数组
 * @param options 搜索选项
 * @returns 过滤后的数据
 */
export function searchTreeNodes<T = any>(
  keyword: string,
  data: T[],
  searchFields: string[],
  options: {
    caseSensitive?: boolean;
    exactMatch?: boolean;
    highlightMatches?: boolean;
  } = {}
): T[] {
  const { caseSensitive = false, exactMatch = false } = options;

  if (!keyword.trim()) {
    return [];
  }

  const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();

  const kkk = data.filter((item) => {
    return searchFields.some((field) => {
      const value = item[field];
      if (!value) return false;

      const itemValue = caseSensitive
        ? value.toString()
        : value.toString().toLowerCase();

      if (exactMatch) {
        return itemValue === searchKeyword;
      } else {
        return itemValue.includes(searchKeyword);
      }
    });
  });
  console.log(kkk, '搜索的内容', searchFields, data);
  return kkk;
}

/**
 * 树形数据搜索函数（保持树形结构）
 * @param keyword 搜索关键词
 * @param treeData 树形数据
 * @param searchFields 搜索字段名数组
 * @param options 搜索选项
 * @returns 过滤后的树形数据和需要展开的节点key列表
 */
export function searchTreeData<T = any>(
  keyword: string,
  treeData: T[],
  searchFields: string[],
  options: {
    caseSensitive?: boolean;
    exactMatch?: boolean;
    keyField?: string;
    childrenField?: string;
  } = {}
): {
  filteredData: T[];
  expandedKeys: string[];
} {
  const {
    caseSensitive = false,
    exactMatch = false,
    keyField = 'key',
    childrenField = 'children'
  } = options;

  if (!keyword.trim()) {
    return {
      filteredData: [],
      expandedKeys: []
    };
  }

  const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
  const expandedKeys: string[] = [];

  // 检查节点是否匹配
  const isNodeMatch = (node: T): boolean => {
    return searchFields.some((field) => {
      const value = node[field];
      if (!value) return false;

      const itemValue = caseSensitive
        ? value.toString()
        : value.toString().toLowerCase();

      if (exactMatch) {
        return itemValue === searchKeyword;
      } else {
        return itemValue.includes(searchKeyword);
      }
    });
  };

  // 递归过滤树节点
  const filterNode = (node: T): T | null => {
    const isMatch = isNodeMatch(node);
    const children = node[childrenField] as T[];

    let filteredChildren: T[] = [];
    let hasMatchingChildren = false;

    if (children && children.length > 0) {
      filteredChildren = children
        .map((child) => filterNode(child))
        .filter((child) => child !== null) as T[];

      hasMatchingChildren = filteredChildren.length > 0;

      // 如果有匹配的子节点，将当前节点添加到展开列表
      if (hasMatchingChildren) {
        expandedKeys.push(String(node[keyField]));
      }
    }

    // 如果当前节点匹配或有匹配的子节点，则保留该节点
    if (isMatch || hasMatchingChildren) {
      // 如果当前节点匹配，也要展开其父节点路径
      if (isMatch) {
        expandedKeys.push(String(node[keyField]));
      }

      return {
        ...node,
        [childrenField]: filteredChildren
      };
    }

    return null;
  };

  const filteredData = treeData
    .map((node) => filterNode(node))
    .filter((node) => node !== null) as T[];

  return {
    filteredData,
    expandedKeys
  };
}

/**
 * 创建搜索配置
 * @param searchFields 搜索字段
 * @param options 搜索选项
 * @returns 搜索配置对象
 */
export function createSearchConfig(
  searchFields: string[],
  options: {
    caseSensitive?: boolean;
    exactMatch?: boolean;
  } = {}
) {
  return {
    searchFields,
    ...options
  };
}

/**
 * 常用的搜索配置
 */
export const SEARCH_CONFIGS = {
  // 按名称搜索
  BY_NAME: createSearchConfig(['name']),
  // 按标题搜索
  BY_TITLE: createSearchConfig(['title']),
  // 按名称和描述搜索
  BY_NAME_AND_DESC: createSearchConfig(['name', 'description']),
  // 按多个字段搜索
  BY_MULTIPLE: (fields: string[]) => createSearchConfig(fields)
} as const;

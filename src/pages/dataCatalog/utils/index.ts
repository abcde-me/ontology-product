import { TreeDataType } from '@arco-design/web-react/es/Tree/interface';

/**
 * 验证名称是否符合规范
 * @param name 待验证的名称
 * @returns 返回验证结果对象，包含是否通过验证和错误信息
 */
export interface ValidateNameResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 名称正则校验函数
 * 校验规则：
 * 1. 允许包含中文、英文字符和阿拉伯数字
 * 2. 允许包含的特殊字符为 '-'、'_'
 * 3. 长度不能超过256个字符
 * 4. 必须以中文、英文、数字开头，不允许以特殊字符开头
 *
 * @param name 待验证的名称
 * @returns 验证结果对象
 */
export function validateName(name: string): ValidateNameResult {
  // 检查是否为空
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      errorMessage: '名称不能为空'
    };
  }

  // 检查长度是否超过256个字符
  if (name.length > 256) {
    return {
      isValid: false,
      errorMessage: '名称长度不能超过256个字符'
    };
  }

  // 正则表达式说明：
  // ^[\u4e00-\u9fa5a-zA-Z0-9] - 以中文、英文字母或数字开头
  // [\u4e00-\u9fa5a-zA-Z0-9_-]* - 后续字符可以是中文、英文、数字、下划线或连字符
  // $ - 字符串结束
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9][\u4e00-\u9fa5a-zA-Z0-9_-]*$/;

  if (!nameRegex.test(name)) {
    // 检查是否以特殊字符开头
    if (/^[-_]/.test(name)) {
      return {
        isValid: false,
        errorMessage: '名称不能以特殊字符（-、_）开头'
      };
    }

    // 检查是否包含不允许的字符
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_-]*$/.test(name)) {
      return {
        isValid: false,
        errorMessage: '名称只能包含中文、英文字符、数字以及特殊字符（-、_）'
      };
    }

    return {
      isValid: false,
      errorMessage: '名称格式不正确'
    };
  }

  return {
    isValid: true
  };
}

/**
 * 简化版本的名称校验函数，只返回布尔值
 * @param name 待验证的名称
 * @returns 是否通过验证
 */
export function isValidName(name: string): boolean {
  return validateName(name).isValid;
}

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

  const filterNode = (node: TreeDataType): TreeDataType | null => {
    const nodeTitle = String(node.title || '').toLowerCase();
    const searchLower = searchValue.toLowerCase();

    // 检查当前节点是否匹配
    const currentMatches = nodeTitle.includes(searchLower);

    // 递归过滤子节点
    let filteredChildren: TreeDataType[] = [];
    let hasMatchingChildren = false;

    if (node.children && node.children.length > 0) {
      filteredChildren = node.children
        .map((child) => filterNode(child))
        .filter((child) => child !== null) as TreeDataType[];

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

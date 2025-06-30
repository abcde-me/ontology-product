# 组织管理 TreeSelect 功能增强说明

## 概述

为组织管理模块中的成员表单 TreeSelect 组件添加了权限控制和模糊搜索功能，与成员管理模块保持一致的用户体验。

## 增强功能

### ✅ 权限控制功能

1. **权限检查**：检查每个组织节点的 `perms` 数组中是否包含 `can_get` 权限
2. **节点禁用**：没有权限的节点会被设置为 `disabled: true`
3. **视觉反馈**：禁用的节点会添加 `text-gray-400` 样式，显示为灰色
4. **递归处理**：整个组织树的所有层级都会应用权限控制

### ✅ 模糊搜索功能

1. **节点标题搜索**：直接搜索组织名称
2. **完整路径搜索**：支持 "技术部/前端组" 格式搜索
3. **路径片段搜索**：搜索路径中的任意部分
4. **不区分大小写**：搜索时忽略大小写
5. **实时过滤**：输入时立即显示匹配结果

## 实现细节

### 权限控制函数

```typescript
// 为组织数据添加权限控制的函数
const addPermissionControl = (nodes: any[]): any[] => {
  return nodes.map((node) => {
    // 检查当前节点是否有 can_get 权限
    const hasGetPermission = node.perms && node.perms.includes('can_get');

    // 创建新节点（保留原有属性）
    const newNode = {
      ...node,
      disabled: !hasGetPermission, // 没有 can_get 权限则禁用
      key: node.key || node.id, // 确保有 key 字段
      // 为禁用的节点添加样式提示
      className: !hasGetPermission ? 'text-gray-400' : undefined
    };

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      newNode.children = addPermissionControl(node.children);
    }

    return newNode;
  });
};
```

### 模糊搜索函数

```typescript
// 修复后的搜索函数：按照 Arco Design 官方 API
const filterTreeNode = (inputText: string, node: any) => {
  if (!inputText) return true;

  const searchValue = inputText.toLowerCase();

  // 1. 搜索节点标题（按照官方 API，使用 node.props.title）
  const nodeTitle = node.props?.title || node.title || '';
  if (nodeTitle.toLowerCase().includes(searchValue)) {
    return true;
  }

  // 2. 搜索完整路径（例如：搜索"技术部/前端组"）
  try {
    const nodeKey =
      node.props?.key || node.key || node.props?.value || node.value;
    if (nodeKey) {
      const pathTitles = getNodePathTitles(processedOrgData, nodeKey);
      const fullPath = pathTitles.join('/').toLowerCase();
      if (fullPath.includes(searchValue)) {
        return true;
      }

      // 3. 搜索路径中的任意部分
      const pathString = pathTitles.join(' ').toLowerCase();
      if (pathString.includes(searchValue)) {
        return true;
      }
    }
  } catch (error) {
    // 如果路径搜索出错，只进行标题搜索
    console.warn('Path search error:', error);
  }

  return false;
};
```

### TreeSelect 组件配置

```tsx
<TreeSelect
  showSearch
  placeholder="请选择所属组织"
  allowClear
  treeData={processedOrgData} // 使用处理后的数据
  treeCheckedStrategy={TreeSelect.SHOW_ALL}
  filterTreeNode={filterTreeNode} // 添加模糊搜索
  renderFormat={(nodeProps, _value) => {
    const pathTitles = getNodePathTitles(
      processedOrgData, // 使用处理后的数据
      nodeProps._key as string
    );
    return <span> {pathTitles.join(' / ')}</span>;
  }}
/>
```

## 功能特性

### 权限控制效果

- **有 `can_get` 权限**：✅ 节点正常显示，可以点击选择
- **无 `can_get` 权限**：❌ 节点置灰显示，不可点击选择

### 搜索功能效果

- **节点搜索**：输入 "技术部" 找到所有包含的组织
- **路径搜索**：输入 "技术部/前端组" 精确匹配
- **片段搜索**：输入 "前端" 找到路径中包含的组织

## 调试信息

组件会在控制台输出调试信息：

```
Organization MemberForm TreeSelect 权限控制结果: [...]
Organization MemberForm TreeSelect 中共有 X 个节点因缺少 'can_get' 权限被禁用
```

## 与其他模块的一致性

现在以下三个 TreeSelect 组件都具备相同的功能：

1. **成员管理 - 搜索组件** (`src/pages/member/components/Search/index.tsx`)
2. **成员管理 - 成员表单** (`src/pages/member/components/MemberForm/index.tsx`)
3. **组织管理 - 成员表单** (`src/pages/organization/components/MemberForm/index.tsx`) ✅ 新增

## 注意事项

1. **不影响其他功能**：增强只针对 TreeSelect 组件，不影响其他表单功能
2. **向后兼容**：支持不同的节点属性结构
3. **错误处理**：路径搜索出错时降级为标题搜索
4. **数据一致性**：`renderFormat` 函数也使用处理后的数据

## 测试建议

1. **权限测试**：

   - 准备包含不同权限的组织数据
   - 验证禁用节点的视觉效果
   - 确认禁用节点无法被选择

2. **搜索测试**：

   - 测试节点名称搜索
   - 测试路径格式搜索
   - 测试部分匹配搜索

3. **功能完整性**：
   - 确认表单提交正常
   - 验证路径显示正确
   - 检查与其他表单字段的交互

## 扩展建议

未来可以考虑：

- 统一抽取权限控制和搜索逻辑为公共 hook
- 添加搜索结果高亮显示
- 支持更多的搜索方式（如拼音搜索）

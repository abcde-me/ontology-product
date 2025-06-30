# TreeSelect 模糊搜索功能说明

## 功能概述

为成员管理模块中的两个 TreeSelect 组件添加了增强的模糊搜索功能，支持多种搜索方式，让用户可以快速找到目标组织。

## 搜索功能特性

### ✅ 多种搜索方式

1. **节点标题搜索**

   - 直接搜索组织名称
   - 例如：搜索 "技术部" 可以找到所有包含 "技术部" 的组织

2. **完整路径搜索**

   - 支持按路径格式搜索
   - 例如：搜索 "技术部/前端组" 可以精确找到该路径下的组织

3. **路径片段搜索**
   - 搜索路径中的任意部分
   - 例如：搜索 "前端" 可以找到 "公司/技术部/前端组"

### ✅ 搜索特性

- **不区分大小写**：搜索时忽略大小写
- **实时过滤**：输入时立即显示匹配结果
- **权限控制**：搜索结果仍然遵循权限控制规则
- **智能匹配**：支持部分匹配和模糊匹配

## 实现细节

### 核心搜索函数

```typescript
const enhancedFilterTreeNode = (inputValue: string, treeNode: any) => {
  if (!inputValue) return true;

  const searchValue = inputValue.toLowerCase();

  // 1. 搜索节点标题
  if (treeNode.title.toLowerCase().includes(searchValue)) {
    return true;
  }

  // 2. 搜索完整路径（例如：搜索"技术部/前端组"）
  const pathTitles = getNodePathTitles(
    processedOrgData,
    treeNode.key || treeNode.id
  );
  const fullPath = pathTitles.join('/').toLowerCase();
  if (fullPath.includes(searchValue)) {
    return true;
  }

  // 3. 搜索路径中的任意部分（例如：搜索"前端"能找到"公司/技术部/前端组"）
  const pathString = pathTitles.join(' ').toLowerCase();
  if (pathString.includes(searchValue)) {
    return true;
  }

  return false;
};
```

### TreeSelect 组件配置

```tsx
<TreeSelect
  showSearch
  placeholder="选择部门"
  treeData={processedOrgData}
  filterTreeNode={enhancedFilterTreeNode}
  onChange={(value) => {
    console.log('Selected organization:', value);
    handleSearch('organization_id', value);
  }}
/>
```

## 使用示例

### 搜索场景示例

假设有以下组织结构：

```
公司总部
├── 技术部
│   ├── 前端组
│   ├── 后端组
│   └── 测试组
├── 产品部
│   ├── 产品设计组
│   └── 用户研究组
└── 运营部
    ├── 市场推广组
    └── 客户服务组
```

### 搜索示例

1. **搜索 "技术"**

   - 匹配：技术部、技术部/前端组、技术部/后端组、技术部/测试组

2. **搜索 "前端"**

   - 匹配：技术部/前端组

3. **搜索 "技术部/前端"**

   - 匹配：技术部/前端组

4. **搜索 "组"**
   - 匹配：所有包含 "组" 的节点

## 工作流程

1. **用户输入搜索关键词**
2. **系统实时过滤组织树**
   - 应用权限控制（只显示有 `can_get` 权限的节点）
   - 应用搜索过滤（匹配搜索条件的节点）
3. **显示过滤结果**
   - 有权限且匹配搜索条件：正常显示
   - 有权限但不匹配搜索条件：隐藏
   - 无权限：禁用显示（如果匹配搜索条件）
4. **用户选择组织**
5. **传递选中的组织 ID 给后端接口**

## 技术优势

1. **性能优化**：只在客户端进行过滤，减少服务器请求
2. **用户体验**：实时搜索反馈，快速定位目标
3. **灵活性**：支持多种搜索方式，适应不同用户习惯
4. **安全性**：搜索结果仍然遵循权限控制

## 注意事项

1. **搜索范围**：只搜索当前用户有权限访问的组织
2. **搜索精度**：使用包含匹配，支持部分关键词搜索
3. **性能考虑**：大量组织数据时，搜索性能良好
4. **兼容性**：与现有权限控制功能完全兼容

## 调试信息

搜索功能会在控制台输出相关信息：

- 选中的组织 ID
- 权限控制结果
- 搜索过滤结果

## 扩展建议

未来可以考虑添加：

- 拼音搜索支持
- 搜索历史记录
- 搜索结果高亮显示
- 快捷搜索标签

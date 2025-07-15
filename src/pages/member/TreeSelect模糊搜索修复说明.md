# TreeSelect 模糊搜索修复说明

## 问题描述

之前的 TreeSelect 模糊搜索功能不工作，用户无法通过输入关键词来过滤组织树。

## 问题原因

1. **API 参数错误**：之前的 `filterTreeNode` 函数参数定义不正确
2. **节点属性访问错误**：没有按照 Arco Design 的官方 API 访问节点属性

## 官方 API 分析

根据 Arco Design 官方示例：

```typescript
filterTreeNode = (inputText, node) => {
  return node.props.title.toLowerCase().indexOf(inputText.toLowerCase()) > -1;
};
```

**关键点**：

- 函数签名：`(inputText: string, node: any) => boolean`
- 节点属性访问：`node.props.title` 而不是 `node.title`

## 修复方案

### 1. 修正函数签名和参数

**修复前：**

```typescript
const enhancedFilterTreeNode = (inputValue: string, treeNode: any) => {
  // 错误的参数名和节点属性访问
  if (treeNode.title.toLowerCase().includes(searchValue)) {
    return true;
  }
};
```

**修复后：**

```typescript
const filterTreeNode = (inputText: string, node: any) => {
  // 正确的参数名和节点属性访问
  const nodeTitle = node.props?.title || node.title || '';
  if (nodeTitle.toLowerCase().includes(searchValue)) {
    return true;
  }
};
```

### 2. 兼容性处理

为了确保在不同情况下都能正常工作，添加了兼容性处理：

```typescript
// 兼容不同的节点属性结构
const nodeTitle = node.props?.title || node.title || '';
const nodeKey = node.props?.key || node.key || node.props?.value || node.value;
```

### 3. 错误处理

添加了 try-catch 来处理路径搜索可能出现的错误：

```typescript
try {
  const nodeKey =
    node.props?.key || node.key || node.props?.value || node.value;
  if (nodeKey) {
    const pathTitles = getNodePathTitles(processedOrgData, nodeKey);
    // ... 路径搜索逻辑
  }
} catch (error) {
  console.warn('Path search error:', error);
}
```

## 完整的修复代码

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

## 功能特性

修复后的模糊搜索支持：

1. **节点标题搜索**：直接搜索组织名称
2. **完整路径搜索**：支持 "技术部/前端组" 格式搜索
3. **路径片段搜索**：搜索路径中的任意部分
4. **不区分大小写**：搜索时忽略大小写
5. **实时过滤**：输入时立即显示匹配结果
6. **权限控制**：搜索结果仍然遵循权限控制规则

## 使用方式

```tsx
<TreeSelect
  showSearch
  placeholder="选择部门"
  treeData={processedOrgData}
  filterTreeNode={filterTreeNode} // 使用修复后的搜索函数
  onChange={handleOrgChange}
/>
```

## 测试验证

1. **基础搜索**：输入组织名称，验证能否正确过滤
2. **路径搜索**：输入 "部门/子部门" 格式，验证路径搜索
3. **部分匹配**：输入部分关键词，验证模糊匹配
4. **权限控制**：确认搜索结果仍然遵循权限规则
5. **选择功能**：确认搜索后选择组织能正确传递给后端

## 注意事项

1. **不影响其他功能**：修复只针对搜索功能，不影响权限控制和接口调用
2. **向后兼容**：支持不同的节点属性结构
3. **错误处理**：路径搜索出错时降级为标题搜索
4. **性能考虑**：搜索在客户端进行，不增加服务器负载

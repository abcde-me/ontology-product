# TreeSelect 权限控制功能

## 功能说明

为 TreeSelect 组件添加了基于权限的节点禁用功能。根据每个组织节点的 `perms` 数组中是否包含 `can_get` 权限来决定该节点是否可以被选择。

## 实现原理

### 1. 权限检查逻辑

```typescript
// 检查当前节点是否有 can_get 权限
const hasGetPermission = node.perms && node.perms.includes('can_get');

// 没有权限则禁用节点
const newNode = {
  ...node,
  disabled: !hasGetPermission,
  className: !hasGetPermission ? 'text-gray-400' : undefined
};
```

### 2. 递归处理

函数会递归处理整个组织树，确保所有层级的节点都应用权限控制：

```typescript
// 递归处理子节点
if (node.children && node.children.length > 0) {
  newNode.children = addPermissionControl(node.children);
}
```

## 数据结构要求

组织数据中每个节点需要包含 `perms` 字段：

```typescript
interface OrgNode {
  id: string;
  key?: string;
  title: string;
  perms: string[]; // 权限数组，如 ['can_get', 'can_create', 'can_update']
  children?: OrgNode[];
}
```

## 权限控制效果

- **有 `can_get` 权限**：节点正常显示，可以点击选择
- **无 `can_get` 权限**：节点置灰显示，不可点击选择

## 使用示例

```tsx
<TreeSelect
  className="w-[160px] flex-none font-[400]"
  allowClear
  placeholder="选择部门"
  showSearch
  treeData={processedOrgData} // 使用处理后的数据
  value={searchParams.organization_id}
  onChange={(value) => {
    handleSearch('organization_id', value);
  }}
/>
```

## 调试信息

组件会在控制台输出调试信息：

- 处理后的组织数据结构
- 被禁用的节点数量统计

## 注意事项

1. **权限字段**：确保组织数据中包含 `perms` 字段
2. **权限标识**：当前检查的是 `can_get` 权限，可根据需要修改
3. **样式处理**：禁用的节点会添加 `text-gray-400` 样式类
4. **向后兼容**：如果节点没有 `perms` 字段，会被视为无权限并禁用

## 自定义权限检查

如果需要检查其他权限，可以修改权限检查逻辑：

```typescript
// 检查多个权限（需要全部满足）
const hasPermission =
  node.perms &&
  ['can_get', 'can_view'].every((perm) => node.perms.includes(perm));

// 检查任意权限（满足一个即可）
const hasPermission =
  node.perms &&
  ['can_get', 'can_view'].some((perm) => node.perms.includes(perm));
```

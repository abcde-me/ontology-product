# TreeSelect 权限控制功能说明

## 概述

为成员管理模块中的两个 TreeSelect 组件添加了基于 `can_get` 权限的节点禁用功能：

1. **搜索组件** (`src/pages/member/components/Search/index.tsx`)
2. **成员表单组件** (`src/pages/member/components/MemberForm/index.tsx`)

## 功能特性

### ✅ 权限检查

- 检查每个组织节点的 `perms` 数组中是否包含 `can_get` 权限
- 递归处理整个组织树的所有层级

### ✅ 视觉反馈

- **有权限**：节点正常显示，可以点击选择
- **无权限**：节点置灰显示（`text-gray-400`），不可点击选择

### ✅ 调试支持

- 在控制台输出权限控制结果
- 统计并显示被禁用的节点数量

## 实现细节

### 核心权限控制函数

```typescript
const addPermissionControl = (nodes: any[]): any[] => {
  return nodes.map((node) => {
    // 检查当前节点是否有 can_get 权限
    const hasGetPermission = node.perms && node.perms.includes('can_get');

    // 创建新节点（保留原有属性）
    const newNode = {
      ...node,
      disabled: !hasGetPermission, // 没有 can_get 权限则禁用
      key: node.key || node.id, // 确保有 key 字段
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

### 使用方式

```typescript
// 处理后的组织数据
const processedOrgData = orgData ? addPermissionControl(orgData) : [];

// TreeSelect 组件使用处理后的数据
<TreeSelect
  treeData={processedOrgData}
  // ... 其他属性
/>
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

## 调试信息

两个组件都会在控制台输出调试信息：

```
Search TreeSelect 权限控制结果: [...]
Search TreeSelect 中共有 X 个节点因缺少 'can_get' 权限被禁用

MemberForm TreeSelect 权限控制结果: [...]
MemberForm TreeSelect 中共有 X 个节点因缺少 'can_get' 权限被禁用
```

## 注意事项

1. **权限字段**：确保组织数据中包含 `perms` 字段
2. **权限标识**：当前检查的是 `can_get` 权限
3. **向后兼容**：如果节点没有 `perms` 字段，会被视为无权限并禁用
4. **性能优化**：权限处理只在 `orgData` 变化时重新计算
5. **路径显示**：MemberForm 中的 `renderFormat` 函数也使用处理后的数据来生成路径

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

## 测试建议

1. 准备包含不同权限的组织数据
2. 观察控制台输出的调试信息
3. 验证禁用节点的视觉效果
4. 确认禁用节点无法被选择

# 权限控制系统

这是一套完整的前端权限控制解决方案，支持页面级、组件级和按钮级的权限控制。

## 核心组件

### 1. PermissionGuard

页面级权限守卫，主要用于路由权限控制。

```tsx
import { PermissionGuard } from '@/components/PermissionGuard';

<PermissionGuard permission="user:can_view">
  <UserListPage />
</PermissionGuard>;
```

### 2. PermissionWrapper

按钮级权限包装器，支持隐藏、禁用等多种策略。

```tsx
import { PermissionWrapper } from '@/components/PermissionGuard';

// 基础用法 - 无权限时隐藏
<PermissionWrapper permission="user:can_delete">
  <Button danger>删除用户</Button>
</PermissionWrapper>

// 无权限时禁用
<PermissionWrapper permission="user:can_edit" disableWhenNoPermission>
  <Button>编辑用户</Button>
</PermissionWrapper>
```

## 权限 Hooks

### usePermission

提供完整的权限操作功能。

```tsx
import { usePermission } from '@/hooks/usePermission';

const { hasPermission, hasAnyPermission, getPermissionProps } = usePermission();

// 检查单个权限
const canDelete = hasPermission('user:can_delete');

// 检查多个权限（需要全部满足）
const canManage = hasPermission(['user:can_view', 'user:can_edit']);

// 检查任意权限（满足一个即可）
const canOperate = hasAnyPermission(['admin:full_access', 'user:can_manage']);
```

### useHasPermission

直接检查权限的简化 hook。

```tsx
import { useHasPermission } from '@/store/userInfoStore';

const canCreate = useHasPermission('user:can_create');
const canManage = useHasPermission(['user:can_view', 'user:can_edit']);
```

## 权限常量

使用统一的权限常量，避免硬编码：

```tsx
import {
  USER_PERMISSIONS,
  ORGANIZATION_PERMISSIONS
} from '@/config/permissions';

<PermissionWrapper permission={USER_PERMISSIONS.CAN_DELETE}>
  <Button danger>删除用户</Button>
</PermissionWrapper>;
```

## 使用场景

### 1. 按钮权限控制

```tsx
// 场景1: 简单的显示/隐藏
<PermissionWrapper permission="user:can_create">
  <Button type="primary">创建用户</Button>
</PermissionWrapper>

// 场景2: 禁用而不是隐藏
<PermissionWrapper permission="user:can_edit" disableWhenNoPermission>
  <Button>编辑用户</Button>
</PermissionWrapper>

// 场景3: 自定义无权限时的显示
<PermissionWrapper
  permission="user:can_delete"
  fallback={<Button disabled>删除用户（无权限）</Button>}
>
  <Button danger>删除用户</Button>
</PermissionWrapper>
```

### 2. 复杂权限逻辑

```tsx
// 需要多个权限
<PermissionWrapper permission={["user:can_view", "user:can_edit"]}>
  <Button>查看并编辑</Button>
</PermissionWrapper>

// 满足任意一个权限即可
<PermissionWrapper anyPermission={["admin:full_access", "user:can_manage"]}>
  <Button>管理用户</Button>
</PermissionWrapper>
```

### 3. 表格操作列

```tsx
const renderActions = (record) => (
  <Space>
    <PermissionWrapper permission="user:can_view">
      <Button size="small">查看</Button>
    </PermissionWrapper>

    <PermissionWrapper permission="user:can_edit">
      <Button size="small" type="primary">
        编辑
      </Button>
    </PermissionWrapper>

    <PermissionWrapper permission="user:can_delete">
      <Button size="small" danger>
        删除
      </Button>
    </PermissionWrapper>
  </Space>
);
```

### 4. 菜单权限过滤

```tsx
const { createPermissionFilter } = usePermission();

const menuItems = [
  { key: 'view', label: '查看', permission: 'user:can_view' },
  { key: 'create', label: '创建', permission: 'user:can_create' },
  { key: 'edit', label: '编辑', permission: 'user:can_edit' }
];

const filteredItems = createPermissionFilter(menuItems);
```

### 5. 动态组件属性

```tsx
const { getPermissionProps } = usePermission();

const buttonProps = getPermissionProps('user:can_edit', {
  disableWhenNoPermission: true,
  noPermissionClassName: 'opacity-50'
});

<Button {...buttonProps}>编辑用户</Button>;
```

## 权限数据结构

用户信息中的权限数据格式：

```typescript
interface UserInfo {
  // ... 其他字段
  perms: string[]; // 权限数组，如 ['user:can_view', 'user:can_create']
}
```

## 最佳实践

1. **使用权限常量**：避免硬编码权限字符串
2. **组件级权限**：优先使用 `PermissionWrapper` 而不是条件渲染
3. **权限组合**：合理使用 `permission` 和 `anyPermission` 属性
4. **性能优化**：权限检查会自动缓存，无需担心性能问题
5. **错误处理**：权限不存在时默认为无权限，确保安全性

## 注意事项

- 权限检查是基于前端的，后端仍需要进行权限验证
- 权限数据来自 `userInfoStore`，确保用户信息已正确加载
- 使用 TypeScript 时，建议使用权限常量以获得类型提示

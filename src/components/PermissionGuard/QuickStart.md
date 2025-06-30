# 🚀 权限控制快速开始

## 立即使用

### 1. 基础按钮权限控制

```tsx
import { PermissionWrapper } from '@/components/PermissionGuard';
import { Button } from '@arco-design/web-react';

// 有权限时显示，无权限时隐藏
<PermissionWrapper permission="user:can_delete">
  <Button status="danger">删除用户</Button>
</PermissionWrapper>

// 无权限时禁用而不是隐藏
<PermissionWrapper permission="user:can_edit" disableWhenNoPermission>
  <Button type="primary">编辑用户</Button>
</PermissionWrapper>
```

### 2. 使用权限常量（推荐）

```tsx
import { USER_PERMISSIONS } from '@/config/permissions';
import { PermissionWrapper } from '@/components/PermissionGuard';

<PermissionWrapper permission={USER_PERMISSIONS.CAN_DELETE}>
  <Button status="danger">删除用户</Button>
</PermissionWrapper>;
```

### 3. 复杂权限逻辑

```tsx
// 需要多个权限（AND 逻辑）
<PermissionWrapper permission={["user:can_view", "user:can_edit"]}>
  <Button>查看并编辑</Button>
</PermissionWrapper>

// 满足任意权限（OR 逻辑）
<PermissionWrapper anyPermission={["admin:full_access", "user:can_manage"]}>
  <Button>管理用户</Button>
</PermissionWrapper>
```

### 4. 表格操作列

```tsx
import { Space } from '@arco-design/web-react';

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
      <Button size="small" status="danger">
        删除
      </Button>
    </PermissionWrapper>
  </Space>
);
```

### 5. 使用 Hooks 进行权限检查

```tsx
import { useHasPermission } from '@/store/userInfoStore';

function MyComponent() {
  const canDelete = useHasPermission('user:can_delete');
  const canManage = useHasPermission(['user:can_view', 'user:can_edit']);

  return (
    <div>
      {canDelete && <Button status="danger">删除</Button>}
      {canManage && <Button>管理</Button>}
    </div>
  );
}
```

## 🔧 配置权限数据

确保用户信息中包含权限数据：

```typescript
// 用户信息示例
const userInfo = {
  username: '张三',
  role: 'admin',
  perms: [
    'user:can_view',
    'user:can_create',
    'user:can_edit',
    'user:can_delete',
    'organizations:can_search'
  ]
};
```

## 📝 注意事项

1. **现有功能不受影响**：`PermissionWrapper` 是全新组件，不会影响现有的页面和路由权限逻辑
2. **向后兼容**：现有的 `PermissionGuard` 组件功能保持不变
3. **权限安全**：前端权限控制仅用于UI展示，后端仍需要进行权限验证
4. **性能优化**：权限检查使用 Zustand 选择器，避免不必要的重渲染

## 🎯 最佳实践

1. **使用权限常量**：避免硬编码权限字符串
2. **组件级权限**：优先使用 `PermissionWrapper` 而不是条件渲染
3. **合理组合**：根据业务需求选择 `permission` 或 `anyPermission`
4. **一致性**：在整个项目中保持权限命名的一致性

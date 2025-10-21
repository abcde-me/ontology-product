# 新权限系统使用指南

## 概述

新权限系统基于接口返回的权限点格式：`aimdp-manager:module:action:operation`，提供了完整的权限管理解决方案，包括：

- 权限Context管理
- 权限组件封装
- 路由权限过滤
- 菜单权限过滤
- 按钮权限控制

## 权限点格式

权限点格式：`aimdp-manager:module:action:operation`

- `aimdp-manager`: 平台标识
- `module`: 模块名（如 connector, workflow, dataset 等）
- `action`: 操作类型（read, manage）
- `operation`: 具体操作（list, get, create, modify, delete, run, export）

示例：

- `aimdp-manager:connector:read:list` - 连接器列表权限
- `aimdp-manager:workflow:manage:create` - 工作流创建权限

## 使用方法

### 1. 权限配置

在 `src/config/newPermissions.ts` 中定义权限点：

```typescript
export const PERMISSIONS = {
  CONNECTOR: {
    LIST: 'aimdp-manager:connector:read:list',
    CREATE: 'aimdp-manager:connector:manage:create'
    // ...
  }
  // ...
};
```

### 2. 权限Context

```typescript
import { usePermission } from '@/context/PermissionContext';

const { permissions, hasPermission, isAdmin } = usePermission();
```

### 3. 权限组件

#### 基础权限包装

```typescript
import { Permission } from '@/components/Permission';

<Permission permission={PERMISSIONS.CONNECTOR.CREATE}>
  <Button>创建连接器</Button>
</Permission>
```

#### 按钮权限

```typescript
import { PermissionButton } from '@/components/Permission';

// 默认模式：无权限时隐藏按钮
<PermissionButton permission={PERMISSIONS.CONNECTOR.DELETE}>
  <Button>删除连接器</Button>
</PermissionButton>

// 禁用模式：无权限时禁用按钮但仍显示
<PermissionButton
  permission={PERMISSIONS.CONNECTOR.DELETE}
  disableWhenNoPermission={true}
>
  <Button>删除连接器</Button>
</PermissionButton>
```

#### 多权限检查

```typescript
import { AnyPermission } from '@/components/Permission';

<AnyPermission permissions={[
  PERMISSIONS.CONNECTOR.CREATE,
  PERMISSIONS.CONNECTOR.MODIFY
]}>
  <Button>编辑连接器</Button>
</AnyPermission>
```

### 4. 路由权限

在路由配置中添加权限字段：

```typescript
{
  name: 'connection',
  key: '/tenant/compute/modaforge/connection',
  component: React.lazy(() => import('../../connection')),
  permission: PERMISSIONS.CONNECTOR.LIST,
  children: []
}
```

### 5. 菜单权限

菜单会根据权限自动过滤，在 `menus.tsx` 中配置：

```typescript
{
  title: '连接器',
  key: 'connection',
  path: '/tenant/compute/modaforge/connection',
  permission: PERMISSIONS.CONNECTOR.LIST
}
```

## 权限初始化流程

1. 用户登录后，在Header组件中获取项目列表
2. 设置默认项目ID或使用本地存储的项目ID
3. 调用 `ResourcePermissionActions` 获取项目权限
4. 将权限数据存储到PermissionContext中
5. 菜单和路由根据权限自动过滤

## 组件API

### Permission

- `permission`: 需要的权限点
- `fallback`: 无权限时显示的内容

### PermissionButton

- `permission`: 需要的权限点
- `hideWhenNoPermission`: 无权限时是否隐藏按钮

### AnyPermission

- `permissions`: 权限点数组，满足任意一个即可

### AdminPermission

- 检查是否为管理员权限

## 最佳实践

1. **权限粒度**: 按照功能模块和操作类型合理划分权限点
2. **组件封装**: 使用权限组件而不是手动检查权限
3. **错误处理**: 为无权限状态提供合适的fallback内容
4. **性能优化**: 权限检查在Context层面缓存，避免重复计算

## 问题解决

### 问题1: 数据标注菜单缺少权限配置

**问题**: 需求管理和标注任务菜单一直显示，没有权限控制
**解决方案**:

- 添加了 `REQUIREMENT` 和 `ANNOTATION_TASK` 权限配置
- 更新菜单配置，为需求管理和标注任务添加对应权限点
- 权限点格式：
  - `aimdp-manager:requirement:read:list` - 需求管理列表权限
  - `aimdp-manager:annotation_task:read:list` - 标注任务列表权限

### 问题2: 项目切换后页面不跳转

**问题**: 切换项目后，页面停留在原来的菜单，没有跳转到新项目的第一个有权限菜单
**解决方案**:

- 修改 `fetchProjectPermissions` 函数，添加 `shouldNavigate` 参数
- 实现 `getFirstAvailableMenuPath` 函数，获取第一个有权限的菜单路径
- 在项目切换时自动跳转到第一个有权限的菜单页面

## 测试功能

### 权限测试页面

创建了 `src/pages/admin/permission-test/index.tsx` 测试页面，包含：

- 权限状态信息显示
- 当前用户权限列表
- 各模块权限组件测试
- 多权限和管理员权限测试

### 权限测试工具

创建了 `src/utils/permissionTest.ts` 测试工具，包含：

- 权限检查功能测试
- 权限配置格式验证
- 开发环境自动测试

## 组件API

### Permission

基础权限包装组件，用于控制内容的显示/隐藏。

**Props:**

- `permission: string | null` - 权限点
- `children: React.ReactNode` - 子组件
- `fallback?: React.ReactNode` - 无权限时的替代内容

### PermissionButton

按钮权限组件，支持隐藏和禁用两种模式。

**Props:**

- `permission: string | null` - 权限点
- `children: React.ReactElement` - 按钮组件（必须是单个React元素）
- `disableWhenNoPermission?: boolean` - 无权限时是否禁用而非隐藏（默认false）

**行为说明:**

- **默认模式（隐藏）**: `disableWhenNoPermission={false}` 或不传该属性
  - 有权限：正常显示按钮
  - 无权限：完全隐藏按钮
- **禁用模式**: `disableWhenNoPermission={true}`
  - 有权限：正常显示按钮
  - 无权限：显示按钮但设置为禁用状态

### AnyPermission

多权限检查组件，满足任意一个权限即可显示。

**Props:**

- `permissions: string[]` - 权限点数组
- `children: React.ReactNode` - 子组件
- `fallback?: React.ReactNode` - 无权限时的替代内容

### AdminPermission

管理员权限组件，只有管理员才能看到内容。

**Props:**

- `children: React.ReactNode` - 子组件
- `fallback?: React.ReactNode` - 非管理员时的替代内容

## 注意事项

1. 权限数据在项目切换时会重新获取
2. 菜单权限过滤是实时的，权限变化后菜单会自动更新
3. 路由权限在应用启动时确定，需要刷新页面才能生效
4. **按钮权限默认为隐藏模式，可通过 `disableWhenNoPermission={true}` 切换为禁用模式**
5. 项目切换时会自动跳转到第一个有权限的菜单页面

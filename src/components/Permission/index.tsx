import React from 'react';
import { usePermission } from '@/context/PermissionContext';

// 权限包装组件的基础接口
interface BasePermissionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// 单权限检查组件
interface PermissionWrapperProps extends BasePermissionProps {
  permission: string | null;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission, isLoading, isInitialized } = usePermission();

  // 权限加载中时，不显示任何内容，避免闪烁
  if (isLoading || !isInitialized) {
    return <>{fallback}</>;
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 多权限检查组件 (任意一个权限满足即可)
interface AnyPermissionWrapperProps extends BasePermissionProps {
  permissions: string[];
}

export const AnyPermissionWrapper: React.FC<AnyPermissionWrapperProps> = ({
  permissions,
  children,
  fallback = null
}) => {
  const { hasAnyPermission } = usePermission();

  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 模块权限检查组件
interface ModulePermissionWrapperProps extends BasePermissionProps {
  module: string;
}

export const ModulePermissionWrapper: React.FC<
  ModulePermissionWrapperProps
> = ({ module, children, fallback = null }) => {
  const { hasModulePermission } = usePermission();

  if (!hasModulePermission(module)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 管理员权限检查组件
type AdminPermissionWrapperProps = BasePermissionProps;

export const AdminPermissionWrapper: React.FC<AdminPermissionWrapperProps> = ({
  children,
  fallback = null
}) => {
  const { isAdmin } = usePermission();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 按钮权限组件
interface PermissionButtonProps {
  permission: string | null;
  children: React.ReactElement;
  disableWhenNoPermission?: boolean; // 改为禁用模式的开关
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  children,
  disableWhenNoPermission = false // 默认为隐藏模式
}) => {
  const { hasPermission, isLoading, isInitialized } = usePermission();

  // 权限加载中时，根据模式决定显示方式
  if (isLoading || !isInitialized) {
    if (disableWhenNoPermission) {
      // 禁用模式：显示但禁用按钮
      return React.cloneElement(children, {
        ...children.props,
        disabled: true
      });
    } else {
      // 隐藏模式：不显示按钮
      return null;
    }
  }

  const hasAccess = hasPermission(permission);

  // 没有权限时的处理
  if (!hasAccess) {
    if (disableWhenNoPermission) {
      // 禁用模式：显示按钮但禁用
      return React.cloneElement(children, {
        ...children.props,
        disabled: true
      });
    } else {
      // 隐藏模式：直接隐藏按钮（默认行为）
      return null;
    }
  }

  // 有权限时正常显示
  return React.cloneElement(children, {
    ...children.props,
    disabled: children.props.disabled // 保持原有的disabled状态
  });
};

// 路由权限组件
interface RoutePermissionProps extends BasePermissionProps {
  permission: string | null;
  redirectTo?: string;
}

export const RoutePermission: React.FC<RoutePermissionProps> = ({
  permission,
  children,
  fallback = <div>无权限访问此页面</div>,
  redirectTo
}) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    if (redirectTo) {
      // 这里可以添加路由跳转逻辑
      window.location.href = redirectTo;
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 权限加载组件
export const PermissionLoading: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { isLoading } = usePermission();

  if (isLoading) {
    return <div>权限加载中...</div>;
  }

  return <>{children}</>;
};

// 别名导出主要权限组件
export { PermissionWrapper as Permission };
export { AnyPermissionWrapper as AnyPermission };
export { ModulePermissionWrapper as ModulePermission };
export { AdminPermissionWrapper as AdminPermission };

// 默认导出主要的权限组件
export default PermissionWrapper;

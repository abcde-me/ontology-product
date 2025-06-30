import { useCallback } from 'react';
import {
  useUserPermissions,
  useHasPermission,
  useHasAnyPermission
} from '@/store/userInfoStore';

/**
 * 权限相关的 hooks 集合
 */
export const usePermission = () => {
  const userPermissions = useUserPermissions();

  /**
   * 检查是否有指定权限
   */
  const hasPermission = useCallback(
    (permission: string | string[]) => {
      if (Array.isArray(permission)) {
        return permission.every((perm) => userPermissions.includes(perm));
      }
      return userPermissions.includes(permission);
    },
    [userPermissions]
  );

  /**
   * 检查是否有任意一个权限
   */
  const hasAnyPermission = useCallback(
    (permissions: string[]) => {
      return permissions.some((perm) => userPermissions.includes(perm));
    },
    [userPermissions]
  );

  /**
   * 检查是否有所有权限
   */
  const hasAllPermissions = useCallback(
    (permissions: string[]) => {
      return permissions.every((perm) => userPermissions.includes(perm));
    },
    [userPermissions]
  );

  /**
   * 获取用户拥有的权限列表
   */
  const getPermissions = useCallback(() => {
    return [...userPermissions];
  }, [userPermissions]);

  /**
   * 检查权限并返回相应的组件属性
   * 用于动态设置组件的 disabled、className 等属性
   */
  const getPermissionProps = useCallback(
    (
      permission: string | string[],
      options: {
        disableWhenNoPermission?: boolean;
        noPermissionClassName?: string;
        noPermissionStyle?: React.CSSProperties;
      } = {}
    ) => {
      const hasAccess = hasPermission(permission);

      if (hasAccess) {
        return {};
      }

      const props: any = {};

      if (options.disableWhenNoPermission) {
        props.disabled = true;
        props.style = {
          opacity: 0.5,
          cursor: 'not-allowed',
          ...options.noPermissionStyle
        };
      }

      if (options.noPermissionClassName) {
        props.className = options.noPermissionClassName;
      }

      return props;
    },
    [hasPermission]
  );

  /**
   * 创建权限过滤器函数
   * 用于过滤数组中的项目
   */
  const createPermissionFilter = useCallback(
    <T extends { permission?: string }>(items: T[]) => {
      return items.filter(
        (item) => !item.permission || hasPermission(item.permission)
      );
    },
    [hasPermission]
  );

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    getPermissionProps,
    createPermissionFilter
  };
};

/**
 * 权限检查的 hook（直接返回布尔值）
 */
export { useHasPermission, useHasAnyPermission };

/**
 * 获取用户权限列表的 hook
 */
export { useUserPermissions };

export default usePermission;

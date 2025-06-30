import React from 'react';
import { useHasPermission } from '@/store/userInfoStore';
import Page403 from '@/pages/errorPages/Page403';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string | string[]; // 需要的权限，支持单个权限或权限数组
  fallback?: React.ReactNode; // 无权限时显示的组件，默认为 403 页面
}

/**
 * 权限守卫组件
 * 根据用户权限决定是否渲染子组件
 * 主要用于页面级别的权限控制
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback
}) => {
  const hasPermission = useHasPermission(permission || []);

  // 如果没有指定权限要求，直接渲染子组件
  if (!permission) {
    return <>{children}</>;
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  // 无权限时显示 fallback 组件或默认的 403 页面
  return <>{fallback || <Page403 />}</>;
};

// 导出新的权限包装组件
export { default as PermissionWrapper } from './PermissionWrapper';

export default PermissionGuard;

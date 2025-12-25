import { usePermission } from '@/hooks';
import { Page403 } from '@/pages/errorPages';
import AuthLoad from '@/pages/errorPages/authLoad';
import { useUserInfoStore } from '@/store/userInfoStore';
import React, { useEffect, useRef } from 'react';

// 带权限检查的路由组件
const PermissionRoute: React.FC<{ route: any }> = ({ route }) => {
  const { userActions, projectId, isInitialized } = useUserInfoStore();
  const { setUserPermissions, hasAnyPermission, hasAllPermissions } =
    usePermission();
  const permissionLoadedRef = useRef(false);

  const Component = route.component;

  const needPermission =
    !!route.permission ||
    (Array.isArray(route.anyPermission) && route.anyPermission.length > 0) ||
    (Array.isArray(route.allPermission) && route.allPermission.length > 0);

  // 当有 projectId 时，加载权限
  useEffect(() => {
    if (projectId && projectId[1] && !permissionLoadedRef.current) {
      permissionLoadedRef.current = true;
      console.log(
        '🔐 PermissionRoute 触发权限初始化，projectId:',
        projectId[1]
      );
      setUserPermissions(projectId[1]);
    }
  }, [projectId, setUserPermissions]);

  // projectId 变化时重置标记
  useEffect(() => {
    permissionLoadedRef.current = false;
  }, [projectId?.[1]]);

  // 如果路由没有权限要求，直接渲染
  if (!needPermission) {
    return <Component />;
  }

  // 如果用户信息还未初始化完成，显示加载页面
  if (!isInitialized) {
    return <AuthLoad />;
  }

  // 如果是管理员，直接渲染
  if (userActions.isAdmin) {
    return <Component />;
  }

  // 如果没有项目ID，显示403页面
  if (!projectId || !projectId[1]) {
    return <Page403 />;
  }

  // 如果权限还未加载完成（actions 为 null），显示加载页面
  if (userActions.actions === null) {
    return <AuthLoad />;
  }

  // 检查用户是否拥有该权限
  let hasPermission = true;

  if (route.allPermission) {
    hasPermission = hasAllPermissions(route.allPermission);
  } else if (route.anyPermission) {
    hasPermission = hasAnyPermission(route.anyPermission);
  } else if (route.permission) {
    hasPermission = userActions.actions.includes(route.permission);
  }

  // 无权限时显示403页面
  if (!hasPermission) {
    return <Page403 />;
  }

  // 有权限时渲染组件
  return <Component />;
};

export default PermissionRoute;

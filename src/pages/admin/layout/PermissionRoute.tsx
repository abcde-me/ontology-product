import { usePermission } from '@/hooks';
import { Page403 } from '@/pages/errorPages';
import AuthLoad from '@/pages/errorPages/authLoad';
import { useUserInfoStore } from '@/store/userInfoStore';
import React, { useEffect, useState } from 'react';

// 带权限检查的路由组件
const PermissionRoute: React.FC<{ route: any }> = ({ route }) => {
  const { userActions, projectId } = useUserInfoStore();
  const { setUserPermissions, hasAnyPermission, hasAllPermissions } =
    usePermission();
  const [isInitializing, setIsInitializing] = useState(false);

  const Component = route.component;

  const needPermission =
    !!route.permission ||
    (Array.isArray(route.anyPermission) && route.anyPermission.length > 0) ||
    (Array.isArray(route.allPermission) && route.allPermission.length > 0);

  // 如果需要权限但权限未加载，则触发加载
  useEffect(() => {
    if (
      needPermission &&
      userActions.actions === null &&
      projectId &&
      projectId[1] &&
      !isInitializing
    ) {
      setIsInitializing(true);
      console.log(
        '🔐 PermissionRoute 触发权限初始化，projectId:',
        projectId[1]
      );

      setUserPermissions(projectId[1]).finally(() => {
        setIsInitializing(false);
      });
    }
  }, [
    needPermission,
    userActions.actions,
    projectId,
    isInitializing,
    setUserPermissions
  ]);

  // 如果路由没有权限要求，直接渲染
  if (!needPermission) {
    return <Component />;
  }

  // 如果是管理员，直接渲染
  if (userActions.isAdmin) {
    return <Component />;
  }

  // 如果正在初始化权限，显示加载中页面
  if (isInitializing || userActions.actions === null) {
    return <AuthLoad />;
  }

  // 检查用户是否拥有该权限
  let hasPermission = true;

  if (route.allPermission) {
    // allPermission: 需要全部命中（优先级最高）
    hasPermission = hasAllPermissions(route.allPermission);
  } else if (route.anyPermission) {
    // anyPermission: 只要命中任意一个
    hasPermission = hasAnyPermission(route.anyPermission);
  } else if (route.permission) {
    // 单一权限（优先级最低）
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

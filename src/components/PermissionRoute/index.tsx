import React from 'react';
import { usePermission } from '@/context/PermissionContext';
import { usePermissionRoute } from '@/pages/admin/route';

// 权限路由Hook，结合权限Context和路由过滤
export const usePermissionRoutes = () => {
  const { permissions, isLoading } = usePermission();
  const [permissionRoutes, defaultRoute] = usePermissionRoute(permissions);

  return {
    routes: permissionRoutes,
    defaultRoute,
    isLoading
  };
};

// 权限路由组件
interface PermissionRouteProviderProps {
  children: (data: {
    routes: any[];
    defaultRoute: string;
    isLoading: boolean;
  }) => React.ReactNode;
}

export const PermissionRouteProvider: React.FC<
  PermissionRouteProviderProps
> = ({ children }) => {
  const routeData = usePermissionRoutes();
  return <>{children(routeData)}</>;
};

export default usePermissionRoutes;

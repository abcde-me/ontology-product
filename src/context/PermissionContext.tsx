import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  hasPermission,
  hasAnyPermission,
  hasModulePermission
} from '@/config/newPermissions';

interface PermissionData {
  admin: boolean;
  scope: string;
  actions: string[];
  aclActions: string[] | null;
}

interface PermissionContextType {
  permissions: string[];
  permissionData: PermissionData | null;
  isLoading: boolean;
  isInitialized: boolean; // 新增：是否已完成初始化
  setPermissions: (permissions: string[]) => void;
  setPermissionData: (data: PermissionData) => void;
  hasPermission: (permission: string | null) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasModulePermission: (module: string) => boolean;
  isAdmin: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionData, setPermissionData] = useState<PermissionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 权限检查函数
  const checkPermission = (permission: string | null): boolean => {
    const result = hasPermission(permissions, permission);
    if (permission && !result) {
      console.log(
        `权限检查失败: ${permission}, 当前权限列表长度: ${permissions.length}`
      );
    }
    return result;
  };

  const checkAnyPermission = (permissionList: string[]): boolean => {
    return hasAnyPermission(permissions, permissionList);
  };

  const checkModulePermission = (module: string): boolean => {
    // 这里需要根据实际的模块权限映射来实现
    const modulePermissions = permissions.filter((p) =>
      p.includes(`:${module}:`)
    );
    return modulePermissions.length > 0;
  };

  // 设置权限数据
  const handleSetPermissionData = (data: PermissionData) => {
    setPermissionData(data);
    setPermissions(data.actions || []);
    setIsLoading(false);
    setIsInitialized(true); // 标记为已初始化
    console.log('权限数据已更新:', data);
  };

  // 设置权限列表
  const handleSetPermissions = (newPermissions: string[]) => {
    setPermissions(newPermissions);
    setIsInitialized(true); // 标记为已初始化
    console.log('权限列表已更新:', newPermissions);
  };

  const contextValue: PermissionContextType = {
    permissions,
    permissionData,
    isLoading,
    isInitialized,
    setPermissions: handleSetPermissions,
    setPermissionData: handleSetPermissionData,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasModulePermission: checkModulePermission,
    isAdmin: permissionData?.admin || false
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

// 权限检查 Hook
export const usePermissionCheck = (permission: string | null) => {
  const { hasPermission } = usePermission();
  return hasPermission(permission);
};

// 多权限检查 Hook
export const useAnyPermissionCheck = (permissions: string[]) => {
  const { hasAnyPermission } = usePermission();
  return hasAnyPermission(permissions);
};

// 模块权限检查 Hook
export const useModulePermissionCheck = (module: string) => {
  const { hasModulePermission } = usePermission();
  return hasModulePermission(module);
};

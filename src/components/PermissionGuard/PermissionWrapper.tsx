import React from 'react';
import { useHasPermission, useHasAnyPermission } from '@/store/userInfoStore';

interface PermissionWrapperProps {
  children: React.ReactNode;
  /** 单个权限或权限数组（需要全部满足） */
  permission?: string | string[];
  /** 权限数组（满足任意一个即可） */
  anyPermission?: string[];
  /** 无权限时显示的内容，默认为 null（不显示） */
  fallback?: React.ReactNode;
  /** 无权限时是否禁用而不是隐藏，仅对支持 disabled 属性的组件有效 */
  disableWhenNoPermission?: boolean;
  /** 无权限时的样式类名 */
  noPermissionClassName?: string;
  /** 无权限时的内联样式 */
  noPermissionStyle?: React.CSSProperties;
}

/**
 * 权限包装组件 - 用于按钮级别的权限控制
 *
 * 使用示例：
 *
 * 1. 基础用法 - 隐藏无权限的按钮
 * <PermissionWrapper permission="user:can_delete">
 *   <Button>删除用户</Button>
 * </PermissionWrapper>
 *
 * 2. 禁用而不是隐藏
 * <PermissionWrapper permission="user:can_edit" disableWhenNoPermission>
 *   <Button>编辑用户</Button>
 * </PermissionWrapper>
 *
 * 3. 需要多个权限
 * <PermissionWrapper permission={["user:can_edit", "user:can_view"]}>
 *   <Button>编辑用户</Button>
 * </PermissionWrapper>
 *
 * 4. 满足任意一个权限即可
 * <PermissionWrapper anyPermission={["admin:full_access", "user:can_edit"]}>
 *   <Button>编辑</Button>
 * </PermissionWrapper>
 *
 * 5. 自定义无权限时的显示
 * <PermissionWrapper permission="user:can_delete" fallback={<span>无权限</span>}>
 *   <Button>删除</Button>
 * </PermissionWrapper>
 */
export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  anyPermission,
  fallback = null,
  disableWhenNoPermission = false,
  noPermissionClassName,
  noPermissionStyle
}) => {
  // 检查权限
  const hasRequiredPermission = useHasPermission(permission || []);
  const hasAnyRequiredPermission = useHasAnyPermission(anyPermission || []);

  // 确定是否有权限
  let hasPermission = true;

  if (permission) {
    hasPermission = hasRequiredPermission;
  }

  if (anyPermission && anyPermission.length > 0) {
    hasPermission = hasPermission && hasAnyRequiredPermission;
  }

  // 如果没有指定任何权限要求，直接渲染
  if (!permission && (!anyPermission || anyPermission.length === 0)) {
    return <>{children}</>;
  }

  // 有权限时直接渲染
  if (hasPermission) {
    return <>{children}</>;
  }

  // 无权限时的处理
  if (disableWhenNoPermission) {
    // 尝试禁用组件
    return React.cloneElement(children as React.ReactElement, {
      disabled: true,
      className:
        `${(children as React.ReactElement).props.className || ''} ${noPermissionClassName || ''}`.trim(),
      style: {
        ...(children as React.ReactElement).props.style,
        ...noPermissionStyle,
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    });
  }

  // 返回 fallback 或不显示
  return <>{fallback}</>;
};

export default PermissionWrapper;

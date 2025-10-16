import React from 'react';
import { Button } from '@arco-design/web-react';
import {
  Permission,
  PermissionButton,
  AdminPermission,
  AnyPermission
} from '@/components/Permission';
import { PERMISSIONS } from '@/config/newPermissions';

/**
 * 权限组件使用示例
 */
export const PermissionExample: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold">权限组件使用示例</h2>

      {/* 单权限检查 */}
      <div>
        <h3 className="mb-2 font-semibold">单权限检查</h3>
        <Permission permission={PERMISSIONS.CONNECTOR.CREATE}>
          <Button type="primary">创建连接器</Button>
        </Permission>

        <Permission
          permission={PERMISSIONS.CONNECTOR.DELETE}
          fallback={<Button disabled>删除连接器（无权限）</Button>}
        >
          <Button status="danger">删除连接器</Button>
        </Permission>
      </div>

      {/* 多权限检查 */}
      <div>
        <h3 className="mb-2 font-semibold">多权限检查（任意一个满足）</h3>
        <AnyPermission
          permissions={[
            PERMISSIONS.CONNECTOR.CREATE,
            PERMISSIONS.CONNECTOR.MODIFY
          ]}
        >
          <Button type="primary">编辑连接器</Button>
        </AnyPermission>
      </div>

      {/* 按钮权限 */}
      <div>
        <h3 className="mb-2 font-semibold">按钮权限控制</h3>
        <div className="space-y-2">
          <div>
            <h4 className="mb-1 text-sm font-medium">默认模式（隐藏）</h4>
            <PermissionButton permission={PERMISSIONS.DATA_LOADER.RUN}>
              <Button type="primary">运行数据载入</Button>
            </PermissionButton>
          </div>

          <div>
            <h4 className="mb-1 text-sm font-medium">禁用模式</h4>
            <PermissionButton
              permission={PERMISSIONS.DATA_LOADER.DELETE}
              disableWhenNoPermission={true}
            >
              <Button status="danger">删除数据载入</Button>
            </PermissionButton>
          </div>
        </div>
      </div>

      {/* 管理员权限 */}
      <div>
        <h3 className="mb-2 font-semibold">管理员权限</h3>
        <AdminPermission fallback={<div>仅管理员可见</div>}>
          <Button type="primary">管理员操作</Button>
        </AdminPermission>
      </div>

      {/* 权限组合使用 */}
      <div>
        <h3 className="mb-2 font-semibold">权限组合使用</h3>
        <Permission permission={PERMISSIONS.WORKFLOW.LIST}>
          <div className="rounded border p-4">
            <h4>工作流管理</h4>
            <div className="mt-2 space-x-2">
              <PermissionButton permission={PERMISSIONS.WORKFLOW.CREATE}>
                <Button type="primary">创建工作流</Button>
              </PermissionButton>

              <PermissionButton permission={PERMISSIONS.WORKFLOW.MODIFY}>
                <Button>编辑工作流</Button>
              </PermissionButton>

              <PermissionButton permission={PERMISSIONS.WORKFLOW.DELETE}>
                <Button status="danger">删除工作流</Button>
              </PermissionButton>

              <PermissionButton permission={PERMISSIONS.WORKFLOW.RUN}>
                <Button type="primary">运行工作流</Button>
              </PermissionButton>
            </div>
          </div>
        </Permission>
      </div>
    </div>
  );
};

export default PermissionExample;

import React from 'react';
import { Button, Space, Dropdown, Menu } from '@arco-design/web-react';
import { PermissionWrapper } from './PermissionWrapper';
import { usePermission } from '@/hooks/usePermission';

/**
 * 权限控制使用示例
 * 这个文件展示了各种权限控制的使用方式
 */

// 示例1: 基础按钮权限控制
export const BasicButtonExample = () => {
  return (
    <Space>
      {/* 有权限时显示，无权限时隐藏 */}
      <PermissionWrapper permission="user:can_create">
        <Button type="primary">创建用户</Button>
      </PermissionWrapper>

      {/* 有权限时启用，无权限时禁用 */}
      <PermissionWrapper permission="user:can_edit" disableWhenNoPermission>
        <Button>编辑用户</Button>
      </PermissionWrapper>

      {/* 无权限时显示自定义内容 */}
      <PermissionWrapper
        permission="user:can_delete"
        fallback={<Button disabled>删除用户（无权限）</Button>}
      >
        <Button>删除用户</Button>
      </PermissionWrapper>
    </Space>
  );
};

// 示例2: 复杂权限逻辑
export const ComplexPermissionExample = () => {
  return (
    <Space direction="vertical">
      {/* 需要多个权限 */}
      <PermissionWrapper permission={['user:can_view', 'user:can_edit']}>
        <Button>查看并编辑用户</Button>
      </PermissionWrapper>

      {/* 满足任意一个权限即可 */}
      <PermissionWrapper
        anyPermission={['admin:full_access', 'user:can_manage']}
      >
        <Button>管理用户</Button>
      </PermissionWrapper>

      {/* 组合使用：需要基础权限 + 任意一个高级权限 */}
      <PermissionWrapper
        permission="user:can_view"
        anyPermission={['admin:full_access', 'user:can_advanced']}
      >
        <Button>高级操作</Button>
      </PermissionWrapper>
    </Space>
  );
};

// 示例3: 使用 hooks 进行更复杂的权限控制
export const HookBasedExample = () => {
  const { hasPermission, hasAnyPermission, getPermissionProps } =
    usePermission();

  // 动态计算按钮状态
  const canDelete = hasPermission('user:can_delete');
  const canManage = hasAnyPermission(['admin:full_access', 'user:can_manage']);

  // 获取权限相关的组件属性
  const editButtonProps = getPermissionProps('user:can_edit', {
    disableWhenNoPermission: true,
    noPermissionClassName: 'opacity-50'
  });

  return (
    <Space direction="vertical">
      <div>
        <span>删除权限状态: {canDelete ? '有权限' : '无权限'}</span>
        <Button disabled={!canDelete}>删除用户</Button>
      </div>

      <div>
        <span>管理权限状态: {canManage ? '有权限' : '无权限'}</span>
        <Button type="primary" disabled={!canManage}>
          管理用户
        </Button>
      </div>

      <Button {...editButtonProps}>编辑用户（动态属性）</Button>
    </Space>
  );
};

// 示例4: 菜单项权限控制
export const MenuPermissionExample = () => {
  const { createPermissionFilter } = usePermission();

  // 定义菜单项（包含权限信息）
  const menuItems = [
    { key: 'view', label: '查看用户', permission: 'user:can_view' },
    { key: 'create', label: '创建用户', permission: 'user:can_create' },
    { key: 'edit', label: '编辑用户', permission: 'user:can_edit' },
    { key: 'delete', label: '删除用户', permission: 'user:can_delete' },
    { key: 'export', label: '导出数据' } // 无权限要求
  ];

  // 过滤有权限的菜单项
  const filteredMenuItems = createPermissionFilter(menuItems);

  const menu = (
    <Menu>
      {filteredMenuItems.map((item) => (
        <Menu.Item key={item.key}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown droplist={menu} position="bl">
      <Button>用户操作</Button>
    </Dropdown>
  );
};

// 示例5: 表格操作列权限控制
export const TableActionExample = () => {
  const renderActions = (_record: any) => {
    return (
      <Space>
        <PermissionWrapper permission="user:can_view">
          <Button size="small">查看</Button>
        </PermissionWrapper>

        <PermissionWrapper permission="user:can_edit">
          <Button size="small" type="primary">
            编辑
          </Button>
        </PermissionWrapper>

        <PermissionWrapper permission="user:can_delete">
          <Button size="small" status="danger">
            删除
          </Button>
        </PermissionWrapper>

        {/* 管理员或用户管理员才能重置密码 */}
        <PermissionWrapper
          anyPermission={['admin:full_access', 'user:can_reset_password']}
        >
          <Button size="small">重置密码</Button>
        </PermissionWrapper>
      </Space>
    );
  };

  return (
    <div>
      <h4>表格操作列示例</h4>
      <p>在实际使用中，将 renderActions 函数用作表格的 render 属性</p>
      {renderActions({})}
    </div>
  );
};

// 示例6: 条件渲染组合
export const ConditionalRenderExample = () => {
  const { hasPermission } = usePermission();

  return (
    <div>
      {/* 传统的条件渲染 */}
      {hasPermission('user:can_create') && (
        <Button type="primary">创建用户</Button>
      )}

      {/* 使用 PermissionWrapper 的条件渲染 */}
      <PermissionWrapper permission="user:can_batch_import">
        <Button>批量导入</Button>
      </PermissionWrapper>

      {/* 复杂的条件逻辑 */}
      {hasPermission('user:can_export') ? (
        <PermissionWrapper permission="user:can_export_sensitive">
          <Button>导出敏感数据</Button>
        </PermissionWrapper>
      ) : (
        <span>无导出权限</span>
      )}
    </div>
  );
};

export default {
  BasicButtonExample,
  ComplexPermissionExample,
  HookBasedExample,
  MenuPermissionExample,
  TableActionExample,
  ConditionalRenderExample
};

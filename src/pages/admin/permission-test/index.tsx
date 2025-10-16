import React from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Divider
} from '@arco-design/web-react';
import { usePermission } from '@/context/PermissionContext';
import { PERMISSIONS } from '@/config/newPermissions';
import {
  Permission,
  PermissionButton,
  AdminPermission,
  AnyPermission
} from '@/components/Permission';

const { Title, Text } = Typography;

/**
 * 权限系统测试页面
 */
const PermissionTest: React.FC = () => {
  const { permissions, permissionData, isLoading, isAdmin } = usePermission();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Title level={2}>权限系统测试页面</Title>

      {/* 权限状态信息 */}
      <Card title="权限状态信息" className="mb-6">
        <Space direction="vertical" size="medium">
          <div>
            <Text strong>加载状态: </Text>
            <Text>{isLoading ? '加载中...' : '已加载'}</Text>
          </div>
          <div>
            <Text strong>是否管理员: </Text>
            <Text>{isAdmin ? '是' : '否'}</Text>
          </div>
          <div>
            <Text strong>权限数量: </Text>
            <Text>{permissions.length}</Text>
          </div>
          <div>
            <Text strong>权限范围: </Text>
            <Text>{permissionData?.scope || '未知'}</Text>
          </div>
        </Space>
      </Card>

      {/* 权限列表 */}
      <Card title="当前用户权限列表" className="mb-6">
        <div className="max-h-60 overflow-y-auto">
          {permissions.length > 0 ? (
            <Space direction="vertical" size="small">
              {permissions.map((permission, index) => (
                <Text key={index} code>
                  {permission}
                </Text>
              ))}
            </Space>
          ) : (
            <Text type="secondary">暂无权限数据</Text>
          )}
        </div>
      </Card>

      <Divider />

      {/* 权限组件测试 */}
      <Title level={3}>权限组件测试</Title>

      {/* 按钮权限模式测试 */}
      <Card title="按钮权限模式测试" className="mb-4">
        <Space direction="vertical" size="large">
          <div>
            <Title level={4}>默认模式（隐藏）</Title>
            <Text type="secondary">无权限时按钮会被隐藏</Text>
            <div className="mt-2">
              <Space wrap>
                <PermissionButton permission={PERMISSIONS.CONNECTOR.CREATE}>
                  <Button type="primary">创建连接器（有权限显示）</Button>
                </PermissionButton>

                <PermissionButton permission="non-existent-permission">
                  <Button>不存在的权限（会被隐藏）</Button>
                </PermissionButton>
              </Space>
            </div>
          </div>

          <div>
            <Title level={4}>禁用模式</Title>
            <Text type="secondary">无权限时按钮会被禁用但仍然显示</Text>
            <div className="mt-2">
              <Space wrap>
                <PermissionButton
                  permission={PERMISSIONS.CONNECTOR.DELETE}
                  disableWhenNoPermission={true}
                >
                  <Button status="danger">删除连接器（有权限启用）</Button>
                </PermissionButton>

                <PermissionButton
                  permission="non-existent-permission"
                  disableWhenNoPermission={true}
                >
                  <Button>不存在的权限（会被禁用）</Button>
                </PermissionButton>
              </Space>
            </div>
          </div>
        </Space>
      </Card>

      {/* 连接器权限测试 */}
      <Card title="连接器权限测试" className="mb-4">
        <Space wrap>
          <Permission permission={PERMISSIONS.CONNECTOR.LIST}>
            <Button type="primary">查看连接器列表</Button>
          </Permission>

          <PermissionButton permission={PERMISSIONS.CONNECTOR.CREATE}>
            <Button>创建连接器</Button>
          </PermissionButton>

          <PermissionButton permission={PERMISSIONS.CONNECTOR.MODIFY}>
            <Button>编辑连接器</Button>
          </PermissionButton>

          <PermissionButton permission={PERMISSIONS.CONNECTOR.DELETE}>
            <Button status="danger">删除连接器</Button>
          </PermissionButton>
        </Space>
      </Card>

      {/* 工作流权限测试 */}
      <Card title="工作流权限测试" className="mb-4">
        <Space wrap>
          <Permission permission={PERMISSIONS.WORKFLOW.LIST}>
            <Button type="primary">查看工作流列表</Button>
          </Permission>

          <PermissionButton permission={PERMISSIONS.WORKFLOW.CREATE}>
            <Button>创建工作流</Button>
          </PermissionButton>

          <PermissionButton permission={PERMISSIONS.WORKFLOW.RUN}>
            <Button type="primary">运行工作流</Button>
          </PermissionButton>
        </Space>
      </Card>

      {/* 数据集权限测试 */}
      <Card title="数据集权限测试" className="mb-4">
        <Space wrap>
          <Permission permission={PERMISSIONS.DATASET.LIST}>
            <Button type="primary">查看数据集列表</Button>
          </Permission>

          <PermissionButton permission={PERMISSIONS.DATASET.CREATE}>
            <Button>创建数据集</Button>
          </PermissionButton>

          <PermissionButton permission={PERMISSIONS.DATASET.DELETE}>
            <Button status="danger">删除数据集</Button>
          </PermissionButton>
        </Space>
      </Card>

      {/* 标注权限测试 */}
      <Card title="标注权限测试" className="mb-4">
        <Space wrap>
          <Permission permission={PERMISSIONS.REQUIREMENT.LIST}>
            <Button type="primary">查看需求管理</Button>
          </Permission>

          <Permission permission={PERMISSIONS.ANNOTATION_TASK.LIST}>
            <Button type="primary">查看标注任务</Button>
          </Permission>

          <PermissionButton permission={PERMISSIONS.REQUIREMENT.CREATE}>
            <Button>创建需求</Button>
          </PermissionButton>

          <PermissionButton permission={PERMISSIONS.ANNOTATION_TASK.ASSIGN}>
            <Button>分配任务</Button>
          </PermissionButton>
        </Space>
      </Card>

      {/* 多权限测试 */}
      <Card title="多权限测试" className="mb-4">
        <Space wrap>
          <AnyPermission
            permissions={[
              PERMISSIONS.CONNECTOR.CREATE,
              PERMISSIONS.CONNECTOR.MODIFY
            ]}
          >
            <Button type="primary">编辑连接器（创建或修改权限）</Button>
          </AnyPermission>

          <AnyPermission
            permissions={[
              PERMISSIONS.WORKFLOW.CREATE,
              PERMISSIONS.WORKFLOW.MODIFY,
              PERMISSIONS.WORKFLOW.DELETE
            ]}
          >
            <Button>工作流管理（任意管理权限）</Button>
          </AnyPermission>
        </Space>
      </Card>

      {/* 管理员权限测试 */}
      <Card title="管理员权限测试" className="mb-4">
        <AdminPermission fallback={<Text type="secondary">仅管理员可见</Text>}>
          <Button type="primary" status="danger">
            管理员专用功能
          </Button>
        </AdminPermission>
      </Card>

      {/* 权限组合测试 */}
      <Card title="权限组合测试" className="mb-4">
        <Permission permission={PERMISSIONS.ORGANIZATION.LIST}>
          <div className="rounded border bg-gray-50 p-4">
            <Title level={4}>组织管理模块</Title>
            <Space wrap className="mt-2">
              <PermissionButton permission={PERMISSIONS.ORGANIZATION.CREATE}>
                <Button type="primary">创建组织</Button>
              </PermissionButton>

              <PermissionButton permission={PERMISSIONS.ORGANIZATION.MODIFY}>
                <Button>编辑组织</Button>
              </PermissionButton>

              <PermissionButton permission={PERMISSIONS.ORGANIZATION.DELETE}>
                <Button status="danger">删除组织</Button>
              </PermissionButton>
            </Space>
          </div>
        </Permission>
      </Card>
    </div>
  );
};

export default PermissionTest;

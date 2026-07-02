import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Cascader,
  Form,
  Message,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tabs,
  Tag
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { useUserInfoStore } from '@/store/userInfoStore';
import type {
  ApiAuthorizationFormValues,
  ApiAuthorizationRule,
  ApiAuthorizationUser,
  OntologyApiListItem
} from '../types';
import {
  deleteApiAuthorizationRule,
  listApiAuthorizationRules,
  saveApiAuthorizationRule
} from '../services/authorizationStorage';
import {
  getAuthorizationUsersByIds,
  searchAuthorizationUsers
} from '../services/authorizationUsers';
import styles from '../index.module.scss';

interface ApiAuthorizationModalProps {
  api: OntologyApiListItem | null;
  saving?: boolean;
  onCancel: () => void;
  onSaved?: () => void;
}

const buildScopeLabel = (rule: ApiAuthorizationRule) => {
  if (rule.scopeType === 'project') {
    return `${rule.orgName} / ${rule.projectName || '-'}`;
  }

  return rule.orgName;
};

const buildUserScopeLabel = (rule: ApiAuthorizationRule) => {
  if (rule.userScope === 'all') {
    return '全部用户';
  }

  const names = rule.users?.map((user) => user.name).filter(Boolean) ?? [];
  if (!names.length) {
    return '指定用户';
  }

  return names.length > 3
    ? `${names.slice(0, 3).join('、')} 等 ${names.length} 人`
    : names.join('、');
};

export const ApiAuthorizationModal: React.FC<ApiAuthorizationModalProps> = ({
  api,
  saving,
  onCancel,
  onSaved
}) => {
  const [form] = Form.useForm<ApiAuthorizationFormValues>();
  const { projectList, refreshProjectList } = useUserInfoStore();
  const [activeTab, setActiveTab] = useState('add');
  const [rules, setRules] = useState<ApiAuthorizationRule[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState<ApiAuthorizationUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const scopeType = Form.useWatch('scopeType', form);
  const userScope = Form.useWatch('userScope', form);

  const orgOptions = useMemo(
    () =>
      (projectList || []).map((org) => ({
        label: org.title || org.name,
        value: org.id
      })),
    [projectList]
  );

  const projectCascaderOptions = useMemo(
    () =>
      (projectList || []).map((org) => ({
        label: org.title || org.name,
        value: org.id,
        children: (org.projectList || []).map((project) => ({
          label: project.title || project.name,
          value: project.id
        }))
      })),
    [projectList]
  );

  const loadRules = useCallback(() => {
    if (!api) {
      setRules([]);
      return;
    }

    setRules(listApiAuthorizationRules(api.id));
  }, [api]);

  const loadUsers = useCallback(async (keyword = '') => {
    setLoadingUsers(true);
    try {
      const users = await searchAuthorizationUsers(keyword);
      setUserOptions(users);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setActiveTab('add');
    refreshProjectList();
    loadRules();
    form.setFieldsValue({
      scopeType: 'project',
      projectSelection: undefined,
      orgId: undefined,
      userScope: 'all',
      userIds: []
    });
  }, [api, form, loadRules, refreshProjectList]);

  useEffect(() => {
    if (userScope === 'partial') {
      loadUsers();
      return;
    }

    form.setFieldValue('userIds', []);
  }, [form, loadUsers, userScope]);

  const handleScopeTypeChange = (
    value: ApiAuthorizationFormValues['scopeType']
  ) => {
    form.setFieldsValue({
      scopeType: value,
      projectSelection: undefined,
      orgId: undefined
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!api) {
      return;
    }

    const nextRules = deleteApiAuthorizationRule(api.id, ruleId);
    setRules(nextRules);
    Message.success('授权规则已删除');
    onSaved?.();
  };

  const handleSubmit = async () => {
    if (!api) {
      return;
    }

    try {
      const values = await form.validate();
      setSubmitting(true);

      const org =
        values.scopeType === 'project'
          ? (projectList || []).find(
              (item) => item.id === values.projectSelection?.[0]
            )
          : (projectList || []).find((item) => item.id === values.orgId);

      if (!org) {
        Message.error('请选择有效的组织或项目');
        return;
      }

      const project =
        values.scopeType === 'project'
          ? org.projectList?.find(
              (item) => item.id === values.projectSelection?.[1]
            )
          : undefined;

      if (values.scopeType === 'project' && !project) {
        Message.error('请选择项目');
        return;
      }

      if (values.userScope === 'partial' && !values.userIds?.length) {
        Message.error('请选择至少一名用户');
        return;
      }

      const selectedUsers =
        values.userScope === 'partial'
          ? getAuthorizationUsersByIds(values.userIds || [])
          : undefined;

      const rule: ApiAuthorizationRule = {
        id: `auth-${Date.now()}`,
        scopeType: values.scopeType,
        orgId: org.id,
        orgName: org.title || org.name,
        projectId: project?.id,
        projectName: project?.title || project?.name,
        userScope: values.userScope,
        userIds: values.userScope === 'partial' ? values.userIds : undefined,
        users: selectedUsers,
        updatedAt: new Date().toISOString()
      };

      const nextRules = saveApiAuthorizationRule(api.id, rule);
      setRules(nextRules);
      Message.success('授权规则已保存');
      form.setFieldsValue({
        scopeType: values.scopeType,
        projectSelection: undefined,
        orgId: undefined,
        userScope: 'all',
        userIds: []
      });
      setActiveTab('authorized');
      onSaved?.();
    } catch {
      // 表单校验失败时不提示
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnProps<ApiAuthorizationRule>[] = [
    {
      title: '范围',
      dataIndex: 'scopeType',
      width: 56,
      render: (value: ApiAuthorizationRule['scopeType']) =>
        value === 'project' ? '项目' : '组织'
    },
    {
      title: '组织 / 项目',
      dataIndex: 'orgName',
      ellipsis: true,
      render: (_, record) => buildScopeLabel(record)
    },
    {
      title: '用户',
      dataIndex: 'userScope',
      ellipsis: true,
      render: (_, record) => (
        <Space size={4}>
          <Tag
            color={record.userScope === 'all' ? 'arcoblue' : 'orange'}
            size="small"
          >
            {record.userScope === 'all' ? '全部' : '指定'}
          </Tag>
          <span>{buildUserScopeLabel(record)}</span>
        </Space>
      )
    },
    {
      title: '操作',
      dataIndex: 'operations',
      width: 56,
      render: (_, record) => (
        <Popconfirm
          title="确认删除该授权规则？"
          onOk={() => handleDeleteRule(record.id)}
        >
          <Button type="text" size="mini" className="p-0" status="danger">
            删除
          </Button>
        </Popconfirm>
      )
    }
  ];

  if (!api) {
    return null;
  }

  return (
    <div className={styles['auth-modal-body']}>
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        className={styles['auth-modal-tabs']}
        destroyOnHide={false}
      >
        <Tabs.TabPane key="add" title="添加授权">
          <Form
            form={form}
            size="small"
            layout="horizontal"
            className={styles['auth-modal-form']}
            labelCol={{ flex: '72px' }}
            wrapperCol={{ flex: 1 }}
            initialValues={{
              scopeType: 'project',
              userScope: 'all',
              userIds: []
            }}
          >
            <Form.Item label="授权范围" field="scopeType" required>
              <Radio.Group onChange={handleScopeTypeChange}>
                <Radio value="project">项目</Radio>
                <Radio value="organization">组织</Radio>
              </Radio.Group>
            </Form.Item>

            {scopeType === 'project' ? (
              <Form.Item
                label="选择项目"
                field="projectSelection"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Cascader
                  allowClear
                  placeholder="请选择组织 / 项目"
                  options={projectCascaderOptions}
                  showSearch
                />
              </Form.Item>
            ) : (
              <Form.Item
                label="选择组织"
                field="orgId"
                rules={[{ required: true, message: '请选择组织' }]}
              >
                <Select
                  allowClear
                  placeholder="请选择组织"
                  options={orgOptions}
                  showSearch
                  filterOption={(input, option) =>
                    String(option.props.children)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            )}

            <Form.Item label="授权用户" field="userScope" required>
              <Radio.Group>
                <Radio value="all">全部用户</Radio>
                <Radio value="partial">指定用户</Radio>
              </Radio.Group>
            </Form.Item>

            {userScope === 'partial' && (
              <Form.Item
                label="选择用户"
                field="userIds"
                rules={[{ required: true, message: '请选择至少一名用户' }]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="搜索并选择用户"
                  loading={loadingUsers}
                  options={userOptions.map((user) => ({
                    label: `${user.name}${user.account ? ` (${user.account})` : ''}`,
                    value: user.id
                  }))}
                  showSearch
                  filterOption={false}
                  onSearch={loadUsers}
                />
              </Form.Item>
            )}
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane
          key="authorized"
          title={rules.length ? `已授权 (${rules.length})` : '已授权'}
        >
          <div className={styles['auth-modal-tab-panel']}>
            {rules.length ? (
              <Table
                rowKey="id"
                className={styles['auth-modal-table']}
                columns={columns}
                data={rules}
                pagination={false}
                border={false}
                size="mini"
              />
            ) : (
              <div className={styles['auth-modal-empty']}>暂无授权规则</div>
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>

      <Space className={styles['auth-modal-footer']} size={8}>
        <Button size="small" onClick={onCancel} disabled={submitting || saving}>
          取消
        </Button>
        {activeTab === 'add' && (
          <Button
            type="primary"
            size="small"
            loading={submitting || saving}
            onClick={handleSubmit}
          >
            添加授权
          </Button>
        )}
      </Space>
    </div>
  );
};

import {
  Form,
  Input,
  Modal,
  Select,
  TreeSelect,
  Button,
  Message
} from '@arco-design/web-react';
import React, { useEffect, useRef, useState } from 'react';
import { useOrgEditor } from '../../components/OrgProvider/Context';
import { getNodePathTitles } from '../../utils';

const FormItem = Form.Item;

export default function MemberForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const org = useOrgEditor();
  const { orgStore } = org;
  const { visible, currentMember, orgData, roleData, currentOrg } =
    orgStore.useGetState([
      'visible',
      'currentMember',
      'orgData',
      'roleData',
      'currentOrg'
    ]);

  // 为组织数据添加权限控制的函数
  const addPermissionControl = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      // 检查当前节点是否有 can_get 权限
      const hasGetPermission = node.perms && node.perms.includes('can_get');

      // 创建新节点（保留原有属性）
      const newNode = {
        ...node,
        disabled: !hasGetPermission, // 没有 can_get 权限则禁用
        key: node.key || node.id, // 确保有 key 字段
        // 为禁用的节点添加样式提示
        className: !hasGetPermission ? 'text-gray-400' : undefined
      };

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        newNode.children = addPermissionControl(node.children);
      }

      return newNode;
    });
  };

  // 处理后的组织数据（添加权限控制）
  const processedOrgData = orgData ? addPermissionControl(orgData) : [];

  // 调试日志：显示权限控制的结果
  React.useEffect(() => {
    if (processedOrgData.length > 0) {
      console.log(
        'Organization MemberForm TreeSelect 权限控制结果:',
        processedOrgData
      );

      // 统计禁用的节点数量
      const countDisabledNodes = (nodes: any[]): number => {
        let count = 0;
        nodes.forEach((node) => {
          if (node.disabled) count++;
          if (node.children) count += countDisabledNodes(node.children);
        });
        return count;
      };

      const disabledCount = countDisabledNodes(processedOrgData);
      console.log(
        `Organization MemberForm TreeSelect 中共有 ${disabledCount} 个节点因缺少 'can_get' 权限被禁用`
      );
    }
  }, [processedOrgData]);

  // 修复后的搜索函数：按照 Arco Design 官方 API
  const filterTreeNode = (inputText: string, node: any) => {
    if (!inputText) return true;

    const searchValue = inputText.toLowerCase();

    // 1. 搜索节点标题（按照官方 API，使用 node.props.title）
    const nodeTitle = node.props?.title || node.title || '';
    if (nodeTitle.toLowerCase().includes(searchValue)) {
      return true;
    }

    // 2. 搜索完整路径（例如：搜索"技术部/前端组"）
    try {
      const nodeKey =
        node.props?.key || node.key || node.props?.value || node.value;
      if (nodeKey) {
        const pathTitles = getNodePathTitles(processedOrgData, nodeKey);
        const fullPath = pathTitles.join('/').toLowerCase();
        if (fullPath.includes(searchValue)) {
          return true;
        }

        // 3. 搜索路径中的任意部分
        const pathString = pathTitles.join(' ').toLowerCase();
        if (pathString.includes(searchValue)) {
          return true;
        }
      }
    } catch (error) {
      // 如果路径搜索出错，只进行标题搜索
      console.warn('Path search error:', error);
    }

    return false;
  };

  // 用于记录上一次的组织ID
  const prevOrgIdRef = useRef<string | null>(null);

  // 处理确定按钮点击
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validate();
      const orgId = form.getFieldValue('organization_id');
      values.organization_id = orgId;
      const res = await orgStore.addMember(values);
      if (res.success) {
        Message.success('添加成功');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    orgStore.setVisible(false);
  };

  // 监听组织变化，当组织切换时清空表单
  useEffect(() => {
    const currentOrgId = currentOrg?.id || currentOrg?.key;

    // 如果组织发生了变化（且不是初始化）
    if (
      prevOrgIdRef.current !== null &&
      prevOrgIdRef.current !== currentOrgId
    ) {
      console.log('Organization changed, clearing member form');
      // 清空表单
      form.resetFields();
      // 设置默认的组织ID
      if (currentOrgId) {
        form.setFieldsValue({
          organization_id: currentOrgId
        });
      }
    }

    // 更新记录的组织ID
    prevOrgIdRef.current = currentOrgId;
  }, [currentOrg, form]);

  // 监听模态框显示状态，当打开时设置默认组织
  useEffect(() => {
    if (visible && currentOrg) {
      const currentOrgId = currentOrg.id || currentOrg.key;
      if (currentOrgId) {
        // 如果是添加新成员（currentMember为null），设置默认组织
        if (!currentMember) {
          form.setFieldsValue({
            organization_id: currentOrgId
          });
        }
      }
    }
  }, [visible, currentOrg, currentMember, form]);

  return (
    <Modal
      title="添加成员"
      visible={visible}
      footer={
        <div>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            loading={loading}
            className="ml-1"
            onClick={handleOk}
          >
            确定
          </Button>
        </div>
      }
      onCancel={handleCancel}
    >
      <Form autoComplete="off" form={form} initialValues={currentMember}>
        <FormItem
          label="姓名"
          field="username"
          required
          rules={[
            { required: true, message: '请输入姓名' },
            // 最多30个字符
            {
              maxLength: 30,
              message: '姓名最多30个字符'
            }
          ]}
        >
          <Input placeholder="请输入姓名" showWordLimit maxLength={30} />
        </FormItem>

        <FormItem
          label="用户名"
          field="account"
          extra="用户名只能包含英文、数字和下划线，且必须以英文开头"
          required
          rules={[
            { required: true, message: '请输入用户名' },
            {
              match: /^[a-zA-Z][a-zA-Z0-9_]*$/,
              message: '用户名只能包含英文、数字和下划线，且必须以英文开头'
            },
            {
              minLength: 2,
              message: '用户名最少2个字符'
            }
          ]}
        >
          <Input placeholder="请输入用户名" showWordLimit maxLength={50} />
        </FormItem>

        <FormItem
          label="密码"
          field="password"
          extra="密码需包含8-24位字符，混合大写字母、小写字母、数字和符号（如!@#），且不含个人信息"
          required
          rules={[
            { required: true, message: '请输入密码' },
            {
              match:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,24}$/,
              message:
                '密码需包含8-24位字符，混合大写字母、小写字母、数字和符号（如!@#），且不含个人信息'
            }
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </FormItem>

        <FormItem
          label="确认密码"
          field="confirmPassword"
          extra="密码需包含8-24位字符，混合大写字母、小写字母、数字和符号（如!@#），且不含个人信息"
          required
          rules={[
            { required: true, message: '请确认密码' },
            {
              validator: (value, cb) => {
                const password = form.getFieldValue('password');
                if (value !== password) {
                  return cb('两次输入的密码不一致');
                }
                cb();
              }
            }
          ]}
        >
          <Input.Password placeholder="请确认密码" />
        </FormItem>

        <FormItem
          label="手机号"
          field="phone"
          rules={[
            {
              match: /^1[3-9]\d{9}$/,
              message: '请输入正确的手机号'
            }
          ]}
        >
          <Input placeholder="请输入手机号" />
        </FormItem>

        <FormItem
          label="所属组织"
          field="organization_id"
          required
          rules={[{ required: true, message: '请选择所属组织' }]}
        >
          <TreeSelect
            showSearch
            placeholder="请选择所属组织"
            allowClear
            treeData={processedOrgData}
            treeCheckedStrategy={TreeSelect.SHOW_ALL}
            filterTreeNode={filterTreeNode}
            className="member-form-tree-select"
            style={{ width: '100%', maxWidth: '367px' }}
            dropdownMenuStyle={{ maxWidth: '367px' }}
            renderFormat={(nodeProps, _value) => {
              const pathTitles = getNodePathTitles(
                processedOrgData,
                nodeProps._key as string
              );
              return <span> {pathTitles.join(' / ')}</span>;
            }}
          />
        </FormItem>

        <FormItem
          label="角色"
          field="role_id"
          extra={
            <>
              <p>管理员: 管理本组织及下属组织的成员，组织空间的应用读写</p>
              <p>开发者: 组织空间的应用读写</p>
              <p>成员: 组织空间中发布应用的使用权限</p>
            </>
          }
          required
          rules={[{ required: true, message: '请选择角色' }]}
        >
          <Select placeholder="请选择角色">
            {roleData?.map((item) => {
              return (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              );
            })}
          </Select>
        </FormItem>
        <FormItem
          label="职位"
          field="position"
          rules={[
            {
              maxLength: 20,
              message: '职位最多20个字符'
            }
          ]}
        >
          <Input placeholder="请输入职位" showWordLimit maxLength={20} />
        </FormItem>
        <FormItem label="备注" field="mark">
          <Input.TextArea
            placeholder="请输入备注"
            showWordLimit
            maxLength={100}
          />
        </FormItem>
      </Form>
    </Modal>
  );
}

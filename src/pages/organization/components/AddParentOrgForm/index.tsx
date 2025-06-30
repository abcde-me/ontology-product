import {
  Form,
  Input,
  Modal,
  TreeSelect,
  Button,
  Message
} from '@arco-design/web-react';
import React, { useState, useEffect } from 'react';
import { getNodePathTitles } from '../../utils';
import { useOrgEditor } from '../OrgProvider/Context';
import { useUserInfo } from '@/store/userInfoStore';

const FormItem = Form.Item;

export default function MemberForm() {
  const [form] = Form.useForm();
  const userInfo = useUserInfo();
  console.log('userinfo', userInfo);
  const [loading, setLoading] = useState(false);
  const org = useOrgEditor();
  const { orgStore } = org;
  const { orgData, parentOrgModalVisible } = orgStore.useGetState([
    'orgData',
    'parentOrgModalVisible'
  ]);

  // 根据 key 查找对应的组织 id
  const findOrgIdByKey = (key: string) => {
    const findInTree = (nodes: any[]): string | null => {
      for (const node of nodes) {
        if (node.key === key || node._key === key) {
          return node.id;
        }
        if (node.children) {
          const found = findInTree(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(orgData);
  };

  // 处理确定按钮点击
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validate();
      console.log('values', values);

      // 如果 parent_org_id 是 key 值，需要转换为实际的 id
      if (values.parent_org_id) {
        const actualId = findOrgIdByKey(values.parent_org_id);
        if (actualId) {
          values.parent_org_id = actualId;
        }
      }

      const res = await orgStore.createOrg(values);
      if (res.success) {
        Message.success('创建成功');
        // 成功后重置表单
        form.resetFields();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    orgStore.setParentOrgModalVisible(false);
  };

  // 当模态框显示状态变化时，处理表单重置
  useEffect(() => {
    if (parentOrgModalVisible) {
      // 模态框打开时，设置初始值
      form.setFieldsValue({
        parent_org_id:
          userInfo?.organization_id ||
          (orgData && orgData.length > 0 ? orgData[0].key : undefined),
        name: '',
        desc: ''
      });
    } else {
      // 模态框关闭时，重置表单
      form.resetFields();
    }
  }, [parentOrgModalVisible, userInfo, orgData, form]);
  return (
    <Modal
      title="创建部门"
      visible={parentOrgModalVisible}
      footer={
        <div>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleOk}
            className="ml-1"
          >
            确定
          </Button>
        </div>
      }
      onCancel={handleCancel}
    >
      <Form autoComplete="off" form={form}>
        <FormItem
          label="组织名称"
          field="name"
          required
          rules={[
            { required: true, message: '请输入组织名称' },
            {
              match: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
              message: '组织名称是中文、英文及数字'
            },
            {
              maxLength: 30,
              message: '组织名称不能超过30个字符'
            }
          ]}
        >
          <Input placeholder="请输入组织名称" />
        </FormItem>

        <FormItem label="上级部门" field="parent_org_id">
          <TreeSelect
            showSearch
            placeholder="请选择上级部门"
            allowClear
            treeData={orgData}
            treeCheckedStrategy={TreeSelect.SHOW_ALL}
            renderFormat={(nodeProps, value) => {
              let targetKey: string;
              if (value) {
                // 用户手动选择了新值，显示选择的部门路径
                targetKey = value as string;
              } else {
                // 回显时，显示默认值（用户组织或第一个节点）
                targetKey = (userInfo?.organization_id ||
                  nodeProps._key) as string;
              }
              const pathTitles = getNodePathTitles(orgData, targetKey);
              return <span> {pathTitles.join(' / ')}</span>;
            }}
          />
        </FormItem>

        <FormItem
          label="组织描述"
          field="desc"
          rules={[
            {
              maxLength: 200,
              message: '组织描述不能超过200个字符'
            }
          ]}
        >
          <Input.TextArea placeholder="请输入组织描述" />
        </FormItem>
      </Form>
    </Modal>
  );
}

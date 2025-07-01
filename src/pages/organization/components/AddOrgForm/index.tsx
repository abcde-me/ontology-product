import {
  Form,
  Input,
  Modal,
  TreeSelect,
  Button,
  Message
} from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import { getNodePathTitles } from '../../utils';
import { useOrgEditor } from '../OrgProvider/Context';

const FormItem = Form.Item;

export default function MemberForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userManuallySelected, setUserManuallySelected] = useState(false); // 跟踪用户是否手动选择了上级部门
  const org = useOrgEditor();
  const { orgStore } = org;
  const { currentOrg, orgModalVisible, orgData, hoveredOrg } =
    orgStore.useGetState([
      'currentOrg',
      'orgModalVisible',
      'orgData',
      'hoveredOrg'
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
    // TODO: ts错误
    // @ts-expect-error
    return findInTree(orgData);
  };

  // 处理确定按钮点击
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validate();
      console.log('hoveredOrg', hoveredOrg);
      console.log('values', values);

      // 如果 parent_org_id 是 key 值，需要转换为实际的 id
      if (values.parent_org_id) {
        const actualId = findOrgIdByKey(values.parent_org_id);
        if (actualId) {
          values.parent_org_id = actualId;
        }
      } else if (hoveredOrg?.id) {
        // 如果没有选择上级部门，使用当前悬停的组织
        values.parent_org_id = hoveredOrg.id;
      }

      const res = await orgStore.createOrg(values);
      if (res.success) {
        Message.success('创建成功');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    orgStore.setOrgModalVisible(false);
  };

  // 当模态框显示状态变化时，处理表单重置
  useEffect(() => {
    if (orgModalVisible && hoveredOrg) {
      // 模态框打开时，设置初始值并重置手动选择状态
      setUserManuallySelected(false);
      form.setFieldsValue({
        parent_org_id:
          hoveredOrg._key || currentOrg?.parent_org_id || undefined,
        name: '',
        desc: ''
      });
    } else if (!orgModalVisible) {
      // 模态框关闭时，重置表单和状态
      form.resetFields();
      setUserManuallySelected(false);
    }
  }, [orgModalVisible, hoveredOrg, currentOrg, form]);

  // 当 hoveredOrg 变化时，更新上级部门字段（仅在模态框打开且用户未手动选择时）
  useEffect(() => {
    if (
      orgModalVisible &&
      hoveredOrg &&
      hoveredOrg._key &&
      !userManuallySelected
    ) {
      form.setFieldValue('parent_org_id', hoveredOrg._key);
    }
  }, [hoveredOrg, orgModalVisible, userManuallySelected, form]);
  return (
    <Modal
      title="创建部门"
      visible={orgModalVisible}
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
      <Form form={form} autoComplete="off">
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
            onChange={(value) => {
              // 当用户手动选择时，标记为手动选择状态
              if (value !== undefined) {
                setUserManuallySelected(true);
              }
            }}
            renderFormat={(nodeProps, value) => {
              let targetKey: string;
              console.log('value', value);
              if (value) {
                // 用户手动选择了新值，显示选择的部门路径
                targetKey = value as string;
              } else {
                // 回显时，显示当前悬浮部门作为默认上级部门
                // TODO: ts错误
                // @ts-expect-error
                targetKey = (hoveredOrg?._key || nodeProps._key) as string;
              }
              console.log('targetKey', targetKey);
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

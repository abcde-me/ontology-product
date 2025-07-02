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
  const org = useOrgEditor();
  const { orgStore } = org;
  const { currentOrg, editOrgModalVisible, orgData, hoveredOrg } =
    orgStore.useGetState([
      'currentOrg',
      'orgData',
      'editOrgModalVisible',
      'hoveredOrg'
    ]);

  // 处理确定按钮点击
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validate();
      console.log('values', values);
      // 在values添加id字段，从hoveredOrg中获取
      values.id = hoveredOrg.id || currentOrg._key;
      const res = await orgStore.updateOrg(values);
      if (res.success) {
        Message.success('编辑成功');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    orgStore.setEditOrgModalVisible(false);
  };

  // 当 hoveredOrg 变化且弹窗可见时，更新表单值
  useEffect(() => {
    if (editOrgModalVisible && hoveredOrg) {
      // 确保 parent_org_id 字段正确设置
      const formValues = {
        ...hoveredOrg,
        parent_org_id: hoveredOrg.parent_org_id || hoveredOrg.parent_id // 兼容不同的字段名
      };
      form.setFieldsValue(formValues);
    } else if (!editOrgModalVisible) {
      // 弹窗关闭时重置表单
      form.resetFields();
    }
  }, [hoveredOrg, editOrgModalVisible, form]);
  return (
    <Modal
      title="编辑部门"
      visible={editOrgModalVisible}
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
      <Form autoComplete="off" form={form} initialValues={hoveredOrg}>
        <FormItem
          label="组织名称"
          field="name"
          extra="可使用中文、英文及数字"
          required
          rules={[
            { required: true, message: '请输入组织名称' },
            {
              match: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
              message: '组织名称是中文、英文及数字'
            }
          ]}
        >
          <Input placeholder="请输入组织名称" showWordLimit maxLength={50} />
        </FormItem>

        <FormItem label="上级部门" field="parent_org_id">
          <TreeSelect
            showSearch
            placeholder="请选择上级部门"
            allowClear
            treeData={orgData}
            treeCheckedStrategy={TreeSelect.SHOW_ALL}
            renderFormat={(nodeProps, value) => {
              // 确定要显示路径的目标节点
              const targetKey = (value || nodeProps._key) as string;

              if (targetKey) {
                const pathTitles = getNodePathTitles(orgData, targetKey);
                return <span>{pathTitles.join(' / ')}</span>;
              }

              return <span>请选择上级部门</span>;
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
          <Input.TextArea
            placeholder="请输入组织描述"
            showWordLimit
            maxLength={200}
          />
        </FormItem>
      </Form>
    </Modal>
  );
}

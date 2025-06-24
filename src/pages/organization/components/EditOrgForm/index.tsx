import { Form, Input, Modal, TreeSelect } from '@arco-design/web-react';
import React from 'react';
import { getParentNodePathTitles } from '../../utils';
import { useOrgEditor } from '../OrgProvider/Context';

const FormItem = Form.Item;

export default function MemberForm() {
  const [form] = Form.useForm();
  const org = useOrgEditor();
  const { orgStore } = org;
  const { currentOrg, editOrgModalVisible, orgData, hoveredOrg } =
    orgStore.useGetState([
      'currentOrg',
      'orgData',
      'editOrgModalVisible',
      'hoveredOrg'
    ]);
  return (
    <Modal
      title="编辑部门"
      visible={editOrgModalVisible}
      onOk={() => {
        form
          .validate()
          .then((values) => {
            console.log('values', values);
            // 在values添加id字段，从hoveredOrg中获取
            values.id = Number(hoveredOrg._key) || Number(currentOrg._key);
            orgStore.updateOrg(values);
          })
          .catch((err) => {
            console.log(err);
          });
      }}
      onCancel={() => {
        orgStore.setEditOrgModalVisible(false);
      }}
    >
      <Form form={form} initialValues={currentOrg}>
        <FormItem
          label="组织名称"
          field="name"
          required
          rules={[
            { required: true, message: '请输入组织名称' },
            {
              match: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
              message: '组织名称是中文、英文及数字'
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
              const targetKey = (hoveredOrg._key || nodeProps?._key) as string;
              const pathTitles = getParentNodePathTitles(orgData, targetKey);
              return <span> {pathTitles.join(' / ')}</span>;
            }}
          />
        </FormItem>

        <FormItem label="组织描述" field="desc">
          <Input.TextArea placeholder="请输入组织描述" />
        </FormItem>
      </Form>
    </Modal>
  );
}

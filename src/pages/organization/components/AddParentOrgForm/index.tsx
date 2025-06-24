import { Form, Input, Modal, TreeSelect } from '@arco-design/web-react';
import React from 'react';
import { getNodePathTitles } from '../../utils';
import { useOrgEditor } from '../OrgProvider/Context';

const FormItem = Form.Item;

export default function MemberForm() {
  const [form] = Form.useForm();
  const org = useOrgEditor();
  const { orgStore } = org;
  const { orgData, parentOrgModalVisible } = orgStore.useGetState([
    'orgData',
    'parentOrgModalVisible'
  ]);
  return (
    <Modal
      title="创建部门"
      visible={parentOrgModalVisible}
      onOk={() => {
        form
          .validate()
          .then((values) => {
            values.parent_org_id = Number(values.parent_org_id);
            orgStore.createOrg(values);
          })
          .catch((err) => {
            console.log(err);
          });
      }}
      onCancel={() => {
        orgStore.setParentOrgModalVisible(false);
      }}
    >
      <Form
        form={form}
        initialValues={{
          parent_org_id:
            orgData && orgData.length > 0 ? orgData[0].key : undefined
        }}
      >
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
              const pathTitles = getNodePathTitles(
                orgData,
                nodeProps?._key as string
              );
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

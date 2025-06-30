import { Form, Input, Modal, Select, TreeSelect } from '@arco-design/web-react';
import React, { useEffect } from 'react';
import { useMemberEditor } from '../../components/MemberProvider/Context';
import { getNodePathTitles } from '../../utils';

const FormItem = Form.Item;

export default function MemberForm() {
  const [form] = Form.useForm();
  const member = useMemberEditor();
  const { memberStore } = member;
  const { visible, currentMember, orgData, roleData } = memberStore.useGetState(
    ['visible', 'currentMember', 'orgData', 'roleData']
  );
  // 是添加成员还是修改成员
  const isEdit = !!currentMember;

  console.log('currentMember', currentMember);
  useEffect(() => {
    if (!isEdit) {
      // 如果是添加成员，清空表单
      form.setFieldsValue({
        account: '',
        username: '',
        password: '',
        confirmPassword: '',
        organization_id: '',
        phone: '',
        role_id: '',
        position: '',
        mark: ''
      });
    } else {
      form.setFieldsValue(currentMember);
    }
  }, [currentMember]);
  return (
    <Modal
      title={isEdit ? '修改成员' : '添加成员'}
      visible={visible}
      onOk={() => {
        form
          .validate()
          .then((values) => {
            values.organization_id = Number(values.organization_id);
            values.id = isEdit ? currentMember.id : undefined; // 如果是编辑，添加id字段
            if (isEdit) {
              memberStore.updateMember(values);
            } else {
              memberStore.addMember(values);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }}
      onCancel={() => {
        memberStore.setVisible(false);
      }}
    >
      <Form
        form={form}
        initialValues={{
          ...currentMember
        }}
      >
        <FormItem
          label="姓名"
          field="username"
          required
          rules={[
            { required: true, message: '请输入姓名' },
            {
              match: /^[\u4e00-\u9fa5]+$/,
              message: '姓名只能输入中文'
            }
          ]}
        >
          <Input placeholder="请输入姓名" />
        </FormItem>

        <FormItem
          label="用户名"
          field="account"
          disabled={isEdit}
          required
          rules={[
            { required: true, message: '请输入用户名' },
            {
              match: /^[a-zA-Z][a-zA-Z0-9_]*$/,
              message: '用户名只能包含英文、数字和下划线，且必须以英文开头'
            }
          ]}
        >
          <Input placeholder="请输入用户名" />
        </FormItem>

        {isEdit ? null : (
          <FormItem
            label="密码"
            field="password"
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
        )}

        {isEdit ? null : (
          <FormItem
            label="确认密码"
            field="confirmPassword"
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
        )}

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

        <FormItem
          label="角色"
          field="role_id"
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
        <FormItem label="职位" field="position">
          <Input placeholder="请输入职位" />
        </FormItem>
        <FormItem label="备注" field="mark">
          <Input.TextArea placeholder="请输入备注" />
        </FormItem>
      </Form>
    </Modal>
  );
}

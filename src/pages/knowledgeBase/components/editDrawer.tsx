import * as React from 'react';
import { Drawer, Form, Input, Message, Radio } from '@arco-design/web-react';
import { editKnowledge } from '@/api/knowledgeBase';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  record: any;
  submit: () => void;
};

export const EditDrawer: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible, record, submit } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const {
      name,
      description,
      permission,
      indexing_technique,
      retrieval_model_dict: retrieval_model
    } = record;
    form.setFieldsValue({
      name,
      description,
      permission,
      indexing_technique,
      retrieval_model
    });
  }, [form, record]);

  const confirmAction = async () => {
    form
      .validate()
      .then(async () => {
        try {
          setLoading(true);
          const formValue = form.getFields();
          await editKnowledge(record.id, formValue);
          Message.success('编辑成功');
          submit && submit();
          setLoading(false);
          setVisible(false);
        } catch (err) {
          return;
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <Drawer
      width={520}
      className="knowledge-drawer"
      title="设置"
      confirmLoading={loading}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => confirmAction()}
    >
      <Form
        colon="："
        autoComplete="off"
        className="knowledge-form"
        form={form}
      >
        <Form.Item
          field="name"
          label="知识库名称"
          rules={[
            { required: true, message: '知识库名称是必填项' },
            {
              match: /^[a-zA-Z\u4e00-\u9fa5][\w\u4e00-\u9fa5-.]{0,39}$/,
              message:
                '支持 1-40 位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头'
            }
          ]}
        >
          <Input placeholder="请输入知识库名称" />
        </Form.Item>
        <Form.Item field="description" label="知识库描述">
          <Input.TextArea
            maxLength={255}
            autoSize={{
              minRows: 4,
              maxRows: 4
            }}
            showWordLimit
            placeholder="请输入知识库描述"
          />
        </Form.Item>
        <Form.Item field="permission" required label="可见权限">
          <Radio.Group>
            <Radio value="only_me">只有我</Radio>
            {/* <Radio value="all_team_members">所有团队成员</Radio> */}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

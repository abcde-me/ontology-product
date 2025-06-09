import * as React from 'react';
import { Alert, Form, Input, Message, Modal } from '@arco-design/web-react';
import { createKnowledge } from '@/api/knowledgeBase';
import { useHistory } from 'react-router-dom';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
};

export const EmptyModal: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible } = props;
  const history = useHistory();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const confirmAction = async () => {
    form
      .validate()
      .then(async () => {
        try {
          setLoading(true);
          const formValue = form.getFields();
          const resp = await createKnowledge(formValue);
          Message.success('创建空知识库成功');
          setLoading(false);
          history.push(
            `/tenant/compute/appforge/knowledgeDetail?id=${resp.id}`
          );
        } catch (err) {
          return;
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <Modal
      title="创建空知识库"
      visible={visible}
      okButtonProps={{
        loading: loading
      }}
      onCancel={() => {
        setVisible(false);
      }}
      onOk={() => {
        confirmAction();
      }}
    >
      <Alert content="空知识库中还没有文档，你可以在今后任何时候上传文档至该知识库。" />
      <Form
        className="knowledge-form mt-[20px]"
        colon="："
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        autoComplete="off"
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
      </Form>
    </Modal>
  );
};

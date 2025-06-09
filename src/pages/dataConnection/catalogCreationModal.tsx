import * as React from 'react';
import { Form, Input, Message, Modal } from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  onOk: () => void;
};

export const CatalogCreationModal: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible, onOk } = props;
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
          // const resp = await createKnowledge(formValue);
          onOk()
          Message.success('创建类目成功');
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
    <Modal
      title="新建类目"
      visible={visible}
      style={{width: '720px'}}
      className="bold-form-label"
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
      <Form
        className="create-space-form mt-[20px]"
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          field="name"
          label="类目名称"
          rules={[
            { required: true, message: '类目名称是必填项' },
            {
              match: /^[a-zA-Z\u4e00-\u9fa5][\w\u4e00-\u9fa5-.]{0,49}$/,
              message:
                '支持 1-50 位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头'
            }
          ]}
        >
          <Input placeholder="请输入类目名称" maxLength={50} showWordLimit />
        </Form.Item>
        <Form.Item
          field="desc"
          label="描述"
        >
          <Input.TextArea placeholder="请输入描述" style={{ minHeight: 60 }} maxLength={255} showWordLimit />
        </Form.Item>
      </Form>
    </Modal>
  );
};

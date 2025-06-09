import * as React from 'react';
import { Alert, Form, Input, Message, Modal, Trigger } from '@arco-design/web-react';
import { createKnowledge } from '@/api/knowledgeBase';
import { useHistory } from 'react-router-dom';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
};

export const DelSpaceModal: React.FC<CommonModalProps> = (props) => {
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
          Message.success('创建空间成功');
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
      title="删除团队空间"
      visible={visible}
      style={{width: '520px'}}
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
      <Alert type="warning" content="请谨慎删除，删除后，团队内的所有数据都将丢失" />
      <Form
        className="create-space-form mt-[20px]"
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          field="name"
          label="请输入需要删除的团队空间名称"
          rules={[
            { required: true, message: '空间名称是必填项' },
          ]}
        >
          <Input placeholder="请输入团队空间名称" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

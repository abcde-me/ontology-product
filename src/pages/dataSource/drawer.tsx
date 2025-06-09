import * as React from 'react';
import { Button, Drawer, Form, Input, Message, Radio, Switch } from '@arco-design/web-react';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  record: any;
  actionType: string;
  submit: () => void;
};

export const EditDrawer: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible, record, submit, actionType } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const type = Form.useWatch('type', form);

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
      retrieval_model,
      type: 'mysql',
    });
  }, [form, record]);

  const confirmAction = async () => {
    form
      .validate()
      .then(async () => {
        try {
          setLoading(true);
          const formValue = form.getFields();
          // await editKnowledge(record.id, formValue);
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
      className="datasource-drawer"
      title={actionType === 'create' ? "添加数据源" : (actionType === 'edit' ? '编辑数据源' : '数据源详情')}
      confirmLoading={loading}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => confirmAction()}
    >
      <Form
        autoComplete="off"
        className="datasource-form"
        layout="vertical"
        form={form}
      >
        <div className="sub-title">基本信息</div>
        <Form.Item
          field="name"
          label="数据源名称"
          rules={[
            { required: true, message: '数据源名称是必填项' },
            {
              match: /^[a-zA-Z\u4e00-\u9fa5][\w\u4e00-\u9fa5-.]{0,39}$/,
              message:
                '支持 1-40 位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头'
            }
          ]}
        >
          <Input placeholder="请输入数据源名称" />
        </Form.Item>
        <Form.Item field="description" label="数据源描述">
          <Input.TextArea
            maxLength={255}
            autoSize={{
              minRows: 4,
              maxRows: 4
            }}
            showWordLimit
            placeholder="请输入数据源描述"
          />
        </Form.Item>
        <div className="sub-title">数据源详情</div>
        <div className="sub-section">
          <Form.Item field="type" required label="数据源类型">
            <Radio.Group>
              <Radio value="mysql">MySQL</Radio>
              <Radio value="minio">MinIO</Radio>
            </Radio.Group>
          </Form.Item>
          {type === 'mysql' && <>
            <Form.Item
              field="url"
              label="链接地址(host)"
              rules={[
                { required: true, message: '链接地址是必填项' },
              ]}
            >
              <Input placeholder="请输入链接地址" />
            </Form.Item>
            <Form.Item
              field="port"
              label="端口(port)"
              rules={[
                { required: true, message: '端口是必填项' },
              ]}
            >
              <Input placeholder="请输入端口" />
            </Form.Item>
            <Form.Item
              field="database"
              label="数据库名称"
              rules={[
                { required: true, message: '数据库名称是必填项' },
              ]}
            >
              <Input placeholder="请输入数据库名称" />
            </Form.Item>
            <Form.Item
              field="username"
              label="用户名"
              rules={[
                { required: true, message: '用户名是必填项' },
              ]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              field="password"
              label="密码"
              rules={[
                { required: true, message: '密码是必填项' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Form.Item
              field="ssl"
              label="开启加密链接"
            >
              <Switch />
            </Form.Item>
            <Form.Item label="连接状态">
              <Button type="outline" className="primary">链接测试</Button>
            </Form.Item>
          </>}
        </div>
      </Form>
    </Drawer>
  );
};

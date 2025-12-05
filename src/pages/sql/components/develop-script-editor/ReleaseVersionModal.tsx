import React, { useEffect } from 'react';
import {
  Alert,
  Button,
  Form,
  Input,
  Message,
  Modal
} from '@arco-design/web-react';

interface ReleaseVersionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit?: (values: {
    scriptName: string;
    version: string;
    versionDesc?: string;
  }) => void | Promise<void>;
  initialValues?: {
    scriptName?: string;
    version?: string;
    versionDesc?: string;
  };
}

const ReleaseVersionModal: React.FC<ReleaseVersionModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues
}) => {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const TextArea = Input.TextArea;

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        scriptName: initialValues?.scriptName || '',
        version: initialValues?.version || 'V1',
        versionDesc: initialValues?.versionDesc || ''
      });
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      if (onSubmit) {
        await onSubmit(values);
      } else {
        // 默认处理
        console.log('发布版本数据:', values);
        Message.success('发布版本成功');
        onCancel();
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="发布版本"
      visible={visible}
      onCancel={onCancel}
      autoFocus={false}
      focusLock={true}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleSubmit}>
          确定
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert type="info" content="发布后,此版脚本将不支持修改" />
      </div>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <FormItem
          label="SQL脚本名称:"
          field="scriptName"
          rules={[{ required: true, message: '请输入SQL脚本名称' }]}
        >
          <Input placeholder="请输入SQL脚本名称" style={{ width: '100%' }} />
        </FormItem>
        <FormItem label="版本号:" field="version">
          <Input readOnly style={{ width: '100%' }} />
        </FormItem>
        <FormItem label="版本说明:" field="versionDesc">
          <TextArea
            placeholder="请描述当前版本的改动原因与内容"
            style={{ width: '100%', minHeight: 100 }}
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default ReleaseVersionModal;

import React from 'react';
import { Modal, Radio, Message, Form } from '@arco-design/web-react';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

// 批量操作类型
export type BatchActionType = 'pass' | 'reject' | 'return';

interface BatchInspectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // 当前抽检ID
  inspectionId?: number;
}

const BatchInspectModal: React.FC<BatchInspectModalProps> = ({
  visible,
  onClose,
  onSuccess,
  inspectionId
}) => {
  const [form] = Form.useForm();

  // 弹窗打开时重置表单
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        action: 'pass'
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      // TODO: 调用批量质检API
      console.log('批量质检:', { inspectionId, action: values.action });

      const actionText: Record<string, string> = {
        pass: '全部通过',
        reject: '全部驳回',
        return: '放回公池'
      };

      Message.success(`批量质检成功: ${actionText[values.action]}`);
      onClose();
      onSuccess();
    } catch (error) {
      console.log('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="批量质检"
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      autoFocus={false}
      focusLock={true}
      unmountOnExit
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 9 }}
        wrapperCol={{ span: 15 }}
      >
        <FormItem
          label="将未检、待定的任务"
          field="action"
          rules={[{ required: true, message: '请选择操作' }]}
        >
          <RadioGroup>
            <Radio value="pass">全部通过</Radio>
            <Radio value="reject">全部驳回</Radio>
            <Radio value="return">放回公池</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default BatchInspectModal;

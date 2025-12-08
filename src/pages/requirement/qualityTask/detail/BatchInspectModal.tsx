import React from 'react';
import { Modal, Radio, Message, Form } from '@arco-design/web-react';
import { manageQCTaskSampledBatch } from '@/api/dataAnnotation';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

// 批量操作类型
export type BatchActionType = 'pass_all' | 'reject_all' | 'sample_withdraw';

interface BatchInspectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // 当前抽检ID
  currentRecord?: any;
}

const BatchInspectModal: React.FC<BatchInspectModalProps> = ({
  visible,
  onClose,
  onSuccess,
  currentRecord
}) => {
  const [form] = Form.useForm();

  // 弹窗打开时重置表单
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        action: 'pass_all'
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const params = {
        qs_id: currentRecord.qs_id,
        action: values.action
      };
      const res = await manageQCTaskSampledBatch(params);
      if (res.code === 'success') {
        Message.success('批量质检成功');
      } else {
        const actionText: Record<string, string> = {
          pass_all: '全部通过',
          reject_all: '全部驳回',
          sample_withdraw: '放回公池'
        };

        Message.success(`批量质检成功: ${actionText[values.action]}`);
        onClose();
        onSuccess();
      }
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
      style={{ width: 540 }}
      unmountOnExit
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <FormItem
          label="将未检、待定的任务:"
          field="action"
          rules={[{ required: true, message: '请选择操作' }]}
        >
          <RadioGroup>
            <Radio value="pass_all">全部通过</Radio>
            <Radio value="reject_all">全部驳回</Radio>
            <Radio value="sample_withdraw">放回公池</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default BatchInspectModal;

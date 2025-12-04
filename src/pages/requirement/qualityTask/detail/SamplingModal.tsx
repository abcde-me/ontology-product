import React from 'react';
import {
  Modal,
  Form,
  Radio,
  InputNumber,
  Message
} from '@arco-design/web-react';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

// 抽检设置类型
export enum SamplingType {
  ToInspect = 1, // 待质检
  ToRecheck = 2 // 待复核
}

export enum SamplingCountType {
  Percentage = 1, // 按比例
  Count = 2, // 按数量
  All = 3 // 全部
}

interface SamplingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // 剩余待质检数量
  remainingToInspect?: number;
  // 剩余待复核数量
  remainingToRecheck?: number;
}

const SamplingModal: React.FC<SamplingModalProps> = ({
  visible,
  onClose,
  onSuccess,
  remainingToInspect = 15,
  remainingToRecheck = 5
}) => {
  const [form] = Form.useForm();
  const countType = Form.useWatch('countType', form);

  // 弹窗打开时重置表单
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        taskType: SamplingType.ToInspect,
        countType: SamplingCountType.Percentage
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      console.log('抽检设置:', values);
      // TODO: 调用抽检API
      Message.success('抽检成功');
      onClose();
      onSuccess();
    } catch (error) {
      console.log('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="抽检设置"
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      autoFocus={false}
      focusLock={true}
      style={{ width: 520 }}
      unmountOnExit
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        className="sampling-form"
      >
        <FormItem
          label="任务类型"
          field="taskType"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <RadioGroup>
            <Radio value={SamplingType.ToInspect}>
              待质检 (剩余: {remainingToInspect}个)
            </Radio>
            <Radio value={SamplingType.ToRecheck}>
              待复核 (剩余: {remainingToRecheck}个)
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="抽取数量"
          field="countType"
          rules={[{ required: true, message: '请选择抽取方式' }]}
        >
          <RadioGroup>
            <Radio value={SamplingCountType.Percentage}>
              <span className="radio-with-input">
                按比例
                <FormItem
                  field="percentage"
                  noStyle
                  rules={[
                    {
                      required: countType === SamplingCountType.Percentage,
                      message: '请输入比例'
                    }
                  ]}
                >
                  <InputNumber
                    placeholder="请输入"
                    style={{ width: 100, marginLeft: 8 }}
                    min={1}
                    max={100}
                    disabled={countType !== SamplingCountType.Percentage}
                  />
                </FormItem>
                <span className="input-suffix">%</span>
              </span>
            </Radio>
            <Radio value={SamplingCountType.Count}>
              <span className="radio-with-input">
                按数量
                <FormItem
                  field="count"
                  noStyle
                  rules={[
                    {
                      required: countType === SamplingCountType.Count,
                      message: '请输入数量'
                    }
                  ]}
                >
                  <InputNumber
                    placeholder="请输入"
                    style={{ width: 100, marginLeft: 8 }}
                    min={1}
                    disabled={countType !== SamplingCountType.Count}
                  />
                </FormItem>
                <span className="input-suffix">个</span>
              </span>
            </Radio>
            <Radio value={SamplingCountType.All}>全部</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default SamplingModal;

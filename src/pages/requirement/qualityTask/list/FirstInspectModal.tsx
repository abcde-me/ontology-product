import React from 'react';
import {
  Modal,
  Form,
  Radio,
  InputNumber,
  Message
} from '@arco-design/web-react';
import './index.scss';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

// 抽取数量类型
export enum SamplingCountType {
  Percentage = 1, // 按比例
  Count = 2, // 按数量
  All = 3 // 全部
}

interface FirstInspectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FirstInspectModal: React.FC<FirstInspectModalProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const countType = Form.useWatch('countType', form);

  // 弹窗打开时重置表单
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        countType: SamplingCountType.Percentage,
        percentage: 50
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      console.log('首次抽检设置:', values);
      // TODO: 调用首次抽检API
      Message.success('设置成功');
      onClose();
      onSuccess();
    } catch (error) {
      console.log('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="首次抽检设置"
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      autoFocus={false}
      focusLock={true}
      style={{ width: 600 }}
      unmountOnExit
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        className="first-inspect-form"
      >
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

export default FirstInspectModal;

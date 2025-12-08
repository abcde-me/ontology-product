import React from 'react';
import {
  Modal,
  Form,
  Radio,
  InputNumber,
  Message
} from '@arco-design/web-react';
import './index.scss';
import type { QualityTaskItem } from './index';
import { manageQCTaskBatch } from '@/api/dataAnnotation';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

// 抽取数量类型
export enum SamplingCountType {
  Percentage = 'radio', // 按比例
  Count = 'number', // 按数量
  All = 'all' // 全部
}

interface FirstInspectModalProps {
  visible: boolean;
  record?: QualityTaskItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FirstInspectModal: React.FC<FirstInspectModalProps> = ({
  visible,
  record,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const sample_type =
    Form.useWatch('sample_type', form) ?? SamplingCountType.Percentage;

  // 弹窗打开时重置表单
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        sample_type: SamplingCountType.Percentage,
        sample_radio: 50,
        sample_number: undefined
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const params = {
        // 首次抽检/待质检 - uninspect; 待复核 - recheck
        task_type: 'uninspect'
      };
      const values = await form.validate();
      params['sample_type'] = values.sample_type;
      if (values.sample_type === SamplingCountType.Percentage) {
        params['sample_radio'] = values.sample_radio;
      } else if (values.sample_type === SamplingCountType.Count) {
        params['sample_number'] = values.sample_number;
      }
      const res = await manageQCTaskBatch(params);
      if (res.code === 'success') {
        Message.success('设置成功');
        onClose();
        onSuccess();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.log('设置失败:', error);
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
          label="抽取数量:"
          field="sample_type"
          rules={[{ required: true, message: '请选择抽取方式' }]}
        >
          <RadioGroup>
            <Radio value={SamplingCountType.Percentage}>
              <span className="radio-with-input">
                按比例
                <FormItem
                  field="sample_radio"
                  noStyle={{ showErrorTip: true }}
                  rules={[
                    {
                      required: sample_type === SamplingCountType.Percentage,
                      message: '请输入比例'
                    }
                  ]}
                >
                  <InputNumber
                    placeholder="请输入"
                    style={{ width: 80, marginLeft: 8 }}
                    min={1}
                    max={100}
                    disabled={sample_type !== SamplingCountType.Percentage}
                  />
                </FormItem>
                <span className="input-suffix">%</span>
              </span>
            </Radio>
            <Radio value={SamplingCountType.Count}>
              <span className="radio-with-input">
                按数量
                <FormItem
                  field="sample_number"
                  noStyle={{ showErrorTip: true }}
                  rules={[
                    {
                      required: sample_type === SamplingCountType.Count,
                      message: '请输入数量'
                    }
                  ]}
                >
                  <InputNumber
                    placeholder="请输入"
                    style={{ width: 80, marginLeft: 8 }}
                    min={1}
                    max={record?.task_volume_total || 100}
                    step={1}
                    precision={0}
                    disabled={sample_type !== SamplingCountType.Count}
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

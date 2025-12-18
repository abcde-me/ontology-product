import React from 'react';
import {
  Modal,
  Form,
  Radio,
  InputNumber,
  Message
} from '@arco-design/web-react';
import { manageQCTaskBatch } from '@/api/dataAnnotation';
import { useParams } from '@/utils/url';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

// 抽检设置类型
export enum SamplingType {
  ToInspect = 0, // 待质检
  ToRecheck = 1 // 待复核
}

export enum SamplingCountType {
  Percentage = 'radio', // 按比例
  Count = 'number', // 按数量
  All = 'all' // 全部
}

interface SamplingModalProps {
  visible: boolean;
  metricData: any;
  qc_round: number;
  req_id: number;
  onClose: () => void;
  onSuccess: () => void;
}

const SamplingModal: React.FC<SamplingModalProps> = ({
  visible,
  metricData,
  qc_round,
  req_id,
  onClose,
  onSuccess
}) => {
  const pkgId = useParams('pkgId');
  const [form] = Form.useForm();
  const sample_type = Form.useWatch('sample_type', form);

  // 弹窗打开时重置表单
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        task_type: SamplingType.ToInspect,
        sample_type: SamplingCountType.Percentage,
        sample_radio: 50
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const sample_info = {
        task_type: values.task_type
      };
      sample_info['sample_type'] = values.sample_type;
      if (values.sample_type === SamplingCountType.Percentage) {
        sample_info['sample_radio'] = values.sample_radio / 100;
      } else if (values.sample_type === SamplingCountType.Count) {
        sample_info['sample_number'] = values.sample_number;
      }
      const params = {
        pkg_id: Number(pkgId),
        qc_round,
        req_id,
        action: 'sample',
        sample_info
      };
      const res = await manageQCTaskBatch(params);
      if (res.code === 'success') {
        Message.success('设置成功');
        onClose();
        onSuccess();
      } else {
        Message.error(res.message);
      }
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
      style={{ width: 600 }}
      unmountOnExit
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        className="sampling-form"
      >
        <FormItem
          label="任务类型:"
          field="task_type"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <RadioGroup>
            <Radio value={SamplingType.ToInspect}>
              待质检 (剩余: {metricData?.task_volume_uninspected}个)
            </Radio>
            <Radio value={SamplingType.ToRecheck}>
              待复核 (剩余: {metricData?.task_volume_unreinspected}个)
            </Radio>
          </RadioGroup>
        </FormItem>
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
                    max={metricData?.task_volume_unsampled}
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

export default SamplingModal;

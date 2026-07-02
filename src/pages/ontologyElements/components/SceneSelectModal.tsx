import React, { useEffect, useState } from 'react';
import { Form, Message, Modal, Select } from '@arco-design/web-react';
import { fetchSceneSelectOptions } from '../services/sceneSelectOptions';
import type { SceneSelectOption } from '../types';

const Option = Select.Option;

interface SceneSelectModalProps {
  visible: boolean;
  title?: string;
  confirmLoading?: boolean;
  onCancel: () => void;
  onConfirm: (sceneId: number) => void;
}

export const SceneSelectModal: React.FC<SceneSelectModalProps> = ({
  visible,
  title = '选择本体场景库',
  confirmLoading,
  onCancel,
  onConfirm
}) => {
  const [form] = Form.useForm<{ sceneId?: number }>();
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [sceneOptions, setSceneOptions] = useState<SceneSelectOption[]>([]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      return;
    }

    setOptionsLoading(true);
    fetchSceneSelectOptions()
      .then((options) => {
        setSceneOptions(options);
      })
      .catch((error) => {
        console.error('加载本体场景库失败:', error);
        Message.error('加载本体场景库失败');
      })
      .finally(() => {
        setOptionsLoading(false);
      });
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      if (values.sceneId == null) {
        Message.warning('请选择本体场景库');
        return;
      }
      onConfirm(values.sceneId);
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title={title}
      visible={visible}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={handleOk}
      unmountOnExit
    >
      <Form form={form} layout="vertical">
        <Form.Item
          field="sceneId"
          label="本体场景库"
          rules={[{ required: true, message: '请选择本体场景库' }]}
        >
          <Select
            placeholder="请选择本体场景库"
            loading={optionsLoading}
            allowClear
            showSearch
            filterOption={(inputValue, option) =>
              String(option?.props?.children || '')
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            }
          >
            {sceneOptions.map((item) => (
              <Option key={item.value} value={item.value} title={item.label}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button } from '@arco-design/web-react';
import { ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';
import IconSelector from '@/pages/ontologyScene/componens/IconSelector';

const { TextArea } = Input;

export interface SceneFormData {
  name: string;
  description: string;
  icon?: string;
}

interface SceneModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<SceneFormData>;
  onSubmit: (data: SceneFormData) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  existingSceneIcons?: string[]; // 已存在的场景图标列表，用于随机选择时避免重复
}

// 获取随机图标（排除已使用的图标）
const getRandomIcon = (excludeIcons: string[] = []): string => {
  const availableIcons = ICON_OPTIONS.filter(
    (opt) => !excludeIcons.includes(opt.value)
  );
  if (availableIcons.length === 0) {
    return ICON_OPTIONS[0].value;
  }
  const randomIndex = Math.floor(Math.random() * availableIcons.length);
  return availableIcons[randomIndex].value;
};

const SceneModal: React.FC<SceneModalProps> = ({
  visible,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  existingSceneIcons = []
}) => {
  const [form] = Form.useForm();
  const [selectedIcon, setSelectedIcon] = useState<string>(
    ICON_OPTIONS[0].value
  );

  useEffect(() => {
    if (mode === 'create') {
      // 创建模式：随机选择一个与其他场景不同的图标
      const randomIcon = getRandomIcon(existingSceneIcons);
      setSelectedIcon(randomIcon);
    } else if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        name: initialValues.name || '',
        description: initialValues.description || ''
      });
      setSelectedIcon(initialValues.icon || '');
    }
  }, [mode]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      await onSubmit({
        ...values,
        icon: selectedIcon
      });
      // 不在提交成功后立即重置表单，等待 Modal 关闭时由 useEffect 处理
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedIcon(ICON_OPTIONS[0].value);
    onCancel();
  };

  return (
    <Modal
      title={mode === 'create' ? '创建本体场景' : '编辑本体场景'}
      visible={visible}
      onCancel={handleCancel}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            确定
          </Button>
        </div>
      }
      style={{ width: 600 }}
      closable
    >
      <Form form={form} autoComplete="off" labelAlign="left">
        <Form.Item
          label="本体场景名称："
          field="name"
          rules={[
            { required: true, message: '请输入本体场景名称' },
            { maxLength: 50, message: '名称最多50个字符' }
          ]}
        >
          <Input
            placeholder="请输入本体场景名称"
            maxLength={50}
            showWordLimit
          />
        </Form.Item>

        <Form.Item label="描述说明：" field="description">
          <TextArea
            placeholder="请输入描述说明"
            autoSize={{ minRows: 3 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>

        <Form.Item label="图标：" field="icon">
          <IconSelector
            initialValue={selectedIcon}
            onChange={setSelectedIcon}
            options={ICON_OPTIONS}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SceneModal;

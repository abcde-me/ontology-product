import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Trigger } from '@arco-design/web-react';
import { IconDown } from '@arco-design/web-react/icon';
import { ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';

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
    initialValues?.icon || ICON_OPTIONS[0].value
  );
  const [iconDropdownVisible, setIconDropdownVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues && initialValues.icon) {
        form.setFieldsValue({
          name: initialValues.name || '',
          description: initialValues.description || ''
        });
        setSelectedIcon(initialValues.icon);
      } else if (mode === 'create') {
        // 创建模式：随机选择一个与其他场景不同的图标
        form.resetFields();
        const randomIcon = getRandomIcon(existingSceneIcons);
        setSelectedIcon(randomIcon);
      } else {
        form.resetFields();
        setSelectedIcon(ICON_OPTIONS[0].value);
      }
    }
  }, [visible, initialValues, form, mode, existingSceneIcons]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      await onSubmit({
        ...values,
        icon: selectedIcon
      });
      form.resetFields();
      setSelectedIcon(ICON_OPTIONS[0].value);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedIcon(ICON_OPTIONS[0].value);
    setIconDropdownVisible(false);
    onCancel();
  };

  const selectedIconOption =
    ICON_OPTIONS.find((opt) => opt.value === selectedIcon) || ICON_OPTIONS[0];

  return (
    <Modal
      title={mode === 'create' ? '创建本体场景' : '修改本体场景'}
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
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>

        <Form.Item label="图标：" field="icon">
          <Trigger
            popupVisible={iconDropdownVisible}
            onVisibleChange={setIconDropdownVisible}
            popup={() => (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  padding: 12,
                  width: 200
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px'
                  }}
                >
                  {ICON_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setSelectedIcon(option.value);
                        setIconDropdownVisible(false);
                      }}
                      style={{
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: 4,
                        border:
                          selectedIcon === option.value
                            ? '1px solid #165dff'
                            : '1px solid transparent',
                        backgroundColor:
                          selectedIcon === option.value
                            ? '#f0f5ff'
                            : 'transparent',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedIcon !== option.value) {
                          e.currentTarget.style.backgroundColor = '#f7f8fa';
                          e.currentTarget.style.borderColor = '#e5e6eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedIcon !== option.value) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      <option.icon
                        style={{
                          width: 32,
                          height: 32
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            trigger="click"
            position="bl"
          >
            <div
              className="flex h-[56px] w-[72px] items-center justify-between gap-[4px]"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#165dff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
              }}
              onClick={() => setIconDropdownVisible(!iconDropdownVisible)}
            >
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[4px] bg-[#f0f5ff]">
                <selectedIconOption.icon style={{ width: 32, height: 32 }} />
              </div>
              <IconDown
                style={{
                  fontSize: 12,
                  color: '#86909c',
                  transform: iconDropdownVisible
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              />
            </div>
          </Trigger>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SceneModal;

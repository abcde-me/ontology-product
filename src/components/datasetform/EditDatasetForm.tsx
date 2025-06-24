import { Form, Input, Button, Select, Space } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';

interface Dataset {
  key?: string;
  name: string;
  tags: string[];
  version: string;
  description: string;
  model: string;
  creator: string;
}

interface Props {
  onSubmit: (data: Dataset) => void;
  onCancel: () => void;
  initialData: Dataset;
}

const FormItem = Form.Item;

const EditDatasetForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [form] = Form.useForm();
  const [selectedTags, setSelectedTags] = useState<string[]>(['小说情节']);

  // 模型选项
  const modelOptions = [
    { label: 'GPT-4o', value: 'GPT-4o' },
    { label: '克劳德3号作品', value: '克劳德3号作品' },
    { label: '骆驼 3', value: '骆驼 3' }
  ];

  // 标签选项
  const tagOptions = [
    { label: '小说情节', value: '小说情节' },
    { label: '文本', value: '文本' },
    { label: 'AI生成', value: 'AI生成' },
    { label: '剧情', value: '剧情' },
    { label: '对话', value: '对话' },
    { label: '描述', value: '描述' }
  ];

  // 回显编辑数据 - 使用指定的数据值
  useEffect(() => {
    // 设置指定的数据回显值
    const defaultData = {
      name: '三打白骨精',
      model: 'GPT-4o',
      tags: ['小说情节'],
      description: 'liuxiaoyu-test'
    };

    form.setFieldsValue(defaultData);
    setSelectedTags(defaultData.tags);
  }, [form]);

  const handleSubmit = () => {
    form
      .validate()
      .then((values) => {
        const formData: Dataset = {
          ...values,
          key: initialData?.key || '',
          version: initialData?.version || 'v1.0.0',
          creator: initialData?.creator || ''
        };
        onSubmit(formData);
      })
      .catch((error) => {
        console.log('表单验证失败:', error);
      });
  };

  return (
    <div>
      <Form
        form={form}
        style={{ width: '100%' }}
        autoComplete="off"
        layout="vertical"
      >
        <FormItem
          label="数据集名称"
          field="name"
          rules={[{ required: true, message: '请输入数据集名称' }]}
        >
          <Input placeholder="请输入数据集名称..." />
        </FormItem>

        <FormItem
          label="生成模型"
          field="model"
          rules={[{ required: true, message: '请选择生成模型' }]}
        >
          <Select
            placeholder="请选择生成模型..."
            options={modelOptions}
            disabled={true}
          />
        </FormItem>

        <FormItem label="标签" field="tags">
          <Select
            placeholder="请选择标签..."
            mode="multiple"
            options={tagOptions}
            allowCreate
            value={selectedTags}
            onChange={setSelectedTags}
          />
        </FormItem>

        <FormItem label="描述说明" field="description">
          <Input.TextArea
            placeholder="请输入导出文件的路径说明..."
            rows={4}
            maxLength={500}
            showWordLimit
          />
        </FormItem>
      </Form>

      {/* 底部按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #e5e6eb'
        }}
      >
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" onClick={handleSubmit}>
          确定
        </Button>
      </div>
    </div>
  );
};

export default EditDatasetForm;

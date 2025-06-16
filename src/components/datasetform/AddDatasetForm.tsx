import { Form, Input, Button, Select, Space } from '@arco-design/web-react';
import React from 'react';

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
}

const FormItem = Form.Item;

const DatasetForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  // 模型选项
  const modelOptions = [
    { label: 'GPT-4o', value: 'GPT-4o' },
    { label: '克劳德3号作品', value: '克劳德3号作品' },
    { label: '骆驼 3', value: '骆驼 3' },
  ];

  // 标签选项
  const tagOptions = [
    { label: '标签1', value: '标签1' },
    { label: '标签2', value: '标签2' },
    { label: '标签3', value: '标签3' },
    { label: '文本', value: '文本' },
    { label: '图片', value: '图片' },
    { label: '音频', value: '音频' },
  ];






  const handleSubmit = () => {
    form.validate().then((values) => {
      const formData: Dataset = {
        ...values,
      };
      onSubmit(formData);
    }).catch((error) => {
      console.log('表单验证失败:', error);
    });
  };

  return (
    <Form
      form={form}
      style={{ width: '100%' }}
      autoComplete="off"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      layout="horizontal"
    >
      <FormItem
        label="数据集名称"
        field="name"
        rules={[{ required: true, message: '请输入数据集名称' }]}
      >
        <Input placeholder="请输入数据集名称..." />
      </FormItem>

      <FormItem
        label="标签"
        field="tags"
        rules={[{ required: true, message: '请选择至少一个标签' }]}
      >
        <Select
          placeholder="请选择标签..."
          mode="multiple"
          options={tagOptions}
          allowCreate
        />
      </FormItem>

      <FormItem
        label="版本"
        field="version"
        rules={[{ required: true, message: '请输入版本号' }]}
      >
        <Input placeholder="请输入版本号，如：v1.0.0" />
      </FormItem>

      <FormItem
        label="描述"
        field="description"
        rules={[{ required: true, message: '请输入描述信息' }]}
      >
        <Input.TextArea
          placeholder="请输入数据集描述..."
          rows={3}
          maxLength={200}
          showWordLimit
        />
      </FormItem>

      <FormItem
        label="生成模型"
        field="model"
        rules={[{ required: true, message: '请选择生成模型' }]}
      >
        <Select placeholder="请选择生成模型..." options={modelOptions} />
      </FormItem>

      <FormItem
        label="创建人"
        field="creator"
        rules={[{ required: true, message: '请输入创建人' }]}
      >
        <Input placeholder="请输入创建人..." />
      </FormItem>

      <FormItem wrapperCol={{ offset: 6, span: 18 }}>
        <Space>
          <Button type="primary" onClick={handleSubmit}>
            创建数据集
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </FormItem>
    </Form>
  );
};

export default DatasetForm;

import { Form, Input, Button, Select, Space } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import styles from './EditDatasetForm.module.css';

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
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags || []
  );
  const [description, setDescription] = useState<string>(
    initialData?.description || ''
  );

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

  // 回显编辑数据 - 使用传入的真实数据
  useEffect(() => {
    console.log(
      'EditDatasetForm 接收到的 initialData:',
      initialData.description
    );
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        model: initialData.model,
        tags: initialData.tags,
        description: initialData.description
      });
      setSelectedTags(initialData.tags);
      setDescription(initialData.description || '');
    }
  }, [initialData, form]);

  const handleSubmit = () => {
    form
      .validate()
      .then((values) => {
        console.log('表单收集到的values:', values);
        // 确保description字段被包含
        const formData: Dataset = {
          ...values,
          description: description, // 使用state中的description值
          tags: selectedTags, // 使用state中的tags值
          key: initialData?.key || '',
          version: initialData?.version || 'v1.0.0',
          creator: initialData?.creator || ''
        };
        console.log('最终提交的formData:', formData);
        onSubmit(formData);
      })
      .catch((error) => {
        console.log('表单验证失败:', error);
      });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    form.setFieldValue('description', value);
  };

  return (
    <div className={styles.editFormContainer}>
      <Form
        form={form}
        className={styles.editForm}
        style={{ width: '100%' }}
        autoComplete="off"
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        colon={true}
      >
        <FormItem
          label="数据集名称"
          field="name"
          rules={[{ required: true, message: '请输入数据集名称' }]}
        >
          <Input
            placeholder="请输入数据集名称..."
            style={{ marginLeft: '8px' }}
          />
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
            style={{ marginLeft: '8px' }}
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
            style={{ marginLeft: '8px' }}
          />
        </FormItem>

        <FormItem label="描述说明" field="description">
          <Input.TextArea
            placeholder="请输入导出文件的路径说明..."
            rows={2}
            maxLength={500}
            showWordLimit
            value={description}
            style={{ marginLeft: '8px' }}
            onChange={(value) => {
              handleDescriptionChange(value);
              console.log('description changed:', value);
            }}
          />
          <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
            指定导出文件的保存路径目录
          </span>
        </FormItem>
      </Form>

      {/* 底部按钮 */}
      <div
        className={styles.buttonContainer}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          // marginTop: 8,
          paddingTop: 8,
          marginBottom: 16,
          paddingLeft: 'calc(16.666% + 8px)' // 对齐表单字段
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

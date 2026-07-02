import React, { useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Select,
  Space
} from '@arco-design/web-react';
import type {
  CreateLlmModelReq,
  LlmModelConfig,
  UpdateLlmModelReq
} from '@/types/llmModel';

const FormItem = Form.Item;
const { TextArea } = Input;

const PROVIDER_OPTIONS = [
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Azure OpenAI', value: 'azure_openai' },
  { label: '通义千问', value: 'qwen' }
];

const MODEL_TYPE_OPTIONS = [
  { label: '对话模型', value: 'chat' },
  { label: '向量模型', value: 'embedding' }
];

export interface ModelConfigFormModalProps {
  visible: boolean;
  record?: LlmModelConfig | null;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateLlmModelReq | UpdateLlmModelReq) => Promise<void>;
}

export const ModelConfigFormModal: React.FC<ModelConfigFormModalProps> = ({
  visible,
  record,
  saving = false,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm<CreateLlmModelReq>();

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (record) {
      form.setFieldsValue({
        name: record.name,
        modelType: record.modelType,
        provider: record.provider,
        model: record.model,
        apiName: record.apiName,
        baseUrl: record.baseUrl,
        description: record.description
      });
      return;
    }

    form.setFieldsValue({
      name: '',
      modelType: 'chat',
      provider: 'deepseek',
      model: '',
      apiName: '',
      baseUrl: '',
      description: ''
    });
  }, [visible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      if (record) {
        await onSubmit({ ...values, id: record.id });
        return;
      }
      await onSubmit(values);
    } catch (error: any) {
      if (error?.message) {
        Message.error(error.message);
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <FormItem
        label="模型名称"
        field="name"
        rules={[{ required: true, message: '请输入模型名称' }]}
      >
        <Input placeholder="例如 DeepSeek Pro" maxLength={50} />
      </FormItem>

      <FormItem
        label="模型类型"
        field="modelType"
        rules={[{ required: true, message: '请选择模型类型' }]}
      >
        <Select options={MODEL_TYPE_OPTIONS} placeholder="请选择" />
      </FormItem>

      <FormItem
        label="模型提供商"
        field="provider"
        rules={[{ required: true, message: '请选择模型提供商' }]}
      >
        <Select options={PROVIDER_OPTIONS} placeholder="请选择" />
      </FormItem>

      <FormItem
        label="模型 ID"
        field="model"
        rules={[{ required: true, message: '请输入模型 ID' }]}
      >
        <Input placeholder="例如 deepseek-v4-pro" />
      </FormItem>

      <FormItem
        label="API Key 名称"
        field="apiName"
        rules={[{ required: true, message: '请输入 API Key 名称' }]}
        extra="关联平台资源中的 API Key 管理，用于后端鉴权"
      >
        <Input placeholder="例如 aiontosys" />
      </FormItem>

      <FormItem
        label="Base URL"
        field="baseUrl"
        rules={[{ required: true, message: '请输入 Base URL' }]}
        extra="OpenAI 兼容接口地址"
      >
        <Input placeholder="例如 https://api.deepseek.com" />
      </FormItem>

      <FormItem label="说明" field="description">
        <TextArea
          placeholder="可选，描述该模型的适用场景"
          autoSize={{ minRows: 2, maxRows: 4 }}
          maxLength={200}
        />
      </FormItem>

      <div className="flex justify-end">
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存
          </Button>
        </Space>
      </div>
    </Form>
  );
};

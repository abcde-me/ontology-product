import React, { useEffect, useMemo } from 'react';
import {
  Drawer,
  Form,
  Input,
  Message,
  Select,
  Switch,
  Tag
} from '@arco-design/web-react';
import type {
  LlmScenarioConfig,
  UpdateLlmScenarioReq
} from '@/types/llmScenario';
import { fetchLlmModelList } from '../services/modelApi';
import styles from '../index.module.scss';

const FormItem = Form.Item;

const PROVIDER_OPTIONS = [
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Azure OpenAI', value: 'azure_openai' },
  { label: '通义千问', value: 'qwen' }
];

export interface ScenarioConfigDrawerProps {
  visible: boolean;
  record: LlmScenarioConfig | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: UpdateLlmScenarioReq) => Promise<void>;
}

export const ScenarioConfigDrawer: React.FC<ScenarioConfigDrawerProps> = ({
  visible,
  record,
  saving = false,
  onClose,
  onSubmit
}) => {
  const [form] = Form.useForm<UpdateLlmScenarioReq & { modelRef?: string }>();
  const [modelOptions, setModelOptions] = React.useState<
    { label: string; value: string; modelType: string }[]
  >([]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    fetchLlmModelList()
      .then((result) => {
        setModelOptions(
          result.items.map((item) => ({
            label: `${item.name}（${item.provider}/${item.model}）`,
            value: item.id,
            modelType: item.modelType
          }))
        );
      })
      .catch(() => {
        setModelOptions([]);
      });
  }, [visible]);

  const filteredModelOptions = useMemo(() => {
    if (!record) {
      return modelOptions;
    }

    const expectedType =
      record.code === 'ontology_field_vectorization' ? 'embedding' : 'chat';

    return modelOptions.filter((item) => item.modelType === expectedType);
  }, [modelOptions, record]);

  useEffect(() => {
    if (!visible || !record) {
      return;
    }

    form.setFieldsValue({
      code: record.code,
      enabled: record.enabled,
      provider: record.provider,
      model: record.model,
      apiName: record.apiName,
      baseUrl: record.baseUrl,
      modelRef: undefined
    });
  }, [visible, record, form]);

  const handleModelSelect = async (modelId: string) => {
    const result = await fetchLlmModelList();
    const selected = result.items.find((item) => item.id === modelId);

    if (!selected) {
      return;
    }

    form.setFieldsValue({
      provider: selected.provider,
      model: selected.model,
      apiName: selected.apiName,
      baseUrl: selected.baseUrl
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const { modelRef: _modelRef, ...payload } = values;
      await onSubmit(payload);
    } catch (error: any) {
      if (error?.message) {
        Message.error(error.message);
      }
    }
  };

  return (
    <Drawer
      width={520}
      title={record ? `配置：${record.name}` : '配置大模型环节'}
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      unmountOnExit
    >
      {record && (
        <div className={styles['drawer-info-card']}>
          <div className={styles['drawer-info-title']}>
            所属模块：
            <Tag color="arcoblue" bordered size="small">
              {record.module}
            </Tag>
          </div>
          <div className={styles['drawer-info-desc']}>{record.description}</div>
        </div>
      )}

      <Form form={form} layout="vertical" autoComplete="off">
        <FormItem field="code" hidden>
          <Input />
        </FormItem>

        <FormItem label="启用大模型" field="enabled" triggerPropName="checked">
          <Switch />
        </FormItem>

        <FormItem
          label="引用模型"
          field="modelRef"
          extra="从模型列表快速填充下方配置，也可手动修改"
        >
          <Select
            allowClear
            placeholder="选择已配置的模型"
            options={filteredModelOptions}
            onChange={handleModelSelect}
          />
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
      </Form>
    </Drawer>
  );
};

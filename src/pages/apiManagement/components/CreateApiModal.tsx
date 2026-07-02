import React, { useEffect } from 'react';
import { Button, Form, Input, Select, Space } from '@arco-design/web-react';
import type { CreateOntologyApiInput, HttpMethod } from '../types';
import { DEFAULT_ONTOLOGY_API_BASE_URL } from '../constants/ontologyApiCatalog';
import styles from '../index.module.scss';

interface CreateApiModalProps {
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateOntologyApiInput) => void;
}

const METHOD_OPTIONS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];

export const CreateApiModal: React.FC<CreateApiModalProps> = ({
  visible,
  saving,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm<CreateOntologyApiInput>();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name: '',
        method: 'POST',
        path: '/http_rest_api/internal/v1/',
        category: '自定义',
        baseUrl: DEFAULT_ONTOLOGY_API_BASE_URL
      });
    }
  }, [form, visible]);

  return (
    <div className={styles['create-modal-body']}>
      <Form
        form={form}
        size="small"
        layout="vertical"
        className={styles['create-modal-form']}
        initialValues={{
          method: 'POST',
          category: '自定义',
          baseUrl: DEFAULT_ONTOLOGY_API_BASE_URL
        }}
        onSubmit={onSubmit}
      >
        <Form.Item
          label="接口名称"
          field="name"
          rules={[{ required: true, message: '请输入接口名称' }]}
        >
          <Input placeholder="例如：查询自定义对象列表" />
        </Form.Item>

        <Form.Item
          label="请求方法"
          field="method"
          rules={[{ required: true, message: '请选择请求方法' }]}
        >
          <Select
            options={METHOD_OPTIONS.map((method) => ({
              label: method,
              value: method
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Path"
          field="path"
          rules={[{ required: true, message: '请输入 Path' }]}
        >
          <Input placeholder="例如 /http_rest_api/internal/v1/HttpQueryOntology" />
        </Form.Item>

        <Form.Item label="分类" field="category">
          <Input placeholder="例如：自定义" />
        </Form.Item>

        <Form.Item
          label="Base URL"
          field="baseUrl"
          rules={[{ required: true, message: '请输入 Base URL' }]}
        >
          <Input placeholder="例如 https://api.onto.com" />
        </Form.Item>

        <div className={styles['create-modal-hint']}>
          创建后将自动生成接口说明、请求/响应示例，初始状态为「编辑中」。发布后将变为「已上线」，下线后为「已下线」。
        </div>
      </Form>

      <Space className={styles['create-modal-footer']} size={8}>
        <Button size="small" onClick={onCancel} disabled={saving}>
          取消
        </Button>
        <Button
          type="primary"
          size="small"
          loading={saving}
          onClick={() => form.submit()}
        >
          创建并编辑
        </Button>
      </Space>
    </div>
  );
};

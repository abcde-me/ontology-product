import React, { useEffect, useMemo } from 'react';
import {
  Button,
  Form,
  Grid,
  Input,
  Select,
  Space
} from '@arco-design/web-react';
import type {
  HttpMethod,
  OntologyApiConfig,
  OntologyApiCustomMeta
} from '../types';
import { buildApiRequestUrl } from '../services/storage';
import { FormSection } from './FormSection';
import styles from '../index.module.scss';

const { TextArea } = Input;
const { Row, Col } = Grid;

export interface ApiEditFormValues extends OntologyApiConfig {
  name?: string;
  method?: HttpMethod;
  category?: string;
}

interface ApiEditFormProps {
  initialValues: ApiEditFormValues;
  isCustom?: boolean;
  catalogName?: string;
  catalogCategory?: string;
  catalogMethod?: HttpMethod;
  saving?: boolean;
  onSubmit: (values: ApiEditFormValues) => void;
  onReset?: () => void;
}

const METHOD_OPTIONS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];

export const ApiEditForm: React.FC<ApiEditFormProps> = ({
  initialValues,
  isCustom,
  catalogName,
  catalogCategory,
  catalogMethod,
  saving,
  onSubmit,
  onReset
}) => {
  const [form] = Form.useForm<ApiEditFormValues>();
  const baseUrl = Form.useWatch('baseUrl', form as any);
  const path = Form.useWatch('path', form as any);

  const previewUrl = useMemo(() => {
    if (!baseUrl || !path) {
      return '';
    }
    return buildApiRequestUrl(String(baseUrl), String(path));
  }, [baseUrl, path]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onSubmit={onSubmit}
      className={styles['edit-form']}
    >
      <FormSection
        title="基本信息"
        description="定义 API 的识别信息与分类，便于在列表中检索与管理。"
      >
        {isCustom ? (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="接口名称"
                field="name"
                rules={[{ required: true, message: '请输入接口名称' }]}
              >
                <Input placeholder="例如：查询最小路径" />
              </Form.Item>
            </Col>
            <Col span={6}>
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
            </Col>
            <Col span={6}>
              <Form.Item
                label="分类"
                field="category"
                rules={[{ required: true, message: '请输入分类' }]}
              >
                <Input placeholder="例如：自定义" />
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <div className={styles['readonly-meta-grid']}>
            <div>
              <div className={styles['readonly-meta-label']}>接口名称</div>
              <div className={styles['readonly-meta-value']}>{catalogName}</div>
            </div>
            <div>
              <div className={styles['readonly-meta-label']}>请求方法</div>
              <div className={styles['readonly-meta-value']}>
                {catalogMethod}
              </div>
            </div>
            <div>
              <div className={styles['readonly-meta-label']}>分类</div>
              <div className={styles['readonly-meta-value']}>
                {catalogCategory}
              </div>
            </div>
          </div>
        )}
      </FormSection>

      <FormSection
        title="接口地址"
        description="配置对外调用的 Base URL 与 Path，下方会实时预览完整请求地址。"
      >
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item
              label="Base URL"
              field="baseUrl"
              rules={[{ required: true, message: '请输入 Base URL' }]}
            >
              <Input placeholder="例如 https://api.onto.com" />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              label="Path"
              field="path"
              rules={[{ required: true, message: '请输入 Path' }]}
            >
              <Input placeholder="例如 /http_rest_api/internal/v1/HttpQueryOntology" />
            </Form.Item>
          </Col>
        </Row>
        {previewUrl && (
          <div className={styles['endpoint-preview']}>
            <span className={styles['endpoint-preview-label']}>
              完整地址预览
            </span>
            <code>{previewUrl}</code>
          </div>
        )}
      </FormSection>

      <FormSection
        title="使用说明"
        description="面向集成方的接口说明文档，将展示在「调用说明」Tab 中。"
      >
        <Form.Item
          label="接口说明"
          field="description"
          rules={[{ required: true, message: '请输入接口说明' }]}
        >
          <TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
        </Form.Item>

        <Form.Item
          label="使用场景"
          field="useCase"
          rules={[{ required: true, message: '请输入使用场景' }]}
        >
          <TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
        </Form.Item>

        <Form.Item label="补充说明" field="notes">
          <TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
      </FormSection>

      <FormSection
        title="请求 / 响应示例"
        description="用于调用说明展示与接口测试的默认示例内容。"
      >
        <Form.Item
          label="请求示例"
          field="requestExample"
          rules={[{ required: true, message: '请输入请求示例' }]}
        >
          <TextArea
            autoSize={{ minRows: 8, maxRows: 20 }}
            className="font-mono text-[12px]"
          />
        </Form.Item>

        <Form.Item
          label="响应示例"
          field="responseExample"
          rules={[{ required: true, message: '请输入响应示例' }]}
        >
          <TextArea
            autoSize={{ minRows: 8, maxRows: 20 }}
            className="font-mono text-[12px]"
          />
        </Form.Item>
      </FormSection>

      <div className={styles['edit-form-footer']}>
        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存草稿
          </Button>
          {onReset && (
            <Button onClick={onReset} disabled={saving}>
              重置
            </Button>
          )}
        </Space>
      </div>
    </Form>
  );
};

export const splitEditFormValues = (
  values: ApiEditFormValues,
  customMeta?: OntologyApiCustomMeta
) => {
  const { name, method, category, ...config } = values;

  return {
    config: config as OntologyApiConfig,
    customMeta:
      customMeta && name && method && category
        ? {
            ...customMeta,
            name,
            method,
            category,
            path: config.path
          }
        : undefined
  };
};

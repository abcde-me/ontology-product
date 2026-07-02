import React from 'react';
import { Descriptions, Typography } from '@arco-design/web-react';
import type { OntologyApiCatalogItem, OntologyApiConfig } from '../types';
import { buildApiRequestUrl } from '../services/storage';
import { FormSection } from './FormSection';
import styles from '../index.module.scss';

const { Paragraph } = Typography;

interface ApiDocSectionProps {
  catalog: OntologyApiCatalogItem;
  config: OntologyApiConfig;
  showPublishedHint?: boolean;
}

export const ApiDocSection: React.FC<ApiDocSectionProps> = ({
  catalog,
  config,
  showPublishedHint
}) => {
  const fullUrl = buildApiRequestUrl(config.baseUrl, config.path);

  return (
    <div className={styles['doc-section']}>
      {showPublishedHint && (
        <Paragraph className="mb-4" type="secondary">
          当前展示的是已发布（线上）版本。
        </Paragraph>
      )}

      <FormSection title="接口概览" description="对外调用所需的基础信息。">
        <Descriptions
          column={2}
          border
          data={[
            { label: 'API 编号', value: catalog.code },
            { label: '接口名称', value: catalog.name },
            { label: '分类', value: catalog.category },
            { label: '请求方法', value: catalog.method },
            { label: 'Base URL', value: config.baseUrl },
            { label: 'Path', value: config.path },
            { label: '完整地址', value: fullUrl, span: 2 }
          ]}
        />
      </FormSection>

      <FormSection title="接口说明">
        <Paragraph>{config.description}</Paragraph>
      </FormSection>

      <FormSection title="使用场景">
        <Paragraph>{config.useCase}</Paragraph>
      </FormSection>

      {config.notes && (
        <FormSection title="补充说明">
          <Paragraph>{config.notes}</Paragraph>
        </FormSection>
      )}

      <FormSection
        title="全局响应结构"
        description="Ontology HTTP REST API 的统一响应格式。"
      >
        <pre className={styles['code-block']}>
          {`{
  "code": "success",
  "message": "错误信息（非 success 时）",
  "requestId": "",
  "statusCode": 0,
  "data": {}
}`}
        </pre>
      </FormSection>

      <FormSection title="请求示例">
        <pre className={styles['code-block']}>{config.requestExample}</pre>
      </FormSection>

      <FormSection title="响应示例">
        <pre className={styles['code-block']}>{config.responseExample}</pre>
      </FormSection>
    </div>
  );
};

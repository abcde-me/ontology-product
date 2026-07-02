import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Input,
  Message,
  Select,
  Space,
  Spin,
  Typography
} from '@arco-design/web-react';
import type { OntologyApiCatalogItem, OntologyApiConfig } from '../types';
import { executeApiTest } from '../services/testApi';
import { buildApiRequestUrl } from '../services/storage';
import styles from '../index.module.scss';

const { TextArea } = Input;
const { Text } = Typography;

interface ApiTestPanelProps {
  catalog: OntologyApiCatalogItem;
  config: OntologyApiConfig;
  compact?: boolean;
}

export const ApiTestPanel: React.FC<ApiTestPanelProps> = ({
  catalog,
  config,
  compact = false
}) => {
  const defaultUrl = useMemo(
    () => buildApiRequestUrl(config.baseUrl, config.path),
    [config.baseUrl, config.path]
  );

  const [method, setMethod] = useState(catalog.method);
  const [url, setUrl] = useState(defaultUrl);
  const [headersText, setHeadersText] = useState(
    'Authorization: Bearer <your-api-key>'
  );
  const [bodyText, setBodyText] = useState(config.requestExample);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');

  useEffect(() => {
    setMethod(catalog.method);
    setUrl(defaultUrl);
    setBodyText(config.requestExample);
    setResultText('');
  }, [catalog.method, catalog.id, config.requestExample, defaultUrl]);

  const handleSend = async () => {
    setLoading(true);
    try {
      const result = await executeApiTest(
        {
          method,
          url,
          body: bodyText
        },
        headersText
      );

      const summary = [
        `HTTP ${result.status} ${result.statusText}`,
        `耗时 ${result.durationMs} ms`,
        result.errorMessage ? `错误: ${result.errorMessage}` : '',
        '',
        'Response Headers:',
        JSON.stringify(result.responseHeaders, null, 2),
        '',
        'Response Body:',
        result.responseBody || '(empty)'
      ]
        .filter(Boolean)
        .join('\n');

      setResultText(summary);

      if (result.ok) {
        Message.success('接口测试完成');
      } else {
        Message.warning(result.errorMessage || '接口返回非 2xx 状态');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={compact ? styles['test-panel-compact'] : styles['test-panel']}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Space wrap>
          <Select
            value={method}
            style={{ width: 120 }}
            options={['GET', 'POST', 'PUT', 'DELETE'].map((item) => ({
              label: item,
              value: item
            }))}
            onChange={setMethod}
          />
          <Input
            value={url}
            onChange={setUrl}
            placeholder="请求 URL"
            style={{ width: compact ? 420 : 640, maxWidth: '100%' }}
          />
          <Button type="primary" loading={loading} onClick={handleSend}>
            发送请求
          </Button>
        </Space>

        <div>
          <Text type="secondary">请求头</Text>
          <TextArea
            value={headersText}
            onChange={setHeadersText}
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="mt-2"
          />
        </div>

        {method !== 'GET' && (
          <div>
            <Text type="secondary">请求体</Text>
            <TextArea
              value={bodyText}
              onChange={setBodyText}
              autoSize={{ minRows: compact ? 6 : 10, maxRows: 18 }}
              className="mt-2 font-mono text-[12px]"
            />
          </div>
        )}

        <div>
          <Text type="secondary">响应结果</Text>
          <Spin loading={loading} style={{ width: '100%' }}>
            <TextArea
              value={resultText}
              readOnly
              placeholder="点击「发送请求」后在此查看响应"
              autoSize={{ minRows: compact ? 8 : 12, maxRows: 24 }}
              className="mt-2 font-mono text-[12px]"
            />
          </Spin>
        </div>
      </Space>
    </div>
  );
};

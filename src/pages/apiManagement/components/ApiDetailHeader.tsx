import React from 'react';
import { Button, Typography } from '@arco-design/web-react';
import dayjs from 'dayjs';
import type {
  OntologyApiCatalogItem,
  OntologyApiRuntimeRecord
} from '../types';
import { buildApiRequestUrl } from '../services/storage';
import { ApiStatusTag } from './ApiStatusTag';
import styles from '../index.module.scss';

const { Text } = Typography;

interface ApiDetailHeaderProps {
  catalog: OntologyApiCatalogItem;
  record: OntologyApiRuntimeRecord;
  endpointPath: string;
  onBack: () => void;
}

export const ApiDetailHeader: React.FC<ApiDetailHeaderProps> = ({
  catalog,
  record,
  endpointPath,
  onBack
}) => {
  const fullUrl = buildApiRequestUrl(record.draftConfig.baseUrl, endpointPath);

  return (
    <div className={styles['detail-header-wrap']}>
      <div className={styles['detail-header-card']}>
        <div className={styles['detail-header-main']}>
          <div className={styles['detail-header-info']}>
            <div className={styles['detail-title']}>{catalog.name}</div>
            <div className={styles['detail-meta']}>
              <Text type="secondary">{catalog.code}</Text>
              <span className={styles['detail-meta-divider']}>|</span>
              <ApiStatusTag status={record.status} />
              <span className={styles['detail-meta-divider']}>|</span>
              <Text type="secondary">{catalog.category}</Text>
              {record.publishedAt && record.status !== 'editing' && (
                <>
                  <span className={styles['detail-meta-divider']}>|</span>
                  <Text type="secondary">
                    最近发布{' '}
                    {dayjs(record.publishedAt).format('YYYY-MM-DD HH:mm')}
                  </Text>
                </>
              )}
            </div>
            <div className={styles['detail-endpoint']}>
              <span className={styles['detail-method']}>{catalog.method}</span>
              <code className={styles['detail-endpoint-url']}>{fullUrl}</code>
            </div>
          </div>

          <Button
            type="text"
            className={styles['detail-back-btn']}
            onClick={onBack}
          >
            返回列表
          </Button>
        </div>
      </div>
    </div>
  );
};

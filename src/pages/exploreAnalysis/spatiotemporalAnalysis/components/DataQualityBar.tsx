import React from 'react';
import { Tag } from '@arco-design/web-react';
import type { SpatiotemporalDataset } from '../types';
import { formatTimeLabel } from '../services/loadDataset';
import styles from '../index.module.scss';

interface DataQualityBarProps {
  dataset: SpatiotemporalDataset;
}

export const DataQualityBar: React.FC<DataQualityBarProps> = ({ dataset }) => {
  const { quality } = dataset;
  const coverageRate =
    quality.requestedInstances > 0
      ? ((quality.validPoints / quality.requestedInstances) * 100).toFixed(1)
      : '0';

  return (
    <div className={styles.qualityBar}>
      <div className={styles.qualityMain}>
        <span>
          有效时空点 <strong>{quality.validPoints}</strong> / 请求实例{' '}
          {quality.requestedInstances}
        </span>
        <span>
          时间跨度 <strong>{quality.timeSpanHours.toFixed(1)} h</strong>
        </span>
        <span>
          {formatTimeLabel(dataset.timeRange.min)} ~{' '}
          {formatTimeLabel(dataset.timeRange.max)}
        </span>
      </div>
      <div className={styles.qualityTags}>
        <Tag color="arcoblue">覆盖率 {coverageRate}%</Tag>
        {quality.objectTypeBreakdown.slice(0, 4).map((item) => (
          <Tag key={item.name}>
            {item.name} {item.count}
          </Tag>
        ))}
      </div>
    </div>
  );
};

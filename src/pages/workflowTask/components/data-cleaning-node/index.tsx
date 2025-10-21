import React from 'react';
import styles from './index.module.scss';

export default function DataCleaningNode(props: {
  dataSource: { raw_data_num: number; processed_data_num: number; log: string };
  loading: boolean;
  status: number | string;
}) {
  const { dataSource, status } = props;

  return (
    <div className={styles['task-data-cleaning-node']}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          overflow: 'hidden'
        }}
      >
        <div className={styles['item-box']}>
          <span className={styles['item-title']}>原始数据量</span>
          <span className={styles['item-content']}>
            {status === 0 && dataSource?.raw_data_num === 0
              ? '--'
              : (dataSource?.raw_data_num ?? '--')}
          </span>
        </div>
        <div className={styles['item-box']}>
          <span className={styles['item-title']}>清洗后数据量</span>
          <span className={styles['item-content']}>
            {status === 0 && dataSource?.processed_data_num === 0
              ? '--'
              : (dataSource?.processed_data_num ?? '--')}
          </span>
        </div>
      </div>
      <div className={styles['running-detail']}>运行详情：</div>
      <div
        className={styles['running-detail-content-box']}
        style={{
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          lineHeight: '12px',
          color: '#1E293B'
        }}
      >
        {dataSource.log}
      </div>
    </div>
  );
}

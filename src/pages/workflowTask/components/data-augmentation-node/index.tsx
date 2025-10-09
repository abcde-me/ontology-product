import React from 'react';
import cn from 'classnames';
import './index.scss';

export default function DataAugmentationNode(props: {
  dataSource: { raw_data_num: number; processed_data_num: number; log: string };
  loading: boolean;
  status: number | string;
}) {
  const { dataSource, status } = props;

  return (
    <div className={cn('data-augmentation-node')}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          overflow: 'hidden'
        }}
      >
        <div className={cn('item-box')}>
          <span className={cn('item-title')}>原始数据量</span>
          <span className={cn('item-content')}>
            {status === 0 && dataSource?.raw_data_num === 0
              ? '--'
              : (dataSource?.raw_data_num ?? '--')}
          </span>
        </div>
        <div className={cn('item-box')}>
          <span className={cn('item-title')}>增强后数据量</span>
          <span className={cn('item-content')}>
            {status === 0 && dataSource?.processed_data_num === 0
              ? '--'
              : (dataSource?.processed_data_num ?? '--')}
          </span>
        </div>
      </div>
      <div className={cn('running-detail')}>运行详情：</div>
      <div
        className={cn('running-detail-content-box')}
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

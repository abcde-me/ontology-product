import React from 'react';
import './index.css';

export default function DataCleaningNode(props: {
  dataSource: { raw_data_num: number; processed_data_num: number; log: string };
  loading: boolean;
  status: number | string;
}) {
  const { dataSource, status } = props;

  return (
    <div className="task-data-cleaning-node">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          overflow: 'hidden'
        }}
      >
        <div className="item-box">
          <span className="item-title">原始数据量</span>
          <span className="item-content">
            {status === 0 && dataSource?.raw_data_num === 0
              ? '--'
              : dataSource?.raw_data_num ?? '--'}
          </span>
        </div>
        <div className="item-box">
          <span className="item-title">清洗后数据量</span>
          <span className="item-content">
            {status === 0 && dataSource?.processed_data_num === 0
              ? '--'
              : dataSource?.processed_data_num ?? '--'}
          </span>
        </div>
      </div>
      <div className="running-detail">运行详情：</div>
      <div
        className="running-detail-content-box"
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

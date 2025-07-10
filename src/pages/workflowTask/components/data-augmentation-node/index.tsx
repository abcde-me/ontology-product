import React from 'react';
import './index.css';

export default function DataAugmentationNode(props: { dataSource; loading }) {
  const { dataSource } = props;

  return (
    <div className="data-augmentation-node">
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
            {dataSource?.raw_data_num != null ? dataSource.raw_data_num : '--'}
          </span>
        </div>
        <div className="item-box">
          <span className="item-title">增强后数据量</span>
          <span className="item-content">
            {dataSource?.processed_data_num != null
              ? dataSource.processed_data_num
              : '--'}
          </span>
        </div>
      </div>
      <div className="running-detail">运行详情：</div>
      <div className="running-detail-content-box">{dataSource.log}</div>
    </div>
  );
}

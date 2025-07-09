import React from 'react';
import './index.css';

export default function DataCleaningNode(props: { dataSource; loading }) {
  const { dataSource } = props;

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
            {dataSource.raw_data_num || '--'}
          </span>
        </div>
        <div className="item-box">
          <span className="item-title">清洗后数据量</span>
          <span className="item-content">
            {dataSource.cleansed_data_num || '--'}
          </span>
        </div>
        <div className="item-box">
          <span className="item-title">删除重复数据</span>
          <span className="item-content">
            {dataSource.remove_duplicates_num || '--'}
          </span>
        </div>
        <div className="item-box">
          <span className="item-title">删除有害信息数据</span>
          <span className="item-content">
            {dataSource.missing_value_num || '--'}
          </span>
        </div>
      </div>
      <div className="running-detail">运行详情：</div>
      <div className="running-detail-content-box">{dataSource.log}</div>
    </div>
  );
}

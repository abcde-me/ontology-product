import React from 'react';
import './index.scss';

export default function DataCleaningNode(props: {
  dataSource: {
    input_file_num: number;
    output_file_num: number;
    run_log: string;
    input_file_size: string;
    output_file_size: string;
  };
  loading: boolean;
  status: number | string;
}) {
  const { dataSource, status } = props;

  return (
    <div className="task-scripting-node">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          overflow: 'hidden'
        }}
      >
        <div className="item-box">
          <span className="item-title">加载数据</span>
          <span className="item-content">
            {status === 0 && dataSource?.input_file_num === 0
              ? '--'
              : `${dataSource?.input_file_num}个文件 / ${dataSource?.input_file_size}`}
          </span>
        </div>
        <div className="item-box">
          <span className="item-title">保存数据</span>
          <span className="item-content">
            {status === 0 && dataSource?.output_file_num === 0
              ? '--'
              : `${dataSource?.output_file_num}个文件 / ${dataSource?.output_file_size}`}
          </span>
        </div>
      </div>
      <div className="running-detail">运行详情：</div>
      <div
        className="running-detail-content-box"
        style={{
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          lineHeight: '24px',
          color: '#1E293B'
        }}
      >
        {dataSource.run_log}
      </div>
    </div>
  );
}

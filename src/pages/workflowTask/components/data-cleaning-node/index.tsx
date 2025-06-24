import React from 'react';
import './index.css';
import { Table } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import noDataElement from '@/components/no-data';

export default function DataCleaningNode(props: { dataSource }) {
  const { dataSource } = props;

  const columns: ColumnProps<any>[] = [
    {
      title: '规则名称',
      dataIndex: 'file_name',
      width: 120,
      ellipsis: true
    },
    {
      title: '清洗结果',
      dataIndex: 'start_time',
      width: 150,
      ellipsis: true
    },
    {
      title: '描述',
      dataIndex: 'end_time',
      width: 150,
      ellipsis: true
    }
  ];

  return (
    <div className="data-cleaning-node">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div className="item-box">
          <span className="item-title">原始数据量</span>
          <span className="item-content">{dataSource.raw_data_num}</span>
        </div>
        <div className="item-box">
          <span className="item-title">清洗后数据量</span>
          <span className="item-content">{dataSource.cleansed_data_num}</span>
        </div>
        <div className="item-box">
          <span className="item-title">删除重复数据</span>
          <span className="item-content">
            {dataSource.remove_duplicates_num}
          </span>
        </div>
        <div className="item-box">
          <span className="item-title">删除有害信息数据</span>
          <span className="item-content">{dataSource.missing_value_num}</span>
        </div>
      </div>
      <Table
        border={false}
        columns={columns}
        data={dataSource.log}
        pagination={false}
        noDataElement={noDataElement({ description: '暂无数据' })}
        rowKey="id"
        style={{ margin: '10px 0' }}
      />
    </div>
  );
}

import React, { useState } from 'react';
import './index.css';
import { Pagination, Table } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import PdfIcon from '@/assets/pdf-icon.svg';
import TxtIcon from '@/assets/txt-icon.svg';
import EpubIcon from '@/assets/epub-icon.svg';
import TimeFormatting from '@/utils/timeFormatting';
import noDataElement from '@/components/no-data';

export default function ParseNode(props: { dataSource }) {
  const { dataSource } = props;
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);

  const columns: ColumnProps[] = [
    {
      title: '文件名称',
      dataIndex: 'file_name',
      width: 120,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '5px',
              height: '5px',
              backgroundColor: record.status ? '#10B981' : '#EF4444',
              borderRadius: '50%',
              marginRight: '5px'
            }}
          ></div>
          <div>{record.status ? '成功' : '失败'}</div>
        </div>
      ),
      filters: [
        {
          text: '成功',
          value: true
        },
        {
          text: '失败',
          value: false
        }
      ],
      onFilter: (value, row) => row.status == value
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      width: 100,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.file_type === 'pdf' ? (
            <PdfIcon />
          ) : record.file_type === 'txt' ? (
            <TxtIcon />
          ) : (
            <EpubIcon />
          )}
          <div style={{ margin: '0 0 0 5px' }}>{record.file_type}</div>
        </div>
      ),
      filters: [
        {
          text: '成功',
          value: true
        },
        {
          text: '失败',
          value: false
        }
      ],
      onFilter: (value, row) => row.status == value
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      width: 150,
      render: (_, record) => <span>{TimeFormatting(record.start_time)}</span>,
      sorter: (a, b) => a.start_time.length - b.start_time.length
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      width: 150,
      render: (_, record) => <span>{TimeFormatting(record.end_time)}</span>,
      sorter: (a, b) => a.end_time.length - b.end_time.length
    }
  ];
  return (
    <div className="parse-node">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div className="item-box">
          <span className="item-title">原始数据量</span>
          <span className="item-content">{dataSource.total}</span>
        </div>
        <div className="item-box">
          <span className="item-title">成功</span>
          <span className="item-content">{dataSource.success_total}</span>
        </div>
        <div className="item-box">
          <span className="item-title">失败</span>
          <span className="item-content">{dataSource.fail_total}</span>
        </div>
      </div>
      <Table
        border={false}
        columns={columns}
        data={dataSource.file}
        pagination={false}
        noDataElement={noDataElement({ description: '暂无数据' })}
        rowKey="id"
        style={{ margin: '10px 0' }}
      />
      {/* 分页 */}
      <Pagination
        current={current}
        pageSize={pageSize}
        onPageSizeChange={(pageSize) => {
          setPageSize(pageSize);
          setCurrent(1);
        }}
        onChange={(page) => {
          setCurrent(page);
        }}
        sizeOptions={[2, 5, 10, 20]}
        showTotal
        total={100}
        showJumper
        sizeCanChange
        style={{ justifyContent: 'flex-end', marginTop: '10px' }}
      />
    </div>
  );
}

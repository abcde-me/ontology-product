import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import { Pagination, Table } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import PdfIcon from '@/assets/pdf-icon.svg';
import TxtIcon from '@/assets/txt-icon.svg';
import EpubIcon from '@/assets/epub-icon.svg';
import TimeFormatting from '@/utils/timeFormatting';
import noDataElement from '@/components/no-data';
import { debounce } from 'lodash';

// 枚举文件类型
enum FileType {
  pdf = 'pdf',
  txt = 'txt',
  epub = 'epub'
}

export default function ParseNode(props: {
  dataSource;
  loading;
  onSendData;
  pagination;
}) {
  const { dataSource, onSendData, pagination } = props;

  // 使用防抖控制onSendData
  const changeRef = useRef(debounce(onSendData, 100));

  // 分页change事件
  const handlePageChange = (page: number, pageSize?: number) => {
    changeRef.current(page, pageSize || pagination.pageSize);
  };

  // 组件销毁时取消防抖
  useEffect(() => {
    return () => changeRef.current.cancel();
  }, []);

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
          {record.file_type === FileType.pdf ? (
            <PdfIcon />
          ) : record.file_type === FileType.txt ? (
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
      render: (_, record) => <span>{record.start_time}</span>,
      sorter: (a, b) => {
        return (
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      }
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      width: 150,
      render: (_, record) => <span>{record.end_time}</span>,
      sorter: (a, b) => {
        return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
      }
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
          <span className="item-content">{dataSource.total || '-'}</span>
        </div>
        <div className="item-box">
          <span className="item-title">成功</span>
          <span className="item-content">
            {dataSource.success_total || '-'}
          </span>
        </div>
        <div className="item-box">
          <span className="item-title">失败</span>
          <span className="item-content">{dataSource.fail_total || '-'}</span>
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
        current={pagination.current}
        pageSize={pagination.pageSize}
        onChange={handlePageChange}
        onPageSizeChange={(pageSize) => {
          handlePageChange(1, pageSize);
        }}
        sizeOptions={[2, 5, 10, 20]}
        showTotal
        total={pagination.total}
        showJumper
        sizeCanChange
        style={{ justifyContent: 'flex-end', marginTop: '10px' }}
      />
    </div>
  );
}

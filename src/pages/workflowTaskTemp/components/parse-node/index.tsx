import React, { useEffect, useRef, useState } from 'react';
import { Pagination, Table } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { debounce } from 'lodash-es';
import getFileIcon from '@/components/file-icon';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { FileType } from '@/utils/type';
import styles from './index.module.scss';

// 枚举文件状态
enum FileStatus {
  success = 1,
  fail = 2
}

export default function ParseNode(props: {
  dataSource;
  loading: boolean;
  onSendData: (
    page: number,
    pageSize: number,
    value: {
      sorter: SorterInfo;
      filters: Partial<Record<string | number | symbol, string[]>>;
    }
  ) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onSortData: (
    sort: SorterInfo,
    sort_by: Partial<Record<string | number | symbol, string[]>>
  ) => void;
  status: number | string;
}) {
  const { dataSource, onSendData, pagination, onSortData, status } = props;

  // 使用防抖控制onSendData
  const changeRef = useRef(debounce(onSendData, 100));

  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    sorter: {},
    filters: {}
  });

  // 分页change事件
  const handlePageChange = (page: number, pageSize?: number) => {
    changeRef.current(page, pageSize || pagination.pageSize, sortValue);
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
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover value={record.file_name} isEdit={false} />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor:
                record.status === FileStatus.success ? '#10B981' : '#EF4444',
              borderRadius: '50%',
              marginRight: '5px'
            }}
          ></div>
          <div>{record.status === FileStatus.success ? '成功' : '失败'}</div>
        </div>
      ),
      filters: [
        {
          text: '成功',
          value: FileStatus.success
        },
        {
          text: '失败',
          value: FileStatus.fail
        }
      ]
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      width: 100,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getFileIcon(record.file_type)}
          <div style={{ margin: '0 0 0 5px' }}>{record.file_type}</div>
        </div>
      ),
      filters: [
        {
          text: FileType.pdf,
          value: FileType.pdf
        },
        {
          text: FileType.ppt,
          value: FileType.ppt
        },
        {
          text: FileType.pptx,
          value: FileType.pptx
        },
        {
          text: FileType.txt,
          value: FileType.txt
        },
        {
          text: FileType.md,
          value: FileType.md
        },
        {
          text: FileType.doc,
          value: FileType.doc
        },
        {
          text: FileType.docx,
          value: FileType.docx
        },
        {
          text: FileType.jpg,
          value: FileType.jpg
        },
        {
          text: FileType.png,
          value: FileType.png
        },
        {
          text: FileType.jpeg,
          value: FileType.jpeg
        },
        {
          text: FileType.wav,
          value: FileType.wav
        },
        {
          text: FileType.mp3,
          value: FileType.mp3
        },
        {
          text: FileType.aac,
          value: FileType.aac
        },
        {
          text: FileType.flac,
          value: FileType.flac
        },
        {
          text: FileType.mp4,
          value: FileType.mp4
        },
        {
          text: FileType.mov,
          value: FileType.mov
        },
        {
          text: FileType.mkv,
          value: FileType.mkv
        }
      ]
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      width: 150,
      render: (_, record) => <span>{record.start_time}</span>,
      sorter: true
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      width: 150,
      render: (_, record) => <span>{record.end_time}</span>,
      sorter: true
    }
  ];
  return (
    <div className={styles['parse-node']}>
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
            {status === 0 && dataSource?.total === 0
              ? '--'
              : (dataSource?.total ?? '--')}
          </span>
        </div>
        <div className={styles['item-box']}>
          <span className={styles['item-title']}>成功</span>
          <span className={styles['item-content']}>
            {status === 0 && dataSource?.success_total === 0
              ? '--'
              : (dataSource?.success_total ?? '--')}
          </span>
        </div>
        <div className={styles['item-box']}>
          <span className={styles['item-title']}>失败</span>
          <span className={styles['item-content']}>
            {status === 0 && dataSource?.fail_total === 0
              ? '--'
              : (dataSource?.fail_total ?? '--')}
          </span>
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
        onChange={(pagination, sorter, filters) => {
          setSortValue({
            sorter,
            filters
          });
          // @ts-expect-error
          onSortData(sorter, filters);
        }}
      />
      {/* 分页 */}
      {dataSource.file && dataSource.file.length > 0 && (
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          onChange={handlePageChange}
          onPageSizeChange={(pageSize) => {
            handlePageChange(1, pageSize);
          }}
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={pagination.total}
          showJumper
          sizeCanChange
          style={{ justifyContent: 'flex-end', marginTop: '10px' }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Pagination } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { IconRefresh, IconDownload } from '@arco-design/web-react/icon';
import './GenerateRecordModal.scss';

// 状态枚举
enum RecordStatus {
  GENERATING = 'generating', // 生成中
  NOT_DOWNLOADED = 'not_downloaded', // 未下载
  DOWNLOADED = 'downloaded' // 已下载
}

// 状态配置
const statusConfig = {
  [RecordStatus.GENERATING]: {
    text: '生成中',
    color: '#2970ff' // 蓝色
  },
  [RecordStatus.NOT_DOWNLOADED]: {
    text: '未下载',
    color: '#86909c' // 灰色
  },
  [RecordStatus.DOWNLOADED]: {
    text: '已下载',
    color: '#00b42a' // 绿色
  }
};

interface GenerateRecord {
  id: number;
  time: string;
  taskPackageIds: number[];
  status: RecordStatus;
}

// 模拟数据
const mockRecords: GenerateRecord[] = [
  {
    id: 1,
    time: '2025-05-05 05:05:05',
    taskPackageIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    status: RecordStatus.GENERATING
  },
  {
    id: 2,
    time: '2025-05-04 05:05:05',
    taskPackageIds: [11, 12, 13],
    status: RecordStatus.NOT_DOWNLOADED
  },
  {
    id: 3,
    time: '2025-05-03 05:05:05',
    taskPackageIds: [14, 15],
    status: RecordStatus.DOWNLOADED
  },
  {
    id: 4,
    time: '2025-05-02 05:05:05',
    taskPackageIds: [16],
    status: RecordStatus.DOWNLOADED
  },
  {
    id: 5,
    time: '2025-05-01 05:05:05',
    taskPackageIds: [17, 18, 19],
    status: RecordStatus.DOWNLOADED
  }
];

// 状态指示器组件
const StatusIndicator: React.FC<{ status: RecordStatus }> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <div className="status-indicator">
      <div className="status-dot" style={{ backgroundColor: config.color }} />
      <span>{config.text}</span>
    </div>
  );
};

interface GenerateRecordModalProps {
  visible: boolean;
  onClose: () => void;
}

function GenerateRecordModal({ visible, onClose }: GenerateRecordModalProps) {
  const [records, setRecords] = useState<GenerateRecord[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(50);
  const [loading, setLoading] = useState(false);
  const [sorter, setSorter] = useState<SorterInfo | null>(null);

  // 获取数据
  const getList = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      const sortedData = [...mockRecords];

      // 排序
      if (sorter && sorter.field) {
        sortedData.sort((a, b) => {
          const { field, direction } = sorter;
          if (!field || !direction) return 0;

          let aVal: any = a[field as keyof GenerateRecord];
          let bVal: any = b[field as keyof GenerateRecord];

          if (field === 'time') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }

          if (direction === 'ascend') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }

      // 分页
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = sortedData.slice(start, end);

      setRecords(paginatedData);
      setTotal(mockRecords.length);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (visible) {
      getList();
    }
  }, [visible, current, pageSize, sorter]);

  // 处理刷新
  const handleRefresh = () => {
    getList();
  };

  // 处理表格变化
  const handleTableChange = (
    _pagination: any,
    sorterInfo: SorterInfo | SorterInfo[],
    _filters: any
  ) => {
    if (Array.isArray(sorterInfo)) {
      setSorter(sorterInfo[0] || null);
    } else {
      setSorter(sorterInfo || null);
    }
    setCurrent(1);
  };

  // 处理下载
  const handleDownload = (record: GenerateRecord) => {
    // TODO: 替换为实际的下载API调用
    // 这里模拟下载过程
    try {
      // 创建下载链接
      const link = document.createElement('a');
      // 实际应该调用API获取下载URL
      // const downloadUrl = await getAnnotationDownloadUrl(record.id);
      link.href = `#`; // 临时占位，实际应使用 downloadUrl
      link.download = `标注结果_${record.taskPackageIds.join('_')}.zip`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 更新状态为已下载
      const updatedRecords = records.map((r) =>
        r.id === record.id ? { ...r, status: RecordStatus.DOWNLOADED } : r
      );
      setRecords(updatedRecords);

      // 同时更新mockData，以便刷新后保持状态
      // 实际应该调用API更新状态
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 表格列定义
  const columns: ColumnProps[] = [
    {
      title: '时间',
      dataIndex: 'time',
      width: 180,
      sorter: true
    },
    {
      title: '任务包ID',
      dataIndex: 'taskPackageIds',
      width: 300,
      render: (ids: number[]) => ids.join(', ')
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (_: any, record: GenerateRecord) => (
        <StatusIndicator status={record.status} />
      )
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 120,
      fixed: 'right',
      render: (_: any, record: GenerateRecord) => {
        const isDownloaded = record.status === RecordStatus.DOWNLOADED;
        return (
          <Button
            type="text"
            onClick={() => handleDownload(record)}
            className="download-btn"
          >
            {isDownloaded ? '重新下载' : '下载'}
          </Button>
        );
      }
    }
  ];

  return (
    <Modal
      title="生成记录"
      visible={visible}
      onCancel={onClose}
      footer={null}
      className="generate-record-modal"
      style={{ width: 800 }}
    >
      <div className="generate-record-content">
        <div className="generate-record-header">
          <Button
            type="outline"
            icon={<IconRefresh />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
        </div>

        <Table
          border={false}
          columns={columns}
          data={records}
          rowKey="id"
          loading={loading}
          pagination={false}
          onChange={handleTableChange}
        />

        {total > 0 && (
          <div className="generate-record-pagination">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              showTotal
              showJumper
              sizeCanChange
              sizeOptions={[10, 20, 50, 100]}
              onChange={(page) => setCurrent(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrent(1);
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default GenerateRecordModal;

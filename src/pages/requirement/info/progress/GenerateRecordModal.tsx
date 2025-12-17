import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Pagination,
  Message
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { IconRefresh, IconDownload } from '@arco-design/web-react/icon';
import { useParams } from '@/utils/url';
import './GenerateRecordModal.scss';
import { generateRecord, downloadGenRecord } from '@/api/dataAnnotation';
import dayjs from 'dayjs';
import { downloadBlob, isBlob, parseFilename } from '../utils/downloadBlob';
// 状态配置 status: 0-生成中 1-生成失败 2-未下载 3-已下载
const statusConfig: Record<number, { text: string; color: string }> = {
  0: { text: '生成中', color: '#2970ff' }, // 蓝色
  1: { text: '生成失败', color: '#f53f3f' }, // 红色
  2: { text: '未下载', color: '#86909c' }, // 灰色
  3: { text: '已下载', color: '#00b42a' } // 绿色
};

interface GenerateRecord {
  id: number; // 生成纪录id
  create_time: string; // 创建时间
  pkg_ids: string; // 需求包id，使用逗号分隔
  status: number; // 状态
}

// 状态指示器组件
const StatusIndicator: React.FC<{ status: number }> = ({ status }) => {
  const config = statusConfig[status] || { text: '-', color: '#86909c' };
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
  const id = useParams('id') as string;
  const reqId = Number(id);
  const [records, setRecords] = useState<GenerateRecord[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sorter, setSorter] = useState<SorterInfo | null>(null);

  // 获取数据
  const getList = async () => {
    if (!reqId || isNaN(reqId)) return;
    setLoading(true);
    try {
      const res = await generateRecord({
        req_id: reqId,
        page: current,
        page_size: pageSize
      });
      if (res?.code === 'success') {
        setRecords(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('获取生成记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && reqId) {
      getList();
    }
  }, [visible, current, pageSize, reqId]);

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
  const handleDownload = async (record: GenerateRecord) => {
    // TODO: 替换为实际的下载API调用
    try {
      // 实际应该调用API获取下载URL
      const res = await downloadGenRecord({ id: record.id });
      if (!isBlob(res?.data)) {
        Message.error('下载失败!');
        return;
      }
      const contentDisposition = res.headers['content-disposition'] || '';
      const filename = parseFilename(contentDisposition);
      downloadBlob(res.data, { download: filename });
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 表格列定义
  const columns: ColumnProps[] = [
    {
      title: '时间',
      dataIndex: 'create_time',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '任务包ID',
      dataIndex: 'pkg_ids',
      width: 300
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
        // 0-生成中 1-生成失败 不显示下载按钮
        if (record.status === 0 || record.status === 1) {
          return '-';
        }
        const isDownloaded = record.status === 3;
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
          rowKey="create_time"
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

import React, { useState } from 'react';
import {
  Table,
  Button,
  Tooltip,
  Notification,
  Pagination,
  Progress
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { IconRight } from '@arco-design/web-react/icon';
import GenerateRecordModal from './GenerateRecordModal';
import './index.scss';

interface TaskPackage {
  id: number;
  taskCount: number;
  annotationProgress: {
    completed: number;
    total: number;
  };
  firstRoundQCProgress: {
    completed: number;
    total: number;
  };
  secondRoundQCProgress: {
    completed: number;
    total: number;
  };
  createTime: string;
  creator: string;
}

// 模拟数据
const mockData: TaskPackage[] = [
  {
    id: 3,
    taskCount: 300,
    annotationProgress: { completed: 100, total: 100 },
    firstRoundQCProgress: { completed: 46, total: 100 },
    secondRoundQCProgress: { completed: 36, total: 100 },
    createTime: '2025-05-05 05:05:05',
    creator: '李斯'
  },
  {
    id: 2,
    taskCount: 300,
    annotationProgress: { completed: 66, total: 100 },
    firstRoundQCProgress: { completed: 46, total: 100 },
    secondRoundQCProgress: { completed: 36, total: 100 },
    createTime: '2025-05-04 05:05:05',
    creator: '王武'
  },
  {
    id: 1,
    taskCount: 300,
    annotationProgress: { completed: 66, total: 100 },
    firstRoundQCProgress: { completed: 46, total: 100 },
    secondRoundQCProgress: { completed: 36, total: 100 },
    createTime: '2025-05-03 05:05:05',
    creator: '张三'
  }
];

// 进度条组件
const ProgressBar: React.FC<{
  completed: number;
  total: number;
  label: string;
}> = ({ completed, total, label }) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="progress-item">
      <div className="progress-text-wrapper">
        <span className="progress-label">{label}:</span>
        <span className="progress-text">
          {percent}% ({completed}/{total})
        </span>
      </div>
      <Progress percent={percent} size="small" showText={false} />
    </div>
  );
};

// 具体进度列渲染
const renderProgress = (record: TaskPackage) => {
  return (
    <div className="progress-container">
      <ProgressBar
        label="标注"
        completed={record.annotationProgress.completed}
        total={record.annotationProgress.total}
      />
      <IconRight className="progress-arrow" />
      <ProgressBar
        label="1轮质检"
        completed={record.firstRoundQCProgress.completed}
        total={record.firstRoundQCProgress.total}
      />
      <IconRight className="progress-arrow" />
      <ProgressBar
        label="2轮质检"
        completed={record.secondRoundQCProgress.completed}
        total={record.secondRoundQCProgress.total}
      />
    </div>
  );
};

function RequirementProgress() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  );
  const [generateRecordModalVisible, setGenerateRecordModalVisible] =
    useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorter, setSorter] = useState<SorterInfo | null>(null);

  // 表格列定义
  const columns: ColumnProps[] = [
    {
      title: '任务包ID',
      dataIndex: 'id',
      width: 120
    },
    {
      title: '任务数',
      dataIndex: 'taskCount',
      width: 120
    },
    {
      title: '具体进度',
      dataIndex: 'progress',
      width: 600,
      render: (_: any, record: TaskPackage) => renderProgress(record)
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 200,
      sorter: true
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 120
    }
  ];

  // 处理表格变化（排序、分页等）
  const handleTableChange = (
    pagination: any,
    sorterInfo: SorterInfo | SorterInfo[],
    filters: any
  ) => {
    if (Array.isArray(sorterInfo)) {
      setSorter(sorterInfo[0] || null);
    } else {
      setSorter(sorterInfo || null);
    }
  };

  // 处理生成标注结果
  const handleGenerateAnnotationResults = () => {
    if (selectedRowKeys.length === 0) {
      return;
    }

    // 显示Toast提示
    Notification.info({
      content: (
        <span>
          标注结果生成中,可点击
          <span
            className="toast-link"
            onClick={() => {
              setGenerateRecordModalVisible(true);
            }}
          >
            生成记录
          </span>
          查看进度
        </span>
      ),
      duration: 5000,
      style: { marginTop: 20 }
    });
  };

  // 处理生成记录
  const handleGenerateRecord = () => {
    setGenerateRecordModalVisible(true);
  };

  // 判断是否禁用生成标注结果按钮
  const isGenerateDisabled = selectedRowKeys.length === 0;

  return (
    <div className="requirement-progress">
      <div className="progress-header">
        <h2 className="progress-title">任务包进度</h2>
        <div className="progress-actions">
          <Button
            type="text"
            onClick={handleGenerateRecord}
            style={{ marginRight: 8 }}
          >
            生成记录
          </Button>
          {isGenerateDisabled ? (
            <Tooltip content="请先选择任务包" position="top">
              <Button type="primary" disabled>
                生成标注结果
              </Button>
            </Tooltip>
          ) : (
            <Button type="primary" onClick={handleGenerateAnnotationResults}>
              生成标注结果
            </Button>
          )}
        </div>
      </div>

      <Table
        border={false}
        columns={columns}
        data={mockData}
        rowKey="id"
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (keys) => {
            setSelectedRowKeys(keys);
          }
        }}
        pagination={false}
        onChange={handleTableChange}
      />

      {mockData.length > 0 && (
        <div className="progress-pagination">
          <Pagination
            current={current}
            pageSize={pageSize}
            total={mockData.length}
            showTotal
            showJumper
            sizeOptions={[10, 20, 50, 100]}
            sizeCanChange
            onChange={(page) => setCurrent(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrent(1);
            }}
          />
        </div>
      )}

      {/* 生成记录弹窗 */}
      <GenerateRecordModal
        visible={generateRecordModalVisible}
        onClose={() => setGenerateRecordModalVisible(false)}
      />
    </div>
  );
}

export default RequirementProgress;

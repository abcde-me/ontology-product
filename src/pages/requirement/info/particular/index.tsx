import React, { useState, useEffect } from 'react';
import { Table, Input, Pagination, Button } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import './index.scss';

const InputSearch = Input.Search;

// 状态枚举
enum TaskStatus {
  PENDING_ANNOTATION = 'pending_annotation', // 待标注
  ANNOTATING = 'annotating', // 标注中
  PENDING_QC = 'pending_qc', // 待质检
  QCING = 'qcing', // 质检中
  REJECTED = 'rejected', // 被驳回
  CORRECTING = 'correcting', // 改正中
  PENDING_REVIEW = 'pending_review', // 待复核
  REVIEWING = 'reviewing', // 复核中
  COMPLETED = 'completed' // 任务完成
}

// 状态配置
const statusConfig = {
  [TaskStatus.PENDING_ANNOTATION]: {
    text: '待标注',
    color: '#86909c' // 灰色
  },
  [TaskStatus.ANNOTATING]: {
    text: '标注中',
    color: '#2970ff' // 蓝色
  },
  [TaskStatus.PENDING_QC]: {
    text: '待质检',
    color: '#86909c' // 灰色
  },
  [TaskStatus.QCING]: {
    text: '质检中',
    color: '#2970ff' // 蓝色
  },
  [TaskStatus.REJECTED]: {
    text: '被驳回',
    color: '#f7a500' // 橙色
  },
  [TaskStatus.CORRECTING]: {
    text: '改正中',
    color: '#2970ff' // 蓝色
  },
  [TaskStatus.PENDING_REVIEW]: {
    text: '待复核',
    color: '#86909c' // 灰色
  },
  [TaskStatus.REVIEWING]: {
    text: '复核中',
    color: '#2970ff' // 蓝色
  },
  [TaskStatus.COMPLETED]: {
    text: '任务完成',
    color: '#00b42a' // 绿色
  }
};

// 工序枚举
enum Process {
  ANNOTATION = 'annotation', // 标注
  FIRST_QC = 'first_qc', // 1轮质检
  SECOND_QC = 'second_qc' // 2轮质检
}

const processMap = {
  [Process.ANNOTATION]: '标注',
  [Process.FIRST_QC]: '1轮质检',
  [Process.SECOND_QC]: '2轮质检'
};

interface TaskDetail {
  id: number;
  taskPackageId: number;
  taskId: string;
  currentProcess: Process;
  status: TaskStatus;
  currentOperator: string;
  annotator: string;
  updateTime: string;
}

// 模拟数据
const mockData: TaskDetail[] = [
  {
    id: 1,
    taskPackageId: 3,
    taskId: '111111111111',
    currentProcess: Process.ANNOTATION,
    status: TaskStatus.ANNOTATING,
    currentOperator: '李斯',
    annotator: '李斯',
    updateTime: '2025-05-05 05:05:05'
  },
  {
    id: 2,
    taskPackageId: 3,
    taskId: '111111111111',
    currentProcess: Process.FIRST_QC,
    status: TaskStatus.QCING,
    currentOperator: '王武',
    annotator: '李斯',
    updateTime: '2025-05-05 04:05:05'
  },
  {
    id: 3,
    taskPackageId: 3,
    taskId: '111111111111',
    currentProcess: Process.SECOND_QC,
    status: TaskStatus.REVIEWING,
    currentOperator: '张三',
    annotator: '李斯',
    updateTime: '2025-05-05 03:05:05'
  },
  {
    id: 4,
    taskPackageId: 2,
    taskId: '111111111111',
    currentProcess: Process.ANNOTATION,
    status: TaskStatus.PENDING_ANNOTATION,
    currentOperator: '-',
    annotator: '-',
    updateTime: '2025-05-04 05:05:05'
  },
  {
    id: 5,
    taskPackageId: 2,
    taskId: '111111111111',
    currentProcess: Process.FIRST_QC,
    status: TaskStatus.REJECTED,
    currentOperator: '王武',
    annotator: '李斯',
    updateTime: '2025-05-04 04:05:05'
  },
  {
    id: 6,
    taskPackageId: 2,
    taskId: '111111111111',
    currentProcess: Process.ANNOTATION,
    status: TaskStatus.CORRECTING,
    currentOperator: '李斯',
    annotator: '李斯',
    updateTime: '2025-05-04 03:05:05'
  },
  {
    id: 7,
    taskPackageId: 1,
    taskId: '111111111111',
    currentProcess: Process.ANNOTATION,
    status: TaskStatus.COMPLETED,
    currentOperator: '张三',
    annotator: '张三',
    updateTime: '2025-05-03 05:05:05'
  },
  {
    id: 8,
    taskPackageId: 1,
    taskId: '111111111111',
    currentProcess: Process.FIRST_QC,
    status: TaskStatus.PENDING_QC,
    currentOperator: '-',
    annotator: '张三',
    updateTime: '2025-05-03 04:05:05'
  },
  {
    id: 9,
    taskPackageId: 1,
    taskId: '111111111111',
    currentProcess: Process.SECOND_QC,
    status: TaskStatus.PENDING_REVIEW,
    currentOperator: '-',
    annotator: '张三',
    updateTime: '2025-05-03 03:05:05'
  },
  {
    id: 10,
    taskPackageId: 3,
    taskId: '111111111111',
    currentProcess: Process.ANNOTATION,
    status: TaskStatus.ANNOTATING,
    currentOperator: '李斯',
    annotator: '李斯',
    updateTime: '2024-05-05 05:05:05'
  },
  {
    id: 11,
    taskPackageId: 2,
    taskId: '111111111111',
    currentProcess: Process.FIRST_QC,
    status: TaskStatus.QCING,
    currentOperator: '王武',
    annotator: '李斯',
    updateTime: '2024-05-04 05:05:05'
  },
  {
    id: 12,
    taskPackageId: 1,
    taskId: '111111111111',
    currentProcess: Process.SECOND_QC,
    status: TaskStatus.REVIEWING,
    currentOperator: '张三',
    annotator: '张三',
    updateTime: '2024-05-03 05:05:05'
  }
];

// 状态指示器组件
const StatusIndicator: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <div className="status-indicator">
      <div className="status-dot" style={{ backgroundColor: config.color }} />
      <span>{config.text}</span>
    </div>
  );
};

function RequirementParticular() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(50);
  const [tableData, setTableData] = useState<TaskDetail[]>([]);
  const [sorter, setSorter] = useState<SorterInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取数据
  const getList = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      let filteredData = [...mockData];

      // 搜索过滤
      if (searchValue) {
        filteredData = filteredData.filter(
          (item) =>
            item.taskPackageId.toString().includes(searchValue) ||
            item.taskId.includes(searchValue) ||
            item.currentOperator.includes(searchValue) ||
            item.annotator.includes(searchValue)
        );
      }

      // 排序
      if (sorter) {
        filteredData.sort((a, b) => {
          const { field, direction } = sorter;
          if (!field || !direction) return 0;

          let aVal: any = a[field as keyof TaskDetail];
          let bVal: any = b[field as keyof TaskDetail];

          if (field === 'updateTime') {
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
      const paginatedData = filteredData.slice(start, end);

      setTableData(paginatedData);
      setTotal(filteredData.length);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pageSize, sorter]);

  useEffect(() => {
    if (searchValue !== undefined) {
      setCurrent(1);
      getList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
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

  // 处理预览
  const handlePreview = (record: TaskDetail) => {
    // TODO: 实现预览功能
    console.log('预览任务:', record);
  };

  // 表格列定义
  const columns: ColumnProps[] = [
    {
      title: '任务包ID',
      dataIndex: 'taskPackageId',
      width: 120
    },
    {
      title: '任务ID',
      dataIndex: 'taskId',
      width: 180
    },
    {
      title: '当前工序',
      dataIndex: 'currentProcess',
      width: 120,
      render: (process: Process) => processMap[process] || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      render: (_: any, record: TaskDetail) => (
        <StatusIndicator status={record.status} />
      )
    },
    {
      title: '当前操作人',
      dataIndex: 'currentOperator',
      width: 140
    },
    {
      title: '标注员',
      dataIndex: 'annotator',
      width: 120
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 180,
      sorter: true
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      fixed: 'right',
      render: (_: any, record: TaskDetail) => (
        <Button
          type="text"
          onClick={() => handlePreview(record)}
          className="preview-link"
        >
          预览
        </Button>
      )
    }
  ];

  return (
    <div className="requirement-particular">
      <div className="particular-header" style={{ flexShrink: 0 }}>
        <InputSearch
          placeholder="输入任务包ID、名称、当前操作人、标注员搜索"
          value={searchValue}
          onChange={setSearchValue}
          onSearch={handleSearch}
          allowClear
          style={{ width: 400 }}
        />
      </div>

      <Table
        border={false}
        columns={columns}
        data={tableData}
        rowKey="id"
        loading={loading}
        pagination={false}
        onChange={handleTableChange}
      />

      {total > 0 && (
        <div className="particular-pagination">
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
  );
}

export default RequirementParticular;

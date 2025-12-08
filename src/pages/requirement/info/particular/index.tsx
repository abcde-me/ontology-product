import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Pagination, Button } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { detailRequirement } from '@/api/dataAnnotation';
import { useParams } from '@/utils/url';
import './index.scss';

const InputSearch = Input.Search;

// 状态配置 task_status
// 0-未领取，待标注 1-已领取，标注中 2-标注完成，待质检 3-已领取，质检中
// 4-质检未通过，被驳回 5-驳回后重新标注，改正中 6-驳回后，重新质检,待复核
// 7-质检领取，复核中 8-任务完成
const statusConfig: Record<number, { text: string; color: string }> = {
  0: { text: '待标注', color: '#86909c' }, // 灰色
  1: { text: '标注中', color: '#2970ff' }, // 蓝色
  2: { text: '待质检', color: '#86909c' }, // 灰色
  3: { text: '质检中', color: '#2970ff' }, // 蓝色
  4: { text: '被驳回', color: '#f7a500' }, // 橙色
  5: { text: '改正中', color: '#2970ff' }, // 蓝色
  6: { text: '待复核', color: '#86909c' }, // 灰色
  7: { text: '复核中', color: '#2970ff' }, // 蓝色
  8: { text: '任务完成', color: '#00b42a' } // 绿色
};

// 工序配置 task_process
// 0-标注 1-1轮质检 2-2轮质检 3-3轮质检
const processMap: Record<number, string> = {
  0: '标注',
  1: '1轮质检',
  2: '2轮质检',
  3: '3轮质检'
};

interface TaskDetail {
  pkg_id: number; // 需求包id
  task_id: number; // 任务id
  task_status: number; // 状态
  task_process: number; // 任务工序
  label_user: string; // 标注员
  task_owner: string; // 当前操作人
  front_pkg_id: number; // 任务包ID（展示用）
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

interface RequirementParticularProps {
  isActive?: boolean;
}

function RequirementParticular({ isActive }: RequirementParticularProps) {
  const id = useParams('id') as string;
  const [searchValue, setSearchValue] = useState<string>('');
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<TaskDetail[]>([]);
  const [sorter, setSorter] = useState<SorterInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  // 获取数据
  const getList = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await detailRequirement({
        req_id: Number(id),
        search_content: searchValue,
        page: current,
        page_size: pageSize
      });
      if (res?.code === 'success') {
        setTableData(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('获取明细数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      getList();
    }
  }, [id, current, pageSize, isActive]);

  useEffect(() => {
    // 跳过首次渲染，避免重复调用
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isActive) {
      setCurrent(1);
      getList();
    }
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
      dataIndex: 'front_pkg_id',
      width: 120
    },
    {
      title: '任务ID',
      dataIndex: 'task_id',
      width: 180
    },
    {
      title: '当前工序',
      dataIndex: 'task_process',
      width: 120,
      render: (process: number) => processMap[process] || '-'
    },
    {
      title: '状态',
      dataIndex: 'task_status',
      width: 140,
      render: (_: any, record: TaskDetail) => (
        <StatusIndicator status={record.task_status} />
      )
    },
    {
      title: '当前操作人',
      dataIndex: 'task_owner',
      width: 140
    },
    {
      title: '标注员',
      dataIndex: 'label_user',
      width: 120
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
          placeholder="输入任务包ID、当前操作人、标注员搜索"
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
        rowKey="task_id"
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
            selectProps={{
              getPopupContainer: () => document.body
            }}
          />
        </div>
      )}
    </div>
  );
}

export default RequirementParticular;

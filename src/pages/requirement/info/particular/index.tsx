import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Table, Input, Pagination, Button } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { detailRequirement } from '@/api/dataAnnotation';
import { useParams } from '@/utils/url';
import dayjs from 'dayjs';
import './index.scss';
import { openNewPage } from '@/utils/env';

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
  id: number; // 任务id
  req_id: number; // 需求id
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

// 工序筛选选项
const processFilterOptions = Object.entries(processMap).map(([key, value]) => ({
  text: value,
  value: Number(key)
}));

// 状态筛选选项
const statusFilterOptions = Object.entries(statusConfig).map(
  ([key, value]) => ({
    text: value.text,
    value: Number(key)
  })
);

function RequirementParticular({ isActive }: RequirementParticularProps) {
  const id = useParams('id') as string;
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<TaskDetail[]>([]);
  const [sorter, setSorter] = useState<SorterInfo | null>(null);
  const [filters, setFilters] = useState<{
    task_process?: number[];
    task_status?: number[];
  }>({});
  const [loading, setLoading] = useState(false);

  // 使用 ref 保存搜索值，避免闭包问题
  const searchValueRef = useRef('');

  // 获取数据
  const getList = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await detailRequirement({
        req_id: Number(id),
        search_content: searchValueRef.current,
        page: current,
        page_size: pageSize,
        sort: sorter?.field
          ? [
              {
                field: sorter.field as string,
                order: sorter.direction === 'descend' ? 'desc' : 'asc'
              }
            ]
          : undefined,
        filters:
          filters.task_process?.length || filters.task_status?.length
            ? {
                task_process_list: filters.task_process,
                task_status_list: filters.task_status
              }
            : undefined
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
  }, [id, current, pageSize, sorter, filters]);

  useEffect(() => {
    if (isActive) {
      getList();
    }
  }, [isActive, getList]);

  // 搜索处理（点击搜索、回车、清空都会触发）
  const handleSearch = (value: string) => {
    searchValueRef.current = value;
    setCurrent(1);
    getList();
  };

  // 处理表格变化（排序和筛选）
  const handleTableChange = (
    _pagination: any,
    sorterInfo: SorterInfo | SorterInfo[],
    tableFilters: Partial<Record<string, (string | number)[]>>
  ) => {
    // 处理排序
    if (Array.isArray(sorterInfo)) {
      setSorter(sorterInfo[0] || null);
    } else {
      setSorter(sorterInfo || null);
    }
    // 处理筛选
    setFilters({
      task_process: tableFilters.task_process as number[] | undefined,
      task_status: tableFilters.task_status as number[] | undefined
    });
    setCurrent(1);
  };

  // 处理预览
  const handlePreview = (record: TaskDetail) => {
    // TODO: 实现预览功能
    console.log('预览任务:', record);
    // 标注工具跳转
    openNewPage(
      `/modaforge/tenant/compute/modaforge/labelEditor?rId=${record.req_id}&tId=${record.id}&pkgId=${record.pkg_id}&stage=PREVIEW`
    );
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
      dataIndex: 'id',
      width: 180
    },
    {
      title: '当前工序',
      dataIndex: 'task_process',
      width: 120,
      filters: processFilterOptions,
      filterMultiple: true,
      render: (process: number) => processMap[process] || '-'
    },
    {
      title: '状态',
      dataIndex: 'task_status',
      width: 140,
      filters: statusFilterOptions,
      filterMultiple: true,
      render: (_: any, record: TaskDetail) => (
        <StatusIndicator status={record.task_status} />
      )
    },
    {
      title: '当前操作人',
      dataIndex: 'task_owner_name',
      width: 140
    },
    {
      title: '标注员',
      dataIndex: 'label_user',
      width: 120
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 180,
      sorter: true,
      render: (_, record) => (
        <span>{dayjs(record.update_time).format('YYYY-MM-DD HH:mm:ss')}</span>
      )
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
          onSearch={handleSearch}
          allowClear
          onClear={() => handleSearch('')}
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

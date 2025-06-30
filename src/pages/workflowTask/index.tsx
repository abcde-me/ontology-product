import React, { useEffect, useMemo, useState } from 'react';
import { Input, Pagination, Table } from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import './index.css';
import noDataElement from '@/components/no-data';
import { useUserInfo } from '@/store/userInfoStore';
import { getTaskList } from '@/api/taskList';

const InputSearch = Input.Search;

// 枚举作业运行状态
enum TaskRunStatus {
  success = 1,
  fail = 2,
  running = 3,
  stop = 4
}

export default function WorkflowTask() {
  const history = useHistory();
  const userInfo = useUserInfo();
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化作业列表数据
  const [workflowTaskData, setWorkflowTaskData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 数据总数
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(true);

  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize]);

  const getList = async () => {
    setLoading(true);
    try {
      const params = {
        uid: userInfo?.id,
        search_value: searchValue,
        page: current,
        page_size: pageSize
      };
      const res = await getTaskList(params);
      if (res.status === 200 && res.data) {
        setWorkflowTaskData(res.data.list);
        setCurrent(res.data.page_info.page);
        setPageSize(res.data.page_info.page_size);
        setTotal(res.data.page_info.total);
      }
    } finally {
      setLoading(false);
    }
  };

  // 跳转详情
  const handleToTaskDeatil = (id: number) => {
    history.push(`/tenant/compute/modaforge/workflowTaskDetail?id=${id}`);
  };

  // 跳转目录
  const handleToDirectoryPath = (path: string) => {
    history.push(path);
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '作业ID',
      dataIndex: 'id',
      width: 80,
      ellipsis: true,
      render: (_, record) => (
        <span
          className="hover-change"
          onClick={() => handleToTaskDeatil(record.id)}
        >
          {record.id}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '5px',
              height: '5px',
              backgroundColor:
                record.status === TaskRunStatus.success
                  ? '#10B981'
                  : record.status === TaskRunStatus.fail
                    ? '#EF4444'
                    : record.status === TaskRunStatus.running
                      ? '#007DFA'
                      : '#CBD5E1',
              borderRadius: '50%',
              marginRight: '5px'
            }}
          ></div>
          <div>
            {record.status === TaskRunStatus.success
              ? '运行完成'
              : record.status === TaskRunStatus.fail
                ? '运行失败'
                : record.status === TaskRunStatus.running
                  ? '进行中'
                  : '已停止'}
          </div>
        </div>
      ),
      filters: [
        {
          text: '运行完成',
          value: 0
        },
        {
          text: '运行失败',
          value: 1
        },
        {
          text: '进行中',
          value: 2
        },
        {
          text: '已停止',
          value: 3
        }
      ],
      onFilter: (value, row) => row.status == value
    },
    {
      title: '运行时长',
      dataIndex: 'time_size',
      width: 170,
      ellipsis: true
    },
    {
      title: '工作流名称',
      dataIndex: 'workflow_name',
      width: 130,
      ellipsis: true,
      render: (_, record) => (
        <span
          className="hover-change"
          onClick={() => handleToTaskDeatil(record.id)}
          title={record.workflow_name}
        >
          {record.workflow_name}
        </span>
      )
    },
    {
      title: '源数据目录',
      dataIndex: 'source_path',
      width: 130,
      ellipsis: true,
      render: (_, record) => (
        <span
          className="hover-change"
          title={record.source_path}
          onClick={() => handleToDirectoryPath(record.source_path)}
        >
          {record.source_path}
        </span>
      )
    },
    {
      title: '目标数据目录',
      dataIndex: 'target_path',
      width: 130,
      ellipsis: true,
      render: (_, record) => (
        <span
          className="hover-change"
          title={record.target_path}
          onClick={() => handleToDirectoryPath(record.target_path)}
        >
          {record.target_path}
        </span>
      )
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      width: 170,
      render: (_, record) => <span>{record.start_time}</span>,
      sorter: (a, b) => a.start_time.length - b.start_time.length
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      width: 170,
      render: (_, record) => <span>{record.end_time}</span>,
      sorter: (a, b) => a.end_time.length - b.end_time.length
    },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 80,
      render: (_, record) => (
        <span
          className="operate-text"
          onClick={() => handleToTaskDeatil(record.id)}
        >
          详情
        </span>
      )
    }
  ];

  return (
    <div className="workflow-task">
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>作业</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          margin: '15px 0'
        }}
      >
        <InputSearch
          placeholder="输入作业ID搜索"
          style={{ width: 230 }}
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value);
          }}
          onPressEnter={() => getList()}
        />
      </div>
      <Table
        border={false}
        columns={columns}
        data={workflowTaskData}
        pagination={false}
        noDataElement={noDataElement({ description: '暂无作业' })}
        rowKey="id"
        loading={loading}
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
        total={total}
        showJumper
        sizeCanChange
        style={{ justifyContent: 'flex-end', marginTop: '10px' }}
      />
    </div>
  );
}

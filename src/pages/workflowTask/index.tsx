import React, { useEffect, useMemo, useState } from 'react';
import {
  Input,
  Pagination,
  PaginationProps,
  Popover,
  Table
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import './index.css';
import noDataElement from '@/components/no-data';
import { useUserInfo } from '@/store/userInfoStore';
import { getTaskList } from '@/api/taskList';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';

const InputSearch = Input.Search;

// 枚举作业运行状态
enum TaskRunStatus {
  running = 1,
  success = 2,
  fail = 3,
  stop = 4
}

// 枚举开始时间结束时间字段
enum StartOrEnd {
  start_time = 'start_time',
  end_time = 'end_time'
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
  const [loading, setLoading] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    status: '',
    sort: '',
    sort_by: ''
  });

  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize, sortValue]);

  const getList = async () => {
    setLoading(true);
    try {
      const params = {
        uid: userInfo?.id,
        search_value: searchValue,
        page: current,
        page_size: pageSize,
        ...sortValue
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
  const handleToTaskDeatil = (
    id: number,
    workflow_uuid: string | number,
    ds_workflow_id: string | number
  ) => {
    history.push(
      `/tenant/compute/modaforge/workflowTaskDetail?id=${id}&workflow_uuid=${workflow_uuid}&ds_workflow_id=${ds_workflow_id}`
    );
  };

  // 跳转目录
  const handleToDirectoryPath = (
    id: string,
    parent_id: string,
    root_type: string | number
  ) => {
    history.push(
      `/tenant/compute/modaforge/dataCatalog?root_type=${root_type}&id=${id}&parent_id=${parent_id}`
    );
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      status: filters.status === undefined ? '' : filters.status.join(','),
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc',
      sort_by:
        sorter.field === undefined
          ? ''
          : sorter.field === StartOrEnd.start_time
            ? 'start_run_time'
            : 'end_run_time'
    };

    setSortValue(sortdata);
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '作业ID',
      dataIndex: 'id',
      width: 80,
      ellipsis: true,
      render: (_, record) => (
        <Popover trigger="hover" content={record.id} position="tl">
          <span
            className="hover-change"
            onClick={() =>
              handleToTaskDeatil(
                record.id,
                record.workflow_uuid,
                record.ds_workflow_id
              )
            }
          >
            {record.id}
          </span>
        </Popover>
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
          value: TaskRunStatus.success
        },
        {
          text: '运行失败',
          value: TaskRunStatus.fail
        },
        {
          text: '进行中',
          value: TaskRunStatus.running
        },
        {
          text: '已停止',
          value: TaskRunStatus.stop
        }
      ]
    },
    {
      title: '运行时长',
      dataIndex: 'time_size',
      width: 170,
      ellipsis: true,
      render: (_, record) => (
        <Popover trigger="hover" content={record.id} position="tl">
          <span>{record.time_size}</span>
        </Popover>
      )
    },
    {
      title: '工作流名称',
      dataIndex: 'workflow_name',
      width: 130,
      ellipsis: true,
      render: (_, record) => (
        <Popover trigger="hover" content={record.workflow_name} position="tl">
          <span>{record.workflow_name}</span>
        </Popover>
      )
    },
    {
      title: '源数据目录',
      dataIndex: 'source_path',
      width: 130,
      ellipsis: true,
      render: (_, record) => (
        <Popover trigger="hover" content={record.source_path} position="tl">
          <span
            className="hover-change"
            onClick={() =>
              handleToDirectoryPath(
                record.source_path_id,
                record.source_parent_id,
                1
              )
            }
          >
            {record.source_path}
          </span>
        </Popover>
      )
    },
    {
      title: '目标数据目录',
      dataIndex: 'target_path',
      width: 130,
      ellipsis: true,
      render: (_, record) => (
        <Popover trigger="hover" content={record.target_path} position="tl">
          <span
            className="hover-change"
            onClick={() =>
              handleToDirectoryPath(
                record.target_path_id,
                record.target_parent_id,
                1
              )
            }
          >
            {record.target_path}
          </span>
        </Popover>
      )
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      width: 170,
      render: (_, record) => <span>{record.start_time}</span>,
      sorter: true
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      width: 170,
      render: (_, record) => <span>{record.end_time}</span>,
      sorter: true
    },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <span
          className="operate-text"
          onClick={() =>
            handleToTaskDeatil(
              record.id,
              record.workflow_uuid,
              record.ds_workflow_id
            )
          }
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
        onChange={(pagination, sorter, filters) =>
          handleTableChange(pagination, sorter, filters)
        }
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
        sizeOptions={[10, 20, 50, 100]}
        showTotal
        total={total}
        showJumper
        sizeCanChange
        style={{ justifyContent: 'flex-end', marginTop: '10px' }}
      />
    </div>
  );
}

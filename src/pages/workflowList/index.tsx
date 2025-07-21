import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Message,
  Modal,
  Pagination,
  PaginationProps,
  Popover,
  Table
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import './index.css';
import Clock1Icon from '@/pages/workflowConfig/styles/images/op-icons/clock1.svg';
import Success11Icon from '@/pages/workflowConfig/styles/images/op-icons/success1.svg';
import noDataElement from '@/components/no-data';
import {
  getWorkflowList,
  workflowDelete,
  workflowCopy
} from '@/api/workflowList';
import { useUserInfo } from '@/store/userInfoStore';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';

const InputSearch = Input.Search;

export default function WorkflowList() {
  const history = useHistory();
  const userInfo = useUserInfo();
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化工作流列表数据
  const [workflowData, setWorkflowData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 总数据量
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    run_cycle: '',
    sort: ''
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
        search_content: searchValue,
        page: current, //第几页
        page_size: pageSize, //每页个数
        ...sortValue
      };
      const res = await getWorkflowList(params);
      if (res.status === 200 && res.data) {
        setWorkflowData(res.data.list);
        setCurrent(res.data.page_info?.page);
        setPageSize(res.data.page_info?.page_size);
        setTotal(res.data.page_info?.total);
      }
    } finally {
      setLoading(false);
    }
  };

  // 创建工作流
  const handleCreateWorkflow = () => {
    window.open('/tenant/compute/modaforge/workflowConfig', '_blank');
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

  // 查看详情
  const viewDetailWorkflow = (
    workflow_uuid: number | string,
    ds_workflow_id: number | string
  ) => {
    window.open(
      `/tenant/compute/modaforge/workflowConfig?workflow_uuid=${workflow_uuid}&ds_workflow_id=${ds_workflow_id}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // 复制工作流
  const handleCloneWorkflow = async (workflow_uuid: number | string) => {
    const res = await workflowCopy(workflow_uuid);
    if (res.status === 200 && res.data) {
      Message.success({
        content: '复制成功'
      });
      window.open(
        `/tenant/compute/modaforge/workflowConfig?workflow_uuid=${res.data.workflow_uuid}&ds_workflow_id=${res.data.ds_workflow_id}`,
        '_blank',
        'noopener,noreferrer'
      );
      getList();
    } else {
      Message.error({
        content: res.message || '复制失败，请稍后重试'
      });
    }
  };

  // 点击删除操作弹窗
  const handleDelete = (
    workflow_uuid: number | string,
    workflow_version: string
  ) => {
    Modal.confirm({
      title: (
        <span className="workflow-list-modal-title">确认删除工作流吗？</span>
      ),
      content: (
        <div className="workflow-list-modal-content">
          删除该工作流后，工作流中的内容将全部清除。
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        handleDeleteWorkflow(workflow_uuid, workflow_version);
      }
    });
  };

  // 删除工作流
  const handleDeleteWorkflow = async (
    workflow_uuid: number | string,
    workflow_version: string
  ) => {
    const res = await workflowDelete(workflow_uuid, workflow_version);
    if (res.status === 200 && res.code === '') {
      Message.success({
        content: '删除成功'
      });
      getList();
    } else {
      Message.error({
        content: res?.message ?? '删除失败，请稍后重试'
      });
    }
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      run_cycle:
        filters.run_cycle === undefined ? '' : filters.run_cycle.join(','),
      is_online:
        filters.is_online === undefined ? '' : filters.is_online.join(','),
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'create_time:ASC'
            : 'create_time:DESC'
    };

    setSortValue(sortdata);
  };

  // table数据为空时展示-
  const renderEmptyPlaceholder = (value: string | null) => {
    return value === '' || value == null ? '-' : value;
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '工作流名称',
      dataIndex: 'workflow_name',
      width: 300,
      ellipsis: true,
      className: 'hover-change workflow-name',
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.workflow_name)}
          isEdit={false}
          isLink
          handleLink={() => {
            viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
          }}
        />
      )
    },
    {
      title: '运行方式',
      dataIndex: 'run_cycle',
      width: 120,
      render: (_, record) =>
        record.run_cycle ? <span>周期运行</span> : <span>单次运行</span>,
      filters: [
        {
          text: '单次运行',
          value: 0
        },
        {
          text: '周期运行',
          value: 1
        }
      ]
    },
    {
      title: '状态',
      dataIndex: 'is_online',
      width: 100,
      render: (_, record) =>
        record.is_online ? (
          <div className="publish-part published">
            <Success11Icon className="mr-[6px] size-[16px]" />
            <span>已上线</span>
          </div>
        ) : (
          <div className="publish-part not-published">
            <Clock1Icon className="mr-[6px] size-[16px]" />
            <span>未上线</span>
          </div>
        ),
      filters: [
        {
          text: '未上线',
          value: 0
        },
        {
          text: '已上线',
          value: 1
        }
      ]
    },
    {
      title: '源数据目录',
      dataIndex: 'source_path',
      width: 280,
      ellipsis: true,
      className: 'hover-change',
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.source_path)}
          isEdit={false}
          isLink
          handleLink={() => {
            handleToDirectoryPath(
              record.source_path_id,
              record.parent_source_path_id,
              1
            );
          }}
        />
      )
    },
    {
      title: '目标数据目录',
      dataIndex: 'target_path',
      width: 280,
      ellipsis: true,
      className: 'hover-change',
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.target_path)}
          isEdit={false}
          isLink
          handleLink={() => {
            handleToDirectoryPath(
              record.source_path_id,
              record.parent_source_path_id,
              2
            );
          }}
        />
      )
    },
    {
      title: '创建人',
      dataIndex: 'user_name',
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.user_name)}
          isEdit={false}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 150,
      render: (_, record) => (
        <span>
          {record.create_time == '' || record.create_time == null
            ? '-'
            : new Date(record.create_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <div style={{ display: 'flex' }}>
          <span
            className="operate-text"
            onClick={() => {
              viewDetailWorkflow(record.workflow_uuid, record.ds_workflow_id);
            }}
          >
            详情
          </span>
          <span
            className="operate-text"
            onClick={() => {
              handleCloneWorkflow(record.workflow_uuid);
            }}
          >
            复制
          </span>
          <Popover
            trigger="hover"
            content="请先下线工作流"
            position="top"
            disabled={!record.is_online}
          >
            <span
              className={record.is_online ? 'disabled-text' : 'operate-text'}
              onClick={() =>
                handleDelete(record.workflow_uuid, record.workflow_version)
              }
            >
              删除
            </span>
          </Popover>
        </div>
      )
    }
  ];

  return (
    <div className="workflow">
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>工作流</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          margin: '15px 0'
        }}
      >
        <InputSearch
          placeholder="输入工作流名称搜索"
          style={{ width: 230 }}
          value={searchValue}
          allowClear
          onChange={(value) => {
            setSearchValue(value);
          }}
          onPressEnter={() => {
            getList();
          }}
        />
        <Button type="primary" onClick={handleCreateWorkflow} loading={loading}>
          创建工作流
        </Button>
      </div>
      <Table
        border={false}
        columns={columns}
        data={workflowData}
        pagination={false}
        noDataElement={noDataElement({
          description: '暂无工作流',
          btnText: '创建工作流',
          handleBtn: () => handleCreateWorkflow()
        })}
        rowKey="id"
        loading={loading}
        onChange={(pagination, sorter, filters) =>
          handleTableChange(pagination, sorter, filters)
        }
      />
      {/* 分页 */}
      {workflowData && workflowData.length > 0 && (
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
      )}
    </div>
  );
}

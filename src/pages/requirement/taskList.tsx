import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Pagination,
  PaginationProps,
  Table,
  Tooltip
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { getAnnotationTaskList } from '@/api/dataAnnotation';
import { useUserInfo } from '@/store/userInfoStore';
import { openNewPage } from '@/utils/env';
import { RequirementTypeNameMap } from './type';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import './index.scss';

export default function Requirement() {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const userInfo = useUserInfo();
  const InputSearch = Input.Search;
  // 初始化搜索框value
  const [searchValue, setSearchValue]: any = useState(null);
  // 初始化任务列表数据
  const [taskData, setTaskData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 总数据量
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 区分是否点击按钮清空搜索框
  const [isClickClear, setIsClickClear] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue]: any = useState({});

  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize, sortValue]);

  // 清空搜索框
  useEffect(() => {
    if ((isClickClear && searchValue === '') || !searchValue) {
      getList();
      setIsClickClear(false);
    }
  }, [isClickClear]);

  const getList = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: current, //第几页
        pageSize: pageSize, //每页个数
        order: sortValue?.order,
        filters: {
          name: searchValue,
          type: sortValue?.type,
          belong: sortValue?.belong
        }
      };
      const res = await getAnnotationTaskList(params);
      if (res.code === 0) {
        setTaskData(res?.data?.result || []);
        setTotal(res.data?.total);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const viewDetailWorkflow = (record: Record<string, any>) => {
    openNewPage(
      `/modaforge/tenant/compute/modaforge/labelEditor?rId=${record.id}`
    );
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata: any = {
      name: '',
      type: filters?.type,
      belong: filters?.belong,
      order:
        sorter.direction === undefined
          ? 'desc'
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc'
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
      title: '所属需求名称',
      dataIndex: 'name',
      width: 300,
      ellipsis: true,
      className: 'hover-change workflow-name',
      render: (_, record) => {
        return renderEmptyPlaceholder(record.name) !== '-' ? (
          <Tooltip content={record?.name}>{record?.name}</Tooltip>
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '需求ID',
      dataIndex: 'id',
      width: 100,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.id) !== '-' ? (
          <EllipsisPopover value={record.id} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },

    {
      title: '类型',
      dataIndex: 'type',
      width: 174,
      render: (_, record) => {
        return (
          <div>{record?.type ? RequirementTypeNameMap[record.type] : '-'}</div>
        );
      },
      filters: [
        {
          text: '文本',
          value: 1
        },
        {
          text: '图片',
          value: 2
        },
        {
          text: '音频',
          value: 3
        },
        {
          text: '视频',
          value: 4
        }
      ]
    },
    {
      title: '所属部门/个人',
      dataIndex: 'belong',
      width: 160,
      render: (_, record) =>
        record.belong === 1 ? (
          <div className="belong-item">
            <span>个人</span>
          </div>
        ) : (
          <div className="belong-item">
            <span>部门</span>
          </div>
        ),
      filters: [
        {
          text: '个人',
          value: 1
        },
        {
          text: '部门',
          value: 2
        }
      ]
    },
    {
      // not_started_num 未领取任务数
      // task_total	任务总数
      title: '未领取/总任务量',
      dataIndex: 'task_total', // Changed from 'user_name' to unique dataIndex
      width: 160,
      ellipsis: true,
      render: (_, record) => (
        <div>{`${record?.not_started_num}/${record?.task_total}`}</div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 200,
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
      width: 75,
      render: (_, record) => {
        const perms = record.perms || [];
        return (
          <div style={{ display: 'flex' }}>
            {/* {perms.includes(WORKFLOW_LIST_PERMISSIONS.CAN_GET) && ( */}
            <span
              className="operate-text"
              onClick={() => {
                viewDetailWorkflow(record);
              }}
            >
              标注
            </span>
            {/* )} */}
          </div>
        );
      }
    }
  ];

  return (
    <div className="requirement">
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>标注任务</h1>
      <div className="requirement-form">
        <Form
          form={form}
          autoComplete="off"
          style={{ marginTop: '16px' }}
          layout="inline"
          validateMessages={{
            required: (_, { label }) => `必须填写 ${label}`
          }}
        >
          <FormItem field="name" style={{ marginBottom: 0 }}>
            <InputSearch
              onClear={() => {
                setCurrent(1);
                setSearchValue(null);
                setIsClickClear(true);
              }}
              onSearch={() => {
                getList();
                setCurrent(1);
              }}
              onPressEnter={() => {
                getList();
                setCurrent(1);
              }}
              onChange={(val) => {
                setSearchValue(val);
              }}
              placeholder="输入任务名称搜索"
              allowClear
            />
          </FormItem>
        </Form>
      </div>
      <Table
        border={false}
        columns={columns}
        data={taskData}
        pagination={false}
        noDataElement={noDataElement({
          description: '暂无任务'
          // perms: WORKFLOW_LIST_PERMISSIONS.CAN_CREATE,
        })}
        rowKey="id"
        loading={loading}
        onChange={(pagination, sorter, filters) =>
          handleTableChange(pagination, sorter as SorterInfo, filters)
        }
      />
      {/* 分页 */}
      {taskData && taskData.length > 0 && (
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

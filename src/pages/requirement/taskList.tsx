import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
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
import Success11Icon from '@/pages/workflowConfig/styles/images/op-icons/success1.svg';
import noDataElement from '@/components/no-data';
import { getAnnotationTaskList } from '@/api/dataAnnotation';
import { useUserInfo } from '@/store/userInfoStore';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { IconClockCircle } from '@arco-design/web-react/icon';
import { openNewPage } from '@/utils/env';
import { RequirementTypeNameMap } from './type';
import './index.scss';

enum typeCode {
  TEXT_ENTITY = 'entity', // 实体关系
  TEXT_CLASSIFICATION = 'classification', // 文本分类
  TEXT_QA = 'qa', // 问答
  TEXT_SORT = 'ranking' // 排序
}

export default function Requirement() {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const history = useHistory();
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
  // 创建人的搜索框清楚按钮
  const [isClickClearUserName, setIsClickClearUserName] = useState(false);
  // 创建人查询输入框内容
  const [userNameValue, setUserNameValue] = useState('');

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
    if (isClickClearUserName && userNameValue === '') {
      getList();
      setIsClickClearUserName(false);
    }
  }, [isClickClear, isClickClearUserName]);

  const getList = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: current, //第几页
        pageSize: pageSize, //每页个数
        filters: {
          name: searchValue,
          type: sortValue?.type,
          belong: sortValue?.belong
        }
      };
      const res = await getAnnotationTaskList(params);
      if (res.code === 0 && res.data) {
        setTaskData(res?.data?.result || []);
        setTotal(res.data?.total);
        setLoading(false);
      }
    } catch (error) {
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
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata: any = {
      name: '',
      type: filters?.type,
      belong: filters?.belong
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
      width: 280,
      ellipsis: true,
      className: 'hover-change workflow-name',
      render: (_, record) => {
        return renderEmptyPlaceholder(record.name) !== '-' ? (
          <EllipsisPopover value={record.name} isEdit={false} isLink />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '需求ID',
      dataIndex: 'id',
      width: 80,
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
      width: 100,
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
      title: '所属',
      dataIndex: 'belong',
      width: 100,
      render: (_, record) =>
        record.belong ? (
          <div className="publish-part published">
            <Success11Icon className="mr-[6px] size-[16px]" />
            <span>已上线</span>
          </div>
        ) : (
          <div className="publish-part not-published">
            <IconClockCircle className="mr-[6px] size-[16px]" />
            <span>未上线</span>
          </div>
        ),
      filters: [
        {
          text: '个人',
          value: 1
        },
        {
          text: '组织',
          value: 2
        }
      ]
    },
    {
      // not_started_num 未领取任务数
      // task_total	任务总数
      title: '未领取/总任务量',
      dataIndex: 'task_total', // Changed from 'user_name' to unique dataIndex
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <div>{`${record?.not_started_num}/${record?.task_total}`}</div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 160,
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
      title: '创建人',
      dataIndex: 'user_name',
      key: `user_name+id`,
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
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 160,
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
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>任务列表</h1>
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
          <FormItem field="name">
            <InputSearch
              onClear={() => {
                setCurrent(1);
                setSearchValue(null);
                setIsClickClear(true);
              }}
              onPressEnter={() => {
                getList();
              }}
              onChange={(val) => {
                setSearchValue(val);
              }}
              placeholder="请输入需求名称/创建人"
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
          description: '暂无需求'
          // perms: WORKFLOW_LIST_PERMISSIONS.CAN_CREATE,
        })}
        rowKey="id"
        loading={loading}
        onChange={(pagination, sorter, filters) =>
          handleTableChange(pagination, filters)
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

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
import {
  getWorkflowList,
  workflowDelete,
  workflowCopy
} from '@/api/workflowList';
import { useUserInfo } from '@/store/userInfoStore';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { WORKFLOW_LIST_PERMISSIONS } from '@/config/permissions';
import { IconClockCircle, IconPlus } from '@arco-design/web-react/icon';
import { openNewPage } from '@/utils/env';
import { getAnnotationList, getAnnotationTaskList } from '@/api/dataAnnotation';
import './index.scss';

export default function Requirement() {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const history = useHistory();
  const userInfo = useUserInfo();
  const InputSearch = Input.Search;
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
  // 区分是否点击按钮清空搜索框
  const [isClickClear, setIsClickClear] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState({
    name: '',
    type: '',
    belong: '',
    create_by: ''
  });
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
    if (isClickClear && searchValue === '') {
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
      const params: {
        page: number;
        page_size: number;
        filters: {
          name: string; // 需求名称
          type: number; // 创建人
          belong: number; // 创建人
        };
      } = {
        page: current, //第几页
        page_size: pageSize, //每页个数
        filters: {
          name: searchValue,
          type: Number(sortValue.type),
          belong: Number(sortValue.belong)
        }
      };

      // const res1 = await getAnnotationList(data1).then((res) => {
      //   console.log('object', res);
      // });
      // console.log(res1, '-----top');
      const res = await getAnnotationTaskList(params);
      if (res.status === 200 && res.data) {
        setWorkflowData(res.data.list1 || []);
        setCurrent(res.data.page_info?.page);
        setPageSize(res.data.page_info?.page_size);
        setTotal(res.data.page_info?.total);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // 创建工作流
  const handleCreateWorkflow = () => {
    history.push(`/tenant/compute/modaforge/requirementDetail?type=create`);
  };

  // 查看详情
  const viewDetailWorkflow = (id: number | string) => {
    history.push(
      `/tenant/compute/modaforge/requirementDetail?id=${id}&type=detail`
    );
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
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      name: filters?.name?.[0] || '',
      type: filters?.type?.[0] || '',
      belong: filters?.belong?.[0] || '',
      create_by: userNameValue
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
      title: '需求名称',
      dataIndex: 'workflow_name',
      width: 280,
      ellipsis: true,
      className: 'hover-change workflow-name',
      render: (_, record) => {
        return renderEmptyPlaceholder(record.workflow_name) !== '-' ? (
          <EllipsisPopover
            value={record.workflow_name}
            isEdit={false}
            isLink
            handleLink={() => {
              viewDetailWorkflow(record.id);
            }}
          />
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
            <IconClockCircle className="mr-[6px] size-[16px]" />
            <span>未上线</span>
          </div>
        ),
      filters: [
        {
          text: '图片',
          value: 0
        },
        {
          text: '文本',
          value: 1
        }
      ]
    },
    {
      title: '数据量',
      dataIndex: 'data_volume', // Changed from 'user_name' to unique dataIndex
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.data_volume)} // Updated to correct data field
          isEdit={false}
        />
      )
    },
    {
      title: '状态',
      dataIndex: 'is_online',
      width: 100,
      render: (_, record) =>
        record.is_online ? (
          <div className="publish-part published">
            <span>标注完成</span>
          </div>
        ) : (
          <div className="publish-part not-published">
            <IconClockCircle className="mr-[6px] size-[16px]" />
            <span>发布中</span>
          </div>
        ),
      filters: [
        {
          text: '发布中',
          value: 0
        },
        {
          text: '已发布',
          value: 1
        },
        {
          text: '发布失败',
          value: 1
        }
      ]
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
                viewDetailWorkflow(record.id);
              }}
            >
              详情
            </span>
            {/* )} */}
          </div>
        );
      }
    }
  ];

  return (
    <div className="requirement">
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>需求管理</h1>
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
          <FormItem label="需求名称:" field="name">
            <InputSearch
              onClear={() => {
                setCurrent(1);
                setSearchValue('');
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
        <PermissionWrapper>
          <Button
            type="primary"
            onClick={handleCreateWorkflow}
            loading={loading}
          >
            <IconPlus /> 创建需求
          </Button>
        </PermissionWrapper>
      </div>
      <Table
        border={false}
        columns={columns}
        data={workflowData}
        pagination={false}
        noDataElement={noDataElement({
          description: '暂无需求',
          btnText: (
            <>
              <IconPlus /> 创建需求
            </>
          ),
          // perms: WORKFLOW_LIST_PERMISSIONS.CAN_CREATE,
          handleBtn: () => handleCreateWorkflow()
        })}
        rowKey="id"
        loading={loading}
        onChange={(pagination, sorter, filters) =>
          handleTableChange(pagination, filters)
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

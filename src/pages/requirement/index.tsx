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
  Table,
  Tooltip
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { useUserInfo } from '@/store/userInfoStore';
import { PermissionWrapper } from '@/components/PermissionGuard';
import {
  IconClockCircle,
  IconInfoCircle,
  IconPlus
} from '@arco-design/web-react/icon';
import { getAnnotationList } from '@/api/dataAnnotation';
import {
  RequirementStatus,
  RequirementStatusMap,
  RequirementType,
  RequirementTypeMap
} from './type';
import { isNil, omitBy } from 'lodash';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import './index.scss';

export default function Requirement() {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const history = useHistory();
  const userInfo = useUserInfo();
  const InputSearch = Input.Search;
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化需求列表数据
  const [requirementData, setRequirementData] = useState([]);
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
    if (isClickClear && searchValue === '') {
      getList();
      setIsClickClear(false);
    }
  }, [isClickClear]);

  const getList = async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        page_size: number;
        order: string;
        filters: {
          keyword: string;
          label_type: number | string;
          status: number | string;
        };
      } = {
        page: current || 1, //第几页
        page_size: pageSize || 10, //每页个数
        order: sortValue.order,
        filters: {
          keyword: searchValue,
          label_type: sortValue.label_type,
          status: sortValue.status
        }
      };
      const res = await getAnnotationList(params);
      if (res.code === 0 && res.data) {
        setRequirementData(res.data.result || []);
        setTotal(res.data?.total);
        setLoading(false);
      } else {
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

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      status: filters?.status,
      label_type: filters?.label_type,
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
  // 状态列表内容
  const StatusContent = (status: RequirementStatus) => {
    switch (status) {
      case RequirementStatus.Draft:
        return (
          <div className="status-item">
            <span className="status-draft-icon" />
            <span className="status-text">发布中</span>
          </div>
        );
      case RequirementStatus.Published:
        return (
          <div className="status-item">
            <span className="status-published-icon" />
            <span className="status-text">已发布</span>
          </div>
        );
      case RequirementStatus.PublishFailed:
        return (
          <div className="status-item">
            <span className="status-publishFailed-icon" />
            <span className="status-text">发布失败</span>
          </div>
        );
      case RequirementStatus.Annotated:
        return (
          <div className="status-item">
            <span className="status-annotated-icon" />
            <span className="status-text">标注完成</span>
          </div>
        );
    }
  };
  // table columns
  const columns: ColumnProps[] = [
    {
      title: '需求名称',
      dataIndex: 'name',
      width: 280,
      ellipsis: true,
      className: 'hover-change workflow-name',
      render: (_, record) => {
        return renderEmptyPlaceholder(record.name) !== '-' ? (
          <EllipsisPopover
            value={record.name}
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
      dataIndex: 'label_type',
      width: 100,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.label_type) !== '-' ? (
          <EllipsisPopover
            value={RequirementTypeMap[record.label_type]}
            isEdit={false}
          />
        ) : (
          <span>-</span>
        );
      },
      filters: [
        {
          text: '文本',
          value: RequirementType.Text
        },
        {
          text: '图片',
          value: RequirementType.Image
        },
        {
          text: '音频',
          value: RequirementType.Audio
        },
        {
          text: '视频',
          value: RequirementType.Video
        }
      ]
    },
    {
      title: '数据量',
      dataIndex: 'label_count', // Changed from 'user_name' to unique dataIndex
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.label_count)} // Updated to correct data field
          isEdit={false}
        />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.status) !== '-' ? (
          StatusContent(record.status)
        ) : (
          <span>-</span>
        );
      },
      filters: [
        {
          text: '发布中',
          value: RequirementStatus.Draft
        },
        {
          text: '已发布',
          value: RequirementStatus.Published
        },
        {
          text: '发布失败',
          value: RequirementStatus.PublishFailed
        },
        {
          text: '标注完成',
          value: RequirementStatus.Annotated
        }
      ]
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 220,
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
      dataIndex: 'create_by',
      key: `create_by+id`,
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.create_by)}
          isEdit={false}
        />
      )
    },
    {
      title: '操作',
      dataIndex: 'operate',
      align: 'center',
      fixed: 'right',
      width: 160,
      render: (_, record) => {
        const perms = record.perms || [];
        return (
          <div style={{ display: 'flex' }} className="option-content">
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
                setPageSize(10);
                setSearchValue('');
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
        data={requirementData}
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
          handleTableChange(pagination, sorter as SorterInfo, filters)
        }
      />
      {/* 分页 */}
      {requirementData && requirementData.length > 0 && (
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

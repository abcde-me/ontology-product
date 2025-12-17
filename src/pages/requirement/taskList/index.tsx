import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Form,
  Input,
  Pagination,
  PaginationProps,
  Table,
  Tooltip,
  Space
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { getAnnotationTaskList } from '@/api/dataAnnotation';
import { useHasPermission, useUserInfo } from '@/store/userInfoStore';
import { ANNOTATION_TASK_PERMISSIONS } from '@/config/permissions';
import { openNewPage } from '@/utils/env';
import { RequirementTypeNameMap } from '../type';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { CopyItemIcon } from '@ceai-front/arco-material';
import ImageIcon from '@/assets/annotation/image-column.svg';
import '../index.scss';

function TaskList() {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const userInfo = useUserInfo();
  const InputSearch = Input.Search;
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
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState<any>({});

  // 使用 ref 保存搜索值
  const searchValueRef = useRef('');

  const getList = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: current,
        page_size: pageSize,
        order: sortValue?.order,
        filters: {
          name: searchValueRef.current || null,
          type: sortValue?.type,
          belong: sortValue?.belong
        }
      };
      const res = await getAnnotationTaskList(params);
      if (res.code === 'success') {
        setTaskData(res?.data?.result || []);
        setTotal(res.data?.total);
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, sortValue]);

  // 组件初始化和依赖变化时获取数据
  useEffect(() => {
    if (userInfo) {
      getList();
    }
  }, [userInfo, getList]);

  // 搜索处理
  const handleSearch = (value: string) => {
    searchValueRef.current = value;
    setCurrent(1);
    getList();
  };

  // 标注工具跳转
  const toLabelEditor = (record: Record<string, any>, stage: string) => {
    openNewPage(
      `/modaforge/tenant/compute/modaforge/labelEditor?rId=${record.id}&pkgId=${record.pkg_id}&stage=${stage}`
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

  // 查询是否有权限标注
  const hasPermissionGetTask = useHasPermission(
    ANNOTATION_TASK_PERMISSIONS.GET
  );

  // table数据为空时展示-
  const renderEmptyPlaceholder = (value: string | null) => {
    return value === '' || value == null ? '-' : value;
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '需求名称',
      dataIndex: 'name',
      width: 300,
      ellipsis: true,
      className: 'hover-change requirement-name',
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
          <div className="flex items-center">
            <EllipsisPopover value={record.id} isEdit={false} />
            <CopyItemIcon className="copy-icon" value={record.id} />
          </div>
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '任务包ID',
      dataIndex: 'front_pkg_id',
      width: 100,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.front_pkg_id) !== '-' ? (
          <div className="flex items-center">
            <EllipsisPopover value={record.front_pkg_id} isEdit={false} />
            {/* <CopyItemIcon className="copy-icon" value={record.front_pkg_id} /> */}
          </div>
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
          <div className="flex items-center">
            {record.type === 2 && <ImageIcon style={{ marginRight: 4 }} />}
            {record?.type ? RequirementTypeNameMap[record.type] : '-'}
          </div>
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
      title: '总任务量',
      dataIndex: 'task_total', // Changed from 'user_name' to unique dataIndex
      width: 160,
      ellipsis: true
      // render: (_, record) => (
      //   <div>{`${record?.not_started_num}/${record?.task_total}`}</div>
      // )
    },
    {
      // not_started_num 未领取任务数
      // task_total	任务总数
      title: '未领取',
      dataIndex: 'not_started_num', // Changed from 'user_name' to unique dataIndex
      width: 160,
      ellipsis: true
      // render: (_, record) => (
      //   <div>{`${record?.not_started_num}/${record?.task_total}`}</div>
      // )
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
      width: 120,
      render: (_, record) => {
        return (
          <Space>
            {/* {perms.includes(WORKFLOW_LIST_PERMISSIONS.CAN_GET) && ( */}
            {hasPermissionGetTask && (
              <span
                className="operate-text"
                onClick={() => {
                  toLabelEditor(record, 'LABEL');
                }}
              >
                去标注
              </span>
            )}
            <span
              className="operate-text"
              onClick={() => {
                toLabelEditor(record, 'RELABEL');
              }}
            >
              改错
            </span>
          </Space>
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
              onSearch={handleSearch}
              onClear={() => handleSearch('')}
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
        })}
        rowKey="pkg_id"
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

export default TaskList;

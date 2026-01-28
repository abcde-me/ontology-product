import React from 'react';
import {
  Button,
  Form,
  Input,
  Space,
  Table,
  TableColumnProps,
  Pagination,
  Message
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSearch,
  IconInfoCircle,
  IconFile
} from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  NoDataCard,
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import { useHistory, useParams } from 'react-router-dom';
import { useWorkflowTable } from '../../hooks/useTable';
import styles from './list.module.scss';

// 对象类型数据接口
export interface ObjectTypeItem {
  id: string;
  resourceId: string;
  name: string;
  description: string;
  syncStatus: 'success' | 'running' | 'failed';
  syncTime: string;
  linkCount: number;
  instanceCount: number;
  lastModifiedTime: string;
  iconColor?: string;
}

// 同步状态配置
const SYNC_STATUS_CONFIG = {
  success: {
    text: '成功',
    color: '#00b42a'
  },
  running: {
    text: '运行中',
    color: '#165dff'
  },
  failed: {
    text: '失败',
    color: '#f53f3f'
  }
};

// 模拟数据
const MOCK_DATA: ObjectTypeItem[] = [
  {
    id: 'media_id',
    resourceId: 'media_id',
    name: '气象站',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    syncStatus: 'success',
    syncTime: '2026-10-10 20:10:00',
    linkCount: 2,
    instanceCount: 100,
    lastModifiedTime: '2026-10-10 20:10:00',
    iconColor: 'orangered'
  },
  {
    id: 'type',
    resourceId: 'type',
    name: '战斗机',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    syncStatus: 'running',
    syncTime: '2026-10-10 20:10:00',
    linkCount: 1,
    instanceCount: 324,
    lastModifiedTime: '2026-10-10 20:10:00',
    iconColor: 'arcoblue'
  },
  {
    id: 'source',
    resourceId: 'source',
    name: '无人机',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    syncStatus: 'failed',
    syncTime: '2026-10-10 20:10:00',
    linkCount: 2,
    instanceCount: 123,
    lastModifiedTime: '2026-10-10 20:10:00',
    iconColor: 'green'
  }
];

// 同步状态筛选选项
const SYNC_STATUS_FILTERS = [
  { text: '成功', value: 'success' },
  { text: '运行中', value: 'running' },
  { text: '失败', value: 'failed' }
];

export default function OntologySceneObjectTypeList() {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<ObjectTypeItem, any>({
      service: async (params) => {
        // TODO: 替换为实际API调用
        // 模拟API延迟
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 模拟筛选和分页
        let filteredData = [...MOCK_DATA];
        if (params.keyword) {
          filteredData = filteredData.filter(
            (item) =>
              item.name.includes(params.keyword) ||
              item.id.includes(params.keyword) ||
              item.resourceId.includes(params.keyword)
          );
        }

        const page = params.page || 1;
        const pageSize = params.page_size || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        return {
          data: {
            items: filteredData.slice(start, end),
            total: filteredData.length,
            page,
            page_size: pageSize
          }
        };
      },
      form,
      defaultPageSize: 10
    });

  // 跳转到创建页面
  const handleCreate = () => {
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/create`
    );
  };

  // 跳转到详情/编辑页面
  const handleViewDetail = (record: ObjectTypeItem) => {
    // TODO: 实现跳转到详情页
    console.log('View detail:', record);
  };

  // 处理链接点击
  const handleLinkClick = (record: ObjectTypeItem) => {
    // TODO: 实现跳转到链接列表
    console.log('View links:', record);
  };

  // 处理实例数量点击
  const handleInstanceCountClick = (record: ObjectTypeItem) => {
    // TODO: 实现跳转到实例列表
    console.log('View instances:', record);
  };

  // 处理编辑
  const handleEdit = (record: ObjectTypeItem) => {
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/edit/${record.id}`
    );
  };

  // 处理删除
  const handleDelete = (record: ObjectTypeItem) => {
    // TODO: 实现删除功能
    Message.info(`删除 ${record.name}`);
  };

  // 表格列定义
  const columns: TableColumnProps<ObjectTypeItem>[] = [
    {
      title: '对象类型名称',
      dataIndex: 'name',
      width: 200,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-white"
            style={{
              backgroundColor: record.iconColor || '#165dff'
            }}
          >
            <IconFile />
          </div>
          <div
            className="hover-blue font-PingFangSc text-[14px] font-medium leading-[22px]"
            onClick={() => handleViewDetail(record)}
          >
            {value}
          </div>
        </div>
      )
    },
    {
      title: 'id',
      dataIndex: 'id',
      width: 150,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value}
          </div>
          <CopyItemIcon className="hidden flex-shrink-0" value={value} />
        </div>
      )
    },
    {
      title: '资源id',
      dataIndex: 'resourceId',
      width: 150,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value}
          </div>
          <CopyItemIcon className="hidden flex-shrink-0" value={value} />
        </div>
      )
    },
    {
      title: '描述说明',
      dataIndex: 'description',
      ellipsis: true,
      tooltip: true,
      width: 200
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 120,
      filters: SYNC_STATUS_FILTERS,
      onFilter: (value, record) => record.syncStatus === value,
      render: (value) => {
        const config = SYNC_STATUS_CONFIG[value];
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="font-PingFangSc text-[14px] font-normal leading-[22px]">
              {config.text}
            </span>
            {value === 'failed' && (
              <IconInfoCircle
                className="cursor-pointer text-[#f53f3f]"
                style={{ fontSize: '14px' }}
              />
            )}
          </div>
        );
      }
    },
    {
      title: '同步时间',
      dataIndex: 'syncTime',
      width: 180,
      sorter: true,
      render: (value) => (
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
          {value}
        </div>
      )
    },
    {
      title: '链接',
      dataIndex: 'linkCount',
      width: 100,
      sorter: true,
      render: (value, record) => (
        <div
          className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px]"
          onClick={() => handleLinkClick(record)}
        >
          {value}
        </div>
      )
    },
    {
      title: '实例数量',
      dataIndex: 'instanceCount',
      width: 120,
      sorter: true,
      render: (value, record) => (
        <div
          className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px]"
          onClick={() => handleInstanceCountClick(record)}
        >
          {value}
        </div>
      )
    },
    {
      title: '最新修改时间',
      dataIndex: 'lastModifiedTime',
      width: 180,
      sorter: true,
      render: (value) => (
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
          {value}
        </div>
      )
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size={16}>
          <Button
            type="text"
            className="p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            className="p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className={styles['object-type-list']}>
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          对象类型
        </div>
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          核心数据模型的原子单位,描述系统中可独立存在的实体
        </div>
      </div>
      <SearchTable
        className={styles['object-type-table']}
        searchForm={
          <Form form={form}>
            <Form.Item noStyle field="keyword">
              <Input.Search
                className="w-[220px]"
                placeholder="请输入关键词"
                suffix={<IconSearch />}
                allowClear
                onClear={() => submit()}
                onSearch={() => submit()}
              />
            </Form.Item>
          </Form>
        }
        addButton={
          <ProButton icon={<IconPlus />} onClick={handleCreate}>
            创建对象类型
          </ProButton>
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: 'id',
          border: false,
          pagination: false,
          scroll: { x: true },
          onChange: (pagination, sorter, filters) => {
            onChange(pagination, sorter, filters);
          }
        }}
      />
      {Number(pagination?.total) > 0 && (
        <div className="mt-4 flex items-center justify-end">
          <Pagination
            {...pagination}
            onChange={(page, pageSize) => {
              onChange(
                {
                  ...pagination,
                  current: page,
                  pageSize
                } as any,
                undefined,
                undefined
              );
            }}
          />
        </div>
      )}
    </div>
  );
}

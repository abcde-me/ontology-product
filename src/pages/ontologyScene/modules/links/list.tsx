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
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import { useHistory, useParams } from 'react-router-dom';
import { useWorkflowTable } from '../../hooks/useTable';
import styles from './list.module.scss';

// 链接数据接口
export interface LinkItem {
  id: string;
  name: string;
  sourceObjectType: {
    name: string;
    iconColor: string;
  };
  targetObjectType: {
    name: string;
    iconColor: string;
  };
  linkType: '1:1' | '1:N' | 'N:N';
  syncStatus: 'success' | 'running' | 'failed';
  syncTime: string;
  attributes: string | { count: number; first: string };
  linkCount: number;
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
const MOCK_DATA: LinkItem[] = [
  {
    id: 'media_id',
    name: '类别',
    sourceObjectType: {
      name: '多媒体情报',
      iconColor: '#00b42a'
    },
    targetObjectType: {
      name: '无人机',
      iconColor: '#ffb400'
    },
    linkType: '1:N',
    syncStatus: 'success',
    syncTime: '2026-10-10 20:10:00',
    attributes: { count: 3, first: 'time' },
    linkCount: 32
  },
  {
    id: 'type',
    name: '情报ID',
    sourceObjectType: {
      name: '战斗机',
      iconColor: '#f53f3f'
    },
    targetObjectType: {
      name: '战斗机',
      iconColor: '#f53f3f'
    },
    linkType: '1:1',
    syncStatus: 'running',
    syncTime: '2026-10-10 20:10:00',
    attributes: 'properties',
    linkCount: 24
  },
  {
    id: 'source',
    name: '来源',
    sourceObjectType: {
      name: '操作员',
      iconColor: '#722ed1'
    },
    targetObjectType: {
      name: '无人机',
      iconColor: '#ffb400'
    },
    linkType: 'N:N',
    syncStatus: 'failed',
    syncTime: '2026-10-10 20:10:00',
    attributes: 'properties',
    linkCount: 67
  }
];

// 链接类型筛选选项
const LINK_TYPE_FILTERS = [
  { text: '1:1', value: '1:1' },
  { text: '1:N', value: '1:N' },
  { text: 'N:N', value: 'N:N' }
];

// 同步状态筛选选项
const SYNC_STATUS_FILTERS = [
  { text: '成功', value: 'success' },
  { text: '运行中', value: 'running' },
  { text: '失败', value: 'failed' }
];

export default function OntologySceneLinksList() {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<LinkItem, any>({
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
              item.sourceObjectType.name.includes(params.keyword) ||
              item.targetObjectType.name.includes(params.keyword)
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
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/create`
    );
  };

  // 处理属性点击
  const handleAttributesClick = (record: LinkItem) => {
    // TODO: 实现跳转到属性详情
    console.log('View attributes:', record);
  };

  // 处理链接数点击
  const handleLinkCountClick = (record: LinkItem) => {
    // TODO: 实现跳转到链接详情
    console.log('View link details:', record);
  };

  // 处理编辑
  const handleEdit = (record: LinkItem) => {
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/edit/${record.id}`
    );
  };

  // 处理删除
  const handleDelete = (record: LinkItem) => {
    // TODO: 实现删除功能
    Message.info(`删除 ${record.name}`);
  };

  // 表格列定义
  const columns: TableColumnProps<LinkItem>[] = [
    {
      title: '链接名称',
      dataIndex: 'name',
      width: 150,
      render: (value) => (
        <div className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
          {value}
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
      title: '源对象类型',
      dataIndex: 'sourceObjectType',
      width: 180,
      render: (value: LinkItem['sourceObjectType']) => (
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-white"
            style={{
              backgroundColor: value.iconColor
            }}
          >
            <IconFile style={{ fontSize: '12px' }} />
          </div>
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value.name}
          </div>
        </div>
      )
    },
    {
      title: '目标对象类型',
      dataIndex: 'targetObjectType',
      width: 180,
      render: (value: LinkItem['targetObjectType']) => (
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-white"
            style={{
              backgroundColor: value.iconColor
            }}
          >
            <IconFile style={{ fontSize: '12px' }} />
          </div>
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value.name}
          </div>
        </div>
      )
    },
    {
      title: '链接类型',
      dataIndex: 'linkType',
      width: 120,
      filters: LINK_TYPE_FILTERS,
      onFilter: (value, record) => record.linkType === value,
      render: (value) => (
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
          {value}
        </div>
      )
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
      render: (value) => (
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
          {value}
        </div>
      )
    },
    {
      title: '属性',
      dataIndex: 'attributes',
      width: 150,
      render: (value, record) => {
        if (typeof value === 'string') {
          return (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
              {value}
            </div>
          );
        }
        return (
          <div
            className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
            onClick={() => handleAttributesClick(record)}
          >
            {value.first} 等{value.count}个
          </div>
        );
      }
    },
    {
      title: '链接数',
      dataIndex: 'linkCount',
      width: 120,
      sorter: true,
      render: (value, record) => (
        <div
          className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
          onClick={() => handleLinkCountClick(record)}
        >
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
    <div className={styles['links-list']}>
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          链接
        </div>
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          描述不同实体对象之间的语义联系与数据拓扑结构
        </div>
      </div>
      <SearchTable
        className={styles['links-table']}
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
            创建链接
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

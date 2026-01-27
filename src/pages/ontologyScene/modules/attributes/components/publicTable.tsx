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
import { IconPlus, IconSearch, IconFile } from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import { useHistory, useParams } from 'react-router-dom';
import { useWorkflowTable } from '../../../hooks/useTable';
import styles from '../list.module.scss';

// 公共属性数据接口
export interface PublicAttributeItem {
  id: string;
  name: string;
  description: string;
  objectTypes: Array<{
    name: string;
    color: string;
    icon?: string;
  }>;
  fieldType: string;
  referenceCount: number;
  lastModifiedTime: string;
}

// 模拟数据
const MOCK_DATA: PublicAttributeItem[] = [
  {
    id: 'media_id',
    name: '情报ID',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    objectTypes: [
      {
        name: '多媒体情报',
        color: '#00b42a'
      },
      {
        name: '其他类型1',
        color: '#165dff'
      },
      {
        name: '其他类型2',
        color: '#ff7d00'
      },
      {
        name: '其他类型3',
        color: '#f53f3f'
      }
    ],
    fieldType: 'STRING',
    referenceCount: 32,
    lastModifiedTime: '2026-10-10 20:10'
  },
  {
    id: 'type',
    name: '类别',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    objectTypes: [
      {
        name: '战斗机',
        color: '#f53f3f'
      }
    ],
    fieldType: 'STRING',
    referenceCount: 24,
    lastModifiedTime: '2026-10-10 20:10'
  },
  {
    id: 'source',
    name: '来源',
    description: '占位文字占位文字占位文字占位文字占位文字占位文字',
    objectTypes: [
      {
        name: '无人机',
        color: '#ff7d00'
      }
    ],
    fieldType: 'STRING',
    referenceCount: 67,
    lastModifiedTime: '2026-10-10 20:10'
  }
];

export default function PublicTable() {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<PublicAttributeItem, any>({
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
              item.description.includes(params.keyword)
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
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/attributes/create`
    );
  };

  // 处理编辑
  const handleEdit = (record: PublicAttributeItem) => {
    // TODO: 实现跳转到编辑页面
    console.log('Edit:', record);
  };

  // 处理删除
  const handleDelete = (record: PublicAttributeItem) => {
    // TODO: 实现删除功能
    Message.info(`删除 ${record.name}`);
  };

  // 表格列定义
  const columns: TableColumnProps<PublicAttributeItem>[] = [
    {
      title: '公共属性名称',
      dataIndex: 'name',
      width: 150,
      render: (value) => (
        <div className="font-PingFangSc text-[14px] font-medium leading-[22px] text-[#23293b]">
          {value}
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
      title: '所属对象类型',
      dataIndex: 'objectTypes',
      width: 200,
      render: (value) => {
        if (!value || value.length === 0) {
          return <span className="text-[#86909c]">-</span>;
        }
        const firstType = value[0];
        const remainingCount = value.length - 1;
        return (
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 items-center gap-1 rounded px-2 text-white"
              style={{
                backgroundColor: firstType.color || '#165dff'
              }}
            >
              <IconFile style={{ fontSize: '12px' }} />
              <span className="font-PingFangSc text-[12px] font-normal leading-[20px]">
                {firstType.name}
              </span>
            </div>
            {remainingCount > 0 && (
              <span className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#165dff]">
                +{remainingCount}
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: '支持字段类型',
      dataIndex: 'fieldType',
      width: 150
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
      title: '引用计数',
      dataIndex: 'referenceCount',
      width: 120,
      sorter: true,
      render: (value) => (
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
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
    <div className={styles['public-table-wrapper']}>
      <SearchTable
        className={styles['attributes-table']}
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
            创建公共属性
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

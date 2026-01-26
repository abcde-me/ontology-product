import React from 'react';
import {
  Form,
  Input,
  Table,
  TableColumnProps,
  Pagination,
  Message
} from '@arco-design/web-react';
import { IconSearch, IconLink, IconCheck } from '@arco-design/web-react/icon';
import { CopyItemIcon, SearchTable } from '@ceai-front/arco-material';
import { useWorkflowTable } from '../../../hooks/useTable';
import styles from '../list.module.scss';

// 属性数据接口
export interface AttributeItem {
  id: string;
  name: string;
  objectType: {
    name: string;
    color: string;
    icon?: string;
  };
  tableField: string;
  dataSource: string;
  publicAttribute?: string;
  fieldType: string;
}

// 模拟数据
const MOCK_DATA: AttributeItem[] = [
  {
    id: 'media_id',
    name: '情报ID',
    objectType: {
      name: '多媒体情报',
      color: '#00b42a'
    },
    tableField: 'media_id',
    dataSource: 'Media_DATA_SET',
    publicAttribute: '多媒体情报',
    fieldType: 'STRING'
  },
  {
    id: 'type',
    name: '类别',
    objectType: {
      name: '战斗机',
      color: '#f53f3f'
    },
    tableField: 'type',
    dataSource: 'Media_DATA_SET',
    fieldType: 'STRING'
  },
  {
    id: 'source',
    name: '来源',
    objectType: {
      name: '无人机',
      color: '#ff7d00'
    },
    tableField: 'source',
    dataSource: 'Media_DATA_SET',
    publicAttribute: '无人机',
    fieldType: 'STRING'
  }
];

export default function NormalTable() {
  const [form] = Form.useForm();

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<AttributeItem, any>({
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
              item.tableField.includes(params.keyword) ||
              item.dataSource.includes(params.keyword)
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

  // 处理查看详情
  const handleViewDetail = (record: AttributeItem) => {
    // TODO: 实现跳转到详情页
    console.log('View detail:', record);
  };

  // 表格列定义
  const columns: TableColumnProps<AttributeItem>[] = [
    {
      title: '属性名称',
      dataIndex: 'name',
      width: 150,
      render: (value, record) => (
        <div
          className="hover-blue font-PingFangSc text-[14px] font-medium leading-[22px]"
          onClick={() => handleViewDetail(record)}
        >
          {value}
        </div>
      )
    },
    {
      title: '所属对象类型',
      dataIndex: 'objectType',
      width: 180,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-white"
            style={{
              backgroundColor: value.color || '#165dff'
            }}
          >
            <IconCheck style={{ fontSize: '14px' }} />
          </div>
          <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value.name}
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
      title: '表字段',
      dataIndex: 'tableField',
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
      title: '数据源',
      dataIndex: 'dataSource',
      width: 180
    },
    {
      title: '关联公共属性',
      dataIndex: 'publicAttribute',
      width: 150,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value}
          </div>
        </div>
      )
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      width: 120
    }
  ];

  return (
    <div className={styles['normal-table-wrapper']}>
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

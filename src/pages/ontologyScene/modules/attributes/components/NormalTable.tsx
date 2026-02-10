import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Table,
  TableColumnProps,
  Pagination,
  Message
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  EllipsisPopover,
  SearchTable
} from '@ceai-front/arco-material';
import { useWorkflowTable } from '../../../hooks/useTable';
import styles from '../list.module.scss';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/componens/ObjectTypeDetailDrawer';
import { ObjectTypeTag } from '@/pages/ontologyScene/componens';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import type { PhysicalProperties } from '@/types/graphApi';

// 属性数据接口
export interface AttributeItem {
  id: string;
  name: string;
  objectType: {
    name: string;
    color: string;
    icon?: string;
    id?: string; // 对象类型ID，用于查看详情
  };
  tableField: string;
  dataSource: string;
  publicAttribute?: string;
  fieldType: string;
}

// 根据对象类型名称生成颜色（简单哈希）
const getColorByObjectTypeName = (name: string): string => {
  const colors = [
    '#00b42a',
    '#f53f3f',
    '#ff7d00',
    '#165dff',
    '#722ED1',
    '#f7ba1e',
    '#3491fa',
    '#9fdb1d'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// 将 PhysicalProperties 转换为 AttributeItem
const convertPhysicalPropertiesToAttributeItem = (
  item: PhysicalProperties
): AttributeItem => {
  return {
    id: String(item.id || ''),
    name: item.name || '',
    objectType: {
      name: item.ontologyObjectTypeName || '',
      color: getColorByObjectTypeName(item.ontologyObjectTypeName || ''),
      icon: item.ontologyObjectTypeIcon,
      id: String(item.ontologyObjectTypeId || item.objectTypeID || '')
    },
    tableField: item.tableField || '',
    dataSource: '', // 接口中没有此字段，设为空字符串
    publicAttribute: item.ontologyPublicPropertiesName || undefined,
    fieldType: item.columnType || ''
  };
};

export interface NormalTableProps {
  /** total 变化时的回调函数 */
  onTotalChange?: (total: number) => void;
}

export default function NormalTable({ onTotalChange }: NormalTableProps = {}) {
  const [form] = Form.useForm();
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<{
    id: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    'instances' | 'attributes' | 'links'
  >('attributes');

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<AttributeItem, any>({
      service: async (params) => {
        try {
          // 调用 listOntologyPhysicalProperties 接口
          const response = await listOntologyPhysicalProperties({
            filter: params.keyword || '',
            pageNo: params.page || 1,
            pageSize: params.page_size || 10,
            order: params.order || '',
            orderBy: params.orderBy || ''
          });

          if (response.status === 200 && response.data) {
            // 将 PhysicalProperties 转换为 AttributeItem
            const items = (response.data.result || []).map(
              convertPhysicalPropertiesToAttributeItem
            );

            return {
              data: {
                items,
                total: response.data.totalCount || 0,
                page: params.page || 1,
                page_size: params.page_size || 10
              }
            };
          }

          // 如果接口调用失败，返回空数据
          return {
            data: {
              items: [],
              total: 0,
              page: params.page || 1,
              page_size: params.page_size || 10
            }
          };
        } catch (error) {
          console.error('获取属性列表失败:', error);
          Message.error('获取属性列表失败');
          return {
            data: {
              items: [],
              total: 0,
              page: params.page || 1,
              page_size: params.page_size || 10
            }
          };
        }
      },
      form,
      defaultPageSize: 10
    });

  // 当 total 变化时，通知父组件
  useEffect(() => {
    if (onTotalChange && pagination?.total !== undefined) {
      onTotalChange(pagination.total);
    }
  }, [pagination?.total, onTotalChange]);

  // 处理查看详情：打开对象类型详情抽屉
  const handleViewDetail = (record: AttributeItem) => {
    // 使用对象类型ID打开详情抽屉
    const objectTypeId = record.objectType.id || record.id;
    setSelectedObjectType({ id: objectTypeId });
    setActiveTab('instances');
    setDetailDrawerVisible(true);
  };

  // 表格列定义
  const columns: TableColumnProps<AttributeItem>[] = [
    {
      title: '属性名称',
      dataIndex: 'name',
      width: 150,
      render: (value, record) => (
        <EllipsisPopover value={value || '-'} className="font-[600]" />
      )
    },
    {
      title: '所属对象类型',
      dataIndex: 'objectType',
      width: 180,
      render: (value, record) => (
        <ObjectTypeTag
          ontologyObjectTypeIcon={value.icon}
          ontologyObjectTypeName={value.name}
          ontologyObjectTypeId={value.id}
          onClick={() => handleViewDetail(record)}
        />
      )
    },
    {
      title: '属性id',
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
      title: '数据源',
      dataIndex: 'dataSource',
      width: 180,
      render: (value) => <EllipsisPopover value={value || '-'} />
    },
    {
      title: '关联公共属性',
      dataIndex: 'publicAttribute',
      width: 150,
      render: (value) => (
        <EllipsisPopover value={value || '-'} className="hover-blue" />
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

      {/* 对象类型详情抽屉 */}
      {selectedObjectType && detailDrawerVisible && (
        <ObjectTypeDetailDrawer
          visible={detailDrawerVisible}
          onClose={() => {
            setDetailDrawerVisible(false);
            setSelectedObjectType(null);
          }}
          objectTypeId={selectedObjectType?.id}
          defaultActiveTab={activeTab}
        />
      )}
    </div>
  );
}

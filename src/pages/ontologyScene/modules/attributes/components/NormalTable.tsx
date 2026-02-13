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
import useUrlState from '@ahooksjs/use-url-state';
import { useWorkflowTable } from '../../../hooks/useTable';
import styles from '../list.module.scss';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/componens/ObjectTypeDetailDrawer';
import { ObjectTypeTag } from '@/pages/ontologyScene/componens';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import type { PhysicalProperties } from '@/types/graphApi';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

export interface NormalTableProps {
  /** total 变化时的回调函数 */
  onTotalChange?: (total: number) => void;
}

export default function NormalTable({ onTotalChange }: NormalTableProps = {}) {
  const [form] = Form.useForm();
  const { id: ontologyModelID } = useParams<{ id: string }>();
  const [urlState, setUrlState] = useUrlState({ search: '' });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<{
    id: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    'instances' | 'attributes' | 'links'
  >('attributes');
  const history = useHistory();

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<PhysicalProperties, any>({
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
            return {
              data: {
                items: response.data.result || [],
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

  // 从 URL 的 search 参数同步到表单
  useEffect(() => {
    const currentKeyword = form.getFieldValue('keyword');
    const searchValue = urlState.search || '';
    if (searchValue !== currentKeyword) {
      form.setFieldsValue({ keyword: searchValue });
      // 延迟提交，确保表单值已设置
      setTimeout(() => {
        submit();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlState.search]);

  // 当 total 变化时，通知父组件
  useEffect(() => {
    if (onTotalChange && pagination?.total !== undefined) {
      onTotalChange(pagination.total);
    }
  }, [pagination?.total, onTotalChange]);

  // 处理查看详情：打开对象类型详情抽屉
  const handleViewDetail = (record: PhysicalProperties) => {
    // 使用对象类型ID打开详情抽屉
    const objectTypeId = String(
      record.ontologyObjectTypeId || record.objectTypeID || record.id || ''
    );
    setSelectedObjectType({ id: objectTypeId });
    setActiveTab('instances');
    setDetailDrawerVisible(true);
  };

  const handleViewPublicAttribute = (record: PhysicalProperties) => {
    if (!record.ontologyPublicPropertiesName) {
      return;
    }

    const url = `/tenant/compute/modaforge/ontologyScene/detail/${ontologyModelID}/attributes/list?tab=public&search=${encodeURIComponent(record.ontologyPublicPropertiesName || '')}`;
    history.push(url);
  };

  // 表格列定义
  const columns: TableColumnProps<PhysicalProperties>[] = [
    {
      title: '属性名称',
      dataIndex: 'name',
      fixed: 'left',
      width: 150,
      render: (value, record) => (
        <EllipsisPopover value={value || '-'} className="font-[600]" />
      )
    },
    {
      title: '所属对象类型',
      dataIndex: 'ontologyObjectTypeName',
      width: 180,
      render: (value, record) => (
        <div>
          {value ? (
            <ObjectTypeTag
              ontologyObjectTypeIcon={record.ontologyObjectTypeIcon}
              ontologyObjectTypeName={value}
              ontologyObjectTypeId={String(
                record.ontologyObjectTypeId || record.objectTypeID || ''
              )}
              onClick={() => handleViewDetail(record)}
            />
          ) : (
            <span>-</span>
          )}
        </div>
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
          <CopyItemIcon
            className="hidden flex-shrink-0"
            value={String(value || '')}
          />
        </div>
      )
    },
    {
      title: '数据源',
      dataIndex: 'dataSource',
      width: 180,
      render: () => <EllipsisPopover value="-" />
    },
    {
      title: '关联公共属性',
      dataIndex: 'ontologyPublicPropertiesName',
      width: 150,
      render: (value, record) => (
        <span onClick={() => handleViewPublicAttribute(record)}>
          <EllipsisPopover
            value={value || '-'}
            className={value ? 'hover-blue' : ''}
          />
        </span>
      )
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
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
                onClear={() => {
                  setUrlState({ search: '' });
                  submit();
                }}
                onSearch={(value) => {
                  setUrlState({ search: value || '' });
                  submit();
                }}
              />
            </Form.Item>
          </Form>
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: (record) => String(record.id || ''),
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

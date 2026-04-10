import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  TableColumnProps,
  Pagination,
  Message,
  Checkbox,
  Button
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { CopyItemIcon, SearchTable } from '@ceai-front/arco-material';
import useUrlState from '@ahooksjs/use-url-state';
import { useWorkflowTable } from '../../../hooks/useTable';
import styles from '../list.module.scss';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import { ObjectTypeTag } from '@/pages/ontologyScene/components';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import type { PhysicalProperties } from '@/types/graphApi';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import type { ListOntologyPhysicalPropertiesReq } from '@/types/graphApi';
import { openNewPage } from '@/utils/env';
import { EllipsisPopover } from '@/pages/ontologyScene/components';
import classNames from 'classnames';

export interface NormalTableProps {
  /** total 变化时的回调函数 */
  onTotalChange?: (total: number) => void;
}

export default function NormalTable({ onTotalChange }: NormalTableProps = {}) {
  const [form] = Form.useForm();
  const { id: ontologyModelID } = useParams<{ id: string }>();
  const [urlState, setUrlState] = useUrlState({ search: '', tab: 'normal' });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<{
    id: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    'instances' | 'attributes' | 'links'
  >('attributes');
  const history = useHistory();
  const [objectTypeFilters, setObjectTypeFilters] = useState<
    Array<{ text: string; value: string }>
  >([]);
  const [objectTypeFilterKeys, setObjectTypeFilterKeys] = useState<string[]>(
    []
  );
  // 不随搜索和筛选变化的物理属性总数（用于 Tab 上展示）
  const [allTotal, setAllTotal] = useState<number | undefined>(undefined);

  // 获取对象类型列表用于“所属对象类型”筛选
  useEffect(() => {
    const fetchObjectTypes = async () => {
      try {
        const response = await listOntologyObjectType({
          ontologyModelID: Number(ontologyModelID),
          pageNo: -1,
          pageSize: -1
        });

        if (response.status === 200 && response.data?.result) {
          const filters = response.data.result.map((item) => ({
            text: item.name || '',
            value: String(item.id)
          }));
          setObjectTypeFilters(filters);
        }
      } catch (error) {
        console.error('获取对象类型列表失败:', error);
        Message.error('获取对象类型列表失败');
      }
    };

    if (ontologyModelID) {
      fetchObjectTypes();
    }
  }, [ontologyModelID]);

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<PhysicalProperties, ListOntologyPhysicalPropertiesReq>({
      service: async (params) => {
        try {
          // 调用 listOntologyPhysicalProperties 接口
          const response = await listOntologyPhysicalProperties(params);

          if (response.status === 200 && response.data) {
            const totalCount = response.data.totalCount || 0;

            // 只有在“无搜索关键词且无对象类型筛选”时，才更新全量总数，
            // 确保 Tab 上展示的是物理属性总数，而不是搜索/筛选后的数量。
            if (!params.filter && objectTypeFilterKeys.length === 0) {
              setAllTotal(totalCount);
            }

            return {
              data: {
                items: response.data.result || [],
                total: totalCount,
                page: params.pageNo || 1,
                page_size: params.pageSize || 10
              }
            };
          }

          // 如果接口调用失败，返回空数据
          return {
            data: {
              items: [],
              total: 0,
              page: params.pageNo || 1,
              page_size: params.pageSize || 10
            }
          };
        } catch (error) {
          console.error('获取属性列表失败:', error);
          Message.error('获取属性列表失败');
          return {
            data: {
              items: [],
              total: 0,
              page: params.pageNo || 1,
              page_size: params.pageSize || 10
            }
          };
        }
      },
      form,
      defaultPageSize: 10,
      manual: false,
      formatParams: (formValues, pag, sorter, filters) => {
        return {
          ontologyModelID: Number(ontologyModelID),
          filter: formValues.keyword || '',
          objectTypeIdList: objectTypeFilterKeys.map(Number),
          pageNo: pag.current || 1,
          pageSize: pag.pageSize || 10,
          order: sorter?.direction
            ? sorter.direction === 'ascend'
              ? 'asc'
              : 'desc'
            : undefined,
          orderBy: sorter?.field as string | undefined
        };
      }
    });

  // 从 URL 的 search 参数同步到表单
  useEffect(() => {
    const currentKeyword = form.getFieldValue('keyword');
    const searchValue = urlState.search || '';
    if (
      searchValue !== '' &&
      searchValue !== currentKeyword &&
      urlState.tab === 'normal'
    ) {
      form.setFieldsValue({ keyword: searchValue });
      // 延迟提交，确保表单值已设置
      setTimeout(() => {
        submit();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlState.search]);

  // 当 total / 全量 total 变化时，通知父组件
  useEffect(() => {
    if (!onTotalChange) return;
    // Tab 上展示的数量：优先使用“全量总数”，退化为当前分页 total
    const totalForDisplay =
      allTotal !== undefined
        ? allTotal
        : pagination?.total !== undefined
          ? pagination.total
          : 0;
    onTotalChange(totalForDisplay);
  }, [allTotal, pagination?.total, onTotalChange]);

  // 处理查看详情：打开对象类型详情抽屉
  const handleViewDetail = (record: PhysicalProperties) => {
    setSelectedObjectType({ id: String(record.ontologyObjectTypeId) });
    setActiveTab('instances');
    setDetailDrawerVisible(true);
  };

  const handleViewPublicAttribute = (record: PhysicalProperties) => {
    if (!record.ontologyPublicPropertiesName) {
      return;
    }

    const url = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/attributes/list?tab=public&search=${encodeURIComponent(record.ontologyPublicPropertiesName || '')}`;
    openNewPage(url);
  };

  // 表格列定义
  const columns: TableColumnProps<PhysicalProperties>[] = [
    {
      title: '属性名称',
      dataIndex: 'comment',
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
      filters: objectTypeFilters,
      filterDropdown: ({ setFilterKeys, confirm, clearFilters }: any) => {
        return (
          <div
            className={classNames(
              styles['attributes-table-filter-dropdown'],
              'rounded-[4px] bg-white shadow-md'
            )}
          >
            <div className="max-h-[214px] max-w-[184px] overflow-auto py-[8px] pl-[7px] pr-[12px]">
              <div className="flex gap-[8px]">
                <Checkbox.Group
                  direction="vertical"
                  options={objectTypeFilters.map((item) => ({
                    label: (
                      <EllipsisPopover
                        value={item.text || '-'}
                        wrapperClassName="inline-flex max-w-[130px]"
                        className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
                      />
                    ),
                    value: item.value
                  }))}
                  value={objectTypeFilterKeys}
                  onChange={(values: string[]) => {
                    setObjectTypeFilterKeys(values);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-[8px] border-t border-solid border-[#E2E8F0] bg-white px-3 py-2">
              <Button
                size="small"
                type="outline"
                onClick={() => {
                  // 外部状态与表格内部筛选一起重置
                  setObjectTypeFilterKeys([]);
                  // clearFilters?.();
                  confirm?.();
                }}
              >
                重置
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  // 将外部维护的选中项同步给表格内部的筛选，再确认
                  // setFilterKeys?.(objectTypeFilterKeys);
                  confirm?.();
                }}
              >
                确定
              </Button>
            </div>
          </div>
        );
      },
      filteredValue: objectTypeFilterKeys,
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
      dataIndex: 'name',
      width: 150,
      render: (value) => (
        <div className="flex items-center gap-[4px]">
          <EllipsisPopover
            wrapperClassName="min-w-0 leading-[22px]"
            value={value || '-'}
          >
            {value}
          </EllipsisPopover>
          {value && (
            <CopyItemIcon
              className="flex hidden flex-shrink-0 items-center leading-[22px]"
              value={String(value || '')}
            />
          )}
        </div>
      )
    },
    {
      title: '数据源',
      dataIndex: 'dataSourceName',
      width: 180,
      render: (value) => <EllipsisPopover value={value || '-'} />
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
                autoComplete="off"
                key="normal-search"
                placeholder="请输入属性名称或id搜索"
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
        <div className="mt-[12px] flex items-center justify-end">
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

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
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import type { ListOntologyPhysicalPropertiesReq } from '@/types/graphApi';
import { EllipsisPopover } from '@/pages/ontologyScene/components';
import classNames from 'classnames';
import { repairScenePhysicalProperties } from '@/pages/ontologyScene/services/repairScenePhysicalProperties';

export default function NormalTable() {
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
  const [objectTypeFilters, setObjectTypeFilters] = useState<
    Array<{ text: string; value: string }>
  >([]);
  const [objectTypeFilterKeys, setObjectTypeFilterKeys] = useState<string[]>(
    []
  );
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

  // 进入属性页时自动修复数据资源对象类型的空壳/缺失属性
  useEffect(() => {
    const sceneId = Number(ontologyModelID);
    if (!Number.isFinite(sceneId)) {
      return;
    }

    let canceled = false;

    const runRepair = async () => {
      try {
        const repairResult = await repairScenePhysicalProperties(sceneId);
        if (canceled) {
          return;
        }

        if (repairResult.repairedObjectTypes.length) {
          Message.success(
            `已补全 ${repairResult.repairedObjectTypes.length} 个对象类型的属性`
          );
          refresh();
        } else if (repairResult.errors.length) {
          console.warn('[attributes] 属性补全未完成', repairResult.errors);
        }
      } catch (error) {
        console.error('属性补全失败:', error);
      }
    };

    void runRepair();

    return () => {
      canceled = true;
    };
  }, [ontologyModelID, refresh]);

  // 从 URL 的 search 参数同步到表单
  useEffect(() => {
    const currentKeyword = form.getFieldValue('keyword');
    const searchValue = urlState.search || '';
    if (searchValue !== '' && searchValue !== currentKeyword) {
      form.setFieldsValue({ keyword: searchValue });
      // 延迟提交，确保表单值已设置
      setTimeout(() => {
        submit();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlState.search]);

  // 处理查看详情：打开对象类型详情抽屉
  const handleViewDetail = (record: PhysicalProperties) => {
    setSelectedObjectType({ id: String(record.ontologyObjectTypeId) });
    setActiveTab('instances');
    setDetailDrawerVisible(true);
  };

  // 表格列定义（5 列布局）
  const columns: TableColumnProps<PhysicalProperties>[] = [
    {
      title: '属性名称',
      dataIndex: 'comment',
      width: 240,
      render: (value) => (
        <span className="whitespace-nowrap text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
          {value || '-'}
        </span>
      )
    },
    {
      title: '所属对象类型',
      dataIndex: 'ontologyObjectTypeName',
      width: 280,
      filters: objectTypeFilters,
      filterDropdown: ({ setFilterKeys, confirm, clearFilters }: any) => {
        return (
          <div
            className={classNames(
              styles['attributes-table-filter-dropdown'],
              'rounded-[4px] bg-white shadow-md'
            )}
          >
            <div className="max-h-[214px] max-w-[280px] overflow-auto py-[8px] pl-[7px] pr-[12px]">
              <div className="flex gap-[8px]">
                <Checkbox.Group
                  direction="vertical"
                  options={objectTypeFilters.map((item) => ({
                    label: (
                      <span className="whitespace-nowrap text-[14px] leading-[22px] text-[var(--color-text-1)]">
                        {item.text || '-'}
                      </span>
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
              showFullName
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
      width: 160,
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
      width: 220,
      render: (value) => <EllipsisPopover value={value || '-'} />
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 140,
      render: (value) => (
        <span className="whitespace-nowrap">{value || '-'}</span>
      )
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
          scroll: { x: 1040 },
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

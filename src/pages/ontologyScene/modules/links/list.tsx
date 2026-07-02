import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Button,
  Form,
  Input,
  Space,
  TableColumnProps,
  Pagination,
  Message,
  Checkbox
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  GlobalTooltip,
  SearchTable
} from '@ceai-front/arco-material';
import useUrlState from '@ahooksjs/use-url-state';
import { useHistory, useParams } from 'react-router-dom';
import { useWorkflowTable } from '../../hooks/useTable';
import styles from './list.module.scss';
import LinkDetailDrawer from './components/LinkDetailDrawer';
import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { deleteOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import {
  LinkInfo,
  ListOntologyLinkTypeReq,
  SyncStatus
} from '@/types/graphApi';
import ObjectTypeTag from '@/pages/ontologyScene/components/ObjectTypeTag';
import { getLinkTypeText } from '../../utils';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import { fetchSceneObjectTypes } from '@/utils/enrichLinkTypeObjectTypes';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import { EllipsisPopover, OntoModal } from '@/pages/ontologyScene/components';
import classNames from 'classnames';
import { useOntologySceneDataSync } from '../../hooks/useOntologySceneDataSync';

// 将 SyncStatus 枚举转换为 LinkDetailDrawer 期望的字符串类型
const convertSyncStatusToString = (
  status?: SyncStatus
): 'success' | 'running' | 'failed' => {
  switch (status) {
    case SyncStatus.SUCCESS:
      return 'success';
    case SyncStatus.SYNCING:
      return 'running';
    case SyncStatus.FAILED:
      return 'failed';
    case SyncStatus.NOT_SYNC:
      return 'running';
    default:
      return 'success';
  }
};

export default function OntologySceneLinksList() {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const [urlState, setUrlState] = useUrlState({ search: '' });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [objectTypeDetailDrawerVisible, setObjectTypeDetailDrawerVisible] =
    useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<{
    id: string;
  } | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<
    'instances' | 'attributes'
  >('instances');
  const [selectedLink, setSelectedLink] = useState<LinkInfo | null>(null);
  const [objectTypeFilters, setObjectTypeFilters] = useState<
    Array<{ text: string; value: string }>
  >([]);
  const [sourceObjectTypeFilterKeys, setSourceObjectTypeFilterKeys] = useState<
    string[]
  >([]);
  const [targetObjectTypeFilterKeys, setTargetObjectTypeFilterKeys] = useState<
    string[]
  >([]);
  // 获取对象类型列表用于源/目标对象类型筛选（与链接列表 enrich 共用去重请求）
  const reloadObjectTypeFilters = useCallback(async () => {
    if (!OSId) {
      return;
    }

    try {
      const list = await fetchSceneObjectTypes(Number(OSId));
      const filters = list.map((item) => ({
        text: item.name || '',
        value: String(item.id)
      }));
      setObjectTypeFilters(filters);
    } catch (error) {
      console.error('获取对象类型列表失败:', error);
    }
  }, [OSId]);

  useEffect(() => {
    reloadObjectTypeFilters();
  }, [reloadObjectTypeFilters]);

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<LinkInfo, ListOntologyLinkTypeReq>({
      service: async (params) => {
        try {
          const response = await listOntologyLinkType(params);

          if (!isOntologyApiSuccess(response)) {
            return {
              data: {
                items: [],
                total: 0,
                page: params.pageNo || 1,
                page_size: params.pageSize || 10
              }
            };
          }

          const linkInfos = response.data?.result || [];
          const totalCount = response.data?.totalCount || 0;

          return {
            data: {
              items: linkInfos,
              total: totalCount,
              page: params.pageNo || 1,
              page_size: params.pageSize || 10
            }
          };
        } catch (error) {
          console.error('获取链接列表失败:', error);
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
      formatParams: (formValues, pagination, sorter, filters) => {
        const keyword = formValues.keyword;

        const hasSorter = sorter && sorter.direction;

        const sourceObjectTypeIDList = sourceObjectTypeFilterKeys.map(Number);
        const targetObjectTypeIDList = targetObjectTypeFilterKeys.map(Number);

        return {
          ontologyModelID: Number(OSId),
          filter: keyword || undefined,
          pageNo: pagination.current || 1,
          pageSize: pagination.pageSize || 10,
          sourceObjectTypeIDList,
          targetObjectTypeIDList,
          ...(hasSorter &&
            sorter && {
              orderBy: sorter.field as string,
              order: sorter.direction === 'ascend' ? 'asc' : 'desc'
            })
        };
      }
    });

  const handleSceneDataSync = useCallback(() => {
    refresh();
    reloadObjectTypeFilters();
  }, [refresh, reloadObjectTypeFilters]);

  useOntologySceneDataSync(
    OSId ? Number(OSId) : 0,
    ['objectType', 'link'],
    handleSceneDataSync
  );

  // 从 URL 参数同步到表单和筛选条件
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

  // 跳转到创建页面
  const handleCreate = () => {
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/create`
    );
  };

  // 处理编辑
  const handleEdit = (record: LinkInfo) => {
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/edit/${record.id}`
    );
  };

  // 处理删除
  const handleDelete = (record: LinkInfo) => {
    if (!record.id) {
      Message.error('链接ID无效');
      return;
    }

    OntoModal.confirm({
      title: '确认删除链接吗？',
      content: `删除后，不可恢复`,
      onOk: async () => {
        try {
          const linkId = Number(record.id);
          if (!Number.isFinite(linkId) || linkId <= 0) {
            Message.error('链接ID无效');
            return;
          }

          const response = await deleteOntologyLinkType({ id: linkId });
          if (isOntologyApiSuccess(response)) {
            Message.success('删除成功');
            refresh();
          } else {
            Message.error(response.message || '删除失败');
          }
        } catch (error) {
          Message.error(typeof error === 'string' ? error : '删除失败');
        }
      }
    });
  };

  // 处理查看详情（点击链接名称）
  const handleViewObjectTypeDetail = (record: LinkInfo, isSource = true) => {
    if (isSource) {
      setSelectedObjectType({ id: String(record.sourceObjectTypeID) });
    } else {
      setSelectedObjectType({ id: String(record.targetObjectTypeID) });
    }
    setObjectTypeDetailDrawerVisible(true);
  };

  const handleViewLinkDetail = (record: LinkInfo) => {
    setSelectedLink(record);
    setDetailActiveTab('instances');
    setDetailDrawerVisible(true);
  };

  // 表格列定义
  const columns: TableColumnProps<LinkInfo>[] = [
    {
      title: '链接名称',
      dataIndex: 'name',
      width: 150,
      fixed: 'left',
      render: (value, record) => (
        <div onClick={() => handleViewLinkDetail(record)}>
          <GlobalTooltip.Ellipsis
            className="hover-blue min-w-0 cursor-pointer font-[600]"
            text={value}
          />
        </div>
      )
    },
    {
      title: '链接id',
      dataIndex: 'code',
      width: 150,
      render: (value) => (
        <div className="flex items-center gap-[4px]">
          <EllipsisPopover wrapperClassName="min-w-0" value={value} />
          {value && (
            <CopyItemIcon className="hidden flex-shrink-0" value={value} />
          )}
        </div>
      )
    },
    {
      title: '源对象类型',
      dataIndex: 'sourceObjectType',
      minWidth: 200,
      filters: objectTypeFilters,
      filterDropdown: ({ confirm }: any) => {
        return (
          <div
            className={classNames(
              styles['links-table-filter-dropdown'],
              'rounded-[4px] bg-white shadow-md'
            )}
          >
            <div className="max-h-[214px] max-w-[184px] overflow-auto py-[8px] pl-[7px] pr-[12px]">
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
                  value={sourceObjectTypeFilterKeys}
                  onChange={(values: string[]) => {
                    setSourceObjectTypeFilterKeys(values);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-[8px] border-t border-solid border-[#E2E8F0] bg-white px-3 py-2">
              <Button
                size="small"
                type="outline"
                onClick={() => {
                  setSourceObjectTypeFilterKeys([]);
                  confirm?.();
                }}
              >
                重置
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  confirm?.();
                }}
              >
                确定
              </Button>
            </div>
          </div>
        );
      },
      filteredValue: sourceObjectTypeFilterKeys,
      render: (_, record) => {
        return (
          <div>
            {record.sourceObjectTypeID ? (
              <ObjectTypeTag
                showFullName
                ontologyObjectTypeIcon={record.sourceObjectTypeIcon}
                ontologyObjectTypeName={record.sourceObjectTypeName || ''}
                ontologyObjectTypeId={record.sourceObjectTypeID}
                onClick={() => handleViewObjectTypeDetail(record)}
              />
            ) : (
              <span>-</span>
            )}
          </div>
        );
      }
    },
    {
      title: '目标对象类型',
      dataIndex: 'targetObjectType',
      minWidth: 200,
      filters: objectTypeFilters,
      filterDropdown: ({ confirm }: any) => {
        return (
          <div
            className={classNames(
              styles['links-table-filter-dropdown'],
              'rounded-[4px] bg-white shadow-md'
            )}
          >
            <div className="max-h-[214px] max-w-[184px] overflow-auto py-[8px] pl-[7px] pr-[12px]">
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
                  value={targetObjectTypeFilterKeys}
                  onChange={(values: string[]) => {
                    setTargetObjectTypeFilterKeys(values);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-[8px] border-t border-solid border-[#E2E8F0] bg-white px-3 py-2">
              <Button
                size="small"
                type="outline"
                onClick={() => {
                  setTargetObjectTypeFilterKeys([]);
                  confirm?.();
                }}
              >
                重置
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  confirm?.();
                }}
              >
                确定
              </Button>
            </div>
          </div>
        );
      },
      filteredValue: targetObjectTypeFilterKeys,
      render: (_, record) => {
        return (
          <div>
            {record.targetObjectTypeID ? (
              <ObjectTypeTag
                showFullName
                ontologyObjectTypeIcon={record.targetObjectTypeIcon}
                ontologyObjectTypeName={record.targetObjectTypeName || ''}
                ontologyObjectTypeId={record.targetObjectTypeID}
                onClick={() => handleViewObjectTypeDetail(record, false)}
              />
            ) : (
              <span>-</span>
            )}
          </div>
        );
      }
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size={16}>
          <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
            <Button
              type="text"
              className="p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.DELETE}>
            <Button
              type="text"
              className="p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary"
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </PermissionWrapper>
        </Space>
      )
    }
  ];

  const drawerData = useMemo(() => {
    if (!selectedLink) return undefined;
    // 暂时使用固定值，后续可以从其他接口获取
    const attributeCount = 0;
    const instanceCount = 0;

    return {
      id: String(selectedLink.id || selectedLink.code || ''),
      name: selectedLink.name || '',
      syncStatus: convertSyncStatusToString(selectedLink.syncStatus),
      linkType: getLinkTypeText(selectedLink.type),
      sourceObjectType: {
        id: selectedLink.sourceObjectTypeID,
        name: selectedLink.sourceObjectTypeName || '',
        iconColor: undefined // ObjectTypeTag 使用 icon 而不是 iconColor
      },
      targetObjectType: {
        id: selectedLink.targetObjectTypeID,
        name: selectedLink.targetObjectTypeName || '',
        iconColor: undefined // ObjectTypeTag 使用 icon 而不是 iconColor
      },
      instanceCount,
      attributeCount
    };
  }, [selectedLink]);

  return (
    <div className={styles['links-list']}>
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          链接
        </div>
        <div className="mb-[16px] font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          描述不同实体对象之间的语义联系与数据拓扑结构
        </div>
      </div>
      <SearchTable
        className={styles['links-table']}
        searchForm={
          <Form form={form}>
            <Form.Item noStyle field="keyword">
              <Input.Search
                autoComplete="off"
                className="w-[220px]"
                placeholder="请输入链接名称或id搜索"
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
        addButton={
          <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.CREATE}>
            <Button type={'outline'} icon={<IconPlus />} onClick={handleCreate}>
              创建链接
            </Button>
          </PermissionWrapper>
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: (record) => String(record.id || record.code || ''),
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

      {/* 链接详情抽屉 */}
      {detailDrawerVisible && (
        <LinkDetailDrawer
          visible={detailDrawerVisible}
          onClose={() => {
            setDetailDrawerVisible(false);
            setSelectedLink(null);
          }}
          linkId={
            selectedLink?.id ? String(selectedLink.id) : selectedLink?.code
          }
          data={drawerData as any}
          defaultActiveTab={detailActiveTab}
        />
      )}

      {/* 对象类型详情抽屉 */}
      {objectTypeDetailDrawerVisible && (
        <ObjectTypeDetailDrawer
          objectTypeId={selectedObjectType?.id}
          visible={objectTypeDetailDrawerVisible}
          onClose={() => {
            setObjectTypeDetailDrawerVisible(false);
            setSelectedObjectType(null);
          }}
        />
      )}
    </div>
  );
}

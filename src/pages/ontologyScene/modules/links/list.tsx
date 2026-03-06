import React, { useMemo, useState, useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Space,
  TableColumnProps,
  Pagination,
  Message,
  Modal,
  Popover,
  Checkbox
} from '@arco-design/web-react';
import { IconPlus, IconSearch } from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  DotStatus,
  EllipsisPopover,
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import useUrlState from '@ahooksjs/use-url-state';
import { useHistory, useParams } from 'react-router-dom';
import { useWorkflowTable } from '../../hooks/useTable';
import styles from './list.module.scss';
import LinkDetailDrawer from './components/LinkDetailDrawer';
import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { deleteOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import {
  LinkInfo,
  LinkType,
  ListOntologyLinkTypeReq,
  SyncStatus
} from '@/types/graphApi';
import ObjectTypeTag from '@/pages/ontologyScene/componens/ObjectTypeTag';
import dayjs from 'dayjs';
import {
  OBJECT_TYPE_SYNC_STATUS_CONFIG,
  OBJECT_TYPE_SYNC_STATUS_FILTERS
} from '../../common/constants';
import { getLinkTypeText } from '../../utils';
import ObjectTypeDetailDrawer from '../../componens/ObjectTypeDetailDrawer';
import TaskLogDrawer from '../../componens/TaskLogDrawer';
import { getLinkTypeSyncTaskLog } from '@/api/ontologySceneLibrary/links';
import LogIcon from '../../assets/log-icon.svg';
import { listOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import type { ListOntologyObjectTypeReq, ObjectType } from '@/types/objectType';

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

// 链接类型筛选选项
const LINK_TYPE_FILTERS = [
  { text: '1:1', value: '1:1' },
  { text: '1:N', value: '1:N' },
  { text: 'N:N', value: 'N:N' }
];

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
  const [logDrawerVisible, setLogDrawerVisible] = useState(false);
  const [logTaskId, setLogTaskId] = useState<number | null>(null);
  const [logTaskName, setLogTaskName] = useState<string | undefined>();
  const [objectTypeFilters, setObjectTypeFilters] = useState<
    Array<{ text: string; value: string }>
  >([]);
  const [sourceObjectTypeFilterKeys, setSourceObjectTypeFilterKeys] = useState<
    string[]
  >([]);
  const [targetObjectTypeFilterKeys, setTargetObjectTypeFilterKeys] = useState<
    string[]
  >([]);

  // 获取对象类型列表用于源/目标对象类型筛选
  useEffect(() => {
    const fetchObjectTypes = async () => {
      try {
        const params: ListOntologyObjectTypeReq = {
          ontologyModelID: OSId ? Number(OSId) : undefined,
          pageNo: -1,
          pageSize: -1
        };
        const res = await listOntologyObjectType(params);
        const list: ObjectType[] = res.data?.result || [];
        const filters = list.map((item) => ({
          text: item.name || '',
          value: String(item.id)
        }));
        setObjectTypeFilters(filters);
      } catch (error) {
        console.error('获取对象类型列表失败:', error);
        Message.error('获取对象类型列表失败');
      }
    };

    if (OSId) {
      fetchObjectTypes();
    }
  }, [OSId]);

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<LinkInfo, ListOntologyLinkTypeReq>({
      service: async (params) => {
        try {
          const response = await listOntologyLinkType(params);

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
          Message.error('获取链接列表失败');
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

        const syncStatusValues = filters?.syncStatus || [];
        const typeFilterValues = filters?.type || [];

        const syncStatusList = Array.isArray(syncStatusValues)
          ? syncStatusValues
          : syncStatusValues !== undefined
            ? [syncStatusValues]
            : undefined;

        const typeList: LinkType[] | undefined = Array.isArray(typeFilterValues)
          ? typeFilterValues
              .map((val) => {
                switch (val) {
                  case '1:1':
                    return LinkType.ONE_TO_ONE;
                  case '1:N':
                    return LinkType.ONE_TO_MANY;
                  case 'N:N':
                    return LinkType.MANY_TO_MANY;
                  default:
                    return undefined;
                }
              })
              .filter((v): v is LinkType => v !== undefined)
          : undefined;

        const hasSorter = sorter && sorter.direction;

        const sourceObjectTypeIDList = sourceObjectTypeFilterKeys.map(Number);
        const targetObjectTypeIDList = targetObjectTypeFilterKeys.map(Number);

        return {
          ontologyModelID: Number(OSId),
          filter: keyword || undefined,
          pageNo: pagination.current || 1,
          pageSize: pagination.pageSize || 10,
          ...(syncStatusList && syncStatusList.length
            ? { syncStatusList }
            : {}),
          ...(typeList && typeList.length ? { typeList } : {}),
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

  // 跳转到创建页面
  const handleCreate = () => {
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/create`
    );
  };

  // 处理属性点击
  const handleAttributesClick = (record: LinkInfo) => {
    setSelectedLink(record);
    setDetailActiveTab('attributes');
    setDetailDrawerVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: LinkInfo) => {
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/edit/${record.id}`
    );
  };

  // 处理删除
  const handleDelete = (record: LinkInfo) => {
    if (!record.id) {
      Message.error('链接ID无效');
      return;
    }

    Modal.confirm({
      title: '确认删除链接吗？',
      content: `删除后，不可恢复`,
      onOk: async () => {
        try {
          const response = await deleteOntologyLinkType({ id: record.id! });
          if (response.status === 200 && response.code === '') {
            Message.success('删除成功');
            refresh();
          } else {
            Message.error(response.message || '删除失败');
          }
        } catch (error) {
          Message.error('删除失败');
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

  // 处理查看日志
  const handleViewLog = (record: LinkInfo) => {
    if (!record.id) {
      Message.error('链接ID无效');
      return;
    }
    setLogTaskId(record.id);
    setLogTaskName(record.name);
    setLogDrawerVisible(true);
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
          <EllipsisPopover
            wrapperClassName="min-w-0 hover-blue font-[600]"
            value={value}
          />
        </div>
      )
    },
    {
      title: '链接id',
      dataIndex: 'code',
      width: 150,
      render: (value) => (
        <div className="flex items-center gap-2">
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
      width: 180,
      filters: objectTypeFilters,
      filterDropdown: ({ confirm }: any) => {
        return (
          <div className="rounded-[4px] bg-white shadow-md">
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
      width: 180,
      filters: objectTypeFilters,
      filterDropdown: ({ confirm }: any) => {
        return (
          <div className="rounded-[4px] bg-white shadow-md">
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
      title: '链接类型',
      dataIndex: 'type',
      width: 120,
      filters: LINK_TYPE_FILTERS,
      render: (value) => (
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
          {getLinkTypeText(value)}
        </div>
      )
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 120,
      filters: OBJECT_TYPE_SYNC_STATUS_FILTERS,
      render: (value: SyncStatus, record: LinkInfo) => {
        if (value === undefined || value === null) {
          return null;
        }
        const config = OBJECT_TYPE_SYNC_STATUS_CONFIG[value];
        return (
          <div className="flex items-center gap-[4px]">
            <DotStatus text={config.text} color={config.color} />
            {value === SyncStatus.FAILED && (
              <Popover content="查看日志">
                <LogIcon
                  className="h-[14px] w-[14px] text-[var(--color-text-4)] hover:cursor-pointer hover:text-[#184FF2]"
                  onClick={() => handleViewLog(record)}
                />
              </Popover>
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
        <div>{value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
      )
    },
    {
      title: '属性',
      dataIndex: 'attributes',
      width: 150,
      render: (_, record) => {
        // 暂时使用固定值，后续可以从其他接口获取
        const value = 'properties';
        return (
          <div className="text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value}
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
          <ProButton icon={<IconPlus />} onClick={handleCreate}>
            创建链接
          </ProButton>
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

      {/* 日志抽屉 */}
      {logTaskId !== null && (
        <TaskLogDrawer
          visible={logDrawerVisible}
          taskInstanceId={logTaskId}
          taskName={logTaskName}
          onClose={() => setLogDrawerVisible(false)}
          fetchLog={getLinkTypeSyncTaskLog}
        />
      )}
    </div>
  );
}

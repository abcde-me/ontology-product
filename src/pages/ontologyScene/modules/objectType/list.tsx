import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Space,
  TableColumnProps,
  Pagination,
  Message,
  Switch,
  Popover
} from '@arco-design/web-react';
import {
  IconPlus,
  IconRefresh,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  DotStatus,
  SearchTable
} from '@ceai-front/arco-material';
import useUrlState from '@ahooksjs/use-url-state';
import { useHistory, useParams } from 'react-router-dom';
import { debounce } from 'lodash-es';
import { useWorkflowTable } from '../../hooks/useTable';
import ObjectTypeDetailDrawer from '@/pages/ontologyScene/components/ObjectTypeDetailDrawer';
import TaskLogDrawer from '@/pages/ontologyScene/components/TaskLogDrawer';
import {
  listOntologyObjectType,
  deleteOntologyObjectType,
  syncObjectTypeTask,
  getObjectTypeSyncLog
} from '@/api/ontologySceneLibrary/objectType';
import { ObjectType, ListOntologyObjectTypeReq } from '@/types/objectType';
import { SyncStatus } from '@/types/graphApi';
import styles from './list.module.scss';
import {
  OBJECT_TYPE_SYNC_STATUS_CONFIG,
  OBJECT_TYPE_ICON_OPTIONS
} from '../../common/constants';
import dayjs from 'dayjs';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { ONTOLOGY_PERMISSIONS } from '@/config/permissions';
import LogIcon from '@/pages/ontologyScene/assets/log-icon.svg';
import { EllipsisPopover, OntoModal } from '@/pages/ontologyScene/components';

export default function OntologySceneObjectTypeList() {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id: ontologyModelID } = useParams<{ id: string }>();
  const [urlState, setUrlState] = useUrlState({ search: '' });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedObjectType, setSelectedObjectType] =
    useState<ObjectType | null>(null);
  const [activeTab, setActiveTab] = useState<
    'instances' | 'attributes' | 'links'
  >('instances');

  const [logDrawerVisible, setLogDrawerVisible] = useState(false);
  const [currentSyncTaskId, setCurrentSyncTaskId] = useState<number | null>(
    null
  );
  const [currentTaskName, setCurrentTaskName] = useState<string>('');

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<ObjectType, ListOntologyObjectTypeReq>({
      service: async (params) => {
        try {
          const response = await listOntologyObjectType(params);

          if (response.status === 200 && response.code === '') {
            const items = response.data?.result || [];

            return {
              data: {
                items,
                total: response.data?.totalCount || 0,
                page: params.pageNo || 1,
                page_size: params.pageSize || 10
              }
            };
          } else {
            Message.error(response.message || '获取列表失败');
            return {
              data: {
                items: [],
                total: 0,
                page: params.pageNo || 1,
                page_size: params.pageSize || 10
              }
            };
          }
        } catch (error) {
          Message.error('获取列表失败');
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
        const params: ListOntologyObjectTypeReq = {
          filter: formValues.keyword || undefined,
          ontologyModelID: ontologyModelID
            ? Number(ontologyModelID)
            : undefined,
          pageNo: pagination.current,
          pageSize: pagination.pageSize
        };

        if (sorter && sorter.direction) {
          params.order = sorter.direction === 'ascend' ? 'asc' : 'desc';
          params.orderBy = sorter.field as string;
        }

        // 同步状态筛选交给服务端处理，支持多选
        if (filters?.syncStatus && filters.syncStatus.length > 0) {
          params.syncStatusList = filters.syncStatus as SyncStatus[];
        }

        return params;
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
      `/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/objectType/create`
    );
  };

  // 跳转到详情/编辑页面
  const handleViewDetail = (
    record: ObjectType,
    tab?: 'instances' | 'attributes' | 'links'
  ) => {
    setSelectedObjectType(record);
    if (tab) {
      setActiveTab(tab);
    }
    setDetailDrawerVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: ObjectType) => {
    if (!record.id) {
      Message.error('对象类型ID无效');
      return;
    }
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/objectType/edit/${record.id}`
    );
  };

  // 处理配置实例同步
  const handleConfigureSync = (record: ObjectType) => {
    if (!record.id) {
      Message.error('对象类型ID无效');
      return;
    }
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/objectType/edit/${record.id}?step=3`
    );
  };

  // 处理删除
  const handleDelete = (record: ObjectType) => {
    OntoModal.confirm({
      title: '确认删除对象类型吗？',
      content: `删除后，不可恢复`,
      onOk: async () => {
        try {
          if (!record.id) {
            Message.error('对象类型ID无效');
            return;
          }

          const response = await deleteOntologyObjectType({ id: record.id });

          if (response.status === 200 && response.code === '') {
            Message.success('删除成功');
            // 重新加载列表
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

  // 查看同步日志
  const handleViewSyncLog = (record: ObjectType) => {
    if (!record.id) {
      Message.error('对象类型ID无效');
      return;
    }

    setCurrentSyncTaskId(record.id);
    setCurrentTaskName(record.name || '');
    setLogDrawerVisible(true);
  };

  // 失败重试（防抖处理）
  const handleRetrySync = debounce(async (record: ObjectType) => {
    if (!record.id) {
      Message.error('对象类型ID无效');
      return;
    }

    try {
      const res = await syncObjectTypeTask({ id: record.id });
      if (res.status === 200 && res.code === '') {
        Message.success('重新同步成功');
        // 重新刷新列表，获取最新状态
        refresh();
      } else {
        Message.error(res.message || '重新同步失败');
      }
    } catch (e) {
      Message.error('重新同步失败');
    }
  }, 500);

  // 表格列定义
  const columns: TableColumnProps<ObjectType>[] = [
    {
      title: '对象类型名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      fixed: 'left',
      render: (value, record) => {
        // 根据 icon 字段匹配对应的图标
        const iconOption = OBJECT_TYPE_ICON_OPTIONS.find(
          (option) => option.value === record.icon
        );
        const IconComponent =
          iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

        return (
          <div
            className="flex items-center gap-[8px]"
            onClick={() => handleViewDetail(record)}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded text-white">
              <IconComponent className="h-6 w-6" />
            </div>
            <EllipsisPopover
              className="hover-blue text-[14px] font-[500] leading-[22px]"
              value={value}
              isEdit={false}
              preferTypography
            />
          </div>
        );
      }
    },
    {
      title: '描述说明',
      dataIndex: 'description',
      ellipsis: true,
      tooltip: true,
      width: 200,
      render: (value) => (
        <div>
          {value ? <EllipsisPopover value={value} isEdit={false} /> : '-'}
        </div>
      )
    },
    {
      title: '对象类型id',
      dataIndex: 'code',
      width: 200,
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
      title: '实例同步任务',
      dataIndex: 'syncEnabled',
      width: 200,
      render: (_, record) => {
        // 如果 enableSyncSourceData 为 false，显示"未配置 配置"
        if (!record.enableSyncSourceData) {
          return (
            <div className="flex items-center gap-[4px]">
              <span className="text-[#334155]">未配置</span>
              <span
                className="cursor-pointer text-[#184FF2] hover:underline"
                onClick={() => handleConfigureSync(record)}
              >
                配置
              </span>
            </div>
          );
        }

        // 如果 enableSyncSourceData 为 true，根据 syncEnabled 显示 Switch
        return <Switch checked={record.syncEnabled} disabled size="small" />;
      }
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 120,
      // filters: OBJECT_TYPE_SYNC_STATUS_FILTERS,
      render: (value: SyncStatus, record: ObjectType) => {
        if (value === undefined || value === null) {
          return null;
        }
        const config = OBJECT_TYPE_SYNC_STATUS_CONFIG[value];
        const isFailed = value === SyncStatus.FAILED;

        return (
          <div className="flex items-center gap-[4px]">
            <DotStatus text={config.text} color={config.color} />
            {isFailed && (
              <Popover
                trigger="hover"
                position="top"
                content={
                  <div className="flex items-center gap-[12px]">
                    <span
                      className="flex cursor-pointer items-center text-[#184FF2]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSyncLog(record);
                      }}
                    >
                      <LogIcon className="mr-[4px] h-[14px] w-[14px]" />
                      查看日志
                    </span>
                    <span
                      className="flex cursor-pointer items-center text-[#184FF2]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetrySync(record);
                      }}
                    >
                      <IconRefresh
                        className="mr-[4px] h-[14px] w-[14px]"
                        onClick={() => handleRetrySync(record)}
                      />
                      重试
                    </span>
                  </div>
                }
              >
                <IconQuestionCircle className="h-[14px] w-[14px] cursor-pointer text-[var(--color-text-4)] hover:text-[#184FF2]" />
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
      title: '最新修改时间',
      dataIndex: 'updateTime',
      width: 180,
      sorter: true,
      render: (value) => (
        <div>{value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
      )
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

  return (
    <div className={styles['object-type-list']}>
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          对象类型
        </div>
        <div className="mb-[16px] font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
          核心数据模型的原子单位,描述系统中可独立存在的实体
        </div>
      </div>
      <SearchTable
        className={styles['object-type-table']}
        searchForm={
          <Form form={form}>
            <Form.Item noStyle field="keyword">
              <Input.Search
                autoComplete="off"
                className="w-[230px]"
                placeholder="请输入对象类型名称或id搜索"
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
            <Button type="outline" icon={<IconPlus />} onClick={handleCreate}>
              创建对象类型
            </Button>
          </PermissionWrapper>
        }
        tableProps={{
          columns,
          data,
          loading,
          rowKey: (record) => record.id?.toString() || '',
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
          objectTypeId={selectedObjectType?.id?.toString() || ''}
          defaultActiveTab={activeTab}
        />
      )}
      {logDrawerVisible && currentSyncTaskId && (
        <TaskLogDrawer
          visible={logDrawerVisible}
          taskInstanceId={currentSyncTaskId}
          taskName={currentTaskName}
          onClose={() => {
            setLogDrawerVisible(false);
            setCurrentSyncTaskId(null);
            setCurrentTaskName('');
          }}
          fetchLog={getObjectTypeSyncLog}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  Space,
  TableColumnProps,
  Pagination,
  Message,
  Switch,
  Popover,
  Tooltip
} from '@arco-design/web-react';
import {
  IconDown,
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
  getObjectTypeSyncLog,
  startSyncObjectTypeTask,
  pauseSyncObjectTypeTask
} from '@/api/ontologySceneLibrary/objectType';
import {
  configureDataResourceInstanceSync,
  isDataResourceBackedObjectTypeFromRecord
} from '@/pages/ontologyScene/modules/objectType/services/configureDataResourceInstanceSync';
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
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { bindOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import type { ObjectTypeQueryRow } from '@/pages/exploreAnalysis/ontologyQuery/types';
import { invalidateObjectTypeQueryCache } from '@/pages/exploreAnalysis/ontologyQuery/services/objectTypeQuery';
import { SelectExistingObjectTypeModal } from './components/SelectExistingObjectTypeModal';
import { useOntologySceneDataSync } from '../../hooks/useOntologySceneDataSync';

const MenuItem = Menu.Item;

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
  const [switchLoadingIds, setSwitchLoadingIds] = useState<Set<number>>(
    new Set()
  );
  const [selectExistingVisible, setSelectExistingVisible] = useState(false);
  const [selectExistingLoading, setSelectExistingLoading] = useState(false);

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<ObjectType, ListOntologyObjectTypeReq>({
      service: async (params) => {
        try {
          const response = await listOntologyObjectType(params);

          if (isOntologyApiSuccess(response)) {
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

  useOntologySceneDataSync(
    ontologyModelID ? Number(ontologyModelID) : 0,
    ['objectType'],
    refresh
  );

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

  const createPagePath = `/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/objectType/create`;

  const handleCreateNew = () => {
    history.push(createPagePath);
  };

  const boundObjectTypeCodes = useMemo(
    () =>
      new Set(
        (data || [])
          .map((item) => item.code?.trim())
          .filter((code): code is string => Boolean(code))
      ),
    [data]
  );

  const handleSelectExisting = async (record: ObjectTypeQueryRow) => {
    if (!record.id) {
      Message.error('对象类型ID无效');
      return;
    }

    if (!ontologyModelID) {
      Message.error('场景库ID无效');
      return;
    }

    const objectTypeCode = record.code?.trim();
    if (objectTypeCode && boundObjectTypeCodes.has(objectTypeCode)) {
      Message.warning('当前场景库已绑定该对象类型');
      return;
    }

    setSelectExistingLoading(true);
    try {
      const response = await bindOntologyObjectType({
        ontologyModelID: Number(ontologyModelID),
        objectTypeID: record.id
      });

      if (isOntologyApiSuccess(response)) {
        Message.success('绑定成功');
        setSelectExistingVisible(false);
        invalidateObjectTypeQueryCache();
        refresh();
        return;
      }

      Message.error(response.message || '绑定失败，请重试');
    } catch (error) {
      console.error('绑定对象类型失败:', error);
      Message.error('绑定失败，请重试');
    } finally {
      setSelectExistingLoading(false);
    }
  };

  const createDropdown = (
    <Menu>
      <MenuItem key="new" onClick={handleCreateNew}>
        新建对象类型
      </MenuItem>
      <MenuItem key="existing" onClick={() => setSelectExistingVisible(true)}>
        选择已有对象类型
      </MenuItem>
    </Menu>
  );

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

  const handleInstanceSync = (record: ObjectType) => {
    if (!record.id) {
      Message.error('对象类型ID无效');
      return;
    }

    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/objectType/edit/${record.id}?step=3`
    );
  };

  // 处理同步任务开关（防抖处理）
  const handleSyncToggle = debounce(
    async (record: ObjectType, checked: boolean) => {
      if (!record.id) {
        Message.error('对象类型ID无效');
        return;
      }

      // 添加 loading 状态
      setSwitchLoadingIds((prev) => new Set(prev).add(record.id));

      try {
        // 首次开启：后端尚未分配 funnel_task_id，走 SyncObjectTypeTask 创建并执行同步
        if (!record.funnel_task_id) {
          if (!checked) {
            Message.info('同步任务尚未创建，无需关闭');
            refresh();
            return;
          }

          // 数据资源已标记开启同步但策略未落库时，先补全配置再触发任务
          if (
            record.enableSyncSourceData &&
            isDataResourceBackedObjectTypeFromRecord(record)
          ) {
            const repairResult = await configureDataResourceInstanceSync(
              record.id
            );
            if (repairResult.ok) {
              Message.success(repairResult.message);
              refresh();
            } else {
              Message.error(repairResult.message);
              refresh();
            }
            return;
          }

          const res = await syncObjectTypeTask({ id: record.id });
          if (res.status === 200 && res.code === '') {
            Message.success('已触发实例同步，请稍后查看同步状态');
            refresh();
          } else {
            Message.error(res.message || '触发实例同步失败');
            refresh();
          }
          return;
        }

        const params = {
          id: record.id,
          funnel_task_id: record.funnel_task_id
        };

        // checked 为 true 表示要开启，调用启动接口
        // checked 为 false 表示要关闭，调用暂停接口
        const res = checked
          ? await startSyncObjectTypeTask(params)
          : await pauseSyncObjectTypeTask(params);

        if (res.status === 200 && res.code === '') {
          const succeed = res?.data?.succeed;
          if (succeed === '1') {
            Message.success(checked ? '启动同步成功' : '暂停同步成功');
            // 刷新列表以获取最新状态
            refresh();
          } else {
            Message.error(checked ? '启动同步失败' : '暂停同步失败');
            // 失败时也刷新列表，恢复原状态
            refresh();
          }
        } else {
          Message.error(
            res.message || (checked ? '启动同步失败' : '暂停同步失败')
          );
          // 失败时刷新列表，恢复原状态
          refresh();
        }
      } catch (e) {
        Message.error(checked ? '启动同步失败' : '暂停同步失败');
        // 失败时刷新列表，恢复原状态
        refresh();
      } finally {
        // 移除 loading 状态
        setSwitchLoadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(record.id);
          return newSet;
        });
      }
    },
    500
  );

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

          const response = await deleteOntologyObjectType({
            id: Number(record.id),
            ontologyModelID: ontologyModelID
              ? Number(ontologyModelID)
              : undefined
          });

          if (isOntologyApiSuccess(response)) {
            Message.success('删除成功');
            refresh();
          } else {
            Message.error(response.message || '删除失败');
          }
        } catch (error) {
          Message.error(
            typeof error === 'string' && error ? error : '删除失败'
          );
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
        // 如果 sourceType 为 2（文件上传），显示 -
        if (record.sourceType === 2) {
          return <span>-</span>;
        }

        if (!record.enableSyncSourceData) {
          return <span className="text-[#334155]">未配置</span>;
        }

        // 如果 enableSyncSourceData 为 true，根据 syncEnabled 显示 Switch
        return (
          <Switch
            checked={record.syncEnabled}
            size="small"
            loading={switchLoadingIds.has(record.id)}
            onChange={(checked) => handleSyncToggle(record, checked)}
          />
        );
      }
    },
    {
      title: '最新同步状态',
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
      width: 160,
      fixed: 'right',
      render: (_, record) => {
        // 当 enableSyncSourceData 和 syncEnabled 都为 true 时，禁用编辑按钮
        const isEditDisabled =
          record.enableSyncSourceData && record.syncEnabled;

        return (
          <Space size={16}>
            <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
              <Tooltip
                content={
                  isEditDisabled
                    ? '当前状态不支持编辑，停止后方可编辑'
                    : undefined
                }
                disabled={!isEditDisabled}
              >
                <span>
                  <Button
                    type="text"
                    className="p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary"
                    onClick={() => handleEdit(record)}
                    disabled={isEditDisabled}
                  >
                    编辑
                  </Button>
                </span>
              </Tooltip>
            </PermissionWrapper>
            <PermissionWrapper permission={ONTOLOGY_PERMISSIONS.MODIFY}>
              <Tooltip content="同步实例">
                <Button
                  type="text"
                  className="p-0 font-PingFangSc text-[14px] font-normal leading-[22px] text-blue-primary"
                  onClick={() => handleInstanceSync(record)}
                >
                  实例
                </Button>
              </Tooltip>
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
        );
      }
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
            <Dropdown droplist={createDropdown} position="br">
              <Button type="outline" icon={<IconPlus />}>
                创建对象类型
                <IconDown className="ml-[4px]" />
              </Button>
            </Dropdown>
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

      {ontologyModelID && (
        <SelectExistingObjectTypeModal
          visible={selectExistingVisible}
          currentSceneId={Number(ontologyModelID)}
          excludedCodes={boundObjectTypeCodes}
          confirmLoading={selectExistingLoading}
          onCancel={() => setSelectExistingVisible(false)}
          onConfirm={handleSelectExisting}
        />
      )}
    </div>
  );
}

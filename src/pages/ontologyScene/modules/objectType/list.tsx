import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Space,
  TableColumnProps,
  Pagination,
  Message,
  Modal,
  Popover
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
import ObjectTypeDetailDrawer from '../../componens/ObjectTypeDetailDrawer';
import TaskLogDrawer from '../../componens/TaskLogDrawer';
import {
  listOntologyObjectType,
  deleteOntologyObjectType,
  getObjectTypeSyncLog
} from '@/api/ontologySceneLibrary/objectType';
import { ObjectType } from '@/types/objectType';
import { SyncStatus } from '@/types/graphApi';
import styles from './list.module.scss';
import {
  OBJECT_TYPE_SYNC_STATUS_CONFIG,
  OBJECT_TYPE_SYNC_STATUS_FILTERS,
  OBJECT_TYPE_ICON_OPTIONS
} from '../../common/constants';
import LogIcon from '../../assets/log-icon.svg';
import dayjs from 'dayjs';

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
  const [logTaskId, setLogTaskId] = useState<number | null>(null);
  const [logTaskName, setLogTaskName] = useState<string | undefined>();

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<ObjectType, any>({
      service: async (params) => {
        try {
          const requestParams: any = {
            filter: params.keyword,
            ontologyModelID: ontologyModelID
              ? Number(ontologyModelID)
              : undefined,
            pageNo: params.page || 1,
            pageSize: params.page_size || 10
          };

          // 如果有排序参数，添加排序信息
          if (params.orders && params.orders.length > 0) {
            requestParams.order = params.orders[0].asc ? 'asc' : 'desc';
            requestParams.orderBy = params.orders[0].column;
          }

          const response = await listOntologyObjectType(requestParams);

          if (response.status === 200 && response.code === '') {
            const items = response.data?.result || [];

            return {
              data: {
                items,
                total: response.data?.totalCount || 0,
                page: params.page || 1,
                page_size: params.page_size || 10
              }
            };
          } else {
            Message.error(response.message || '获取列表失败');
            return {
              data: {
                items: [],
                total: 0,
                page: params.page || 1,
                page_size: params.page_size || 10
              }
            };
          }
        } catch (error) {
          Message.error('获取列表失败');
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
      `/tenant/compute/modaforge/ontologyScene/detail/${ontologyModelID}/objectType/create`
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

  // 处理链接点击
  const handleLinkClick = (record: ObjectType) => {
    handleViewDetail(record, 'links');
  };

  // 处理实例数量点击
  const handleInstanceCountClick = (record: ObjectType) => {
    handleViewDetail(record, 'instances');
  };

  // 处理编辑
  const handleEdit = (record: ObjectType) => {
    if (!record.id) {
      Message.error('对象类型ID无效');
      return;
    }
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${ontologyModelID}/objectType/edit/${record.id}`
    );
  };

  // 处理删除
  const handleDelete = (record: ObjectType) => {
    Modal.confirm({
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

  // 处理查看日志
  const handleViewLog = (record: ObjectType) => {
    if (!record.id) {
      Message.error('对象类型ID无效');
      return;
    }
    setLogTaskId(record.id);
    setLogTaskName(record.name);
    setLogDrawerVisible(true);
  };

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
      title: '对象类型id',
      dataIndex: 'code',
      width: 200,
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
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 120,
      filters: OBJECT_TYPE_SYNC_STATUS_FILTERS,
      onFilter: (value, record) => record.syncStatus === value,
      render: (value: SyncStatus, record: ObjectType) => {
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
      sorter: true,
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
    <div className={styles['object-type-list']}>
      <div>
        <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-default">
          对象类型
        </div>
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#334155]">
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
          <ProButton icon={<IconPlus />} onClick={handleCreate}>
            创建对象类型
          </ProButton>
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
          objectTypeId={selectedObjectType?.id?.toString() || ''}
          defaultActiveTab={activeTab}
        />
      )}
      {logTaskId !== null && (
        <TaskLogDrawer
          visible={logDrawerVisible}
          taskInstanceId={logTaskId}
          taskName={logTaskName}
          onClose={() => setLogDrawerVisible(false)}
          fetchLog={getObjectTypeSyncLog}
        />
      )}
    </div>
  );
}

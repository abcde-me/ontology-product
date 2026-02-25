import React, { useMemo, useState, useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Space,
  Table,
  TableColumnProps,
  Pagination,
  Message
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSearch,
  IconInfoCircle
} from '@arco-design/web-react/icon';
import {
  CopyItemIcon,
  ProButton,
  SearchTable
} from '@ceai-front/arco-material';
import useUrlState from '@ahooksjs/use-url-state';
import { useHistory, useParams } from 'react-router-dom';
import { useWorkflowTable } from '../../hooks/useTable';
import styles from './list.module.scss';
import LinkDetailDrawer from './components/LinkDetailDrawer';
import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { LinkInfo, LinkType, SyncStatus } from '@/types/graphApi';
import ObjectTypeTag from '@/pages/ontologyScene/componens/ObjectTypeTag';
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';

// 链接数据接口
export interface LinkItem {
  id: string;
  name: string;
  sourceObjectType: {
    id?: string | number;
    name: string;
    icon?: string;
  };
  targetObjectType: {
    id?: string | number;
    name: string;
    icon?: string;
  };
  linkType: '1:1' | '1:N' | 'N:N';
  syncStatus: 'success' | 'running' | 'failed';
  syncTime: string;
  attributes: string | { count: number; first: string };
  linkCount: number;
}

// 同步状态配置
const SYNC_STATUS_CONFIG = {
  success: {
    text: '成功',
    color: '#00b42a'
  },
  running: {
    text: '运行中',
    color: '#165dff'
  },
  failed: {
    text: '失败',
    color: '#f53f3f'
  }
};

// 将 LinkType 枚举转换为字符串
const getLinkTypeText = (type?: LinkType): '1:1' | '1:N' | 'N:N' => {
  switch (type) {
    case LinkType.ONE_TO_ONE:
      return '1:1';
    case LinkType.ONE_TO_MANY:
      return '1:N';
    case LinkType.MANY_TO_MANY:
      return 'N:N';
    default:
      return '1:1';
  }
};

// 将 SyncStatus 枚举转换为字符串
const getSyncStatusText = (
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

// 将 LinkInfo 转换为 LinkItem
const convertLinkInfoToLinkItem = (linkInfo: LinkInfo): LinkItem => {
  return {
    id: String(linkInfo.id || linkInfo.code || ''),
    name: linkInfo.name || '',
    sourceObjectType: {
      id: linkInfo.sourceObjectTypeID,
      name: linkInfo.sourceObjectTypeName || '',
      icon: linkInfo.sourceObjectTypeIcon
    },
    targetObjectType: {
      id: linkInfo.targetObjectTypeID,
      name: linkInfo.targetObjectTypeName || '',
      icon: linkInfo.targetObjectTypeIcon
    },
    linkType: getLinkTypeText(linkInfo.type),
    syncStatus: getSyncStatusText(linkInfo.syncStatus),
    syncTime: linkInfo.syncTime || '',
    attributes: 'properties', // 暂时使用固定值，后续可以从其他接口获取
    linkCount: 0 // 暂时使用固定值，后续可以从其他接口获取
  };
};

// 链接类型筛选选项
const LINK_TYPE_FILTERS = [
  { text: '1:1', value: '1:1' },
  { text: '1:N', value: '1:N' },
  { text: 'N:N', value: 'N:N' }
];

// 同步状态筛选选项
const SYNC_STATUS_FILTERS = [
  { text: '成功', value: 'success' },
  { text: '运行中', value: 'running' },
  { text: '失败', value: 'failed' }
];

export default function OntologySceneLinksList() {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const [urlState, setUrlState] = useUrlState({ search: '' });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [detailActiveTab, setDetailActiveTab] = useState<
    'instances' | 'attributes'
  >('instances');
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);

  // 使用 useTable hook
  const { data, loading, pagination, refresh, submit, onChange } =
    useWorkflowTable<LinkItem, any>({
      service: async (params) => {
        try {
          const order = params.orders?.[0]?.asc ? 'asc' : 'desc';
          const orderBy = params.orders?.[0]?.column;

          const response = await listOntologyLinkType({
            filter: params.keyword || undefined,
            pageNo: params.page || 1,
            pageSize: params.page_size || 10,
            ...(orderBy && { order, orderBy })
          });

          const linkInfos = response.data?.result || [];
          const totalCount = response.data?.totalCount || 0;

          // 转换为 LinkItem 格式
          const items = linkInfos.map(convertLinkInfoToLinkItem);

          return {
            data: {
              items,
              total: totalCount,
              page: params.page || 1,
              page_size: params.page_size || 10
            }
          };
        } catch (error) {
          Message.error('获取链接列表失败');
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
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/create`
    );
  };

  // 处理属性点击
  const handleAttributesClick = (record: LinkItem) => {
    setSelectedLink(record);
    setDetailActiveTab('attributes');
    setDetailDrawerVisible(true);
  };

  // 处理链接数点击
  const handleLinkCountClick = (record: LinkItem) => {
    setSelectedLink(record);
    setDetailActiveTab('instances');
    setDetailDrawerVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: LinkItem) => {
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/edit/${record.id}`
    );
  };

  // 处理删除
  const handleDelete = (record: LinkItem) => {
    // TODO: 实现删除功能
    Message.info(`删除 ${record.name}`);
  };

  // 处理查看详情（点击链接名称）
  const handleViewDetail = (record: LinkItem) => {
    setSelectedLink(record);
    setDetailActiveTab('instances');
    setDetailDrawerVisible(true);
  };

  // 表格列定义
  const columns: TableColumnProps<LinkItem>[] = [
    {
      title: '链接名称',
      dataIndex: 'name',
      width: 150,
      render: (value, record) => (
        <div
          className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
          onClick={() => handleViewDetail(record)}
        >
          {value}
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
      title: '源对象类型',
      dataIndex: 'sourceObjectType',
      width: 180,
      render: (value: LinkItem['sourceObjectType']) => {
        return (
          <div>
            {value?.id ? (
              <ObjectTypeTag
                ontologyObjectTypeIcon={value.icon}
                ontologyObjectTypeName={value.name}
                ontologyObjectTypeId={value.id}
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
      render: (value: LinkItem['targetObjectType']) => {
        return (
          <div>
            {value?.id ? (
              <ObjectTypeTag
                ontologyObjectTypeIcon={value.icon}
                ontologyObjectTypeName={value.name}
                ontologyObjectTypeId={value.id}
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
      dataIndex: 'linkType',
      width: 120,
      filters: LINK_TYPE_FILTERS,
      onFilter: (value, record) => record.linkType === value,
      render: (value) => (
        <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
          {value}
        </div>
      )
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatus',
      width: 120,
      filters: SYNC_STATUS_FILTERS,
      onFilter: (value, record) => record.syncStatus === value,
      render: (value) => {
        const config = SYNC_STATUS_CONFIG[value];
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="font-PingFangSc text-[14px] font-normal leading-[22px]">
              {config.text}
            </span>
            {value === 'failed' && (
              <IconInfoCircle
                className="cursor-pointer text-[#f53f3f]"
                style={{ fontSize: '14px' }}
              />
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
      render: (value, record) => {
        if (typeof value === 'string') {
          return (
            <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]">
              {value}
            </div>
          );
        }
        return (
          <div
            className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
            onClick={() => handleAttributesClick(record)}
          >
            {value.first} 等{value.count}个
          </div>
        );
      }
    },
    {
      title: '链接数',
      dataIndex: 'linkCount',
      width: 120,
      sorter: true,
      render: (value, record) => (
        <div
          className="hover-blue font-PingFangSc text-[14px] font-normal leading-[22px] text-[#23293b]"
          onClick={() => handleLinkCountClick(record)}
        >
          {value}
        </div>
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

  const drawerData = useMemo(() => {
    if (!selectedLink) return undefined;
    const attributeCount =
      typeof selectedLink.attributes === 'string'
        ? 0
        : Number(selectedLink.attributes?.count) || 0;

    return {
      id: selectedLink.id,
      name: selectedLink.name,
      syncStatus: selectedLink.syncStatus,
      linkType: selectedLink.linkType,
      sourceObjectType: {
        id: selectedLink.sourceObjectType.id,
        name: selectedLink.sourceObjectType.name,
        iconColor: undefined // ObjectTypeTag 使用 icon 而不是 iconColor
      },
      targetObjectType: {
        id: selectedLink.targetObjectType.id,
        name: selectedLink.targetObjectType.name,
        iconColor: undefined // ObjectTypeTag 使用 icon 而不是 iconColor
      },
      instanceCount: Number(selectedLink.linkCount) || 0,
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
        addButton={
          <ProButton icon={<IconPlus />} onClick={handleCreate}>
            创建链接
          </ProButton>
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

      {/* 链接详情抽屉 */}
      {detailDrawerVisible && (
        <LinkDetailDrawer
          visible={detailDrawerVisible}
          onClose={() => {
            setDetailDrawerVisible(false);
            setSelectedLink(null);
          }}
          linkId={selectedLink?.id}
          data={drawerData as any}
          defaultActiveTab={detailActiveTab}
        />
      )}
    </div>
  );
}

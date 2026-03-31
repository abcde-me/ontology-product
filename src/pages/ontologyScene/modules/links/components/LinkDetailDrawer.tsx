import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Message,
  Pagination,
  Popover,
  Spin,
  Table,
  TableColumnProps,
  Tabs
} from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import {
  DotStatus,
  GlobalTooltip,
  NoDataCard,
  copyToClipboard
} from '@ceai-front/arco-material';
import { OsDrawer, EllipsisPopover } from '@/pages/ontologyScene/componens';
import {
  getOntologyLinkType,
  listOntologyLinkTypeData,
  listOntologyLinkTypeColumn
} from '@/api/ontologySceneLibrary/links';
import { GetOntologyLinkTypeRes, LinkTypeAttributeInfo } from '@/types/links';
import { LinkType, SyncStatus } from '@/types/graphApi';
import { getLinkTypeText } from '@/pages/ontologyScene/utils';
import {
  OBJECT_TYPE_SYNC_STATUS_CONFIG,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import { isNil } from 'lodash-es';

const TabPane = Tabs.TabPane;

export type SyncStatusDisplay = 'success' | 'running' | 'failed';

export interface LinkDetailData {
  id: string;
  name: string;
  syncStatus: SyncStatusDisplay;
  linkType: LinkType;
  sourceObjectType: {
    id?: string;
    name: string;
    iconColor?: string;
  };
  targetObjectType: {
    id?: string;
    name: string;
    iconColor?: string;
  };
  instanceCount: number;
  attributeCount: number;
}

interface LinkDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  /** 链接 id（推荐使用该字段驱动抽屉数据请求） */
  linkId?: string;
  /** 可选：用于快速首屏展示（例如从列表行直接带入） */
  data?: Partial<LinkDetailData>;
  defaultActiveTab?: 'instances' | 'attributes';
  fetchBasicInfo?: (linkId: string) => Promise<GetOntologyLinkTypeRes>;
  fetchInstances?: (
    linkId: string,
    params: { page: number; pageSize: number }
  ) => Promise<{ items: Record<string, any>[]; total: number }>;
  fetchAttributes?: (
    linkId: string,
    params: { page: number; pageSize: number }
  ) => Promise<{ items: LinkTypeAttributeInfo[]; total: number }>;
  defaultInstancesPageSize?: number;
  defaultAttributesPageSize?: number;
}

// 默认获取基本信息函数
async function defaultFetchBasicInfo(
  linkId: string
): Promise<GetOntologyLinkTypeRes> {
  const res = await getOntologyLinkType({ id: Number(linkId) });
  if (res.status === 200 && res.code === '' && res.data) {
    return res.data;
  }
  throw new Error(res.message || '获取链接基本信息失败');
}

// 默认获取实例列表函数
async function defaultFetchInstances(
  linkId: string,
  params: { page: number; pageSize: number }
): Promise<{ items: Record<string, any>[]; total: number }> {
  const res = await listOntologyLinkTypeData({
    id: Number(linkId),
    page: params.page,
    pageSize: params.pageSize
  });
  if (res.status === 200 && res.code === '' && res.data) {
    return {
      items: res.data.result || [],
      total: res.data.totalCount || 0
    };
  }
  throw new Error(res.message || '获取链接实例列表失败');
}

// 默认获取属性列表函数
async function defaultFetchAttributes(
  linkId: string,
  params: { page: number; pageSize: number }
): Promise<{ items: LinkTypeAttributeInfo[]; total: number }> {
  const res = await listOntologyLinkTypeColumn({
    linkTypeID: Number(linkId),
    pageNo: params.page,
    pageSize: params.pageSize,
    isUse: 1
  });
  if (res.status === 200 && res.code === '' && res.data) {
    return {
      items: res.data.result || [],
      total: res.data.totalCount || 0
    };
  }
  throw new Error(res.message || '获取链接属性列表失败');
}

const defaultPageSize = 10;

export default function LinkDetailDrawer({
  visible,
  onClose,
  linkId,
  data,
  defaultActiveTab = 'instances',
  fetchBasicInfo,
  fetchInstances,
  fetchAttributes,
  defaultInstancesPageSize = defaultPageSize,
  defaultAttributesPageSize = defaultPageSize
}: LinkDetailDrawerProps) {
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab);
  useEffect(() => {
    if (visible && defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [visible, defaultActiveTab]);

  const resolvedLinkId = useMemo(() => {
    return linkId || data?.id;
  }, [linkId, data?.id]);

  const fetchBasicInfoFn = fetchBasicInfo || defaultFetchBasicInfo;
  const fetchInstancesFn = fetchInstances || defaultFetchInstances;
  const fetchAttributesFn = fetchAttributes || defaultFetchAttributes;

  const [basicInfo, setBasicInfo] = useState<
    GetOntologyLinkTypeRes | undefined
  >(undefined);
  const [basicInfoLoading, setBasicInfoLoading] = useState(false);

  const [instancesData, setInstancesData] = useState<Record<string, any>[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [instancesPagination, setInstancesPagination] = useState({
    current: 1,
    pageSize: defaultInstancesPageSize,
    total: 0
  });

  const [attributesData, setAttributesData] = useState<LinkTypeAttributeInfo[]>(
    []
  );
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributesPagination, setAttributesPagination] = useState({
    current: 1,
    pageSize: defaultAttributesPageSize,
    total: 0
  });

  const handleCopy = async (value: string) => {
    const result = await copyToClipboard(value);
    if (!result.success) {
      Message.error(result.message || '复制失败');
    }
  };

  const loadInstances = useCallback(
    async (page: number, pageSize: number) => {
      if (!resolvedLinkId) return;
      setInstancesLoading(true);
      try {
        const res = await fetchInstancesFn(resolvedLinkId, { page, pageSize });
        setInstancesData(res.items || []);
        setInstancesPagination({
          current: page,
          pageSize,
          total: res.total || 0
        });
      } catch (e) {
        Message.error('加载实例失败');
      } finally {
        setInstancesLoading(false);
      }
    },
    [fetchInstancesFn, resolvedLinkId]
  );

  const loadAttributes = useCallback(
    async (page: number, pageSize: number) => {
      if (!resolvedLinkId) return;
      setAttributesLoading(true);
      try {
        const res = await fetchAttributesFn(resolvedLinkId, { page, pageSize });
        setAttributesData(res.items || []);
        setAttributesPagination({
          current: page,
          pageSize,
          total: res.total || 0
        });
      } catch (e) {
        Message.error('加载属性失败');
      } finally {
        setAttributesLoading(false);
      }
    },
    [fetchAttributesFn, resolvedLinkId]
  );

  useEffect(() => {
    if (!visible || !resolvedLinkId) return;

    (async () => {
      setBasicInfoLoading(true);
      try {
        const res = await fetchBasicInfoFn(resolvedLinkId);
        setBasicInfo(res);
      } catch (e) {
        Message.error('加载基本信息失败');
      } finally {
        setBasicInfoLoading(false);
      }
    })();

    loadInstances(1, instancesPagination.pageSize);
    loadAttributes(1, attributesPagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, resolvedLinkId]);

  const displayData = basicInfo;

  const instanceCount = useMemo(() => {
    return instancesPagination.total || 0;
  }, [instancesPagination.total]);

  const attributeCount = useMemo(() => {
    return attributesPagination.total || 0;
  }, [attributesPagination.total]);

  const handleEdit = () => {
    if (!resolvedLinkId) return;
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/edit/${resolvedLinkId}`
    );
  };

  const renderObjectTypeCard = (
    objectType:
      | { name?: string; icon?: string; syncStatus?: SyncStatus }
      | undefined,
    isSource: boolean
  ) => {
    const name = objectType?.name || '-';
    // 根据 icon 字段匹配对应的图标
    const iconOption = objectType?.icon
      ? OBJECT_TYPE_ICON_OPTIONS.find(
          (option) => option.value === objectType.icon
        )
      : null;
    const IconComponent = iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

    return (
      <div
        className="flex w-full max-w-[374px] flex-1 items-center gap-[8px] overflow-hidden rounded-lg px-4 py-3"
        style={{
          backgroundColor: '#fff',
          minHeight: '56px'
        }}
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded">
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="h-[24px] min-w-0 overflow-hidden text-[14px] font-[600] text-[var(--color-text-1)]">
          <EllipsisPopover
            value={name}
            className="min-w-0 leading-[24px]"
            wrapperClassName="min-w-0"
          />
        </div>
        {!isNil(objectType?.syncStatus) ? (
          <div className="flex h-[24px] items-center">
            <DotStatus
              text=""
              color={
                OBJECT_TYPE_SYNC_STATUS_CONFIG[objectType!.syncStatus].color
              }
            />
          </div>
        ) : null}
      </div>
    );
  };

  // 动态生成实例表格列
  const instanceColumns = useMemo<
    TableColumnProps<Record<string, any>>[]
  >(() => {
    if (!instancesData || instancesData.length === 0) {
      return [];
    }

    // 从第一个对象中获取所有属性名
    const firstRecord = instancesData[0];
    const keys = Object.keys(firstRecord);

    if (keys.length === 0) {
      return [];
    }

    // 计算列宽
    const columnCount = keys.length;
    const fixedWidth = 240; // 固定列宽
    const tableWidth = 480; // 假设表格总宽度
    const averageWidth = Math.floor(tableWidth / columnCount);

    // 根据列数决定列宽策略
    const shouldUseFixedWidth = columnCount > 2;
    const columnWidth = shouldUseFixedWidth ? fixedWidth : averageWidth;

    // 生成列配置
    return keys.map((key) => ({
      title: <EllipsisPopover value={key} className="pointer-events-auto" />,
      dataIndex: key,
      width: columnWidth,
      ellipsis: true,
      render: (text: any) => {
        return <EllipsisPopover value={String(text ?? '')} />;
      }
    }));
  }, [instancesData]);

  // 属性表格列，直接使用 API 返回的字段
  const attributeColumns: TableColumnProps<LinkTypeAttributeInfo>[] = [
    {
      title: '属性名称',
      dataIndex: 'comment',
      width: 240,
      render: (text: string) => {
        return <EllipsisPopover value={text || '-'} />;
      }
    },
    {
      title: '表字段',
      dataIndex: 'name',
      width: 240
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 160
    }
  ];

  return (
    <OsDrawer
      key={resolvedLinkId}
      visible={visible}
      onCancel={onClose}
      title="链接详情"
      onEdit={handleEdit}
      footer={null}
    >
      <div className="flex flex-col gap-[24px]">
        {/* 基本信息 */}
        <div className="flex flex-col gap-[12px]">
          <div className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
            基本信息
          </div>
          <Spin loading={basicInfoLoading}>
            <div className="mb-[12px] flex gap-[16px]">
              <div className="flex w-[418px] gap-[8px]">
                <div className="w-[100px] text-[14px] leading-[22px] text-[var(--color-text-4)]">
                  链接名称：
                </div>
                <div className="min-w-0 flex-1">
                  <EllipsisPopover
                    // preferTypography
                    value={displayData?.name || '-'}
                    wrapperClassName="w-full"
                    isEdit={false}
                    className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
                  />
                </div>
              </div>
              <div className="flex gap-[8px]">
                <div className="w-[70px] font-PingFangSc text-sm font-normal leading-[22px] text-[#86909c]">
                  同步状态：
                </div>
                <div className="flex items-center gap-2 font-PingFangSc text-sm font-normal leading-[22px] text-[#23293b]">
                  {!isNil(displayData?.syncStatus) ? (
                    <DotStatus
                      text={
                        OBJECT_TYPE_SYNC_STATUS_CONFIG[displayData!.syncStatus]
                          .text
                      }
                      color={
                        OBJECT_TYPE_SYNC_STATUS_CONFIG[displayData!.syncStatus]
                          .color
                      }
                    />
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-[16px]">
              <div className="flex w-[418px] gap-[8px]">
                <div className="w-[100px] flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-4)]">
                  链接id:
                </div>
                <div className="flex items-center gap-[4px] overflow-hidden">
                  <GlobalTooltip.Ellipsis
                    text={displayData?.code || '-'}
                    className="flex-1 text-[14px] leading-[22px] text-[var(--color-text-1)]"
                  >
                    {/*{displayData?.code || '-'}*/}
                  </GlobalTooltip.Ellipsis>
                  {!isNil(displayData?.code) && (
                    <Popover content="复制">
                      <IconCopy
                        fontSize={14}
                        className="flex-shrink-0 hover:cursor-pointer hover:text-[rgba(var(--primary-6))]"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCopy(String(displayData?.code));
                        }}
                      />
                    </Popover>
                  )}
                </div>
              </div>
              <div className="flex gap-[8px]">
                <div className="text-[14px] leading-[22px] text-[var(--color-text-4)]">
                  链接类型：
                </div>
                <div className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
                  {displayData?.type ? getLinkTypeText(displayData.type) : '-'}
                </div>
              </div>
            </div>
          </Spin>
        </div>

        {/* 关系对 */}
        <div className="flex flex-col gap-[12px]">
          <div className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
            关系对
          </div>
          <div className="flex items-center bg-[#F2F8FF] p-[12px]">
            {renderObjectTypeCard(
              {
                name: displayData?.sourceObjectTypeName,
                icon: displayData?.sourceObjectTypeIcon,
                syncStatus: displayData?.sourceObjectTypeSyncStatus
              },
              true
            )}
            <div className="flex w-[76px] min-w-[76px] items-center">
              <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
              <span className="rounded border border-[#E5E6EB] bg-white px-2 py-[2px] text-[12px] leading-[18px] text-[#23293b]">
                {getLinkTypeText(displayData?.type)}
              </span>
              <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
              <div className="h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-gray-400 border-t-transparent"></div>
            </div>
            {renderObjectTypeCard(
              {
                name: displayData?.targetObjectTypeName,
                icon: displayData?.targetObjectTypeIcon,
                syncStatus: displayData?.targetObjectTypeSyncStatus
              },
              false
            )}
          </div>
        </div>

        {/* Tab 内容 */}
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          className="[&_.arco-tabs-content]:p-0 [&_.arco-tabs-nav]:mb-4"
        >
          <TabPane key="instances" title={`实例(${instanceCount})`}>
            <div className="mt-[16px] flex flex-col gap-[16px]">
              {instancesPagination.total === 0 ? (
                <div className="flex justify-center py-[100px]">
                  <NoDataCard title="暂无数据" />
                </div>
              ) : (
                <Table
                  loading={instancesLoading}
                  columns={instanceColumns}
                  data={instancesData}
                  rowKey={(record) => {
                    // 尝试使用可能的 id 字段，否则使用对象字符串化
                    return String(
                      record.id || record.link_id || JSON.stringify(record)
                    );
                  }}
                  border={false}
                  pagination={false}
                  noDataElement={<NoDataCard title="暂无数据" />}
                  className="[&_.arco-table-td]:py-[10px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[10px]"
                />
              )}
              {instancesPagination.total > defaultPageSize && (
                <div className="flex justify-end pt-[16px]">
                  <Pagination
                    current={instancesPagination.current}
                    pageSize={instancesPagination.pageSize}
                    total={instancesPagination.total}
                    onChange={(page, pageSize) => {
                      loadInstances(page, pageSize);
                    }}
                    showTotal
                    size="small"
                  />
                </div>
              )}
            </div>
          </TabPane>
          <TabPane key="attributes" title={`属性(${attributeCount})`}>
            <div className="mt-[16px] flex flex-col gap-[16px]">
              <Table
                loading={attributesLoading}
                columns={attributeColumns}
                data={attributesData}
                rowKey={(record) => String(record.id || record.name || '')}
                border={false}
                pagination={false}
                noDataElement={<NoDataCard title="暂无数据" />}
                className="[&_.arco-table-td]:py-[8px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[8px]"
              />
              {attributesPagination.total > defaultPageSize && (
                <div className="flex justify-end pt-[16px]">
                  <Pagination
                    current={attributesPagination.current}
                    pageSize={attributesPagination.pageSize}
                    total={attributesPagination.total}
                    onChange={(page, pageSize) => {
                      loadAttributes(page, pageSize);
                    }}
                    showTotal
                    size="small"
                  />
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </OsDrawer>
  );
}

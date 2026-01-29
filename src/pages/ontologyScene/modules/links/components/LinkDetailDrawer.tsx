import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Message,
  Pagination,
  Spin,
  Table,
  TableColumnProps,
  Tabs
} from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import { EllipsisPopover, NoDataCard } from '@ceai-front/arco-material';
import { OsDrawer } from '@/pages/ontologyScene/componens';

const TabPane = Tabs.TabPane;

export type LinkType = '1:1' | '1:N' | 'N:N';
export type SyncStatus = 'success' | 'running' | 'failed';

export interface LinkDetailData {
  id: string;
  name: string;
  syncStatus: SyncStatus;
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

export interface LinkInstanceItem {
  id: string;
  sourceInstance: string;
  targetInstance: string;
}

export interface LinkAttributeItem {
  id: string;
  attributeName: string;
  tableField: string;
  fieldType: string;
}

interface LinkDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  /** 链接 id（推荐使用该字段驱动抽屉数据请求） */
  linkId?: string;
  /** 可选：用于快速首屏展示（例如从列表行直接带入） */
  data?: Partial<LinkDetailData>;
  defaultActiveTab?: 'instances' | 'attributes';
  fetchBasicInfo?: (linkId: string) => Promise<LinkDetailData>;
  fetchInstances?: (
    linkId: string,
    params: { page: number; pageSize: number }
  ) => Promise<{ items: LinkInstanceItem[]; total: number }>;
  fetchAttributes?: (
    linkId: string,
    params: { page: number; pageSize: number }
  ) => Promise<{ items: LinkAttributeItem[]; total: number }>;
  defaultInstancesPageSize?: number;
  defaultAttributesPageSize?: number;
}

const SYNC_STATUS_CONFIG: Record<SyncStatus, { text: string; color: string }> =
  {
    success: { text: '成功', color: '#00b42a' },
    running: { text: '运行中', color: '#165dff' },
    failed: { text: '失败', color: '#f53f3f' }
  };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function defaultFetchBasicInfo(linkId: string): Promise<LinkDetailData> {
  await sleep(200);
  return {
    id: linkId,
    name: `链接-${linkId}`,
    syncStatus: 'success',
    linkType: '1:1',
    sourceObjectType: { id: 'source', name: '气象站', iconColor: '#00b42a' },
    targetObjectType: { id: 'target', name: '地理区域', iconColor: '#722ED1' },
    instanceCount: 100,
    attributeCount: 12
  };
}

async function defaultFetchInstances(
  linkId: string,
  params: { page: number; pageSize: number }
): Promise<{ items: LinkInstanceItem[]; total: number }> {
  await sleep(240);
  const total = 100;
  const start = (params.page - 1) * params.pageSize;
  const end = Math.min(start + params.pageSize, total);
  const items: LinkInstanceItem[] = Array.from({
    length: Math.max(end - start, 0)
  }).map((_, idx) => {
    const n = start + idx + 1;
    return {
      id: `${linkId}-INS-LINK-${String(n).padStart(3, '0')}`,
      sourceInstance: `WS-${String(n).padStart(2, '0')}`,
      // 为了贴近 UI 截图：右侧展示类似 “8.5m/s” 的值
      targetInstance: `${(Math.random() * 30).toFixed(1)}m/s`
    };
  });
  return { items, total };
}

async function defaultFetchAttributes(
  linkId: string,
  params: { page: number; pageSize: number }
): Promise<{ items: LinkAttributeItem[]; total: number }> {
  await sleep(180);
  const all: LinkAttributeItem[] = Array.from({ length: 12 }).map((_, idx) => {
    const n = (idx % 3) + 1;
    return {
      id: `${linkId}-ATTR-${idx + 1}`,
      attributeName: `WS-0${n}`,
      tableField: `${(Math.random() * 30).toFixed(1)}m/s`,
      fieldType: 'STRING'
    };
  });
  const total = all.length;
  const start = (params.page - 1) * params.pageSize;
  const end = Math.min(start + params.pageSize, total);
  return { items: all.slice(start, end), total };
}

export default function LinkDetailDrawer({
  visible,
  onClose,
  linkId,
  data,
  defaultActiveTab = 'instances',
  fetchBasicInfo,
  fetchInstances,
  fetchAttributes,
  defaultInstancesPageSize = 10,
  defaultAttributesPageSize = 10
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

  const [basicInfo, setBasicInfo] = useState<LinkDetailData | undefined>(
    data?.id
      ? ({
          id: data.id,
          name: data.name || '-',
          syncStatus: data.syncStatus || 'success',
          linkType: data.linkType || '1:1',
          sourceObjectType: data.sourceObjectType || { name: '-' },
          targetObjectType: data.targetObjectType || { name: '-' },
          instanceCount: Number(data.instanceCount) || 0,
          attributeCount: Number(data.attributeCount) || 0
        } as LinkDetailData)
      : undefined
  );
  const [basicInfoLoading, setBasicInfoLoading] = useState(false);

  const [instancesData, setInstancesData] = useState<LinkInstanceItem[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [instancesPagination, setInstancesPagination] = useState({
    current: 1,
    pageSize: defaultInstancesPageSize,
    total: 0
  });

  const [attributesData, setAttributesData] = useState<LinkAttributeItem[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributesPagination, setAttributesPagination] = useState({
    current: 1,
    pageSize: defaultAttributesPageSize,
    total: 0
  });

  const handleCopy = (value: string) => {
    const ok = copy(value);
    ok ? Message.success('复制成功') : Message.error('复制失败');
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
          total: Number(res.total) || 0
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
          total: Number(res.total) || 0
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
  const syncStatusConfig = displayData
    ? SYNC_STATUS_CONFIG[displayData.syncStatus]
    : SYNC_STATUS_CONFIG.success;

  const instanceCount = useMemo(() => {
    return (
      Number(displayData?.instanceCount) ||
      Number(instancesPagination.total) ||
      0
    );
  }, [displayData?.instanceCount, instancesPagination.total]);

  const attributeCount = useMemo(() => {
    return (
      Number(displayData?.attributeCount) ||
      Number(attributesPagination.total) ||
      0
    );
  }, [displayData?.attributeCount, attributesPagination.total]);

  const handleEdit = () => {
    if (!resolvedLinkId) return;
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/edit/${resolvedLinkId}`
    );
  };

  const renderObjectTypeCard = (
    objectType: { name: string; iconColor?: string },
    isSource: boolean
  ) => (
    <div
      className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3"
      style={{
        backgroundColor: isSource ? '#E8F4FF' : '#F5E8FF',
        minHeight: '56px'
      }}
    >
      <div
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: objectType.iconColor || '#165dff' }}
      >
        <div className="h-3 w-3 rounded-sm bg-white" />
      </div>
      <div className="min-w-0 flex-1 font-PingFangSc text-sm font-normal leading-[22px] text-[#23293b]">
        <EllipsisPopover preferTypography value={objectType.name || '-'} />
      </div>
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full bg-[#00b42a]" />
      </div>
    </div>
  );

  const instanceColumns: TableColumnProps<LinkInstanceItem>[] = [
    {
      title: '源对象类型',
      dataIndex: 'sourceInstance',
      width: 240
    },
    {
      title: '目标对象类型',
      dataIndex: 'targetInstance',
      width: 240
    }
  ];

  const attributeColumns: TableColumnProps<LinkAttributeItem>[] = [
    {
      title: '属性名称',
      dataIndex: 'attributeName',
      width: 240
    },
    {
      title: '表字段',
      dataIndex: 'tableField',
      width: 240
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      width: 160
    }
  ];

  return (
    <OsDrawer
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
                    preferTypography
                    value={displayData?.name || '-'}
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
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: syncStatusConfig.color }}
                  />
                  <span>{syncStatusConfig.text}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-[16px]">
              <div className="flex w-[418px] gap-[8px]">
                <div className="w-[100px] flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-4)]">
                  id:
                </div>
                <div className="flex items-center gap-[4px]">
                  <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
                    {displayData?.id || resolvedLinkId || '-'}
                  </span>
                  {(displayData?.id || resolvedLinkId) && (
                    <IconCopy
                      fontSize={14}
                      className="hover:cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(String(displayData?.id || resolvedLinkId));
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-[8px]">
                <div className="text-[14px] leading-[22px] text-[var(--color-text-4)]">
                  链接类型：
                </div>
                <div className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
                  {displayData?.linkType || '-'}
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
          <div className="flex items-center gap-4">
            {renderObjectTypeCard(
              displayData?.sourceObjectType || { name: '-' },
              true
            )}
            <div className="flex w-[76px] min-w-[76px] items-center gap-2">
              <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
              <span className="rounded border border-[#E5E6EB] bg-white px-2 py-[2px] text-[12px] leading-[18px] text-[#23293b]">
                {displayData?.linkType || '-'}
              </span>
              <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
            </div>
            {renderObjectTypeCard(
              displayData?.targetObjectType || { name: '-' },
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
              <Table
                loading={instancesLoading}
                columns={instanceColumns}
                data={instancesData}
                rowKey="id"
                border={false}
                pagination={false}
                noDataElement={<NoDataCard title="暂无数据" />}
                className="[&_.arco-table-td]:py-[10px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[10px]"
              />
              {instancesPagination.total > 0 && (
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
                rowKey="id"
                border={false}
                pagination={false}
                noDataElement={<NoDataCard title="暂无数据" />}
                className="[&_.arco-table-td]:py-[8px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[8px]"
              />
              {attributesPagination.total > 0 && (
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

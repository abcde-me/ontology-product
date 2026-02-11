import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Tabs,
  Table,
  TableColumnProps,
  Pagination,
  Tag,
  Message,
  Spin,
  Popover
} from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import { OsDrawer } from '@/pages/ontologyScene/componens';
import { EllipsisPopover, NoDataCard } from '@ceai-front/arco-material';
import copy from 'copy-to-clipboard';
import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import {
  listOntologyObjectTypeData,
  listOntologyPhysicalProperties,
  listOntologyLinkType
} from '@/api/ontologySceneLibrary/graph';
import type {
  ObjectType,
  GetOntologyObjectTypeDetailRes
} from '@/types/objectType';
import type { PhysicalProperties, LinkInfo } from '@/types/graphApi';
import { LinkType, SyncStatus } from '@/types/graphApi';
import {
  OBJECT_TYPE_SYNC_STATUS_CONFIG,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import { IconFile } from '@arco-design/web-react/icon';
import styles from './index.module.scss';

const TabPane = Tabs.TabPane;

// 对象类型详情数据接口
export interface ObjectTypeDetailData {
  code: string;
  id: number;
  name: string;
  description: string;
  syncStatus: SyncStatus;
  icon?: string;
  instanceCount: number;
  attributeCount: number;
  linkCount: number;
}

// 实例数据接口
export interface InstanceItem {
  id: string;
  [key: string]: any; // 动态字段，如 WIND, VIS 等
}

// 属性数据接口 - 直接使用接口定义的字段名
export type AttributeItem = PhysicalProperties;

// 链接数据接口
export interface LinkItem {
  linkId: string;
  linkName: string;
  linkType?: LinkType;
  sourceObjectType: {
    id: string;
    name: string;
    icon?: string;
    iconColor?: string;
  };
  targetObjectType: {
    id: string;
    name: string;
    icon?: string;
    iconColor?: string;
  };
}

interface ObjectTypeDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  /** 对象类型 id（推荐使用该字段驱动抽屉数据请求） */
  objectTypeId?: string;
  data?: ObjectTypeDetailData;
  defaultActiveTab?: 'instances' | 'attributes' | 'links';
  /**
   * 详情/实例/属性/链接分别通过接口获取，接口参数为 objectTypeId
   * - 不传则走组件内置 mock（用于当前页面仍处于联调前的情况下可正常展示）
   */
  fetchBasicInfo?: (objectTypeId: string) => Promise<ObjectTypeDetailData>;
  fetchInstances?: (
    objectTypeId: string,
    params: { page: number; pageSize: number }
  ) => Promise<{ items: InstanceItem[]; total: number }>;
  fetchAttributes?: (
    objectTypeId: string,
    params: { page: number; pageSize: number }
  ) => Promise<{ items: AttributeItem[]; total: number }>;
  fetchLinks?: (objectTypeId: string) => Promise<LinkItem[]>;
  /** 可选：实例分页默认值 */
  defaultInstancesPageSize?: number;
  /** 可选：属性分页默认值 */
  defaultAttributesPageSize?: number;
}

// 将 ObjectType 转换为 ObjectTypeDetailData
const convertObjectTypeToDetailData = (
  objectType: ObjectType,
  instanceCount = 0,
  attributeCount = 0,
  linkCount = 0
): ObjectTypeDetailData => {
  return {
    code: String(objectType.code || ''),
    id: objectType.id,
    name: objectType.name || '',
    description: objectType.description || '',
    syncStatus: objectType.syncStatus,
    icon: objectType.icon,
    instanceCount,
    attributeCount,
    linkCount
  };
};

// 将 GetOntologyObjectTypeDetailRes 转换为 ObjectTypeDetailData
const convertDetailResToDetailData = (
  detailRes: GetOntologyObjectTypeDetailRes,
  instanceCount = 0,
  attributeCount = 0,
  linkCount = 0,
  syncStatus: SyncStatus = SyncStatus.SUCCESS
): ObjectTypeDetailData => {
  return {
    code: String(detailRes.code || ''),
    id: detailRes.id,
    name: detailRes.name || '',
    description: detailRes.description || '',
    syncStatus,
    icon: detailRes.icon,
    instanceCount,
    attributeCount,
    linkCount
  };
};

// 直接使用 PhysicalProperties，不需要转换

// 获取对象类型图标颜色
const getObjectTypeColor = (icon?: string): string => {
  // 根据图标类型返回颜色，参考 panel.tsx
  if (
    icon === 'intelligence' ||
    icon === 'track' ||
    icon === 'mission' ||
    icon === 'asset'
  ) {
    return '#00b42a'; // green
  }
  return '#722ED1'; // purple
};

// 链接关系类型映射
const getLinkTypeText = (type?: LinkType): string => {
  switch (type) {
    case LinkType.ONE_TO_ONE:
      return '1:1';
    case LinkType.ONE_TO_MANY:
      return '1:N';
    case LinkType.MANY_TO_MANY:
      return 'N:N';
    default:
      return '-';
  }
};

export default function ObjectTypeDetailDrawer({
  visible,
  onClose,
  objectTypeId,
  data,
  defaultActiveTab = 'instances',
  fetchBasicInfo,
  fetchInstances,
  fetchAttributes,
  fetchLinks,
  defaultInstancesPageSize = 10,
  defaultAttributesPageSize = 10
}: ObjectTypeDetailDrawerProps) {
  const history = useHistory();
  const { id: ontologyModelID } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab);

  useEffect(() => {
    if (visible && defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [visible, defaultActiveTab]);

  const resolvedObjectTypeId = useMemo(() => {
    return objectTypeId || data?.id;
  }, [objectTypeId, data?.id]);

  // 将 objectTypeId 转换为数字（接口需要 number 类型）
  const resolvedObjectTypeIdNum = useMemo(() => {
    const id = resolvedObjectTypeId;
    if (!id) return undefined;
    const numId = Number(id);
    return isNaN(numId) ? undefined : numId;
  }, [resolvedObjectTypeId]);

  const fetchBasicInfoFn = fetchBasicInfo;
  const fetchInstancesFn = fetchInstances;
  const fetchAttributesFn = fetchAttributes;
  const fetchLinksFn = fetchLinks;

  const [basicInfo, setBasicInfo] = useState<ObjectTypeDetailData | undefined>(
    data
  );
  const [basicInfoLoading, setBasicInfoLoading] = useState(false);

  const [instancesData, setInstancesData] = useState<InstanceItem[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [instancesPagination, setInstancesPagination] = useState({
    current: 1,
    pageSize: defaultInstancesPageSize,
    total: 0
  });

  const [attributesData, setAttributesData] = useState<AttributeItem[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributesPagination, setAttributesPagination] = useState({
    current: 1,
    pageSize: defaultAttributesPageSize,
    total: 0
  });

  const [linksData, setLinksData] = useState<LinkItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  const loadInstances = useCallback(
    async (page: number, pageSize: number) => {
      if (!resolvedObjectTypeIdNum) return;
      setInstancesLoading(true);
      try {
        // 如果传入了自定义 fetchInstances，使用自定义函数
        if (fetchInstances) {
          const res = await fetchInstancesFn?.(
            String(resolvedObjectTypeIdNum),
            {
              page,
              pageSize
            }
          );
          setInstancesData(res?.items || []);
          setInstancesPagination({
            current: page,
            pageSize,
            total: Number(res?.total) || 0
          });
        } else {
          // 使用真实接口
          const res = await listOntologyObjectTypeData({
            id: resolvedObjectTypeIdNum,
            page,
            pageSize
          });
          if (res.code === '' && res.status === 200 && res.data) {
            // 确保每个实例都有 id 字段
            const instances = (res.data.result || []).map(
              (item: Record<string, unknown>) => {
                // 如果已经有 id 字段，直接返回；否则尝试从其他字段生成
                if (item.id) {
                  return item as InstanceItem;
                }
                // 尝试从其他可能的 id 字段获取
                const id =
                  item.id || item.ID || item._id || String(Math.random());
                return { ...item, id: String(id) } as InstanceItem;
              }
            );
            setInstancesData(instances);
            setInstancesPagination({
              current: page,
              pageSize,
              total: res.data.totalCount || 0
            });
          }
        }
      } catch (e) {
        Message.error('加载实例失败');
      } finally {
        setInstancesLoading(false);
      }
    },
    [fetchInstancesFn, resolvedObjectTypeIdNum, fetchInstances]
  );

  const loadAttributes = useCallback(
    async (page: number, pageSize: number) => {
      if (!resolvedObjectTypeIdNum) return;
      setAttributesLoading(true);
      try {
        // 如果传入了自定义 fetchAttributes，使用自定义函数
        if (fetchAttributes) {
          const res = await fetchAttributesFn?.(
            String(resolvedObjectTypeIdNum),
            {
              page,
              pageSize
            }
          );
          setAttributesData(res?.items || []);
          setAttributesPagination({
            current: page,
            pageSize,
            total: Number(res?.total) || 0
          });
        } else {
          // 使用真实接口
          const res = await listOntologyPhysicalProperties({
            objectTypeIdList: [resolvedObjectTypeIdNum],
            pageNo: page,
            pageSize
          });
          if (res.code === '' && res.status === 200 && res.data) {
            // 直接使用 PhysicalProperties，不需要转换
            setAttributesData(res.data.result || []);
            setAttributesPagination({
              current: page,
              pageSize,
              total: res.data.totalCount || 0
            });
          }
        }
      } catch (e) {
        Message.error('加载属性失败');
      } finally {
        setAttributesLoading(false);
      }
    },
    [fetchAttributesFn, resolvedObjectTypeIdNum, fetchAttributes]
  );

  // 当抽屉打开且 objectTypeId 变化时，分别请求：基本信息 / 属性 / 链接 / 实例
  useEffect(() => {
    if (!visible || !resolvedObjectTypeIdNum) return;

    // 基本信息
    (async () => {
      setBasicInfoLoading(true);
      try {
        // 如果传入了自定义 fetchBasicInfo，使用自定义函数
        if (fetchBasicInfo) {
          const res = await fetchBasicInfoFn?.(String(resolvedObjectTypeIdNum));
          setBasicInfo(res);
        } else {
          // 使用真实接口
          const res = await getOntologyObjectTypeDetail({
            id: resolvedObjectTypeIdNum
          });
          if (res.status === 200 && res.code === '' && res.data) {
            const detailRes = res.data;
            // 先获取统计数据（从其他接口获取总数）
            const [instancesRes, attributesRes, linksRes] = await Promise.all([
              listOntologyObjectTypeData({
                id: resolvedObjectTypeIdNum,
                page: 1,
                pageSize: 1
              }).catch(() => ({ code: 0, data: { totalCount: 0 } })),
              listOntologyPhysicalProperties({
                objectTypeIdList: [resolvedObjectTypeIdNum],
                pageNo: 1,
                pageSize: 1
              }).catch(() => ({ code: 0, data: { totalCount: 0 } })),
              listOntologyLinkType({
                sourceObjectTypeIDList: [resolvedObjectTypeIdNum],
                targetObjectTypeIDList: [resolvedObjectTypeIdNum],
                pageNo: 1,
                pageSize: 1
              }).catch(() => ({ code: 0, data: { totalCount: 0 } }))
            ]);

            const instanceCount =
              instancesRes.code === '' && instancesRes.data
                ? instancesRes.data.totalCount || 0
                : 0;
            const attributeCount =
              attributesRes.code === '' && attributesRes.data
                ? attributesRes.data.totalCount || 0
                : 0;
            const linkCount =
              linksRes.code === '' && linksRes.data
                ? linksRes.data.totalCount || 0
                : 0;

            // 使用 GetOntologyObjectTypeDetailRes 转换函数
            // 注意：GetOntologyObjectTypeDetailRes 不包含 syncStatus，使用默认值
            const detailData = convertDetailResToDetailData(
              detailRes,
              instanceCount,
              attributeCount,
              linkCount,
              SyncStatus.SUCCESS // 默认同步状态为成功
            );
            setBasicInfo(detailData);
          }
        }
      } catch (e) {
        Message.error('加载基本信息失败');
      } finally {
        setBasicInfoLoading(false);
      }
    })();

    // 属性（默认拉第一页）
    loadAttributes(1, attributesPagination.pageSize);

    // 链接
    (async () => {
      setLinksLoading(true);
      try {
        // 如果传入了自定义 fetchLinks，使用自定义函数
        if (fetchLinks) {
          const res = await fetchLinksFn?.(String(resolvedObjectTypeIdNum));
          setLinksData(res || []);
        } else {
          // 使用真实接口
          const res = await listOntologyLinkType({
            sourceObjectTypeIDList: [resolvedObjectTypeIdNum],
            targetObjectTypeIDList: [resolvedObjectTypeIdNum],
            pageNo: 1,
            pageSize: 1000 // 链接通常不需要分页，设置一个较大的值
          });
          if (res.code === '' && res.status === 200 && res.data) {
            // 将 LinkInfo 转换为 LinkItem
            const convertedLinks: LinkItem[] = (res.data.result || []).map(
              (link: LinkInfo) => ({
                linkId: link.code || String(link.id || ''),
                linkName: link.name || '',
                linkType: link.type,
                sourceObjectType: {
                  id: String(link.sourceObjectTypeID || ''),
                  name: link.sourceObjectTypeName || '',
                  icon: link.sourceObjectTypeIcon,
                  iconColor: getObjectTypeColor(link.sourceObjectTypeIcon)
                },
                targetObjectType: {
                  id: String(link.targetObjectTypeID || ''),
                  name: link.targetObjectTypeName || '',
                  icon: link.targetObjectTypeIcon,
                  iconColor: getObjectTypeColor(link.targetObjectTypeIcon)
                }
              })
            );
            setLinksData(convertedLinks);
          }
        }
      } catch (e) {
        Message.error('加载链接失败');
      } finally {
        setLinksLoading(false);
      }
    })();

    // 实例（默认拉第一页）
    loadInstances(1, instancesPagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, resolvedObjectTypeIdNum]);

  // 处理编辑按钮点击
  const handleEdit = () => {
    if (resolvedObjectTypeId) {
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${ontologyModelID}/objectType/edit/${resolvedObjectTypeId}`
      );
    }
  };

  const handleCopy = (value: string) => {
    const isCopySuccess = copy(value);

    if (isCopySuccess) {
      Message.success('复制成功');
    } else {
      Message.error('复制失败');
    }
  };

  // 实例表格列定义（动态生成，基于数据）
  const getInstanceColumns = (
    instanceData: InstanceItem[]
  ): TableColumnProps<InstanceItem>[] => {
    if (!instanceData || instanceData.length === 0) {
      return [];
    }

    // 获取第一条数据的所有字段作为列
    const firstInstance = instanceData[0];
    const keys = Object.keys(firstInstance);

    if (keys.length === 0) {
      return [];
    }

    // 计算列宽
    const columnCount = keys.length;
    const fixedWidth = 150; // 固定列宽（当列数 > 4 时使用）
    // 假设表格总宽度，可以根据实际情况调整（drawer 宽度通常较大，这里估算为 800px）
    const tableWidth = 852;
    const averageWidth = Math.floor(tableWidth / columnCount);

    // 根据列数决定列宽策略：<= 4 列时均分，> 4 列时固定宽度 150
    const shouldUseFixedWidth = columnCount > 4;
    const columnWidth = shouldUseFixedWidth ? fixedWidth : averageWidth;

    // 生成列配置
    return keys.map((key) => ({
      title: <EllipsisPopover value={key} className="pointer-events-auto" />,
      dataIndex: key,
      width: columnWidth,
      ellipsis: true,
      render: (text: string) => {
        return <EllipsisPopover value={text} />;
      }
    }));
  };

  // 属性表格列定义 - 直接使用接口定义的字段名
  const attributeColumns: TableColumnProps<AttributeItem>[] = [
    {
      title: '属性名称',
      dataIndex: 'name',
      width: 200,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium leading-[22px] text-[#23293b]">
            {value}
          </span>
          {record.isPrimary === 1 && (
            <Tag size="small" color="blue">
              主键
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'id',
      dataIndex: 'id',
      width: 200,
      render: (value) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          <Popover content="复制">
            <IconCopy
              fontSize={14}
              className="cursor-pointer opacity-0 transition-opacity hover:text-[#184FF2] group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(String(value));
              }}
            />
          </Popover>
        </div>
      )
    },
    {
      title: '表字段',
      dataIndex: 'tableField',
      width: 150
    },
    {
      title: '关联公共属性',
      dataIndex: 'ontologyPublicPropertiesName',
      width: 200,
      render: (value) => {
        if (!value) {
          return <span className="text-[#86909C]">-</span>;
        }
        return (
          <span className="cursor-pointer group-hover:text-[#184FF2]">
            {value}
          </span>
        );
      }
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 120
    }
  ];

  // 渲染链接卡片（参考 panel.tsx 的实现）
  const renderLinkCard = (
    objectType: { id: string; name: string; icon?: string; iconColor?: string },
    isSource: boolean
  ) => {
    // 根据 icon 字段匹配对应的图标
    const iconOption = objectType.icon
      ? OBJECT_TYPE_ICON_OPTIONS.find(
          (option) => option.value === objectType.icon
        )
      : null;
    const IconComponent = iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

    return (
      <div
        className={`flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2`}
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <IconComponent className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {objectType.name}
        </span>
      </div>
    );
  };

  const displayData: ObjectTypeDetailData | undefined = basicInfo || data;
  const syncStatusConfig = displayData
    ? OBJECT_TYPE_SYNC_STATUS_CONFIG[
        displayData?.syncStatus || SyncStatus.SUCCESS
      ]
    : OBJECT_TYPE_SYNC_STATUS_CONFIG[SyncStatus.SUCCESS];

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
  }, [attributesPagination.total, displayData?.attributeCount]);
  const linkCount = useMemo(() => {
    return Number(displayData?.linkCount) || Number(linksData.length) || 0;
  }, [displayData?.linkCount, linksData.length]);

  return (
    <OsDrawer
      visible={visible}
      onCancel={onClose}
      title="对象类型详情"
      onEdit={handleEdit}
      footer={null}
      className={styles['object-type-detail-drawer']}
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
                  对象类型名称：
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-[4px]">
                  {(() => {
                    // 根据 icon 字段匹配对应的图标
                    const iconOption = displayData?.icon
                      ? OBJECT_TYPE_ICON_OPTIONS.find(
                          (option) => option.value === displayData.icon
                        )
                      : null;
                    const IconComponent =
                      iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

                    return (
                      <div className="flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center">
                        <IconComponent className="h-[14px] w-[14px]" />
                      </div>
                    );
                  })()}
                  <div className="min-w-0 flex-1">
                    <EllipsisPopover
                      preferTypography
                      value={displayData?.name || '-'}
                      className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-[8px]">
                <div className="w-[70px] text-sm font-normal leading-[22px] text-[#86909c]">
                  同步状态：
                </div>
                <div className="flex items-center gap-2 text-sm font-normal leading-[22px] text-[#23293b]">
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: syncStatusConfig.color }}
                  ></div>
                  <span>{syncStatusConfig.text}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-[16px]">
              <div className="flex gap-[8px]">
                <div className="flex w-[418px] gap-[8px]">
                  <div className="w-[100px] flex-shrink-0 text-[14px] leading-[22px] text-[var(--color-text-4)]">
                    描述说明：
                  </div>
                  <div className="min-w-0 flex-1">
                    <EllipsisPopover
                      preferTypography
                      value={displayData?.description || '-'}
                      isEdit={false}
                      className="w-full text-[14px] leading-[22px] text-[var(--color-text-1)]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-[8px]">
                <div className="w-[70px] text-[14px] leading-[22px] text-[var(--color-text-4)]">
                  id:
                </div>
                <div className="flex items-center gap-[4px]">
                  <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
                    {displayData?.id || resolvedObjectTypeId || '-'}
                  </span>
                  {(displayData?.id || resolvedObjectTypeId) && (
                    <IconCopy
                      fontSize={14}
                      className="hover:cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(
                          String(displayData?.id || resolvedObjectTypeId)
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </Spin>
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
                columns={getInstanceColumns(instancesData)}
                data={instancesData}
                rowKey="id"
                border={false}
                pagination={false}
                className="[&_.arco-table-th]:bg-[#f7f8fa]"
                noDataElement={<NoDataCard title="暂无数据" />}
                scroll={
                  instancesData.length > 0 &&
                  Object.keys(instancesData[0] || {}).length > 4
                    ? { x: Object.keys(instancesData[0] || {}).length * 150 }
                    : undefined
                }
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
                className="[&_.arco-table-th]:bg-[#f7f8fa]"
                rowClassName={() => 'group'}
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
          <TabPane key="links" title={`链接(${linkCount})`}>
            <div className="mt-[16px] flex flex-col gap-[16px]">
              {linksLoading ? (
                <div className="flex justify-center py-[100px]">
                  <Spin />
                </div>
              ) : linksData.length === 0 ? (
                <div className="flex justify-center py-[100px]">
                  <NoDataCard title="暂无数据" />
                </div>
              ) : (
                linksData.map((link) => {
                  // 确定左侧（当前节点）和右侧（关联节点）的显示
                  const leftObjectType = link.sourceObjectType;
                  const rightObjectType = link.targetObjectType;

                  return (
                    <div
                      key={link.linkId}
                      className="mb-[16px] rounded-[12px] border border-[var(--color-border-2)] bg-white p-[16px]"
                    >
                      {/* 标题区域 */}
                      <div className="mb-[8px] text-[14px] font-[600] text-[var(--color-text-1)]">
                        <EllipsisPopover value={link.linkName} />
                      </div>

                      {/* ID */}
                      <div className="mb-[8px] flex items-center gap-[8px] overflow-hidden leading-[22px]">
                        <span className="text-[14px] text-[var(--color-text-5)]">
                          id:
                        </span>
                        <span className="min-w-0 max-w-full text-[14px] text-[var(--color-text-1)]">
                          <EllipsisPopover value={link.linkId} />
                        </span>
                        <IconCopy
                          fontSize={14}
                          className="cursor-pointer hover:text-[#184FF2]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(link.linkId);
                          }}
                        />
                      </div>

                      {/* 关系图 */}
                      <div className="flex items-center rounded-[4px] bg-[#F2F8FF] p-[12px]">
                        {/* 左侧对象（当前节点） */}
                        {renderLinkCard(leftObjectType, true)}

                        {/* 箭头和关系类型 */}
                        <div className="flex flex-1 items-center gap-1">
                          <div className="h-0.5 flex-1 border-t border-dashed border-gray-300"></div>
                          <div className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            {getLinkTypeText(link.linkType)}
                          </div>
                          <div className="h-0.5 flex-1 border-t border-dashed border-gray-300"></div>
                          <div className="h-0 w-0 border-b-2 border-l-4 border-t-2 border-b-transparent border-l-gray-400 border-t-transparent"></div>
                        </div>

                        {/* 右侧对象（关联节点） */}
                        {renderLinkCard(rightObjectType, false)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </OsDrawer>
  );
}

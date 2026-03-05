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
import {
  DotStatus,
  EllipsisPopover,
  NoDataCard
} from '@ceai-front/arco-material';
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
import { isNil } from 'lodash-es';
import { getLinkTypeText } from '../../utils';

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
  [key: string]: any; // 动态字段，如 WIND, VIS 等
}

// 属性数据接口 - 直接使用接口定义的字段名
export type AttributeItem = PhysicalProperties;

// 链接数据接口
export interface LinkItem {
  linkId: string;
  linkName: string;
  linkType?: LinkType;
  sourceObjectTypeInfo: {
    name?: string;
    icon?: string;
    syncStatus?: SyncStatus;
    id?: string;
  };
  targetObjectTypeInfo: {
    name?: string;
    icon?: string;
    syncStatus?: SyncStatus;
    id?: string;
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
  linkCount = 0
): ObjectTypeDetailData => {
  return {
    code: String(detailRes.code || ''),
    id: detailRes.id,
    name: detailRes.name || '',
    description: detailRes.description || '',
    syncStatus: detailRes.syncStatus,
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
          if (res.code === '' && res.status === 200) {
            setInstancesData(res?.data?.result || []);
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
            ontologyModelID: Number(ontologyModelID),
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
            // 使用 GetOntologyObjectTypeDetailRes 转换函数
            // 注意：GetOntologyObjectTypeDetailRes 不包含 syncStatus，使用默认值
            const detailData = convertDetailResToDetailData(detailRes);
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
            ontologyModelID: Number(ontologyModelID),
            pageNo: 1,
            pageSize: 10
          });
          if (res.code === '' && res.status === 200 && res.data) {
            // 将 LinkInfo 转换为 LinkItem
            const convertedLinks: LinkItem[] = (res.data.result || []).map(
              (link: LinkInfo) => ({
                linkId: link.code || String(link.id || ''),
                linkName: link.name || '',
                linkType: link.type,
                sourceObjectTypeInfo: {
                  name: link.sourceObjectTypeName,
                  icon: link.sourceObjectTypeIcon,
                  syncStatus: link.sourceObjectTypeSyncStatus,
                  id: String(link.sourceObjectTypeID)
                },
                targetObjectTypeInfo: {
                  name: link.targetObjectTypeName,
                  icon: link.targetObjectTypeIcon,
                  syncStatus: link.targetObjectTypeSyncStatus,
                  id: String(link.targetObjectTypeID)
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
    const fixedWidth = 140; // 固定列宽（当列数 > 6 时使用）
    // 假设表格总宽度，可以根据实际情况调整（drawer 宽度通常较大，这里估算为 800px）
    const tableWidth = 852;
    const averageWidth = Math.floor(tableWidth / columnCount);

    // 根据列数决定列宽策略：<= 6 列时均分，> 6 列时固定宽度 150
    const shouldUseFixedWidth = columnCount > 6;
    const columnWidth = shouldUseFixedWidth ? fixedWidth : averageWidth;

    // 生成列配置
    return keys.map((key) => ({
      title: <EllipsisPopover value={key} className="pointer-events-auto" />,
      dataIndex: key,
      width: columnWidth,
      ellipsis: true,
      render: (text: string) => {
        return <EllipsisPopover value={text || '-'} />;
      }
    }));
  };

  const handleViewPublicAttribute = (record: AttributeItem) => {
    if (!record.ontologyPublicPropertiesName) {
      return;
    }
    const url = `/tenant/compute/modaforge/ontologyScene/detail/${ontologyModelID}/attributes/list?tab=public&search=${encodeURIComponent(record.ontologyPublicPropertiesName || '')}`;
    history.push(url);
  };

  // 属性表格列定义 - 直接使用接口定义的字段名
  const attributeColumns: TableColumnProps<AttributeItem>[] = [
    {
      title: '属性名称',
      dataIndex: 'comment',
      width: 140,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <EllipsisPopover
            className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]"
            value={value || '-'}
          />
          {record.isPrimary === 1 && (
            <Tag size="small" color="blue">
              主键
            </Tag>
          )}
        </div>
      )
    },
    {
      title: '属性id',
      dataIndex: 'name',
      width: 140,
      render: (value) => (
        <div className="flex items-center gap-2">
          <EllipsisPopover value={value || '-'} />
          {value && (
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
          )}
        </div>
      )
    },
    {
      title: '表字段',
      dataIndex: 'name',
      width: 140,
      render: (value) => {
        return <EllipsisPopover value={value || '-'} />;
      }
    },
    {
      title: '关联公共属性',
      dataIndex: 'ontologyPublicPropertiesName',
      width: 140,
      render: (value, record) => {
        return (
          <span
            onClick={() => {
              handleViewPublicAttribute(record);
            }}
          >
            <EllipsisPopover
              value={value || '-'}
              className={value ? 'hover-blue' : ''}
            />
          </span>
        );
      }
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 140,
      render: (value) => {
        return <EllipsisPopover value={value || '-'} />;
      }
    }
  ];

  // 渲染链接卡片（参考 panel.tsx 的实现）
  const renderLinkCard = (
    objectType: {
      id?: string;
      name?: string;
      icon?: string;
      syncStatus?: SyncStatus;
    },
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
        className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3"
        style={{
          backgroundColor: '#fff',
          minHeight: '56px'
        }}
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded">
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="min-w-0 text-[14px] leading-[22px] text-[#23293b]">
          <EllipsisPopover preferTypography value={name} />
        </div>
        {!isNil(objectType?.syncStatus) ? (
          <div className="flex items-center">
            <DotStatus
              text=""
              color={
                OBJECT_TYPE_SYNC_STATUS_CONFIG[objectType.syncStatus].color
              }
            />
          </div>
        ) : null}
      </div>
    );
  };

  const displayData: ObjectTypeDetailData | undefined = basicInfo;
  const syncStatusConfig =
    OBJECT_TYPE_SYNC_STATUS_CONFIG[
      displayData?.syncStatus ?? SyncStatus.NOT_SYNC
    ];

  const renderObjectTypeIcon = (icon?: string) => {
    // 根据 icon 字段匹配对应的图标
    const iconOption = icon
      ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === icon)
      : null;
    const IconComponent = iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

    return (
      <div className="flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center">
        <IconComponent className="h-[14px] w-[14px]" />
      </div>
    );
  };

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
                  {displayData?.name ? (
                    <>
                      {renderObjectTypeIcon(displayData.icon)}
                      <div className="min-w-0 flex-1">
                        <EllipsisPopover
                          preferTypography
                          value={displayData?.name}
                          className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
                        />
                      </div>
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div className="flex gap-[8px]">
                <div className="w-[90px] text-sm font-normal leading-[22px] text-[#86909c]">
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
                <div className="w-[90px] text-[14px] leading-[22px] text-[var(--color-text-4)]">
                  对象类型id:
                </div>
                <div className="flex items-center gap-[4px]">
                  <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
                    {displayData?.code ?? '-'}
                  </span>
                  {displayData?.code && (
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
          <TabPane key="instances" title={`实例(${instancesPagination.total})`}>
            <div className="mt-[16px] flex flex-col gap-[16px]">
              {instancesPagination.total === 0 ? (
                <div className="flex justify-center py-[100px]">
                  <NoDataCard title="暂无数据" />
                </div>
              ) : (
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
                    Object.keys(instancesData[0] || {}).length > 6
                      ? { x: Object.keys(instancesData[0] || {}).length * 150 }
                      : undefined
                  }
                />
              )}
              {instancesPagination.total > defaultInstancesPageSize && (
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
          <TabPane
            key="attributes"
            title={`属性(${attributesPagination.total})`}
          >
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
              {attributesPagination.total > defaultAttributesPageSize && (
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
          <TabPane key="links" title={`链接(${linksData.length})`}>
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
                  const leftObjectType = link.sourceObjectTypeInfo ?? {};
                  const rightObjectType = link.targetObjectTypeInfo ?? {};

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
                      <div className="flex items-center bg-[#F2F8FF] p-[12px]">
                        {renderLinkCard(leftObjectType, true)}
                        <div className="flex w-[76px] min-w-[76px] items-center">
                          <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
                          <span className="rounded border border-[#E5E6EB] bg-white px-2 py-[2px] text-[12px] leading-[18px] text-[#23293b]">
                            {getLinkTypeText(link.linkType)}
                          </span>
                          <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
                          <div className="h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-gray-400 border-t-transparent"></div>
                        </div>
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

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Tabs,
  Table,
  TableColumnProps,
  Pagination,
  Tag,
  Message,
  Spin
} from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import { OsDrawer } from '@/pages/ontologyScene/componens';
import { EllipsisPopover, NoDataCard } from '@ceai-front/arco-material';
import copy from 'copy-to-clipboard';

const TabPane = Tabs.TabPane;

// 对象类型详情数据接口
export interface ObjectTypeDetailData {
  id: string;
  name: string;
  description: string;
  syncStatus: 'success' | 'running' | 'failed';
  iconColor?: string;
  instanceCount: number;
  attributeCount: number;
  linkCount: number;
}

// 实例数据接口
export interface InstanceItem {
  id: string;
  [key: string]: any; // 动态字段，如 WIND, VIS 等
}

// 属性数据接口
export interface AttributeItem {
  attributeName: string;
  id: string;
  tableField: string;
  publicAttributeId?: string;
  publicAttributeName?: string;
  fieldType: string;
  isPrimaryKey?: boolean;
}

// 链接数据接口
export interface LinkItem {
  linkId: string;
  linkName: string;
  sourceObjectType: {
    id: string;
    name: string;
    iconColor?: string;
  };
  targetObjectType: {
    id: string;
    name: string;
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

// ---- 默认 mock 请求（后续可替换成真实接口调用）----
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function defaultFetchBasicInfo(
  objectTypeId: string
): Promise<ObjectTypeDetailData> {
  await sleep(200);
  return {
    id: objectTypeId,
    name: `对象类型-${objectTypeId}`,
    description: '（mock）分布在边界区域的实时数据采集设备信息流映射',
    syncStatus: 'success',
    iconColor: '#00b42a',
    instanceCount: 100,
    attributeCount: 5,
    linkCount: 2
  };
}

async function defaultFetchInstances(
  objectTypeId: string,
  params: { page: number; pageSize: number }
): Promise<{ items: InstanceItem[]; total: number }> {
  await sleep(250);
  const total = 100;
  const start = (params.page - 1) * params.pageSize;
  const end = Math.min(start + params.pageSize, total);
  const items: InstanceItem[] = Array.from({
    length: Math.max(end - start, 0)
  }).map((_, idx) => {
    const n = start + idx + 1;
    return {
      id: `${objectTypeId}-INS-${String(n).padStart(3, '0')}`,
      WIND: `${(Math.random() * 30).toFixed(1)}m/s`,
      VIS: `${Math.floor(Math.random() * 50) + 1}km`
    };
  });
  return { items, total };
}

async function defaultFetchAttributes(
  objectTypeId: string,
  params: { page: number; pageSize: number }
): Promise<{ items: AttributeItem[]; total: number }> {
  await sleep(180);
  const all: AttributeItem[] = [
    {
      attributeName: '主键',
      id: `${objectTypeId}_pk`,
      tableField: 'id',
      publicAttributeName: 'id',
      fieldType: 'STRING',
      isPrimaryKey: true
    },
    {
      attributeName: '当前风速',
      id: `${objectTypeId}_wind_speed`,
      tableField: 'anemometer_val',
      publicAttributeName: '风速参数',
      fieldType: 'STRING'
    },
    {
      attributeName: '能见度',
      id: `${objectTypeId}_visibility`,
      tableField: 'opt_visibility_m',
      fieldType: 'STRING'
    },
    {
      attributeName: '温度',
      id: `${objectTypeId}_temperature`,
      tableField: 'temp',
      fieldType: 'NUMBER'
    },
    {
      attributeName: '湿度',
      id: `${objectTypeId}_humidity`,
      tableField: 'humidity',
      fieldType: 'NUMBER'
    }
  ];
  const total = all.length;
  const start = (params.page - 1) * params.pageSize;
  const end = Math.min(start + params.pageSize, total);
  return { items: all.slice(start, end), total };
}

async function defaultFetchLinks(objectTypeId: string): Promise<LinkItem[]> {
  await sleep(220);
  return [
    {
      linkId: `${objectTypeId}_link_1`,
      linkName: '监测区域',
      sourceObjectType: {
        id: objectTypeId,
        name: `对象类型-${objectTypeId}`,
        iconColor: '#00b42a'
      },
      targetObjectType: {
        id: 'GeographicalArea',
        name: '地理区域',
        iconColor: '#722ED1'
      }
    },
    {
      linkId: `${objectTypeId}_link_2`,
      linkName: '读取数据',
      sourceObjectType: {
        id: 'GeographicalArea',
        name: '地理区域',
        iconColor: '#722ED1'
      },
      targetObjectType: {
        id: objectTypeId,
        name: `对象类型-${objectTypeId}`,
        iconColor: '#00b42a'
      }
    }
  ];
}

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
  const { id: OSId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab);

  useEffect(() => {
    if (visible && defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [visible, defaultActiveTab]);

  const resolvedObjectTypeId = useMemo(() => {
    return objectTypeId || data?.id;
  }, [objectTypeId, data?.id]);

  const fetchBasicInfoFn = fetchBasicInfo || defaultFetchBasicInfo;
  const fetchInstancesFn = fetchInstances || defaultFetchInstances;
  const fetchAttributesFn = fetchAttributes || defaultFetchAttributes;
  const fetchLinksFn = fetchLinks || defaultFetchLinks;

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
      if (!resolvedObjectTypeId) return;
      setInstancesLoading(true);
      try {
        const res = await fetchInstancesFn(resolvedObjectTypeId, {
          page,
          pageSize
        });
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
    [fetchInstancesFn, resolvedObjectTypeId]
  );

  const loadAttributes = useCallback(
    async (page: number, pageSize: number) => {
      if (!resolvedObjectTypeId) return;
      setAttributesLoading(true);
      try {
        const res = await fetchAttributesFn(resolvedObjectTypeId, {
          page,
          pageSize
        });
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
    [fetchAttributesFn, resolvedObjectTypeId]
  );

  // 当抽屉打开且 objectTypeId 变化时，分别请求：基本信息 / 属性 / 链接 / 实例
  useEffect(() => {
    if (!visible || !resolvedObjectTypeId) return;

    // 基本信息
    (async () => {
      setBasicInfoLoading(true);
      try {
        const res = await fetchBasicInfoFn(resolvedObjectTypeId);
        setBasicInfo(res);
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
        const res = await fetchLinksFn(resolvedObjectTypeId);
        setLinksData(res || []);
      } catch (e) {
        Message.error('加载链接失败');
      } finally {
        setLinksLoading(false);
      }
    })();

    // 实例（默认拉第一页）
    loadInstances(1, instancesPagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, resolvedObjectTypeId]);

  // 处理编辑按钮点击
  const handleEdit = () => {
    if (resolvedObjectTypeId) {
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/edit/${resolvedObjectTypeId}`
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
    if (instanceData.length === 0) {
      return [
        {
          title: 'ID',
          dataIndex: 'id',
          width: 150
        }
      ];
    }

    // 获取第一条数据的所有字段作为列
    const firstInstance = instanceData[0];
    const columns: TableColumnProps<InstanceItem>[] = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 150
      }
    ];

    // 添加其他字段列（排除 id）
    Object.keys(firstInstance)
      .filter((key) => key !== 'id')
      .forEach((key) => {
        columns.push({
          title: key.toUpperCase(),
          dataIndex: key,
          width: 150
        });
      });

    return columns;
  };

  // 属性表格列定义
  const attributeColumns: TableColumnProps<AttributeItem>[] = [
    {
      title: '属性名称',
      dataIndex: 'attributeName',
      width: 200,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span className="font-PingFangSc text-[14px] font-medium leading-[22px] text-[#23293b]">
            {value}
          </span>
          {record.isPrimaryKey && (
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
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] font-normal leading-[22px] text-[#23293b]">
            {value}
          </span>
          <IconCopy
            fontSize={14}
            className="hover:cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(value);
            }}
          />
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
      dataIndex: 'publicAttributeName',
      width: 200,
      render: (value) => {
        if (!value) {
          return <span className="text-[#86909C]">-</span>;
        }
        return (
          <span className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#165dff]">
            {value}
          </span>
        );
      }
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      width: 120
    }
  ];

  // 渲染链接卡片
  const renderLinkCard = (
    objectType: { id: string; name: string; iconColor?: string },
    isSource: boolean
  ) => {
    return (
      <div
        className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3"
        style={{
          backgroundColor: isSource ? '#E8F4FF' : '#F5E8FF',
          minHeight: '56px'
        }}
      >
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded"
          style={{
            backgroundColor: objectType.iconColor || '#165dff'
          }}
        >
          <div className="h-3 w-3 rounded-sm bg-white"></div>
        </div>
        <div className="flex-1 font-PingFangSc text-sm font-normal leading-[22px] text-[#23293b]">
          {objectType.name}
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-[#00b42a]"></div>
        </div>
      </div>
    );
  };

  const displayData: ObjectTypeDetailData | undefined = basicInfo || data;
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
      // className="[&_.arco-drawer-content]:px-6 [&_.arco-drawer-content]:pb-6"
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
                  <div className="h-[14px] w-[14px] bg-[#10B981]"></div>
                  <div className="min-w-0 flex-1">
                    <EllipsisPopover
                      preferTypography
                      value={displayData?.name || '-'}
                      isEdit={false}
                      className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
                    />
                  </div>
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
              <Spin loading={linksLoading}>
                {linksData.map((link, index) => (
                  <div
                    key={link.linkId}
                    className={`flex flex-col gap-3 ${index !== linksData.length - 1 ? 'mb-6' : ''}`}
                  >
                    <div className="flex items-center gap-2 font-PingFangSc text-sm font-normal leading-[22px] text-[#23293b]">
                      <span className="text-[#86909c]">链接id:</span>
                      <span className="text-[#23293b]">{link.linkId}</span>
                      <IconCopy
                        fontSize={14}
                        className="hover:cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(link.linkId);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      {renderLinkCard(link.sourceObjectType, true)}
                      {renderLinkCard(link.targetObjectType, false)}
                    </div>
                  </div>
                ))}
                {!linksLoading && linksData.length === 0 && (
                  <div className="text-[14px] text-[#86909c]">暂无链接</div>
                )}
              </Spin>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </OsDrawer>
  );
}

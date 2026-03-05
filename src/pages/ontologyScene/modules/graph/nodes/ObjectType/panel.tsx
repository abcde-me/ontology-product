import type { FC } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Tabs,
  Table,
  Message,
  Popover,
  Tag,
  Spin,
  Pagination
} from '@arco-design/web-react';
import { IconCopy, IconFile } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import {
  listOntologyObjectTypeData,
  listOntologyPhysicalProperties,
  listOntologyLinkType
} from '@/api/ontologySceneLibrary/graph';
import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import type {
  ListOntologyObjectTypeDataRes,
  ListOntologyPhysicalPropertiesRes,
  ListOntologyLinkTypeRes,
  PhysicalProperties,
  LinkInfo
} from '@/types/graphApi';
import type { GetOntologyObjectTypeDetailRes } from '@/types/objectType';
import { LinkType, SyncStatus } from '@/types/graphApi';
import {
  DotStatus,
  EllipsisPopover,
  NoDataCard
} from '@ceai-front/arco-material';
import {
  OBJECT_TYPE_ICON_OPTIONS,
  OBJECT_TYPE_SYNC_STATUS_CONFIG
} from '@/pages/ontologyScene/common/constants';
import { useHistory, useParams } from 'react-router';
import { isNil } from 'lodash-es';
import { getLinkTypeText } from '@/pages/ontologyScene/utils';
import { AttributeItem } from '@/pages/ontologyScene/componens/ObjectTypeDetailDrawer';

const defaultPageSize = 10;

const Panel: FC<any> = ({ id, data }) => {
  const [activeTab, setActiveTab] = useState('instances');
  const [instancesData, setInstancesData] = useState<any[]>([]);
  const [instancesTotal, setInstancesTotal] = useState(0);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [instancesPage, setInstancesPage] = useState(1);
  const [instancesPageSize, setInstancesPageSize] = useState(defaultPageSize);
  const { id: OSId } = useParams<{ id: string }>();
  const history = useHistory();

  const [propertiesData, setPropertiesData] = useState<PhysicalProperties[]>(
    []
  );
  const [propertiesTotal, setPropertiesTotal] = useState(0);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesPage, setPropertiesPage] = useState(1);
  const [propertiesPageSize, setPropertiesPageSize] = useState(10);

  const [linksData, setLinksData] = useState<LinkInfo[]>([]);
  const [linksTotal, setLinksTotal] = useState(0);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksPage, setLinksPage] = useState(1);
  const [linksPageSize, setLinksPageSize] = useState(defaultPageSize);

  // 对象详情相关状态
  const [objectTypeDetail, setObjectTypeDetail] =
    useState<GetOntologyObjectTypeDetailRes | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 获取节点ID，从 id 或 data 中提取
  // id prop 是字符串类型（如 "1"），需要转换为数字
  const nodeId = data?.id || (id ? Number(id) : 1);

  const handleCopy = (value: string) => {
    const isCopySuccess = copy(value);
    if (isCopySuccess) {
      Message.success('复制成功');
    } else {
      Message.error('复制失败');
    }
  };

  // 加载实例数据
  const loadInstances = async (page: number, pageSize: number) => {
    setInstancesLoading(true);
    try {
      const res = await listOntologyObjectTypeData({
        id: nodeId,
        page,
        pageSize
      });
      if (res.status === 200 && res.code === '' && res.data) {
        setInstancesData(res.data.result || []);
        setInstancesTotal(res.data.totalCount || 0);
      }
    } catch (error) {
      console.error('加载实例数据失败:', error);
    } finally {
      setInstancesLoading(false);
    }
  };

  // 加载属性数据
  const loadProperties = async (page: number, pageSize: number) => {
    setPropertiesLoading(true);
    try {
      const res = await listOntologyPhysicalProperties({
        objectTypeIdList: [nodeId],
        ontologyModelID: Number(OSId),
        pageNo: page,
        pageSize
      });
      if (res.code === '' && res.status === 200 && res.data) {
        setPropertiesData(res.data.result || []);
        setPropertiesTotal(res.data.totalCount || 0);
      }
    } catch (error) {
      console.error('加载属性数据失败:', error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  // 加载链接数据
  const loadLinks = async (page: number, pageSize: number) => {
    setLinksLoading(true);
    try {
      const res = await listOntologyLinkType({
        ontologyModelID: Number(OSId),
        sourceObjectTypeIDList: [nodeId],
        targetObjectTypeIDList: [nodeId],
        pageNo: page,
        pageSize: pageSize
      });
      if (res.code === '' && res.status === 200 && res.data) {
        setLinksData(res.data.result || []);
        setLinksTotal(res.data.totalCount || 0);
      }
    } catch (error) {
      console.error('加载链接数据失败:', error);
    } finally {
      setLinksLoading(false);
    }
  };

  // 加载对象详情
  const loadObjectTypeDetail = async () => {
    if (!nodeId) return;
    setDetailLoading(true);
    try {
      const res = await getOntologyObjectTypeDetail({ id: nodeId });
      if (res.status === 200 && res.code === '' && res.data) {
        setObjectTypeDetail(res.data);
      }
    } catch (error) {
      console.error('加载对象详情失败:', error);
      Message.error('加载对象详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadObjectTypeDetail();
    loadProperties(propertiesPage, propertiesPageSize);
    loadLinks(linksPage, linksPageSize);
  }, [nodeId]);

  // 根据 tab 切换加载数据
  useEffect(() => {
    if (activeTab === 'instances') {
      loadInstances(instancesPage, instancesPageSize);
    } else if (activeTab === 'properties') {
      loadProperties(propertiesPage, propertiesPageSize);
    } else if (activeTab === 'links') {
      loadLinks(linksPage, linksPageSize);
    }
  }, [
    activeTab,
    instancesPage,
    instancesPageSize,
    propertiesPage,
    propertiesPageSize,
    linksPage,
    linksPageSize
  ]);

  // 动态生成实例表格列
  const instancesColumns = useMemo(() => {
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
    const fixedWidth = 140; // 固定列宽
    const tableWidth = 368; // 假设表格总宽度，可以根据实际情况调整
    const averageWidth = Math.floor(tableWidth / columnCount);

    // 根据列数决定列宽策略
    const shouldUseFixedWidth = columnCount > 4;
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
  }, [instancesData]);

  const handleViewPublicAttribute = (record: AttributeItem) => {
    if (!record.ontologyPublicPropertiesName) {
      return;
    }
    const url = `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/attributes/list?tab=public&search=${encodeURIComponent(record.ontologyPublicPropertiesName || '')}`;
    history.push(url);
  };

  // 属性表格列
  const propertiesColumns = [
    {
      title: '属性名称',
      dataIndex: 'comment',
      width: 140,
      ellipsis: true,
      render: (text: string, record: PhysicalProperties) => (
        <div className="flex items-center gap-2">
          <EllipsisPopover className="font-[600]" value={text || '-'} />
          {record.isPrimary === 1 && (
            <Tag color="purple" size="small">
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
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <EllipsisPopover value={text || '-'} />
          {text && (
            <Popover content="复制">
              <IconCopy
                fontSize={14}
                className="cursor-pointer opacity-0 transition-opacity hover:text-[#184FF2] group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(String(text));
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
      render: (text: string) => <EllipsisPopover value={text || '-'} />
    },
    {
      title: '关联公共属性',
      dataIndex: 'ontologyPublicPropertiesName',
      width: 140,
      render: (text: string, record: PhysicalProperties) => {
        if (text && text !== '-') {
          return (
            <span
              onClick={() => {
                handleViewPublicAttribute(record);
              }}
            >
              <EllipsisPopover
                value={text || '-'}
                className={
                  text ? 'cursor-pointer group-hover:text-[#184FF2]' : ''
                }
              />
            </span>
          );
        }
        return <span>-</span>;
      }
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 140
    }
  ];

  // 渲染对象类型卡片
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
                OBJECT_TYPE_SYNC_STATUS_CONFIG[objectType!.syncStatus].color
              }
            />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* 基本信息 */}
      <div className="flex flex-col gap-[12px] px-[16px] pb-[24px] pt-[16px]">
        <div className="text-[14px] font-[600] text-[var(--color-text-1)]">
          基本信息
        </div>
        <Spin loading={detailLoading}>
          <div className="flex items-center">
            <span className="w-[82px] text-[14px] text-[var(--color-text-4)]">
              同步状态:
            </span>
            {objectTypeDetail?.syncStatus !== undefined ? (
              <DotStatus
                text={
                  OBJECT_TYPE_SYNC_STATUS_CONFIG[objectTypeDetail.syncStatus]
                    .text
                }
                color={
                  OBJECT_TYPE_SYNC_STATUS_CONFIG[objectTypeDetail.syncStatus]
                    .color
                }
              />
            ) : (
              '-'
            )}
          </div>
          <div className="flex items-center">
            <span className="w-[82px] flex-shrink-0 text-[14px] text-[var(--color-text-4)]">
              对象类型id:
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-1 leading-[22px]">
              <EllipsisPopover
                value={objectTypeDetail?.code || '-'}
                wrapperClassName="min-w-0"
                className="text-[14px] text-[var(--color-text-1)]"
              ></EllipsisPopover>
              {objectTypeDetail?.code && (
                <Popover content="复制">
                  <IconCopy
                    fontSize={14}
                    className="flex-shrink-0 cursor-pointer hover:text-[#184FF2]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(objectTypeDetail?.code || '');
                    }}
                  />
                </Popover>
              )}
            </div>
          </div>
        </Spin>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} className="px-4">
        <Tabs.TabPane key="instances" title={`实例(${instancesTotal})`}>
          {instancesTotal === 0 ? (
            <div className="flex justify-center py-[100px]">
              <NoDataCard title="暂无数据" />
            </div>
          ) : (
            <Table
              columns={instancesColumns}
              data={instancesData}
              loading={instancesLoading}
              scroll={
                instancesColumns.length > 4
                  ? { x: instancesColumns.length * 140 }
                  : undefined
              }
              pagination={false}
              rowKey={(record) => `${record.id}`}
              border={false}
              // className="mt-2"
              noDataElement={<NoDataCard title="暂无数据" />}
            />
          )}
          {instancesTotal > defaultPageSize && (
            <div className="mt-[16px] flex items-center justify-end">
              <Pagination
                current={instancesPage}
                pageSize={instancesPageSize}
                total={instancesTotal}
                showTotal
                sizeOptions={[10, 20, 50, 100]}
                onChange={(page, pageSize) => {
                  setInstancesPage(page);
                  setInstancesPageSize(pageSize);
                }}
              />
            </div>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane key="properties" title={`属性(${propertiesTotal})`}>
          <Table
            columns={propertiesColumns}
            data={propertiesData}
            scroll={{ x: 400 }}
            loading={propertiesLoading}
            rowClassName={() => 'group'}
            noDataElement={<NoDataCard title="暂无数据" />}
            rowKey="id"
            border={false}
            pagination={false}
            // className="mt-2"
          />
          {propertiesTotal > defaultPageSize && (
            <div className="mt-[16px] flex items-center justify-end">
              <Pagination
                current={propertiesPage}
                pageSize={propertiesPageSize}
                total={propertiesTotal}
                showTotal
                sizeOptions={[10, 20, 50, 100]}
                onChange={(page, pageSize) => {
                  setPropertiesPage(page);
                  setPropertiesPageSize(pageSize);
                }}
              />
            </div>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane key="links" title={`链接(${linksTotal})`}>
          {linksTotal === 0 ? (
            <div className="flex justify-center py-[100px]">
              <NoDataCard title="暂无数据" />
            </div>
          ) : (
            <div>
              {linksData.map((link) => {
                // 判断当前节点是源节点还是目标节点
                const isSource = link.sourceObjectTypeID === nodeId;
                // 确定左侧（当前节点）和右侧（关联节点）的显示
                const leftObjectType = {
                  name: link.sourceObjectTypeName,
                  icon: link.sourceObjectTypeIcon,
                  syncStatus: link.sourceObjectTypeSyncStatus
                };
                const rightObjectType = {
                  name: link.targetObjectTypeName,
                  icon: link.targetObjectTypeIcon,
                  syncStatus: link.targetObjectTypeSyncStatus
                };
                const linkTypeText = getLinkTypeText(link.type);

                return (
                  <div
                    key={link.id}
                    className="mb-[16px] rounded-[12px] border border-[var(--color-border-2)] bg-white p-[16px]"
                  >
                    {/* 标题区域 */}
                    <div className="mb-[8px] text-[14px] font-[600] text-[var(--color-text-1)]">
                      <EllipsisPopover value={link.name} />
                    </div>

                    {/* ID */}
                    <div className="mb-[8px] flex items-center gap-[8px] overflow-hidden leading-[22px]">
                      <span className="text-[14px] text-[var(--color-text-5)]">
                        id:
                      </span>
                      <span className="min-w-0 max-w-full text-[14px] text-[var(--color-text-1)]">
                        <EllipsisPopover value={link.code} />
                      </span>
                      <Popover content="复制">
                        <IconCopy
                          fontSize={14}
                          className="cursor-pointer hover:text-[#184FF2]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(link.code || String(link.id));
                          }}
                        />
                      </Popover>
                    </div>

                    {/* 关系图 */}
                    <div className="flex items-center bg-[#F2F8FF] p-[12px]">
                      {renderObjectTypeCard(leftObjectType, true)}
                      <div className="flex w-[76px] min-w-[76px] items-center">
                        <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
                        <span className="rounded border border-[#E5E6EB] bg-white px-2 py-[2px] text-[12px] leading-[18px] text-[#23293b]">
                          {linkTypeText}
                        </span>
                        <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
                        <div className="h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-gray-400 border-t-transparent"></div>
                      </div>
                      {renderObjectTypeCard(rightObjectType, false)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(Panel);

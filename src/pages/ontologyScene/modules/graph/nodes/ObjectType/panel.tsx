import type { FC } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Tabs,
  Table,
  Message,
  Popover,
  Tag,
  Spin
} from '@arco-design/web-react';
import { IconCopy, IconFile } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import {
  listOntologyObjectTypeData,
  listOntologyPhysicalProperties,
  listOntologyLinkType
} from '@/api/ontologySceneLibrary/graph';
import type {
  ListOntologyObjectTypeDataRes,
  ListOntologyPhysicalPropertiesRes,
  ListOntologyLinkTypeRes,
  PhysicalProperties,
  LinkInfo
} from '@/types/graphApi';
import { LinkType, SyncStatus } from '@/types/graphApi';
import {
  DotStatus,
  EllipsisPopover,
  NoDataCard
} from '@ceai-front/arco-material';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';

const Panel: FC<any> = ({ id, data }) => {
  const [activeTab, setActiveTab] = useState('instances');
  const [instancesData, setInstancesData] = useState<any[]>([]);
  const [instancesTotal, setInstancesTotal] = useState(0);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [instancesPage, setInstancesPage] = useState(1);
  const [instancesPageSize, setInstancesPageSize] = useState(10);

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
  const [linksPageSize, setLinksPageSize] = useState(10);

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
    console.log('loadInstances', page, pageSize);
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
        sourceObjectTypeIDList: [nodeId],
        targetObjectTypeIDList: [nodeId],
        pageNo: page,
        pageSize
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

  useEffect(() => {
    loadProperties(propertiesPage, propertiesPageSize);
    loadLinks(linksPage, linksPageSize);
  }, []);

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
        return <EllipsisPopover value={text} />;
      }
    }));
  }, [instancesData]);

  // 属性表格列
  const propertiesColumns = [
    {
      title: '属性名称',
      dataIndex: 'name',
      width: 150,
      ellipsis: true,
      render: (text: string, record: PhysicalProperties) => (
        <div className="flex items-center gap-2">
          <EllipsisPopover value={text} />
          {record.isPrimary === 1 && (
            <Tag color="purple" size="small">
              主键
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'id',
      dataIndex: 'id',
      width: 100,
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <span>{text}</span>
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
      width: 150,
      render: (text: string) => {
        if (text && text !== '-') {
          return (
            <span className="cursor-pointer group-hover:text-[#184FF2]">
              {text}
            </span>
          );
        }
        return <span>-</span>;
      }
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 120
    }
  ];

  // 链接关系类型映射
  const getLinkTypeText = (type?: LinkType) => {
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

  // 获取对象类型图标颜色
  const getObjectTypeColor = (icon?: string) => {
    // 根据图标类型返回颜色，这里简化处理
    return icon === 'intelligence' ||
      icon === 'track' ||
      icon === 'mission' ||
      icon === 'asset'
      ? 'green'
      : 'purple';
  };

  // 渲染链接卡片（参考 ObjectTypeDetailDrawer.tsx 的实现）
  const renderLinkCard = (
    objectType: { name: string; icon?: string; iconColor?: string },
    isSource: boolean
  ) => {
    // 根据 icon 字段匹配对应的图标
    const iconOption = objectType.icon
      ? OBJECT_TYPE_ICON_OPTIONS.find(
          (option) => option.value === objectType.icon
        )
      : null;
    const IconComponent = iconOption?.icon;

    const color = objectType.iconColor || '#165dff';
    const isGreen = color === '#00b42a' || color === 'green';
    return (
      <div
        className={`flex items-center gap-2 rounded border px-3 py-2 ${
          isGreen
            ? 'border-green-200 bg-green-50'
            : 'border-purple-200 bg-purple-50'
        }`}
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
          {IconComponent ? (
            <IconComponent className="h-6 w-6" />
          ) : (
            <IconFile className="h-6 w-6" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {objectType.name}
        </span>
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
        <div className="flex items-center">
          <span className="w-[82px] text-[14px] text-[var(--color-text-4)]">
            同步状态:
          </span>
          <DotStatus text="成功" color="#0CBF92" />
        </div>
        <div className="flex items-center">
          <span className="w-[82px] text-[14px] text-[var(--color-text-4)]">
            对象类型id:
          </span>
          <div className="flex items-center gap-1 leading-[22px]">
            <span className="text-[14px] text-[var(--color-text-1)]">{id}</span>
            <Popover content="复制">
              <IconCopy
                fontSize={14}
                className="cursor-pointer hover:text-[#184FF2]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(id || 'WeatherStation');
                }}
              />
            </Popover>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} className="px-4">
        <Tabs.TabPane key="instances" title={`实例(${instancesTotal})`}>
          <Table
            columns={instancesColumns}
            data={instancesData}
            loading={instancesLoading}
            scroll={
              instancesColumns.length > 4
                ? { x: instancesColumns.length * 140 }
                : undefined
            }
            pagination={{
              current: instancesPage,
              pageSize: instancesPageSize,
              total: instancesTotal,
              showTotal: true,
              showJumper: true,
              sizeCanChange: true,
              sizeOptions: [10, 20, 50, 100],
              onChange: (page, pageSize) => {
                setInstancesPage(page);
                setInstancesPageSize(pageSize);
              }
            }}
            rowKey={(record) => `${record.id}`}
            border={false}
            // className="mt-2"
            noDataElement={<NoDataCard title="暂无数据" />}
          />
        </Tabs.TabPane>

        <Tabs.TabPane key="properties" title={`属性(${propertiesTotal})`}>
          <Table
            columns={propertiesColumns}
            data={propertiesData}
            scroll={{ x: 400 }}
            loading={propertiesLoading}
            rowClassName={() => 'group'}
            pagination={{
              current: propertiesPage,
              pageSize: propertiesPageSize,
              total: propertiesTotal,
              showTotal: true,
              showJumper: true,
              sizeCanChange: true,
              sizeOptions: [10, 20, 50, 100],
              onChange: (page, pageSize) => {
                setPropertiesPage(page);
                setPropertiesPageSize(pageSize);
              }
            }}
            noDataElement={<NoDataCard title="暂无数据" />}
            rowKey="id"
            border={false}
            // className="mt-2"
          />
        </Tabs.TabPane>

        <Tabs.TabPane key="links" title={`链接(${linksTotal})`}>
          <div>
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
                // 判断当前节点是源节点还是目标节点
                const isSource = link.sourceObjectTypeID === nodeId;
                // 确定左侧（当前节点）和右侧（关联节点）的显示
                const leftObjectType = {
                  name: isSource
                    ? link.sourceObjectTypeName || '未知'
                    : link.targetObjectTypeName || '未知',
                  icon: isSource
                    ? link.sourceObjectTypeIcon
                    : link.targetObjectTypeIcon,
                  iconColor: isSource
                    ? getObjectTypeColor(link.sourceObjectTypeIcon)
                    : getObjectTypeColor(link.targetObjectTypeIcon)
                };
                const rightObjectType = {
                  name: isSource
                    ? link.targetObjectTypeName || '未知'
                    : link.sourceObjectTypeName || '未知',
                  icon: isSource
                    ? link.targetObjectTypeIcon
                    : link.sourceObjectTypeIcon,
                  iconColor: isSource
                    ? getObjectTypeColor(link.targetObjectTypeIcon)
                    : getObjectTypeColor(link.sourceObjectTypeIcon)
                };
                const linkType = getLinkTypeText(link.type);

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
                    <div className="flex items-center rounded-[4px] bg-[#F2F8FF] p-[12px]">
                      {/* 左侧对象（当前节点） */}
                      {renderLinkCard(leftObjectType, true)}

                      {/* 箭头和关系类型 */}
                      <div className="flex flex-1 items-center gap-1">
                        <div className="h-0.5 flex-1 border-t border-dashed border-gray-300"></div>
                        <div className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          {linkType}
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
            {linksTotal > linksPageSize && (
              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2">
                  <button
                    className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={linksPage === 1}
                    onClick={() => setLinksPage(linksPage - 1)}
                  >
                    上一页
                  </button>
                  <span className="text-sm text-gray-600">
                    {linksPage} / {Math.ceil(linksTotal / linksPageSize)}
                  </span>
                  <button
                    className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={
                      linksPage >= Math.ceil(linksTotal / linksPageSize)
                    }
                    onClick={() => setLinksPage(linksPage + 1)}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(Panel);

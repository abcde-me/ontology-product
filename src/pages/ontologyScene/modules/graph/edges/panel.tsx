import { IconClose, IconCopy, IconLink } from '@arco-design/web-react/icon';
import { useDemoStore } from '../common/store';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useHideNodePanel } from '../common/useHideNodePanel';
import {
  Button,
  Message,
  Spin,
  Table,
  TableColumnProps,
  Tabs,
  Pagination
} from '@arco-design/web-react';
import { useHistory, useParams } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import {
  EllipsisPopover,
  NoDataCard,
  DotStatus
} from '@ceai-front/arco-material';
import {
  getOntologyLinkType,
  listOntologyLinkTypeData,
  listOntologyLinkTypeColumn
} from '@/api/ontologySceneLibrary/links';
import { GetOntologyLinkTypeRes } from '@/types/links';
import {
  OBJECT_TYPE_ICON_OPTIONS,
  OBJECT_TYPE_SYNC_STATUS_CONFIG
} from '@/pages/ontologyScene/common/constants';
import { LinkType, SyncStatus } from '@/types/graphApi';
import { isNil } from 'lodash-es';

const TabPane = Tabs.TabPane;

function EdgePanel() {
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const setShowCustomEdgePanel = useDemoStore((s) => s.setShowCustomEdgePanel);
  const selectedEdgeId = useDemoStore((s) => s.selectedEdgeId);
  const showCustomEdgePanel = useDemoStore((s) => s.showCustomEdgePanel);
  const { hideNodePanel } = useHideNodePanel();

  // 当 EdgePanel 显示时，隐藏节点面板
  useEffect(() => {
    if (showCustomEdgePanel) {
      hideNodePanel();
    }
  }, [showCustomEdgePanel]);

  const [basicInfo, setBasicInfo] = useState<GetOntologyLinkTypeRes | null>(
    null
  );
  const [basicInfoLoading, setBasicInfoLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('instances');

  const [instancesData, setInstancesData] = useState<Record<string, any>[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [instancesPagination, setInstancesPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const [attributesData, setAttributesData] = useState<any[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributesPagination, setAttributesPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 加载链接详情
  const loadBasicInfo = useCallback(async () => {
    if (!selectedEdgeId) return;
    setBasicInfoLoading(true);
    try {
      const res = await getOntologyLinkType({ id: selectedEdgeId });
      if (res.status === 200 && res.code === '' && res.data) {
        setBasicInfo(res.data);
      } else {
        Message.error(res.message || '加载链接详情失败');
      }
    } catch (error) {
      Message.error('加载链接详情失败');
      console.error('加载链接详情失败:', error);
    } finally {
      setBasicInfoLoading(false);
    }
  }, [selectedEdgeId]);

  // 加载实例列表
  const loadInstances = useCallback(
    async (page: number, pageSize: number) => {
      if (!selectedEdgeId) return;
      setInstancesLoading(true);
      try {
        const res = await listOntologyLinkTypeData({
          id: selectedEdgeId,
          page,
          pageSize
        });
        if (res.status === 200 && res.code === '' && res.data) {
          setInstancesData(res.data.result || []);
          setInstancesPagination({
            current: page,
            pageSize,
            total: res.data.totalCount || 0
          });
        } else {
          Message.error(res.message || '加载实例列表失败');
        }
      } catch (error) {
        Message.error('加载实例列表失败');
        console.error('加载实例列表失败:', error);
      } finally {
        setInstancesLoading(false);
      }
    },
    [selectedEdgeId]
  );

  // 加载属性列表
  const loadAttributes = useCallback(
    async (page: number, pageSize: number) => {
      if (!selectedEdgeId) return;
      setAttributesLoading(true);
      try {
        const res = await listOntologyLinkTypeColumn({
          linkTypeID: selectedEdgeId,
          pageNo: page,
          pageSize
        });
        if (res.status === 200 && res.code === '' && res.data) {
          setAttributesData(res.data.result || []);
          setAttributesPagination({
            current: page,
            pageSize,
            total: res.data.totalCount || 0
          });
        } else {
          Message.error(res.message || '加载属性列表失败');
        }
      } catch (error) {
        Message.error('加载属性列表失败');
        console.error('加载属性列表失败:', error);
      } finally {
        setAttributesLoading(false);
      }
    },
    [selectedEdgeId]
  );

  useEffect(() => {
    if (selectedEdgeId) {
      // 重置状态
      setBasicInfo(null);
      setInstancesData([]);
      setAttributesData([]);
      setActiveTab('instances');
      setInstancesPagination({
        current: 1,
        pageSize: 10,
        total: 0
      });
      setAttributesPagination({
        current: 1,
        pageSize: 10,
        total: 0
      });

      // 重新加载数据
      loadBasicInfo();
      loadInstances(1, 10);
      loadAttributes(1, 10);
    } else {
      // 如果没有 selectedEdgeId，清空所有数据
      setBasicInfo(null);
      setInstancesData([]);
      setAttributesData([]);
      setInstancesPagination({
        current: 1,
        pageSize: 10,
        total: 0
      });
      setAttributesPagination({
        current: 1,
        pageSize: 10,
        total: 0
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEdgeId]);

  const handleCopy = (value: string) => {
    const ok = copy(value);
    ok ? Message.success('复制成功') : Message.error('复制失败');
  };

  const handleEdit = () => {
    if (!selectedEdgeId || !OSId) return;
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/edit/${selectedEdgeId}`
    );
  };

  const syncStatusConfig = useMemo(() => {
    return OBJECT_TYPE_SYNC_STATUS_CONFIG[
      basicInfo?.syncStatus ?? SyncStatus.SUCCESS
    ];
  }, [basicInfo?.syncStatus]);

  const linkTypeText = useMemo(() => {
    const type = basicInfo?.type;
    if (type === LinkType.ONE_TO_ONE) return '1:1';
    if (type === LinkType.ONE_TO_MANY) return '1:N';
    if (type === LinkType.MANY_TO_MANY) return 'N:N';
    return basicInfo?.type || '-';
  }, [basicInfo?.type]);

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
        <div className="min-w-0 text-sm font-normal leading-[22px] text-[#23293b]">
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

  // 动态生成实例表格列
  const instanceColumns = useMemo(() => {
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
  const attributeColumns: TableColumnProps<any>[] = [
    {
      title: '属性名称',
      dataIndex: 'comment',
      width: 120,
      render: (text: string) => {
        return <EllipsisPopover value={text || '-'} />;
      }
    },
    {
      title: '表字段',
      dataIndex: 'name',
      width: 120,
      ellipsis: true,
      render: (text: string) => {
        return <EllipsisPopover value={text} />;
      }
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 120
    }
  ];

  if (!selectedEdgeId) {
    return (
      <div className="flex h-full w-[400px] flex-col overflow-auto rounded-[12px] bg-white">
        <div className="flex items-center justify-between border-b border-gray-300 px-[16px] py-[20px] text-[16px]/[24px] font-semibold text-[#1E293B]">
          链接详情
          <div
            className="cursor-pointer p-1"
            onClick={() => setShowCustomEdgePanel(false)}
          >
            <IconClose className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">请选择一条链接</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-[600px] flex-col rounded-[12px] bg-white">
      {/* 头部 */}
      <div className="mx-[16px] flex items-center justify-between border-b border-[var(--color-border-2)] border-gray-300 pb-[8px] pt-[20px]">
        <div className="flex items-center gap-2">
          <IconLink className="h-4 w-4 text-gray-500" />
          <span className="text-[16px]/[24px] font-semibold text-[#1E293B]">
            {basicInfo?.name || '链接详情'}
          </span>
        </div>
        <div className="flex items-center gap-[16px]">
          <Button
            type="outline"
            onClick={handleEdit}
            className="h-[24px] px-[12px]"
          >
            编辑
          </Button>
          <span className="h-[16px] w-[1px] bg-[var(--color-border-1)]" />
          <div
            className="cursor-pointer p-1"
            onClick={() => setShowCustomEdgePanel(false)}
          >
            <IconClose className="h-4 w-4 text-[var(--color-text-2)]" />
          </div>
        </div>
      </div>

      <div className="w-full flex-1 overflow-y-auto px-[16px] py-[20px]">
        <Spin loading={basicInfoLoading} className="w-full">
          {/* 基本信息 */}
          <div className="mb-[24px] flex flex-col gap-[12px]">
            <div className="text-[14px] font-[600] leading-[22px] text-[#1E293B]">
              基本信息
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="flex items-center gap-[8px]">
                <span className="w-[80px] flex-shrink-0 text-[14px] leading-[22px] text-[#86909c]">
                  同步状态：
                </span>
                <div className="flex items-center gap-2 font-PingFangSc text-sm font-normal leading-[22px] text-[#23293b]">
                  {!isNil(basicInfo?.syncStatus) ? (
                    <DotStatus
                      text={
                        OBJECT_TYPE_SYNC_STATUS_CONFIG[basicInfo!.syncStatus]
                          .text
                      }
                      color={
                        OBJECT_TYPE_SYNC_STATUS_CONFIG[basicInfo!.syncStatus]
                          .color
                      }
                    />
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="w-[80px] flex-shrink-0 text-[14px] leading-[22px] text-[#86909c]">
                  链接id：
                </span>
                <div className="flex items-center gap-[4px]">
                  <span className="text-[14px] leading-[22px] text-[#1E293B]">
                    {basicInfo?.code || '-'}
                  </span>
                  {!isNil(basicInfo?.code) && (
                    <IconCopy
                      fontSize={14}
                      className="cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => handleCopy(String(basicInfo?.code))}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="w-[80px] flex-shrink-0 text-[14px] leading-[22px] text-[#86909c]">
                  链接类型：
                </span>
                <span className="text-[14px] leading-[22px] text-[#1E293B]">
                  {linkTypeText}
                </span>
              </div>
            </div>
          </div>

          {/* 关系对 */}
          <div className="mb-[24px] flex flex-col gap-[12px]">
            <div className="text-[14px] font-[600] leading-[22px] text-[#1E293B]">
              关系对
            </div>
            <div className="flex items-center gap-4 bg-[#F2F8FF] p-[12px]">
              {renderObjectTypeCard(basicInfo?.sourceObjectTypeInfo, true)}
              <div className="flex w-[76px] min-w-[76px] items-center">
                <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
                <span className="rounded border border-[#E5E6EB] bg-white px-2 py-[2px] text-[12px] leading-[18px] text-[#23293b]">
                  {linkTypeText}
                </span>
                <span className="h-0 flex-1 border-t border-dashed border-[#CBD5E1]" />
                <div className="h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-gray-400 border-t-transparent"></div>
              </div>
              {renderObjectTypeCard(basicInfo?.targetObjectTypeInfo, false)}
            </div>
          </div>

          {/* 标签页 */}
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            className="[&_.arco-tabs-content]:p-0 [&_.arco-tabs-nav]:mb-4"
          >
            <TabPane
              key="instances"
              title={`实例(${instancesPagination.total})`}
            >
              <div className="gap-[16px mt-[16px] flex w-full flex-col">
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
                      // 尝试使用唯一标识字段作为 rowKey
                      if (record.link_id) return String(record.link_id);
                      if (record.id) return String(record.id);
                      // 如果没有唯一标识，使用所有字段的组合
                      return Object.values(record).join('-');
                    }}
                    border={false}
                    pagination={false}
                    noDataElement={<NoDataCard title="暂无数据" />}
                    className="[&_.arco-table-td]:py-[10px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[10px]"
                  />
                )}
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
        </Spin>
      </div>
    </div>
  );
}

export default EdgePanel;

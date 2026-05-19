import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Button,
  Message,
  Spin,
  Table,
  TableColumnProps,
  Tabs,
  Pagination
} from '@arco-design/web-react';
import { IconClose, IconCopy, IconLink } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import {
  NoDataCard,
  DotStatus,
  GlobalTooltip,
  copyToClipboard
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
import { EllipsisPopover } from '@/pages/ontologyScene/components';
import { useAIWorkbenchGraphStore } from '../../store';
import { useAIWorkbenchStore } from '@/pages/aiOntologyWorkbench/store';
import { getLinkTypeText } from '@/pages/ontologyScene/utils';

const TabPane = Tabs.TabPane;
const defaultPageSize = 10;

interface LinkPanelProps {
  linkId: string | number;
}

function LinkPanel({ linkId }: LinkPanelProps) {
  const history = useHistory();
  const { currentOntology } = useAIWorkbenchStore();
  const { closeBottomPanel } = useAIWorkbenchGraphStore();

  const [basicInfo, setBasicInfo] = useState<GetOntologyLinkTypeRes | null>(
    null
  );
  const [basicInfoLoading, setBasicInfoLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('instances');

  const [instancesData, setInstancesData] = useState<Record<string, any>[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [instancesPagination, setInstancesPagination] = useState({
    current: 1,
    pageSize: defaultPageSize,
    total: 0
  });

  const [attributesData, setAttributesData] = useState<any[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [attributesPagination, setAttributesPagination] = useState({
    current: 1,
    pageSize: defaultPageSize,
    total: 0
  });

  // 加载链接详情
  const loadBasicInfo = useCallback(async () => {
    if (!linkId) return;
    setBasicInfoLoading(true);
    try {
      const res = await getOntologyLinkType({ id: Number(linkId) });
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
  }, [linkId]);

  // 加载实例列表
  const loadInstances = useCallback(
    async (page: number, pageSize: number) => {
      if (!linkId) return;
      setInstancesLoading(true);
      try {
        const res = await listOntologyLinkTypeData({
          id: Number(linkId),
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
    [linkId]
  );

  // 加载属性列表
  const loadAttributes = useCallback(
    async (page: number, pageSize: number) => {
      if (!linkId) return;
      setAttributesLoading(true);
      try {
        const res = await listOntologyLinkTypeColumn({
          linkTypeID: Number(linkId),
          pageNo: page,
          pageSize,
          isUse: 1
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
    [linkId]
  );

  useEffect(() => {
    if (linkId) {
      // 重置状态
      setBasicInfo(null);
      setInstancesData([]);
      setAttributesData([]);
      setActiveTab('instances');
      setInstancesPagination({
        current: 1,
        pageSize: defaultPageSize,
        total: 0
      });
      setAttributesPagination({
        current: 1,
        pageSize: defaultPageSize,
        total: 0
      });

      // 重新加载数据
      loadBasicInfo();
      loadInstances(1, defaultPageSize);
      loadAttributes(1, defaultPageSize);
    }
  }, [linkId, loadBasicInfo, loadInstances, loadAttributes]);

  const handleCopy = async (value: string) => {
    const result = await copyToClipboard(value);
    if (!result.success) {
      Message.error(result.message || '复制失败');
    }
  };

  const handleEdit = () => {
    if (!linkId || !currentOntology?.id) return;
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${currentOntology.id}/links/edit/${linkId}`
    );
  };

  const linkTypeText = useMemo(() => {
    return getLinkTypeText(basicInfo?.type);
  }, [basicInfo?.type]);

  // 动态生成实例表格列
  const instanceColumns = useMemo(() => {
    if (!instancesData || instancesData.length === 0) {
      return [];
    }

    const firstRecord = instancesData[0];
    const keys = Object.keys(firstRecord);

    if (keys.length === 0) {
      return [];
    }

    const columnCount = keys.length;
    const fixedWidth = 140;
    const tableWidth = 800;
    const averageWidth = Math.floor(tableWidth / columnCount);
    const shouldUseFixedWidth = columnCount > 4;
    const columnWidth = shouldUseFixedWidth ? fixedWidth : averageWidth;

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

  // 渲染对象类型卡片
  const renderObjectTypeCard = (
    objectType:
      | { name?: string; icon?: string; syncStatus?: SyncStatus }
      | undefined,
    isSource: boolean
  ) => {
    const name = objectType?.name || '-';
    const iconOption = objectType?.icon
      ? OBJECT_TYPE_ICON_OPTIONS.find(
          (option) => option.value === objectType.icon
        )
      : null;
    const IconComponent = iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

    return (
      <div
        className="flex flex-1 items-center gap-3 overflow-hidden rounded-lg px-4 py-3"
        style={{
          backgroundColor: '#fff',
          minHeight: '56px'
        }}
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded">
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden text-sm font-normal leading-[22px] text-[#23293b]">
          <EllipsisPopover
            preferTypography
            wrapperClassName="min-w-0"
            value={name}
          />
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
    <div className="flex h-full w-full flex-col bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-2)] px-[24px] py-[16px]">
        <div className="flex flex-1 items-center gap-[12px] overflow-hidden">
          <div className="flex items-center gap-[8px] overflow-hidden">
            <IconLink className="h-[20px] w-[20px] flex-shrink-0" />
            <GlobalTooltip.Ellipsis
              text={basicInfo?.name || '链接详情'}
              className="overflow-hidden text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]"
            />
          </div>
          <div className="flex items-center gap-[4px]">
            <span className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
              id: {basicInfo?.code || '-'}
            </span>
            {basicInfo?.code && (
              <IconCopy
                fontSize={14}
                className="flex-shrink-0 cursor-pointer text-gray-500 hover:text-[rgba(var(--primary-6))]"
                onClick={() => void handleCopy(basicInfo?.code || '')}
              />
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center justify-end gap-[16px]">
          <div className="flex items-center gap-[16px]">
            <Button
              type="outline"
              onClick={handleEdit}
              style={{
                backgroundColor: 'var(--color-bg-1)',
                border: '1px solid var(--color-border-1)',
                borderRadius: '4px',
                padding: '5px 12px',
                height: '24px',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '22px',
                color: 'var(--color-text-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'auto'
              }}
            >
              详情
            </Button>
            <Button
              type="outline"
              onClick={handleEdit}
              style={{
                backgroundColor: 'var(--color-bg-1)',
                border: '1px solid var(--color-border-1)',
                borderRadius: '4px',
                padding: '5px 12px',
                height: '24px',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '22px',
                color: 'var(--color-text-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'auto'
              }}
            >
              编辑
            </Button>
          </div>
          <div className="h-[16px] w-[1px] bg-[var(--color-border-1)]" />
          <div
            className="flex cursor-pointer items-center justify-center"
            onClick={() => closeBottomPanel()}
            style={{ width: '16px', height: '16px' }}
          >
            <IconClose className="h-4 w-4 text-[var(--color-text-2)]" />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex flex-1 flex-col overflow-hidden px-[24px] py-[12px]">
        <Spin
          loading={basicInfoLoading}
          className="flex h-full w-full flex-col"
        >
          {/* Tabs */}
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            className="flex h-full flex-col [&_.arco-tabs-content]:flex-1 [&_.arco-tabs-content]:overflow-hidden [&_.arco-tabs-nav]:mb-4"
          >
            <TabPane
              key="instances"
              title={`实例(${instancesPagination.total})`}
            >
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {instancesPagination.total === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <NoDataCard title="暂无数据" />
                  </div>
                ) : (
                  <>
                    <Table
                      loading={instancesLoading}
                      columns={instanceColumns}
                      data={instancesData}
                      rowKey={(record) => {
                        if (record.link_id) return String(record.link_id);
                        if (record.id) return String(record.id);
                        return Object.values(record).join('-');
                      }}
                      border={false}
                      pagination={false}
                      noDataElement={<NoDataCard title="暂无数据" />}
                      className="[&_.arco-table-td]:py-[8px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[8px]"
                      scroll={
                        instanceColumns.length > 4
                          ? { x: instanceColumns.length * 140 }
                          : undefined
                      }
                    />
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
                  </>
                )}
              </div>
            </TabPane>

            <TabPane
              key="attributes"
              title={`属性(${attributesPagination.total})`}
            >
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table
                  loading={attributesLoading}
                  columns={attributeColumns}
                  data={attributesData}
                  rowKey="id"
                  border={false}
                  pagination={false}
                  noDataElement={<NoDataCard title="暂无数据" />}
                  className="[&_.arco-table-td]:py-[8px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[8px]"
                  scroll={{ x: 400 }}
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
        </Spin>
      </div>
    </div>
  );
}

export default LinkPanel;

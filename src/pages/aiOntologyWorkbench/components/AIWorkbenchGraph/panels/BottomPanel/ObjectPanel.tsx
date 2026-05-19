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
import { IconClose, IconCopy } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import {
  NoDataCard,
  DotStatus,
  GlobalTooltip,
  copyToClipboard
} from '@ceai-front/arco-material';
import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import {
  listOntologyObjectTypeData,
  listOntologyPhysicalProperties
} from '@/api/ontologySceneLibrary/graph';
import { getActionListByObjectType } from '@/api/ontologySceneLibrary/ontologyAction';
import { GetOntologyObjectTypeDetailRes } from '@/types/objectType';
import {
  OBJECT_TYPE_ICON_OPTIONS,
  OBJECT_TYPE_SYNC_STATUS_CONFIG
} from '@/pages/ontologyScene/common/constants';
import { SyncStatus } from '@/types/graphApi';
import { isNil } from 'lodash-es';
import { EllipsisPopover } from '@/pages/ontologyScene/components';
import { useAIWorkbenchGraphStore } from '../../store';
import { useAIWorkbenchStore } from '@/pages/aiOntologyWorkbench/store';
import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

const TabPane = Tabs.TabPane;
const defaultPageSize = 10;

interface ObjectPanelProps {
  objectId: string | number;
}

function ObjectPanel({ objectId }: ObjectPanelProps) {
  const history = useHistory();
  const { currentOntology } = useAIWorkbenchStore();
  const { closeBottomPanel, openBottomPanel } = useAIWorkbenchGraphStore();

  const [basicInfo, setBasicInfo] =
    useState<GetOntologyObjectTypeDetailRes | null>(null);
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

  const [linksData, setLinksData] = useState<any[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksPagination, setLinksPagination] = useState({
    current: 1,
    pageSize: defaultPageSize,
    total: 0
  });

  const [behaviorsData, setBehaviorsData] = useState<BehaviorActionItem[]>([]);
  const [behaviorsLoading, setBehaviorsLoading] = useState(false);
  const [behaviorsPagination, setBehaviorsPagination] = useState({
    current: 1,
    pageSize: defaultPageSize,
    total: 0
  });

  // 加载对象详情
  const loadBasicInfo = useCallback(async () => {
    if (!objectId) return;
    setBasicInfoLoading(true);
    try {
      const res = await getOntologyObjectTypeDetail({ id: Number(objectId) });
      if (res.status === 200 && res.code === '' && res.data) {
        setBasicInfo(res.data);
      } else {
        Message.error(res.message || '加载对象详情失败');
      }
    } catch (error) {
      Message.error('加载对象详情失败');
      console.error('加载对象详情失败:', error);
    } finally {
      setBasicInfoLoading(false);
    }
  }, [objectId]);

  // 加载实例列表
  const loadInstances = useCallback(
    async (page: number, pageSize: number) => {
      if (!objectId) return;
      setInstancesLoading(true);
      try {
        const res = await listOntologyObjectTypeData({
          id: Number(objectId),
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
    [objectId]
  );

  // 加载属性列表
  const loadAttributes = useCallback(
    async (page: number, pageSize: number) => {
      if (!objectId) return;
      setAttributesLoading(true);
      try {
        const res = await listOntologyPhysicalProperties({
          objectTypeIdList: [Number(objectId)],
          ontologyModelID: Number(currentOntology?.id || 0),
          pageNo: page,
          pageSize,
          isUse: 1
        });
        if (res.code === '' && res.status === 200 && res.data) {
          setAttributesData(res.data.result || []);
          setAttributesPagination({
            current: page,
            pageSize,
            total: res.data.totalCount || 0
          });
        }
      } catch (error) {
        console.error('加载属性数据失败:', error);
      } finally {
        setAttributesLoading(false);
      }
    },
    [objectId, currentOntology?.id]
  );

  // 加载行为数据
  const loadBehaviors = useCallback(
    async (page: number, pageSize: number) => {
      if (!objectId) return;
      setBehaviorsLoading(true);
      try {
        const res = await getActionListByObjectType({
          objectTypeId: Number(objectId),
          ontologyModelID: Number(currentOntology?.id || 0),
          pageNum: page,
          pageSize: pageSize
        });
        if (res.code === '' && res.status === 200 && res.data) {
          setBehaviorsData(res.data.result || []);
          setBehaviorsPagination({
            current: page,
            pageSize,
            total: res.data.totalCount || 0
          });
        }
      } catch (error) {
        console.error('加载行为数据失败:', error);
        Message.error('加载行为数据失败');
      } finally {
        setBehaviorsLoading(false);
      }
    },
    [objectId, currentOntology?.id]
  );

  useEffect(() => {
    if (objectId) {
      console.log('[ObjectPanel] objectId 变化，重新加载数据:', objectId);

      // 重置状态
      setBasicInfo(null);
      setInstancesData([]);
      setAttributesData([]);
      setBehaviorsData([]);
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
      setBehaviorsPagination({
        current: 1,
        pageSize: defaultPageSize,
        total: 0
      });

      // 重新加载数据
      loadBasicInfo();
      loadInstances(1, defaultPageSize);
      loadAttributes(1, defaultPageSize);
      loadBehaviors(1, defaultPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId]); // 只依赖 objectId，避免无限循环

  const handleCopy = async (value: string) => {
    const result = await copyToClipboard(value);
    if (!result.success) {
      Message.error(result.message || '复制失败');
    }
  };

  const handleEdit = () => {
    if (!objectId || !currentOntology?.id) return;
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${currentOntology.id}/objectType/edit/${objectId}`
    );
  };

  const handleDetail = () => {
    if (!currentOntology?.id || !basicInfo?.name) return;
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${currentOntology.id}/objectType/list?search=${encodeURIComponent(basicInfo.name)}`
    );
  };

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
      width: 150,
      ellipsis: true,
      render: (text: string) => <EllipsisPopover value={text || '-'} />
    },
    {
      title: '属性id',
      dataIndex: 'name',
      width: 140,
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <EllipsisPopover value={text || '-'} />
          {text && (
            <IconCopy
              fontSize={14}
              className="cursor-pointer opacity-0 transition-opacity hover:text-[rgba(var(--primary-6))] group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                void handleCopy(String(text));
              }}
            />
          )}
        </div>
      )
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      width: 140
    }
  ];

  // 行为表格列
  const behaviorColumns: TableColumnProps<BehaviorActionItem>[] = [
    {
      title: '行为名称',
      dataIndex: 'name',
      width: 140,
      ellipsis: true,
      render: (text: string) => <EllipsisPopover value={text || '-'} />
    },
    {
      title: '行为id',
      dataIndex: 'code',
      width: 140,
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <EllipsisPopover value={text || '-'} />
          {text && (
            <IconCopy
              fontSize={14}
              className="cursor-pointer opacity-0 transition-opacity hover:text-[rgba(var(--primary-6))] group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                void handleCopy(String(text));
              }}
            />
          )}
        </div>
      )
    },
    {
      title: '行为描述',
      dataIndex: 'description',
      width: 140,
      ellipsis: true,
      render: (text: string) => <EllipsisPopover value={text || '-'} />
    }
  ];

  // 获取对象图标
  const iconOption = basicInfo?.icon
    ? OBJECT_TYPE_ICON_OPTIONS.find((option) => option.value === basicInfo.icon)
    : null;
  const IconComponent = iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-2)] px-[24px] py-[16px]">
        <div className="flex flex-1 items-center gap-[12px] overflow-hidden">
          <div className="flex items-center gap-[8px] overflow-hidden">
            <IconComponent className="h-[20px] w-[20px] flex-shrink-0" />
            <GlobalTooltip.Ellipsis
              text={basicInfo?.name || '对象详情'}
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
              onClick={handleDetail}
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
          className="flex min-h-0 w-full flex-1 flex-col [&_.arco-spin-children]:flex [&_.arco-spin-children]:min-h-0 [&_.arco-spin-children]:flex-1 [&_.arco-spin-children]:flex-col"
        >
          {/* Tabs */}
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col [&_.arco-tabs-content-list]:h-full [&_.arco-tabs-content]:min-h-0 [&_.arco-tabs-content]:flex-1 [&_.arco-tabs-content]:overflow-hidden [&_.arco-tabs-nav]:mb-4 [&_.arco-tabs-pane]:h-full"
          >
            <TabPane
              key="instances"
              title={`实例(${instancesPagination.total})`}
            >
              <div
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
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
              <div
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Table
                  loading={attributesLoading}
                  columns={attributeColumns}
                  data={attributesData}
                  scroll={{ x: 400 }}
                  rowClassName={() => 'group'}
                  noDataElement={<NoDataCard title="暂无数据" />}
                  rowKey="id"
                  border={false}
                  pagination={false}
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

            <TabPane key="links" title={`链接(${linksPagination.total})`}>
              <div
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex flex-1 items-center justify-center">
                  <NoDataCard title="链接功能待实现" />
                </div>
              </div>
            </TabPane>

            <TabPane
              key="behaviors"
              title={`行为(${behaviorsPagination.total})`}
            >
              <div
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Table
                  loading={behaviorsLoading}
                  columns={behaviorColumns}
                  data={behaviorsData}
                  scroll={{ x: 400 }}
                  pagination={false}
                  rowKey={(record) => `${record.id || record.code}`}
                  border={false}
                  rowClassName={() => 'group'}
                  noDataElement={<NoDataCard title="暂无数据" />}
                  className="[&_.arco-table-td]:py-[8px] [&_.arco-table-th]:bg-[#f7f8fa] [&_.arco-table-th]:py-[8px]"
                  onRow={(record) => ({
                    onClick: () => {
                      openBottomPanel({
                        type: 'behavior',
                        id: record.id!,
                        data: record
                      });
                    },
                    className: 'cursor-pointer hover:bg-[#f7f8fa]'
                  })}
                />
                {behaviorsPagination.total > defaultPageSize && (
                  <div className="flex justify-end pt-[16px]">
                    <Pagination
                      current={behaviorsPagination.current}
                      pageSize={behaviorsPagination.pageSize}
                      total={behaviorsPagination.total}
                      onChange={(page, pageSize) => {
                        loadBehaviors(page, pageSize);
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

export default ObjectPanel;

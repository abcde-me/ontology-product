import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
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
import {
  DrawerWithEditBtn,
  CollapsibleSection,
  DataSourceInfo,
  SyncStrategyInfo
} from '@/pages/ontologyScene/components';
import {
  DotStatus,
  GlobalTooltip,
  NoDataCard,
  copyToClipboard
} from '@ceai-front/arco-material';
import type {
  SourceDataInfo,
  SyncSourceDataStrategy
} from '@/pages/ontologyScene/components/CollapsibleSection/types';

import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import {
  listOntologyObjectTypeData,
  listOntologyPhysicalProperties,
  listOntologyLinkType
} from '@/api/ontologySceneLibrary/graph';
import { getActionListByObjectType } from '@/api/ontologySceneLibrary/ontologyAction';
import type { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
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
import { openNewPage } from '@/utils/env';
import { useInfiniteScroll, useRequest } from 'ahooks';

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
  // 新增字段：数据源和同步策略
  sourceType?: number;
  filePath?: string;
  sourceDataInfo?: SourceDataInfo;
  enableSyncSourceData?: boolean;
  syncSourceDataStrategy?: SyncSourceDataStrategy;
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
  /** 可选：实例分页默认值 */
  defaultInstancesPageSize?: number;
  /** 可选：属性分页默认值 */
  defaultAttributesPageSize?: number;
}

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
    linkCount,
    // 新增字段：数据源和同步策略
    sourceType: detailRes.sourceType,
    filePath: detailRes.filePath,
    sourceDataInfo: detailRes.sourceDataInfo,
    enableSyncSourceData: detailRes.enableSyncSourceData,
    syncSourceDataStrategy: detailRes.syncSourceDataStrategy
  };
};

// 直接使用 PhysicalProperties，不需要转换

const DEFAULT_PAGE_SIZE = 10;

export default function ObjectTypeDetailDrawer({
  visible,
  onClose,
  objectTypeId,
  data,
  defaultActiveTab = 'instances',
  fetchBasicInfo,
  fetchInstances,
  fetchAttributes,
  defaultInstancesPageSize = DEFAULT_PAGE_SIZE,
  defaultAttributesPageSize = DEFAULT_PAGE_SIZE
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
  const [linksTotal, setLinksTotal] = useState(0);
  const [linksIsNoMore, setLinksIsNoMore] = useState(false);
  const linksScrollContainerRef = useRef<HTMLDivElement>(null);
  const linksPageNoRef = useRef(1);
  const linksPageSize = DEFAULT_PAGE_SIZE;

  const [behaviorsData, setBehaviorsData] = useState<BehaviorActionItem[]>([]);
  const [behaviorsLoading, setBehaviorsLoading] = useState(false);
  const [behaviorsPagination, setBehaviorsPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  });

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
            pageSize,
            isUse: 1
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

  // 加载行为数据
  const loadBehaviors = useCallback(
    async (page: number, pageSize: number) => {
      if (!resolvedObjectTypeIdNum) return;
      setBehaviorsLoading(true);
      try {
        const res = await getActionListByObjectType({
          objectTypeId: resolvedObjectTypeIdNum,
          ontologyModelID: Number(ontologyModelID),
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
      } catch (e) {
        Message.error('加载行为数据失败');
      } finally {
        setBehaviorsLoading(false);
      }
    },
    [resolvedObjectTypeIdNum, ontologyModelID]
  );

  // 重置链接状态
  const resetLinksState = useCallback(() => {
    setLinksData([]);
    linksPageNoRef.current = 1;
    setLinksIsNoMore(false);
    setLinksTotal(0);
  }, []);

  // 将 LinkInfo 转换为 LinkItem 的辅助函数
  const convertLinkInfoToLinkItem = useCallback((link: LinkInfo): LinkItem => {
    return {
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
    };
  }, []);

  // 使用 useRequest 加载链接数据（用于滚动加载）
  const { loading: linksScrollLoading, run: loadLinksForScroll } = useRequest(
    async () => {
      if (!resolvedObjectTypeIdNum) {
        throw new Error('对象类型ID不能为空');
      }

      const params = {
        sourceObjectTypeIDList: [resolvedObjectTypeIdNum],
        targetObjectTypeIDList: [resolvedObjectTypeIdNum],
        ontologyModelID: Number(ontologyModelID),
        pageNo: linksPageNoRef.current,
        pageSize: linksPageSize
      };

      const res = await listOntologyLinkType(params);

      if (res.code !== '' || res.status !== 200 || !res.data) {
        throw new Error(res.message || '获取链接数据失败');
      }

      return res.data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        const newData = data.result || [];
        if (newData.length > 0) {
          const convertedLinks: LinkItem[] = newData.map(
            convertLinkInfoToLinkItem
          );
          setLinksData((prevData) => [...prevData, ...convertedLinks]);
          setLinksTotal(data.totalCount || 0);
        }

        // 判断是否是最后一页
        if (newData.length < linksPageSize) {
          setLinksIsNoMore(true);
        } else {
          linksPageNoRef.current += 1;
        }
      },
      onError: (error) => {
        console.error('获取链接数据失败:', error);
        Message.error(error.message || '获取链接数据失败');
        setLinksIsNoMore(true);
      }
    }
  );

  // 包装 loadLinksForScroll 以添加条件检查
  const handleLoadLinksForScroll = useCallback(async () => {
    if (
      linksIsNoMore ||
      !resolvedObjectTypeIdNum ||
      linksScrollLoading ||
      activeTab !== 'links' ||
      !visible
    ) {
      return Promise.resolve();
    }
    return loadLinksForScroll();
  }, [
    linksIsNoMore,
    resolvedObjectTypeIdNum,
    linksScrollLoading,
    activeTab,
    visible,
    loadLinksForScroll
  ]);

  // 无限滚动加载（仅当 activeTab === 'links' 时生效）
  useInfiniteScroll(
    async () => {
      await handleLoadLinksForScroll();
      return { list: [] };
    },
    {
      target: linksScrollContainerRef,
      isNoMore: () =>
        linksIsNoMore ||
        !resolvedObjectTypeIdNum ||
        activeTab !== 'links' ||
        !visible,
      reloadDeps: [activeTab, resolvedObjectTypeIdNum, linksIsNoMore, visible]
    }
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

            // TODO: MOCK 数据 - 用于测试显示效果，后端接口返回真实数据后删除
            const mockData = {
              ...detailRes,
              // Mock 数据源 - 情况1: 本地CSV
              // sourceType: 2,
              // filePath: '/uploads/data/sample_data.csv',
              // sourceDataInfo: {
              //   connectorName: '本地文件',
              // },

              // Mock 数据源 - 情况2: 数据库/表-选择数据表
              sourceType: 1,
              sourceDataInfo: {
                queryMode: 'selected',
                connectorId: 1,
                connectorName: 'MySQL数据源',
                connectorType: 'MySQL',
                connectorSubtype: 'MySQL 8.0',
                databaseName: 'ontology_db',
                tableName: 'user_table'
              },

              // Mock 数据源 - 情况3: 数据库/表-自定义SQL
              // sourceType: 1,
              // sourceDataInfo: {
              //   queryMode: 'sql',
              //   connectorId: 1,
              //   connectorName: 'MySQL数据源',
              //   connectorType: 'MySQL',
              //   connectorSubtype: 'MySQL 8.0',
              //   databaseName: 'ontology_db',
              //   sql: 'SELECT id, name, age, email FROM users WHERE status = 1 AND created_at > "2024-01-01"',
              // },

              // Mock 同步策略 - 有同步策略（CDC模式）
              // enableSyncSourceData: true,
              // syncSourceDataStrategy: {
              //   mode: 'BINLOG_CDC',
              //   conflictStrategy: 'KEEP_SOURCE',
              //   syncScope: 'INCREMENTAL',
              //   pollFetchSize: 1000,
              //   parallelism: 4,
              //   exceptionStrategy: 'STOP_ON_ERROR',
              // },

              // Mock 同步策略 - 有同步策略（轮询模式）
              enableSyncSourceData: true,
              syncSourceDataStrategy: {
                mode: 'JDBC_POLLING',
                conflictStrategy: 'KEEP_TARGET',
                syncScope: 'FULL_THEN_INCREMENTAL',
                pollFetchSize: 500,
                parallelism: 2,
                exceptionStrategy: 'LOG_ERROR_AND_CONTINUE',
                jdbcSyncSqlFull:
                  'SELECT * FROM users WHERE created_at <= NOW()',
                jdbcSyncSqlIncrement:
                  'SELECT * FROM users WHERE updated_at > ${last_sync_time}'
              }

              // Mock 同步策略 - 无同步策略
              // enableSyncSourceData: false,
            };

            // 使用 GetOntologyObjectTypeDetailRes 转换函数
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

    loadLinksForScroll();

    // 实例（默认拉第一页）
    loadInstances(1, instancesPagination.pageSize);

    // 行为（默认拉第一页）
    loadBehaviors(1, DEFAULT_PAGE_SIZE);
  }, [
    visible,
    resolvedObjectTypeIdNum,
    loadAttributes,
    loadInstances,
    loadBehaviors,
    loadLinksForScroll
  ]);

  // 当切换到 links tab 时，如果还没有数据，触发加载
  useEffect(() => {
    if (
      activeTab === 'links' &&
      visible &&
      resolvedObjectTypeIdNum &&
      linksData.length === 0 &&
      !linksScrollLoading &&
      !linksIsNoMore
    ) {
      resetLinksState();
      setTimeout(() => {
        handleLoadLinksForScroll();
      }, 0);
    }
  }, [activeTab, visible, resolvedObjectTypeIdNum]);

  // 处理编辑按钮点击
  const handleEdit = () => {
    if (resolvedObjectTypeId) {
      history.push(
        `/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/objectType/edit/${resolvedObjectTypeId}`
      );
    }
  };

  const handleCopy = async (value: string) => {
    const result = await copyToClipboard(value);
    if (result.success) {
      return;
    }
    Message.error(result.message || '复制失败');
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
      title: (
        <GlobalTooltip.Ellipsis text={key} className="pointer-events-auto" />
      ),
      dataIndex: key,
      width: columnWidth,
      ellipsis: true,
      render: (text: string) => {
        // 只有 null、undefined 或空字符串时显示 '-'
        // 0 会正常显示
        const displayText =
          text === null || text === undefined || text === ''
            ? '-'
            : String(text);
        return <GlobalTooltip.Ellipsis text={displayText} />;
      }
    }));
  };

  const handleViewPublicAttribute = (record: AttributeItem) => {
    if (!record.ontologyPublicPropertiesName) {
      return;
    }
    const url = `/onto/tenant/compute/onto/ontologyScene/detail/${ontologyModelID}/attributes/list?tab=public&search=${encodeURIComponent(
      record.ontologyPublicPropertiesName || ''
    )}`;
    openNewPage(url);
  };

  // 属性表格列定义 - 直接使用接口定义的字段名
  const attributeColumns: TableColumnProps<AttributeItem>[] = [
    {
      title: '属性名称',
      dataIndex: 'comment',
      width: 140,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <GlobalTooltip.Ellipsis
            className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]"
            text={value || '-'}
          />
          {record.isPrimary === 1 && (
            <Tag color="#FBF2FF" className="text-[#9254DE]" size="small">
              主键
            </Tag>
          )}
          {record.isVectorSourceField === 1 && (
            <Tag color="#FBF2FF" className="text-[#9254DE]" size="small">
              向量化
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
          <GlobalTooltip.Ellipsis text={value || '-'} />
          {value && (
            <Popover content="复制">
              <IconCopy
                fontSize={14}
                className="cursor-pointer opacity-0 transition-opacity hover:text-[rgba(var(--primary-6))] group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleCopy(String(value));
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
        return <GlobalTooltip.Ellipsis text={value || '-'} />;
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
            <GlobalTooltip.Ellipsis
              text={value || '-'}
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
        return <GlobalTooltip.Ellipsis text={value || '-'} />;
      }
    }
  ];

  // 行为表格列定义
  const behaviorColumns: TableColumnProps<BehaviorActionItem>[] = [
    {
      title: '行为名称',
      dataIndex: 'name',
      width: 140,
      ellipsis: true,
      render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
    },
    {
      title: '行为id',
      dataIndex: 'code',
      width: 140,
      render: (value) => (
        <div className="flex items-center gap-2">
          <GlobalTooltip.Ellipsis text={value || '-'} />
          {value && (
            <Popover content="复制">
              <IconCopy
                fontSize={14}
                className="cursor-pointer opacity-0 transition-opacity hover:text-[rgba(var(--primary-6))] group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleCopy(String(value));
                }}
              />
            </Popover>
          )}
        </div>
      )
    },
    {
      title: '行为描述',
      dataIndex: 'description',
      width: 140,
      ellipsis: true,
      render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
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
        className="flex flex-1 flex-shrink-0 items-center gap-3 overflow-hidden rounded-lg px-4 py-3"
        style={{
          backgroundColor: '#fff',
          minHeight: '56px'
        }}
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded">
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden text-[14px] leading-[22px] text-[#23293b]">
          <GlobalTooltip.Ellipsis text={name} />
        </div>
        {!isNil(objectType?.syncStatus) ? (
          <div className="flex w-max flex-shrink-0 items-center">
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
    <DrawerWithEditBtn
      key={resolvedObjectTypeId}
      visible={visible}
      onCancel={onClose}
      title="对象类型详情"
      onEdit={handleEdit}
      footer={null}
      className={styles['object-type-detail-drawer']}
    >
      <div className="flex flex-col gap-[24px]">
        {/* 基本信息 */}
        <CollapsibleSection
          title="基本信息"
          defaultExpanded={true}
          loading={basicInfoLoading}
        >
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
                      <GlobalTooltip.Ellipsis
                        text={displayData?.name}
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
                  <GlobalTooltip.Ellipsis
                    text={displayData?.description || '-'}
                    className="w-full text-[14px] leading-[22px] text-[var(--color-text-1)]"
                  />
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 gap-[8px]">
              <div className="w-[90px] text-[14px] leading-[22px] text-[var(--color-text-4)]">
                对象类型id:
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-[4px]">
                <GlobalTooltip.Ellipsis
                  text={displayData?.code ?? '-'}
                  className="text-[14px] leading-[22px] text-[var(--color-text-1)]"
                />
                {displayData?.code && (
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
          </div>
        </CollapsibleSection>

        {/* 数据源 */}
        <CollapsibleSection
          title="数据源"
          defaultExpanded={false}
          loading={basicInfoLoading}
        >
          <DataSourceInfo
            sourceType={basicInfo?.sourceType}
            sourceDataInfo={basicInfo?.sourceDataInfo}
            filePath={basicInfo?.filePath}
          />
        </CollapsibleSection>

        {/* 同步策略 */}
        <CollapsibleSection
          title="同步策略"
          defaultExpanded={false}
          loading={basicInfoLoading}
        >
          <SyncStrategyInfo
            enableSyncSourceData={basicInfo?.enableSyncSourceData}
            syncSourceDataStrategy={basicInfo?.syncSourceDataStrategy}
          />
        </CollapsibleSection>

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
                scroll={{ x: true }}
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
          <TabPane
            key="links"
            title={`链接(${linksTotal || linksData.length})`}
          >
            <div className="mt-[16px] flex flex-col gap-[16px]">
              {linksTotal === 0 && !linksScrollLoading && !linksLoading ? (
                <div className="flex justify-center py-[100px]">
                  <NoDataCard title="暂无数据" />
                </div>
              ) : (
                <div
                  ref={linksScrollContainerRef}
                  className="max-h-[calc(100vh-270px)] overflow-y-auto"
                >
                  {linksData.map((link) => {
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
                          <GlobalTooltip.Ellipsis text={link.linkName} />
                        </div>

                        {/* ID */}
                        <div className="mb-[8px] flex items-center gap-[8px] overflow-hidden leading-[22px]">
                          <span className="w-max flex-shrink-0 text-[14px] text-[var(--color-text-5)]">
                            链接id:
                          </span>
                          <span className="min-w-0 max-w-full text-[14px] text-[var(--color-text-1)]">
                            <GlobalTooltip.Ellipsis text={link.linkId} />
                          </span>
                          <Popover content="复制">
                            <IconCopy
                              fontSize={14}
                              className="cursor-pointer hover:text-[rgba(var(--primary-6))]"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleCopy(link.linkId);
                              }}
                            />
                          </Popover>
                        </div>

                        {/* 关系图 */}
                        <div className="flex items-center overflow-hidden bg-[#F2F8FF] p-[12px]">
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
                  })}
                  {linksScrollLoading && (
                    <div className="flex items-center justify-center p-4">
                      <Spin />
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabPane>
          <TabPane key="behaviors" title={`行为(${behaviorsPagination.total})`}>
            <div className="mt-[16px] flex flex-col gap-[16px]">
              {behaviorsPagination.total === 0 ? (
                <div className="flex justify-center py-[100px]">
                  <NoDataCard title="暂无数据" />
                </div>
              ) : (
                <Table
                  loading={behaviorsLoading}
                  columns={behaviorColumns}
                  data={behaviorsData}
                  rowKey={(record) => `${record.id || record.code}`}
                  border={false}
                  pagination={false}
                  noDataElement={<NoDataCard title="暂无数据" />}
                  className="[&_.arco-table-th]:bg-[#f7f8fa]"
                  rowClassName={() => 'group'}
                  scroll={{ x: 400 }}
                />
              )}
              {behaviorsPagination.total > DEFAULT_PAGE_SIZE && (
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
      </div>
    </DrawerWithEditBtn>
  );
}

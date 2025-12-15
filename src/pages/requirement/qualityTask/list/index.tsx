import React, { useEffect, useState, useCallback } from 'react';
import {
  Input,
  Tabs,
  Table,
  Pagination,
  PaginationProps,
  Link
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { useHistory, useLocation } from 'react-router';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import FirstInspectModal from './FirstInspectModal';
import ImageIcon from '@/assets/annotation/image-column.svg';
import { RequirementTypeNameMap } from '../../type';
import { CopyItemIcon } from '@ceai-front/arco-material';
import { listQualityControlTasks } from '@/api/dataAnnotation';
import './index.scss';

const TabPane = Tabs.TabPane;
const InputSearch = Input.Search;

// 质检轮次枚举
enum QualityRound {
  Round1 = 1,
  Round2 = 2,
  Round3 = 3
}

// 数据类型枚举
enum DataType {
  Text = 1,
  Image = 2,
  Audio = 3,
  Video = 4
}

// 所属类型枚举
enum BelongType {
  Personal = 1,
  Department = 2
}

// 所属类型映射
const BelongTypeMap: Record<number, string> = {
  [BelongType.Personal]: '个人',
  [BelongType.Department]: '部门'
};

// 质检任务数据类型
export interface QualityTaskItem {
  pkg_id: number; // 任务包id
  front_pkg_id: number; // 任务展示和搜索的任务包ID
  req_name: string; // 需求名称
  req_id: number; // 需求ID
  type: DataType; // 1-文本,2-图片,3-音频,4-视频
  belong: BelongType; // 1-个人，2-部门
  task_volume_total: number; // 总任务量
  task_volume_unowned: number; // 未领取
  task_volume_unreceived: number; // 未提检任务量
  started: boolean; // true-直接跳质检详情页面；false-任务包首次被处理，需要抽检
  create_time: string; // 创建时间
  update_time: string; // 更新时间
}

// Tab数据类型
interface TabData {
  key: string;
  round: QualityRound;
  label: string;
  count: number;
}

// 搜索请求参数类型
interface QualityTaskListParams {
  qc_round: number; // 当前质检轮次 1-1轮质检；2-2轮质检；3-3轮质检
  page: number;
  page_size: number;
  filters?: {
    search_content?: string; // 模糊搜索输入框，任务ID或需求名称搜索
    belong?: number[]; // 1-个人，2-部门
    type?: number[]; // 标注内容类型:1-文本,2-图片,3-音频,4-视频
  };
  order?: string; // 默认降序，asc正序，desc倒序
  order_filter?: string; // 默认创建时间，create_time - 创建时间，update_time - 更新时间
}

function QualityTaskList() {
  const history = useHistory();
  const location = useLocation();

  // 从URL获取qc_round参数，默认为1
  const getInitialTab = () => {
    const searchParams = new URLSearchParams(location.search);
    const qcRound = searchParams.get('qc_round');
    return qcRound && ['1', '2', '3'].includes(qcRound) ? qcRound : '1';
  };

  // 当前选中的质检轮次
  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  // 搜索关键词
  const [searchValue, setSearchValue] = useState<string>('');

  // 分页状态
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(50);

  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);

  // 排序和筛选状态
  const [sortValue, setSortValue] = useState<any>({});

  // 首次抽检设置弹窗
  const [firstInspectModalVisible, setFirstInspectModalVisible] =
    useState(false);
  const [currentTask, setCurrentTask] = useState<QualityTaskItem | null>(null);

  // Tab数据
  const [tabsData, setTabsData] = useState<TabData[]>([
    { key: '1', round: QualityRound.Round1, label: '1轮质检', count: 100 },
    { key: '2', round: QualityRound.Round2, label: '2轮质检', count: 200 },
    { key: '3', round: QualityRound.Round3, label: '3轮质检', count: 100 }
  ]);

  // 表格数据
  const [tableData, setTableData] = useState<QualityTaskItem[]>([]);

  // 获取列表数据
  const getList = useCallback(async () => {
    setLoading(true);
    try {
      // 构建 filters 对象，过滤掉空值
      const filters: QualityTaskListParams['filters'] = {};
      if (searchValue) {
        filters.search_content = searchValue;
      }
      if (sortValue?.belong?.length) {
        filters.belong = sortValue.belong;
      }
      if (sortValue?.type?.length) {
        filters.type = sortValue.type;
      }

      const params: QualityTaskListParams = {
        qc_round: Number(activeTab), // 当前质检轮次: 1-1轮质检；2-2轮质检；3-3轮质检
        page: current,
        page_size: pageSize,
        // 只有在 filters 有有效字段时才传递
        ...(Object.keys(filters).length > 0 && { filters }),
        order: sortValue?.order || 'desc', // 默认降序，asc正序，desc倒序
        order_filter: sortValue?.order_filter || 'create_time' // 默认创建时间，create_time - 创建时间，update_time - 更新时间
      };

      const res = await listQualityControlTasks(params);
      if (res.code === 'success') {
        setTableData(res.data?.items || []);
        setTotal(res.data?.total || 0);
      }
    } catch (error) {
      console.error('获取质检任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, activeTab, searchValue, sortValue]);

  // 初始化URL参数
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.has('qc_round')) {
      searchParams.set('qc_round', '1');
      history.replace({ search: searchParams.toString() });
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    getList();
  }, [getList]);

  // 处理Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrent(1);
    // 更新URL参数
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('qc_round', key);
    history.replace({ search: searchParams.toString() });
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrent(1);
  };

  // 处理表格变化（排序、筛选）
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortData = {
      type: filters?.type?.map(Number), // 转为数字数组
      belong: filters?.belong?.map(Number), // 转为数字数组
      order:
        sorter.direction === undefined
          ? 'desc'
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc',
      order_filter: 'create_time' // 默认按创建时间排序
    };
    setSortValue(sortData);
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrent(page);
  };

  // 处理每页数量变化
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrent(1);
  };

  // 跳转到质检详情页
  const handleGoToQuality = (record: QualityTaskItem) => {
    if (!record.started) {
      // started为false表示任务包首次被处理，需要抽检设置
      setCurrentTask(record);
      setFirstInspectModalVisible(true);
    } else {
      // started为true直接跳质检详情页面
      goToDetailPage(record);
    }
  };

  // 跳转到详情页
  const goToDetailPage = (record: QualityTaskItem) => {
    history.push(
      `/tenant/compute/modaforge/qualityTask/detail?pkgId=${record.pkg_id}&qcRound=${activeTab}&reqId=${record.req_id}&reqName=${record.req_name}`
    );
  };

  // 首次抽检设置成功
  const handleFirstInspectSuccess = () => {
    if (currentTask) {
      goToDetailPage(currentTask);
    }
  };

  // 空数据渲染
  const renderEmptyPlaceholder = (
    value: string | number | null | undefined
  ) => {
    return value === '' || value == null ? '-' : value;
  };

  // 表格列定义
  const columns: ColumnProps<QualityTaskItem>[] = [
    {
      title: '需求名称',
      dataIndex: 'req_name',
      width: 160,
      ellipsis: true,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.req_name) !== '-' ? (
          <EllipsisPopover value={record.req_name} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '需求ID',
      dataIndex: 'req_id',
      width: 100,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.req_id) !== '-' ? (
          <div className="flex items-center">
            <EllipsisPopover value={record.req_id} isEdit={false} />
            <CopyItemIcon
              className="copy-icon"
              value={record.req_id.toString()}
            />
          </div>
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '任务包ID',
      dataIndex: 'front_pkg_id',
      width: 120,
      render: (_, record) => {
        return <span>{renderEmptyPlaceholder(record.front_pkg_id)}</span>;
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      filters: [
        {
          text: '文本',
          value: 1
        },
        {
          text: '图片',
          value: 2
        },
        {
          text: '音频',
          value: 3
        },
        {
          text: '视频',
          value: 4
        }
      ],
      render: (_, record) => {
        return (
          <div className="flex items-center">
            {record.type === 2 && <ImageIcon style={{ marginRight: 4 }} />}
            {record?.type ? RequirementTypeNameMap[record.type] : '-'}
          </div>
        );
      }
    },
    {
      title: '所属',
      dataIndex: 'belong',
      width: 80,
      filters: [
        { text: '个人', value: BelongType.Personal },
        { text: '部门', value: BelongType.Department }
      ],
      render: (_, record) => {
        return <span>{BelongTypeMap[record.belong] || '-'}</span>;
      }
    },
    {
      title: '总任务量',
      dataIndex: 'task_volume_total',
      width: 100,
      render: (_, record) => {
        return <span>{renderEmptyPlaceholder(record.task_volume_total)}</span>;
      }
    },
    {
      title: '未领取',
      dataIndex: 'task_volume_unowned',
      width: 80,
      render: (_, record) => {
        return (
          <span>{renderEmptyPlaceholder(record.task_volume_unowned)}</span>
        );
      }
    },
    {
      title: '未提检',
      dataIndex: 'task_volume_unreceived',
      width: 80,
      render: (_, record) => {
        return (
          <span>{renderEmptyPlaceholder(record.task_volume_unreceived)}</span>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 170,
      sorter: true,
      render: (_, record) => {
        return record.create_time ? (
          <span>{new Date(record.create_time).toLocaleString()}</span>
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        return (
          <Link
            className="operation-link"
            onClick={() => goToDetailPage(record)}
          >
            去质检
          </Link>
        );
      }
    }
  ];

  return (
    <div className="quality-task-list">
      <h2 className="page-title">质检任务</h2>

      {/* 搜索框 */}
      <div className="search-wrapper">
        <InputSearch
          allowClear
          placeholder="输入任务包ID或需求名称搜索"
          style={{ width: 300 }}
          onSearch={handleSearch}
          onChange={(value) => {
            if (!value) {
              setSearchValue('');
              setCurrent(1);
            }
          }}
        />
      </div>

      {/* Tab切换 */}
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        type="line"
        className="quality-tabs"
        inkBarSize={{ width: 60 }}
      >
        {tabsData.map((tab) => (
          <TabPane
            key={tab.key}
            title={
              <span className="tab-title">
                {tab.label}
                {/* <span className="tab-count">({tab.count})</span> */}
              </span>
            }
          />
        ))}
      </Tabs>

      {/* 数据表格 */}
      <Table
        loading={loading}
        columns={columns}
        data={tableData}
        rowKey="pkg_id"
        border={false}
        pagination={false}
        noDataElement={noDataElement({ description: '暂无质检任务' })}
        scroll={{ x: 'max-content' }}
        onChange={(pagination, sorter, filters) =>
          handleTableChange(pagination, sorter as SorterInfo, filters)
        }
      />

      {/* 分页 */}
      {tableData && tableData.length > 0 && (
        <div className="pagination-wrapper">
          <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            showTotal
            showJumper
            sizeCanChange
            sizeOptions={[10, 20, 50, 100]}
            onChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* 首次抽检设置弹窗 */}
      <FirstInspectModal
        qc_round={Number(activeTab)}
        record={currentTask}
        visible={firstInspectModalVisible}
        onClose={() => setFirstInspectModalVisible(false)}
        onSuccess={handleFirstInspectSuccess}
      />
    </div>
  );
}

export default QualityTaskList;

import React, { useEffect, useState, useCallback } from 'react';
import {
  Input,
  Tabs,
  Table,
  Pagination,
  PaginationProps,
  Link
} from '@arco-design/web-react';
import { IconImage, IconFile } from '@arco-design/web-react/icon';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { useHistory } from 'react-router';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import FirstInspectModal from './FirstInspectModal';
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
  Image = 2
}

// 所属类型枚举
enum BelongType {
  Personal = 1,
  Department = 2
}

// 数据类型映射
const DataTypeMap: Record<number, { label: string; icon: React.ReactNode }> = {
  [DataType.Text]: { label: '文本', icon: null },
  [DataType.Image]: {
    label: '图片',
    icon: <IconImage style={{ marginRight: 4 }} />
  }
};

// 所属类型映射
const BelongTypeMap: Record<number, string> = {
  [BelongType.Personal]: '个人',
  [BelongType.Department]: '部门'
};

// 质检任务数据类型
interface QualityTaskItem {
  id: string;
  requirementName: string;
  requirementId: string;
  taskPackageId: number;
  dataType: DataType;
  belongType: BelongType;
  totalTasks: number;
  unclaimedTasks: number;
  unsubmittedTasks: number;
  createdAt: string;
  isFirstInspect: boolean; // 是否首次质检
}

// Tab数据类型
interface TabData {
  key: string;
  round: QualityRound;
  label: string;
  count: number;
}

function QualityTaskList() {
  const history = useHistory();

  // 当前选中的质检轮次
  const [activeTab, setActiveTab] = useState<string>('1');

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
  const getList = useCallback(() => {
    setLoading(true);
    // TODO: 替换为实际API调用
    // const params = {
    //   page: current,
    //   page_size: pageSize,
    //   round: activeTab,
    //   keyword: searchValue,
    //   ...sortValue
    // };
    // const res = await getQualityTaskList(params);

    // 模拟数据
    const mockData: QualityTaskItem[] = Array.from(
      { length: 12 },
      (_, index) => ({
        id: `${index + 1}`,
        requirementName: ['智慧城市', '飞机表面缝隙', '车辆和行人检测'][
          index % 3
        ],
        requirementId: ['123123123', '321321321', '345345345'][index % 3],
        taskPackageId: (index % 3) + 1,
        dataType: index % 2 === 0 ? DataType.Image : DataType.Text,
        belongType:
          index % 3 === 0 ? BelongType.Personal : BelongType.Department,
        totalTasks: 120,
        unclaimedTasks: 30,
        unsubmittedTasks: 30,
        createdAt: '2025-05-05 05:05:05',
        isFirstInspect: index % 4 === 0 // 模拟部分是首次质检
      })
    );

    setTableData(mockData);
    setTotal(50);
    setLoading(false);
  }, [current, pageSize, activeTab, searchValue, sortValue]);

  // 初始化加载
  useEffect(() => {
    getList();
  }, [getList]);

  // 处理Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrent(1);
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
      dataType: filters?.dataType,
      belongType: filters?.belongType,
      order:
        sorter.direction === undefined
          ? 'desc'
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc'
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
    if (record.isFirstInspect) {
      // 首次质检需要先设置
      setCurrentTask(record);
      setFirstInspectModalVisible(true);
    } else {
      // 直接跳转
      goToDetailPage(record);
    }
  };

  // 跳转到详情页
  const goToDetailPage = (record: QualityTaskItem) => {
    history.push(
      `/tenant/compute/modaforge/qualityTask/detail?requirementId=${record.requirementId}&taskPackageId=${record.taskPackageId}&round=${activeTab}`
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
      title: '所需求名称',
      dataIndex: 'requirementName',
      width: 160,
      ellipsis: true,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.requirementName) !== '-' ? (
          <EllipsisPopover value={record.requirementName} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '需求ID',
      dataIndex: 'requirementId',
      width: 120,
      render: (_, record) => {
        return (
          <div className="requirement-id-cell">
            <EllipsisPopover value={record.requirementId} isEdit={false} />
          </div>
        );
      }
    },
    {
      title: '任务包ID',
      dataIndex: 'taskPackageId',
      width: 100,
      render: (_, record) => {
        return <span>{renderEmptyPlaceholder(record.taskPackageId)}</span>;
      }
    },
    {
      title: '类型',
      dataIndex: 'dataType',
      width: 100,
      filters: [
        { text: '文本', value: DataType.Text },
        { text: '图片', value: DataType.Image }
      ],
      render: (_, record) => {
        const typeInfo = DataTypeMap[record.dataType];
        return typeInfo ? (
          <div className="type-cell">
            {record.dataType === DataType.Image && (
              <IconImage className="type-icon" />
            )}
            {record.dataType === DataType.Text && (
              <IconFile className="type-icon" />
            )}
            <span>{typeInfo.label}</span>
          </div>
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '所属',
      dataIndex: 'belongType',
      width: 80,
      filters: [
        { text: '个人', value: BelongType.Personal },
        { text: '部门', value: BelongType.Department }
      ],
      render: (_, record) => {
        return <span>{BelongTypeMap[record.belongType] || '-'}</span>;
      }
    },
    {
      title: '总任务量',
      dataIndex: 'totalTasks',
      width: 100,
      render: (_, record) => {
        return <span>{renderEmptyPlaceholder(record.totalTasks)}</span>;
      }
    },
    {
      title: '未领取',
      dataIndex: 'unclaimedTasks',
      width: 80,
      render: (_, record) => {
        return <span>{renderEmptyPlaceholder(record.unclaimedTasks)}</span>;
      }
    },
    {
      title: '未提检',
      dataIndex: 'unsubmittedTasks',
      width: 80,
      render: (_, record) => {
        return <span>{renderEmptyPlaceholder(record.unsubmittedTasks)}</span>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      sorter: true,
      render: (_, record) => {
        return <span>{renderEmptyPlaceholder(record.createdAt)}</span>;
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
            onClick={() => handleGoToQuality(record)}
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
        inkBarSize={{ width: 80 }}
      >
        {tabsData.map((tab) => (
          <TabPane
            key={tab.key}
            title={
              <span className="tab-title">
                {tab.label}
                <span className="tab-count">({tab.count})</span>
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
        rowKey="id"
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
        visible={firstInspectModalVisible}
        onClose={() => setFirstInspectModalVisible(false)}
        onSuccess={handleFirstInspectSuccess}
      />
    </div>
  );
}

export default QualityTaskList;

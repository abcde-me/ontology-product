import React, { useState, useEffect, useCallback } from 'react';
import {
  Breadcrumb,
  Button,
  Table,
  Tag,
  Modal,
  Pagination,
  Tooltip,
  Message
} from '@arco-design/web-react';
import { IconArrowLeft } from '@arco-design/web-react/icon';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { useHistory } from 'react-router';
import { useParams } from '@/utils/url';
import noDataElement from '@/components/no-data';
import SamplingModal from './SamplingModal';
import BatchInspectModal from './BatchInspectModal';
import {
  getQualityControlTaskStatistics,
  manageQCTaskBatch
} from '@/api/dataAnnotation';
import './index.scss';

const BreadcrumbItem = Breadcrumb.Item;

// 状态枚举
enum InspectionStatus {
  InProgress = 1, // 质检中
  Finished = 2 // 已结束
}

// 状态映射
const StatusMap: Record<number, { label: string; color: string }> = {
  [InspectionStatus.InProgress]: { label: '进行中', color: '#165DFF' },
  [InspectionStatus.Finished]: { label: '已结束', color: '#86909C' }
};

// 质检结果类型
interface QualityResult {
  task_volume_passed: number;
  rejected: number;
  pending: number;
}

// 批注类型
interface Annotation {
  extraLabel?: number; // 多标
  wrongLabel?: number; // 错标
  missedLabel?: number; // 漏标
}

// 抽检数据类型
interface InspectionItem {
  id: number;
  isRecheck: boolean; // 是否复核
  status: InspectionStatus;
  progress: { completed: number; total: number };
  qualityResult: QualityResult;
  taskAccuracy: number;
  checkedElements: number;
  annotation: Annotation;
  elementAccuracy: number;
  creator: string;
  createdAt: string;
}

// 指标卡片数据类型
interface MetricData {
  task_volume_unsampled: number; // 未抽检
  task_volume_total: number; // 总任务数
  task_volume_unreceived: number; // 未提检
  task_volume_sampling: number; // 抽检中
  task_volume_passed: number; // 质检通过
}

function QualityTaskDetail() {
  const history = useHistory();
  const pkg_id = useParams('pkg_id');
  const qc_round = useParams('qc_round');

  // 需求名称
  const [requirementName, setRequirementName] = useState('智慧城市');
  const [publishStatus, setPublishStatus] = useState('发布成功');

  // 指标数据
  const [metricData, setMetricData] = useState<MetricData>({
    task_volume_total: 25,
    task_volume_unsampled: 25,
    task_volume_unreceived: 25,
    task_volume_sampling: 25,
    task_volume_passed: 25
  });

  // 表格数据
  const [tableData, setTableData] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortValue, setSortValue] = useState<any>({});

  // 弹窗状态
  const [samplingModalVisible, setSamplingModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InspectionItem>();

  // 获取质检任务包统计数据
  const getQualityControlTaskStatisticsData = useCallback(async () => {
    const res = await getQualityControlTaskStatistics({
      pkg_id: Number(pkg_id),
      qc_round: Number(qc_round)
    });
    if (res.code === 'success') {
      setMetricData(res.data);
    } else {
      Message.error(res.message);
    }
  }, [pkg_id, qc_round]);

  // 获取表格数据
  const getTableData = useCallback(() => {
    setLoading(true);
    // TODO: 替换为实际API调用
    // const params = {
    //   page: current,
    //   page_size: pageSize,
    //   task_package_id: pkg_id,
    //   qc_round,
    //   ...sortValue
    // };

    // 模拟数据
    const mockData: InspectionItem[] = [
      {
        id: 3,
        isRecheck: false,
        status: InspectionStatus.InProgress,
        progress: { completed: 5, total: 10 },
        qualityResult: { task_volume_passed: 2, rejected: 1, pending: 2 },
        taskAccuracy: 40.0,
        checkedElements: 100,
        annotation: { extraLabel: 10 },
        elementAccuracy: 90.0,
        creator: '张三',
        createdAt: '2025-05-05 05:05:05'
      },
      {
        id: 2,
        isRecheck: true,
        status: InspectionStatus.InProgress,
        progress: { completed: 5, total: 10 },
        qualityResult: { task_volume_passed: 0, rejected: 0, pending: 2 },
        taskAccuracy: 40.0,
        checkedElements: 120,
        annotation: { wrongLabel: 3, missedLabel: 10 },
        elementAccuracy: 90.0,
        creator: '李明',
        createdAt: '2025-05-05 05:05:05'
      },
      {
        id: 1,
        isRecheck: false,
        status: InspectionStatus.Finished,
        progress: { completed: 5, total: 10 },
        qualityResult: { task_volume_passed: 2, rejected: 0, pending: 2 },
        taskAccuracy: 40.0,
        checkedElements: 100,
        annotation: { missedLabel: 20 },
        elementAccuracy: 90.0,
        creator: '王五',
        createdAt: '2025-05-05 05:05:05'
      }
    ];

    setTableData(mockData);
    setTotal(3);
    setLoading(false);
  }, [current, pageSize, pkg_id, qc_round, sortValue]);

  useEffect(() => {
    getTableData();
  }, [getTableData]);

  useEffect(() => {
    getQualityControlTaskStatisticsData();
  }, [getQualityControlTaskStatisticsData]);

  // 处理抽检
  const handleSampling = () => {
    setSamplingModalVisible(true);
  };

  // 处理全部通过/驳回
  const handleBatchConfirm = (type: 'pass_all' | 'reject_all') => {
    Modal.confirm({
      title: `确定将未抽检的任务全部${type === 'pass_all' ? '通过' : '驳回'}?`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const params = {
          action: type,
          pkg_id: Number(pkg_id)
        };
        const res = await manageQCTaskBatch(params);
        if (res.data.code === 'success') {
          Message.success(type === 'pass_all' ? '已全部通过' : '已全部驳回');
          getTableData();
        } else {
          Message.error(res.message);
        }
      }
    });
  };

  // 处理表格变化
  const handleTableChange = (
    _pagination: any,
    sorter: SorterInfo | SorterInfo[],
    filters: any
  ) => {
    setCurrent(1);
    const sorterInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    setSortValue({
      status: filters?.status,
      elementAccuracy: filters?.elementAccuracy,
      order:
        sorterInfo?.direction === undefined
          ? 'desc'
          : sorterInfo?.direction === 'ascend'
            ? 'asc'
            : 'desc'
    });
  };

  // 去质检
  const handleGoInspect = (record: InspectionItem) => {
    // TODO 跳转到质检页
  };

  // 批量质检
  const handleBatchInspect = (record: InspectionItem) => {
    setCurrentRecord(record);
    setBatchModalVisible(true);
  };

  // 渲染质检结果
  const renderQualityResult = (result: QualityResult) => {
    const items: React.ReactNode[] = [];
    if (result.task_volume_passed > 0) {
      items.push(
        <div key="task_volume_passed" className="result-item">
          <Tag color="green" size="small">
            通过
          </Tag>
          <span className="result-count">{result.task_volume_passed}</span>
        </div>
      );
    }
    if (result.rejected > 0) {
      items.push(
        <div key="rejected" className="result-item">
          <Tag color="orangered" size="small">
            驳回
          </Tag>
          <span className="result-count">{result.rejected}</span>
        </div>
      );
    }
    if (result.pending > 0) {
      items.push(
        <div key="pending" className="result-item">
          <Tag color="orange" size="small">
            待定
          </Tag>
          <span className="result-count">{result.pending}</span>
        </div>
      );
    }
    return <div className="quality-result-cell">{items}</div>;
  };

  // 渲染批注
  const renderAnnotation = (annotation: Annotation) => {
    const items: string[] = [];
    if (annotation.extraLabel !== undefined) {
      items.push(`多标: ${annotation.extraLabel}`);
    }
    if (annotation.wrongLabel !== undefined) {
      items.push(`错标: ${annotation.wrongLabel}`);
    }
    if (annotation.missedLabel !== undefined) {
      items.push(`漏标: ${annotation.missedLabel}`);
    }
    return items.length > 0 ? (
      <div className="annotation-cell">
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    ) : (
      '-'
    );
  };

  // 表格列定义
  const columns: ColumnProps<InspectionItem>[] = [
    {
      title: '抽检ID',
      dataIndex: 'id',
      width: 100,
      render: (_, record) => (
        <div className="id-cell">
          <span>{record.id}</span>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      filters: [
        { text: '质检中', value: InspectionStatus.InProgress },
        { text: '已结束', value: InspectionStatus.Finished }
      ],
      render: (_, record) => {
        const statusInfo = StatusMap[record.status];
        return (
          <div className="status-cell">
            <span
              className="status-dot"
              style={{ backgroundColor: statusInfo.color }}
            />
            <span>{statusInfo.label}</span>
          </div>
        );
      }
    },
    {
      title: '抽检进度',
      dataIndex: 'progress',
      width: 120,
      render: (_, record) => {
        const percent =
          record.progress.total > 0
            ? Math.round(
                (record.progress.completed / record.progress.total) * 100
              )
            : 0;
        return (
          <span>
            {percent}% ({record.progress.completed}/{record.progress.total})
          </span>
        );
      }
    },
    {
      title: '质检结果',
      dataIndex: 'qualityResult',
      width: 140,
      render: (_, record) => renderQualityResult(record.qualityResult)
    },
    {
      title: '任务准确率',
      dataIndex: 'taskAccuracy',
      width: 100,
      render: (_, record) => `${record.taskAccuracy.toFixed(1)}%`
    },
    {
      title: '已检元素数',
      dataIndex: 'checkedElements',
      width: 100
    },
    {
      title: '批注',
      dataIndex: 'annotation',
      width: 120,
      render: (_, record) => renderAnnotation(record.annotation)
    },
    {
      title: '元素准确率',
      dataIndex: 'elementAccuracy',
      width: 120,
      filters: [
        { text: '≥90%', value: 90 },
        { text: '≥80%', value: 80 },
        { text: '≥70%', value: 70 },
        { text: '<70%', value: 0 }
      ],
      render: (_, record) => `${record.elementAccuracy.toFixed(1)}%`
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 80
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 160,
      fixed: 'right',
      render: (_, record) => {
        const isFinished = record.status === InspectionStatus.Finished;
        return (
          <div className="operation-cell">
            <span
              className={`operation-link ${isFinished ? 'disabled' : ''}`}
              onClick={() => !isFinished && handleGoInspect(record)}
            >
              去质检
            </span>
            <span
              className={`operation-link ${isFinished ? 'disabled' : ''}`}
              onClick={() => !isFinished && handleBatchInspect(record)}
            >
              批量质检
            </span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="quality-task-detail">
      {/* 页面头部 */}
      <div className="head-breadcrumb-box">
        <IconArrowLeft
          style={{ cursor: 'pointer', fontSize: '14px', marginRight: 12 }}
          onClick={() => history.goBack()}
        />
        <Breadcrumb style={{ fontSize: 20 }}>
          <BreadcrumbItem
            onClick={() => history.goBack()}
            className="breadcrumb-text"
          >
            质检任务
          </BreadcrumbItem>
          <BreadcrumbItem>{requirementName}</BreadcrumbItem>
        </Breadcrumb>
        <Tag color="green" className="status-tag">
          {publishStatus}
        </Tag>
      </div>

      <div className="quality-task-detail-content">
        {/* 指标卡片区域 */}
        <div className="metrics-section">
          {/* 未抽检卡片 */}
          <Tooltip content="剩余可抽检的任务数字，包括待质检和待复核">
            <div className="metric-card task_volume_unsampled-card">
              <div className="task_volume_unsampled-left">
                <div className="metric-label">未抽检</div>
                <div className="task_volume_unsampled-divider" />
                <div className="metric-value">
                  {metricData?.task_volume_unsampled}
                </div>
              </div>
              <div className="metric-actions">
                <Button type="primary" onClick={handleSampling}>
                  抽检
                </Button>
                <Button onClick={() => handleBatchConfirm('pass_all')}>
                  全部通过
                </Button>
                <Button onClick={() => handleBatchConfirm('reject_all')}>
                  全部驳回
                </Button>
              </div>
            </div>
          </Tooltip>

          <div className="metric-divider">=</div>

          <Tooltip content="总任务数">
            <div className="metric-card">
              <div className="metric-label">总任务数</div>
              <div className="metric-value">
                {metricData?.task_volume_total}
              </div>
            </div>
          </Tooltip>

          <div className="metric-divider">-</div>

          <Tooltip content="未提检任务数">
            <div className="metric-card">
              <div className="metric-label">未提检</div>
              <div className="metric-value">
                {metricData?.task_volume_unreceived}
              </div>
            </div>
          </Tooltip>

          <div className="metric-divider">-</div>

          <Tooltip content="抽检中任务数">
            <div className="metric-card">
              <div className="metric-label">抽检中</div>
              <div className="metric-value">
                {metricData?.task_volume_sampling}
              </div>
            </div>
          </Tooltip>

          <div className="metric-divider">-</div>

          <Tooltip content="质检通过任务数">
            <div className="metric-card">
              <div className="metric-label">质检通过</div>
              <div className="metric-value">
                {metricData?.task_volume_passed}
              </div>
            </div>
          </Tooltip>
        </div>

        {/* 基本信息表格 */}
        <div className="table-section">
          <h3 className="section-title">基本信息</h3>
          <Table
            loading={loading}
            columns={columns}
            data={tableData}
            rowKey="id"
            border={false}
            pagination={false}
            noDataElement={noDataElement({ description: '暂无数据' })}
            scroll={{ x: 'max-content' }}
            onChange={handleTableChange}
          />

          {tableData.length > 0 && (
            <div className="pagination-wrapper">
              <Pagination
                current={current}
                pageSize={pageSize}
                total={total}
                showTotal
                showJumper
                sizeOptions={[10, 20, 50, 100]}
                sizeCanChange
                onChange={(page) => setCurrent(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrent(1);
                }}
                selectProps={{
                  getPopupContainer: () => document.body
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 抽检设置弹窗 */}
      <SamplingModal
        visible={samplingModalVisible}
        metricData={metricData}
        onClose={() => setSamplingModalVisible(false)}
        onSuccess={getQualityControlTaskStatisticsData}
      />

      {/* 批量质检弹窗 */}
      <BatchInspectModal
        visible={batchModalVisible}
        onClose={() => setBatchModalVisible(false)}
        onSuccess={getTableData}
        currentRecord={currentRecord}
      />
    </div>
  );
}

export default QualityTaskDetail;

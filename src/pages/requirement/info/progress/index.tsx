import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tooltip,
  Notification,
  Pagination,
  Progress
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { IconRight } from '@arco-design/web-react/icon';
import { useParams } from '@/utils/url';
import GenerateRecordModal from './GenerateRecordModal';
import { getProgressRequirement } from '@/api/dataAnnotation';
import './index.scss';

interface StatisticsItem {
  passed: number | string;
  unreceived: number | string;
  sampling: number | string;
  unowned: number | string;
}

interface TaskPackage {
  pkg_id: string;
  front_pkg_id: string;
  pkg_task_cnt: string | number;
  label_cnt: string | number;
  total_qc_round: string | number;
  statistics: StatisticsItem[];
  creator_name: string;
  create_time: string;
}

// 进度条组件
const ProgressBar: React.FC<{
  completed: number;
  total: number;
  label: string;
}> = ({ completed, total, label }) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="progress-item">
      <div className="progress-text-wrapper">
        <span className="progress-label">{label}:</span>
        <span className="progress-text">
          {percent}% ({completed}/{total})
        </span>
      </div>
      <Progress percent={percent} size="small" showText={false} />
    </div>
  );
};

// 具体进度列渲染
const renderProgress = (record: TaskPackage) => {
  const statistics = record.statistics || [];
  const pkgTaskCnt = Number(record.pkg_task_cnt) || 0;
  const totalQcRound = Number(record.total_qc_round) || 0;

  // 标注进度：statistics[0].passed / pkg_task_cnt
  const annotationPassed = statistics[0]
    ? Number(statistics[0].passed) || 0
    : 0;

  // 构建进度项数组
  const progressItems: { label: string; completed: number; total: number }[] = [
    {
      label: '标注',
      completed: annotationPassed,
      total: pkgTaskCnt
    }
  ];

  // 质检进度：从statistics第二项开始，进度为当前passed / 前一个passed
  for (let i = 1; i <= totalQcRound && i < statistics.length; i++) {
    const currentPassed = Number(statistics[i]?.passed) || 0;
    const prevPassed = Number(statistics[i - 1]?.passed) || 0;
    progressItems.push({
      label: `${i}轮质检`,
      completed: currentPassed,
      total: prevPassed
    });
  }

  return (
    <div className="progress-container">
      {progressItems.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <IconRight className="progress-arrow" />}
          <ProgressBar
            label={item.label}
            completed={item.completed}
            total={item.total}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

interface RequirementProgressProps {
  isActive?: boolean;
}

function RequirementProgress({ isActive }: RequirementProgressProps) {
  const id = useParams('id') as string;
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  );
  const [generateRecordModalVisible, setGenerateRecordModalVisible] =
    useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorter, setSorter] = useState<SorterInfo | null>(null);
  const [dataList, setDataList] = useState<TaskPackage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 获取进度数据
  const fetchProgressData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getProgressRequirement({
        req_id: Number(id),
        page: current,
        page_size: pageSize
      });
      if (res?.code === 'success') {
        setDataList(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('获取进度数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchProgressData();
    }
  }, [id, current, pageSize, isActive]);

  // 表格列定义
  const columns: ColumnProps[] = [
    {
      title: '任务包ID',
      dataIndex: 'front_pkg_id',
      width: 100
    },
    {
      title: '任务数',
      dataIndex: 'pkg_task_cnt',
      width: 80
    },
    {
      title: '具体进度',
      dataIndex: 'progress',
      render: (_: any, record: TaskPackage) => renderProgress(record)
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 170
      // sorter: true
    },
    {
      title: '创建人',
      dataIndex: 'creator_name',
      width: 100
    }
  ];

  // 处理表格变化（排序、分页等）
  const handleTableChange = (
    pagination: any,
    sorterInfo: SorterInfo | SorterInfo[],
    filters: any
  ) => {
    if (Array.isArray(sorterInfo)) {
      setSorter(sorterInfo[0] || null);
    } else {
      setSorter(sorterInfo || null);
    }
  };

  // 处理生成标注结果
  const handleGenerateAnnotationResults = () => {
    if (selectedRowKeys.length === 0) {
      return;
    }

    // 显示Toast提示
    Notification.info({
      content: (
        <span>
          标注结果生成中,可点击
          <span
            className="toast-link"
            onClick={() => {
              setGenerateRecordModalVisible(true);
            }}
          >
            生成记录
          </span>
          查看进度
        </span>
      ),
      duration: 5000,
      style: { marginTop: 20 }
    });
  };

  // 处理生成记录
  const handleGenerateRecord = () => {
    setGenerateRecordModalVisible(true);
  };

  // 判断是否禁用生成标注结果按钮
  const isGenerateDisabled = selectedRowKeys.length === 0;

  return (
    <div className="requirement-progress">
      <div className="progress-header">
        <h2 className="progress-title">任务包进度</h2>
        <div className="progress-actions">
          <Button
            type="text"
            onClick={handleGenerateRecord}
            style={{ marginRight: 8 }}
          >
            生成记录
          </Button>
          {isGenerateDisabled ? (
            <Tooltip content="请先选择任务包" position="top">
              <Button type="primary" disabled>
                生成标注结果
              </Button>
            </Tooltip>
          ) : (
            <Button type="primary" onClick={handleGenerateAnnotationResults}>
              生成标注结果
            </Button>
          )}
        </div>
      </div>

      <Table
        border={false}
        columns={columns}
        data={dataList}
        rowKey="pkg_id"
        loading={loading}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (keys) => {
            setSelectedRowKeys(keys);
          }
        }}
        pagination={false}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />

      {total > 0 && (
        <div className="progress-pagination">
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

      {/* 生成记录弹窗 */}
      <GenerateRecordModal
        visible={generateRecordModalVisible}
        onClose={() => setGenerateRecordModalVisible(false)}
      />
    </div>
  );
}

export default RequirementProgress;

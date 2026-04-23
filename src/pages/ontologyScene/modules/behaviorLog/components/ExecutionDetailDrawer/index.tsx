import React, { useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import { DrawerWithEditBtn } from '@/pages/ontologyScene/components';
import { StatusCard } from './StatusCard';
import { BasicInfo } from './BasicInfo';
import { ParamsTab } from './ParamsTab';
import { LogsTab } from './LogsTab';
import { FunctionTab } from './FunctionTab';
import { useExecutionDetailStore } from './store';
import styles from './index.module.scss';

const TabPane = Tabs.TabPane;

interface ExecutionDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  executionId?: string;
  mode?: 'action' | 'function'; // 新增 mode 属性
}

export const ExecutionDetailDrawer: React.FC<ExecutionDetailDrawerProps> = ({
  visible,
  onClose,
  executionId,
  mode = 'action' // 默认为 action 模式
}) => {
  const {
    detailData,
    params,
    outputParams,
    logs,
    functionCode,
    loading,
    activeTab,
    setActiveTab,
    setExecutionId
  } = useExecutionDetailStore();

  useEffect(() => {
    if (visible && executionId) {
      setExecutionId(executionId);
    }
  }, [visible, executionId, setExecutionId]);

  const sourceMap: Record<string, string> = {
    manual: '手动触发',
    auto: '自动触发',
    api: 'API调用'
  };

  const title = mode === 'action' ? '行为执行详情' : '函数执行详情';

  // 兼容 source 和 sources 字段
  const sourceValue = detailData?.source || detailData?.sources || '';
  // 确保 run_status 有效，如果是 0 则默认为 1（处理中）
  const runStatus = detailData?.run_status || 1;

  // 格式化执行耗时（毫秒转秒）
  const formatDuration = (duration: string | number | undefined): string => {
    if (!duration) return '0s';
    const ms = typeof duration === 'string' ? parseFloat(duration) : duration;
    if (isNaN(ms)) return '0s';
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <DrawerWithEditBtn
      visible={visible}
      onCancel={onClose}
      title={title}
      footer={null}
      className={styles['execution-detail-drawer']}
    >
      {!detailData || detailData.id === undefined || detailData.id === null ? (
        <div className="flex items-center justify-center py-20">
          <div>加载中...</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* 状态卡片 */}
          <StatusCard
            status={runStatus}
            executionId={String(detailData.id)}
            source={sourceMap[sourceValue] || sourceValue || '未知'}
            duration={formatDuration(detailData.duration)}
            startTime={detailData.start_time || '-'}
            endTime={detailData.end_time || '-'}
          />

          {/* 基本信息 */}
          <BasicInfo
            mode={mode}
            name={detailData.name}
            code={detailData.code}
            description={detailData.description}
            detailData={detailData}
          />

          {/* Tab 内容 */}
          <div className={styles['tabs-container']}>
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              className="[&_.arco-tabs-content]:p-0"
            >
              <TabPane key="logs" title="运行日志">
                <LogsTab logs={logs} loading={loading} />
              </TabPane>
              <TabPane
                key="params"
                title={`参数(${params.length + outputParams.length})`}
              >
                <ParamsTab
                  params={params}
                  outputParams={outputParams}
                  loading={loading}
                />
              </TabPane>

              <TabPane key="function" title="函数">
                <FunctionTab code={functionCode} loading={loading} />
              </TabPane>
            </Tabs>
          </div>
        </div>
      )}
    </DrawerWithEditBtn>
  );
};

export default ExecutionDetailDrawer;

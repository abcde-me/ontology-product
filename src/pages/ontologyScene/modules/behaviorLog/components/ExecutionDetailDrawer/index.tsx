import React, { useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import { OsDrawer } from '@/pages/ontologyScene/componens';
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

  if (!detailData) {
    return null;
  }

  const sourceMap: Record<string, string> = {
    manual: '手动触发',
    auto: '自动触发',
    api: 'API调用'
  };

  const title = mode === 'action' ? '行为执行详情' : '函数执行详情';

  return (
    <OsDrawer
      visible={visible}
      onCancel={onClose}
      title={title}
      footer={null}
      className={styles['execution-detail-drawer']}
    >
      <div className="flex flex-col gap-6">
        {/* 状态卡片 */}
        <StatusCard
          status={detailData.run_status}
          executionId={detailData.id}
          source={sourceMap[detailData.sources] || detailData.sources}
          duration={detailData.duration}
          startTime={detailData.start_time}
          endTime={detailData.end_time}
        />

        {/* 基本信息 */}
        <BasicInfo
          mode={mode}
          name={detailData.name}
          code={detailData.code}
          description={detailData.description}
          ontologyObjectTypeName={detailData.ontologyObjectTypeName}
          ontologyObjectTypeIcon={detailData.ontologyObjectTypeIcon}
          ontologyObjectTypeId={String(detailData.ontologyObjectTypeId || '')}
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
    </OsDrawer>
  );
};

export default ExecutionDetailDrawer;

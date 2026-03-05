import React, { useState } from 'react';
import { OsDrawer } from '@/pages/ontologyScene/componens';
import { DotStatus, NoDataCard } from '@ceai-front/arco-material';
import { IconLoading } from '@arco-design/web-react/icon';
import { Tabs, Message } from '@arco-design/web-react';
import { TestFunctionInfo } from '@/pages/ontologyScene/hooks/useTestFunction';
import { BehaviorLogItem } from '@/pages/ontologyScene/modules/behaviorLog/types';

const TabPane = Tabs.TabPane;

interface TestResultDrawerProps {
  visible: boolean;
  onClose: () => void;
  testFunctionHook: TestFunctionInfo;
}

export const TestResultDrawer: React.FC<TestResultDrawerProps> = ({
  visible,
  onClose,
  testFunctionHook
}) => {
  // 从 props 接收 testFunctionHook
  const { runLog: runInfo, testIng, loading, stopTest } = testFunctionHook;

  // 当前激活的 tab
  const [activeTab, setActiveTab] = useState<string>('0');

  // 处理关闭抽屉
  const handleClose = () => {
    // 如果正在测试，停止测试并显示提示
    if (testIng || loading) {
      stopTest();
      Message.info('已停止运行');
    }
    onClose();
  };

  // 判断是否为多个行为测试结果
  const isMultipleResults =
    runInfo &&
    Array.isArray(runInfo.runLog) &&
    runInfo.runLog.length > 0 &&
    'name' in runInfo.runLog[0];

  // 渲染状态信息（在日志内容上方）
  const renderStatusInfo = (item: BehaviorLogItem, withMargin = true) => {
    const statusConfig = {
      1: { text: '测试中', color: '#6E7B8D' },
      2: { text: '测试成功', color: '#00B981' },
      3: { text: '运行失败', color: '#F53F3F' },
      4: { text: 'KILL', color: '#F53F3F' }
    };

    const config = statusConfig[item.run_status as 1 | 2 | 3 | 4];
    const duration = Number(item.duration) || 0;
    const durationInSeconds = (duration / 1000).toFixed(2);

    return (
      <div className={`flex items-center gap-2 ${withMargin ? 'mb-4' : ''}`}>
        {config && (
          <>
            <DotStatus text={config.text} color={config.color} />
            <span className="text-sm text-[#94A3B8]">
              ({durationInSeconds}s)
            </span>
          </>
        )}
        {item.run_status === 1 && (
          <IconLoading style={{ color: '#184FF2', fontSize: '14px' }} />
        )}
      </div>
    );
  };

  // 渲染单个行为的日志内容
  const renderLogContent = (logItem: BehaviorLogItem) => {
    return (
      <pre className="m-0 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#1d2129]">
        {logItem.run_log || ''}
      </pre>
    );
  };

  // 渲染内容区域
  const renderContent = () => {
    if (loading || testIng) {
      return <div className="text-sm text-[#86909C]">运行中...</div>;
    }

    if (!runInfo) {
      return <NoDataCard type="block" title="请先在左侧配置参数并点击测试" />;
    }

    // 多个行为测试结果：使用 Tabs
    if (isMultipleResults) {
      const behaviorList = runInfo.runLog as BehaviorLogItem[];

      // 如果只有一个行为，不显示 tabs
      if (behaviorList.length === 1) {
        const item = behaviorList[0];
        return (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-base font-medium">{item.name}</span>
              {renderStatusInfo(item, false)}
            </div>
            {renderLogContent(item)}
          </div>
        );
      }

      // 多个行为：显示 tabs
      return (
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          type="line"
          style={{ height: '100%' }}
        >
          {behaviorList.map((item, index) => (
            <TabPane
              key={String(index)}
              title={item.name || `行为 ${index + 1}`}
            >
              <div className="pt-4">
                {renderStatusInfo(item)}
                {renderLogContent(item)}
              </div>
            </TabPane>
          ))}
        </Tabs>
      );
    }

    // 单个行为测试结果：直接显示日志
    const firstItem = runInfo.runLog[0] as BehaviorLogItem;
    if (firstItem && firstItem.run_log) {
      return renderLogContent(firstItem);
    }

    return <NoDataCard type="block" title="暂无测试结果" />;
  };

  return (
    <OsDrawer
      visible={visible}
      onCancel={handleClose}
      title="测试结果"
      footer={null}
      width={552}
    >
      <div className="h-[calc(100vh-140px)] overflow-y-auto rounded-lg bg-[#F7F8FA] p-4">
        {renderContent()}
      </div>
    </OsDrawer>
  );
};

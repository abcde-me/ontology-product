import React from 'react';
import { Spin } from '@arco-design/web-react';
import { OsDrawer } from '@/pages/ontologyScene/componens';
import { DotStatus } from '@ceai-front/arco-material';
import { TestResult } from '../../types';

interface TestResultDrawerProps {
  visible: boolean;
  onClose: () => void;
  isRunning: boolean;
  results: TestResult[];
}

export const TestResultDrawer: React.FC<TestResultDrawerProps> = ({
  visible,
  onClose,
  isRunning,
  results
}) => {
  // 计算总执行时长
  const totalDuration = results.reduce(
    (sum, result) => sum + (result.duration || 0),
    0
  );

  // 判断整体状态
  const hasError = results.some((r) => r.status === 'error');
  const allSuccess = results.every((r) => r.status === 'success');
  const overallStatus = isRunning
    ? 'running'
    : hasError
      ? 'failed'
      : allSuccess
        ? 'success'
        : 'pending';

  // 渲染标题（包含状态）
  const renderTitle = () => {
    if (isRunning) {
      return (
        <div className="flex items-center gap-2">
          <span>测试结果</span>
          <Spin size={12} />
          <span className="text-sm text-[#86909c]">测试中</span>
        </div>
      );
    }

    const statusConfig = {
      success: { text: '测试成功', color: '#00b42a' },
      failed: { text: '测试失败', color: '#f53f3f' }
    };

    const config = statusConfig[overallStatus as 'success' | 'failed'];
    if (!config) {
      return <span>测试结果</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <span>测试结果</span>
        <DotStatus text={config.text} color={config.color} />
        <span className="text-sm text-[#86909c]">
          ({(totalDuration / 1000).toFixed(0)}s)
        </span>
      </div>
    );
  };

  // 生成模拟日志
  const generateMockLogs = (result: TestResult): string => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 23);

    if (result.status === 'success') {
      return `[LOG-PATH]: /opt/aimdpscheduler/logs/${Date.now()}/test.log
[HOST]: test-worker-0.test-worker-headless:1234
[INFO] ${timestamp} +0800 - ******************************************
[INFO] ${timestamp} +0800 - ********** Initialize ${result.nodeName} **********
[INFO] ${timestamp} +0800 - ******************************************
[INFO] ${timestamp} +0800 - Begin to execute ${result.nodeName}
[INFO] ${timestamp} +0800 - Execution completed successfully
[INFO] ${timestamp} +0800 - Duration: ${result.duration}ms
[INFO] ${timestamp} +0800 - Output: ${JSON.stringify(result.output, null, 2)}`;
    } else {
      return `[LOG-PATH]: /opt/aimdpscheduler/logs/${Date.now()}/test.log
[HOST]: test-worker-0.test-worker-headless:1234
[ERROR] ${timestamp} +0800 - ******************************************
[ERROR] ${timestamp} +0800 - ********** Execute ${result.nodeName} Failed **********
[ERROR] ${timestamp} +0800 - ******************************************
[ERROR] ${timestamp} +0800 - Error: ${result.error}
[ERROR] ${timestamp} +0800 - Duration: ${result.duration}ms`;
    }
  };

  return (
    <OsDrawer
      visible={visible}
      onCancel={onClose}
      title={renderTitle()}
      footer={null}
      width={552}
    >
      {isRunning ? (
        <div className="h-[calc(100vh-140px)] overflow-y-auto rounded-lg bg-[#F7F8FA] p-4">
          <div className="text-sm text-[#86909c]">运行中...</div>
        </div>
      ) : (
        <div className="h-[calc(100vh-140px)] overflow-y-auto rounded-lg bg-[#F7F8FA] p-4">
          <div className="flex flex-col gap-4">
            {results.map((result) => {
              const logs = generateMockLogs(result);

              return (
                <div key={result.nodeId}>
                  {/* 日志内容 */}
                  <pre className="m-0 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#1d2129]">
                    {logs}
                  </pre>
                </div>
              );
            })}

            {results.length === 0 && (
              <div className="flex min-h-[400px] items-center justify-center text-sm text-[#86909c]">
                暂无测试结果
              </div>
            )}
          </div>
        </div>
      )}
    </OsDrawer>
  );
};

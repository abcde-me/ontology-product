import React from 'react';
import { OsDrawer } from '@/pages/ontologyScene/componens';
import { DotStatus, NoDataCard } from '@ceai-front/arco-material';
import { IconLoading } from '@arco-design/web-react/icon';
import { TestFunctionInfo } from '@/pages/ontologyScene/hooks/useTestFunction';

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
  const { runLog: runInfo, testIng, loading } = testFunctionHook;

  // 渲染标题（包含状态）
  const renderTitle = () => {
    if (!runInfo) {
      return <span>测试结果</span>;
    }

    if (runInfo.run_status === 1 || loading || testIng) {
      return (
        <div className="flex items-center gap-2">
          <span>测试结果</span>
          <div className="flex items-center gap-2 text-sm text-[#6E7B8D]">
            测试中
            <IconLoading style={{ color: '#184FF2' }} />
          </div>
        </div>
      );
    }

    const statusConfig = {
      2: { text: '运行成功', color: '#00B981' },
      3: { text: '运行失败', color: '#F53F3F' },
      4: { text: 'KILL', color: '#F53F3F' }
    };

    const config = statusConfig[runInfo.run_status as 2 | 3 | 4];
    if (!config) {
      return <span>测试结果</span>;
    }

    // 将毫秒转换为秒，保留2位小数
    const durationInSeconds = runInfo.duration
      ? (Number(runInfo.duration) / 1000).toFixed(2)
      : '0.00';

    return (
      <div className="flex items-center gap-2">
        <span>测试结果</span>
        <DotStatus text={config.text} color={config.color} />
        <span className="text-sm text-[#94A3B8]">( {durationInSeconds}s)</span>
      </div>
    );
  };

  return (
    <OsDrawer
      visible={visible}
      onCancel={onClose}
      title={renderTitle()}
      footer={null}
      width={552}
    >
      <div className="h-[calc(100vh-140px)] overflow-y-auto rounded-lg bg-[#F7F8FA] p-4">
        {loading || testIng ? (
          <div className="text-sm text-[#86909C]">运行中...</div>
        ) : !runInfo?.run_log ? (
          <NoDataCard type="block" title="请先在左侧配置参数并点击测试" />
        ) : (
          <pre className="m-0 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#1d2129]">
            {runInfo.run_log}
          </pre>
        )}
      </div>
    </OsDrawer>
  );
};

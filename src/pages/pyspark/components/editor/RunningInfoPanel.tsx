import React, { useState, useEffect, memo } from 'react';
import { Collapse, Tabs, Typography } from '@arco-design/web-react';
import {
  IconDown,
  IconUp,
  IconLoading,
  IconCheckCircle,
  IconCloseCircle
} from '@arco-design/web-react/icon';
import RunSuccessIcon from '@/assets/python/run-success-icon.svg';
import RunFailedIcon from '@/assets/python/run-fail-icon.svg';
import { RunningStatus } from '@/types/pythonApi';
import './RunningInfoPanel.scss';
import { formatTime } from '@/utils/format';
import timeFormattig from '@/utils/timeFormatting';

const { Item: CollapseItem } = Collapse;
const { TabPane } = Tabs;
const { Text } = Typography;

interface RunningInfoPanelProps {
  runResult: string;
  runLog: string;
  runStatus?: RunningStatus;
  runStartTime?: Date | null;
  runDuration?: number;
  onGetRunLog?: () => Promise<void>;
  isPanelOpen?: boolean;
  onPanelStateChange?: (isOpen: boolean) => void;
}

const RunningInfoPanel: React.FC<RunningInfoPanelProps> = memo(
  ({
    runResult,
    runLog,
    runStatus,
    runStartTime,
    runDuration,
    onGetRunLog,
    isPanelOpen,
    onPanelStateChange
  }) => {
    const [activeKey, setActiveKey] = useState<string>('result');
    const [isExpanded, setIsExpanded] = useState(false);

    // 监听父组件传递的面板状态变化
    useEffect(() => {
      setIsExpanded(isPanelOpen || false);
    }, [isPanelOpen]);

    // 监听运行状态变化，自动展开面板
    useEffect(() => {
      // 运行完成时自动展开面板
      if (
        runStatus === RunningStatus.SUCCESS ||
        runStatus === RunningStatus.FAILED
      ) {
        setIsExpanded(true);
        onPanelStateChange?.(true);

        // 根据运行结果自动定位到对应标签页
        if (runStatus === RunningStatus.SUCCESS) {
          setActiveKey('result');
        } else if (runStatus === RunningStatus.FAILED) {
          setActiveKey('log');
        }
      }
    }, [runStatus, onPanelStateChange]);

    // 监听TabPane切换，当切换到log时获取日志
    useEffect(() => {
      if (activeKey === 'log' && onGetRunLog) {
        onGetRunLog();
      }
    }, [activeKey, onGetRunLog]);

    const handlePanelChange = (key: string, keys: string[]) => {
      const newExpanded = keys.length > 0;
      setIsExpanded(newExpanded);
      onPanelStateChange?.(newExpanded);
    };

    // 格式化时间显示
    const formatTimeInfo = (startTime?: Date | null, duration?: number) => {
      if (!startTime || !duration) return '';

      const startTimeStr = timeFormattig(startTime.getTime());

      const durationStr =
        duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;

      return `${startTimeStr}（${durationStr}）`;
    };

    const renderRunStatus = (status?: RunningStatus) => {
      if (status === RunningStatus.RUNNING) {
        return (
          <div className="run-status">
            <span className="mr-4">运行中</span>
            <IconLoading style={{ color: '#007DFA' }} />
          </div>
        );
      }
      if (status === RunningStatus.SUCCESS) {
        const timeInfo = formatTimeInfo(runStartTime, runDuration);
        return (
          <div className="run-status">
            <span className="mr-4">运行成功</span>
            <RunSuccessIcon className="mr-[8px]" />
            {timeInfo && <span>{timeInfo}</span>}
          </div>
        );
      }
      if (status === RunningStatus.FAILED) {
        const timeInfo = formatTimeInfo(runStartTime, runDuration);
        return (
          <div className="run-status">
            <span className="mr-4">运行失败</span>
            <RunFailedIcon className="mr-[8px]" />
            {timeInfo && <span>{timeInfo}</span>}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="running-info-panel">
        <Collapse
          activeKey={isExpanded ? ['1'] : []}
          onChange={handlePanelChange}
          expandIconPosition="left"
          expandIcon={isExpanded ? <IconDown /> : <IconUp />}
          style={{
            border: 'none'
          }}
        >
          <CollapseItem
            header={
              <div className="panel-header">
                <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                  运行信息
                </Text>
                {renderRunStatus(runStatus)}
              </div>
            }
            name="1"
          >
            <div className="panel-content">
              <Tabs
                activeTab={activeKey}
                onChange={setActiveKey}
                style={{
                  backgroundColor: '#F8FAFD'
                }}
              >
                <TabPane key="result" title="结果">
                  <div className="run-result-content">{runResult}</div>
                </TabPane>

                <TabPane key="log" title="日志">
                  <div className="runlog-content">{runLog}</div>
                </TabPane>
              </Tabs>
            </div>
          </CollapseItem>
        </Collapse>
      </div>
    );
  }
);

RunningInfoPanel.displayName = 'RunningInfoPanel';

export default RunningInfoPanel;

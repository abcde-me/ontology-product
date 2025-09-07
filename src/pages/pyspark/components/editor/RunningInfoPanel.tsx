import React, { useState, useEffect, memo } from 'react';
import { Collapse, Tabs, Typography } from '@arco-design/web-react';
import {
  IconDown,
  IconUp,
  IconLoading,
  IconCheckCircle,
  IconCloseCircle
} from '@arco-design/web-react/icon';
import { RunningStatus } from '@/types/pythonApi';
import './RunningInfoPanel.scss';

const { Item: CollapseItem } = Collapse;
const { TabPane } = Tabs;
const { Text } = Typography;

interface RunningInfoPanelProps {
  runResult: string;
  runLog: string;
  runStatus?: RunningStatus; // 使用正确的类型
  onGetRunLog?: () => Promise<void>; // 获取运行日志的函数
  isPanelOpen?: boolean; // 控制面板是否打开
  onPanelStateChange?: (isOpen: boolean) => void; // 面板状态变化回调
}

const RunningInfoPanel: React.FC<RunningInfoPanelProps> = memo(
  ({
    runResult,
    runLog,
    runStatus,
    onGetRunLog,
    isPanelOpen,
    onPanelStateChange
  }) => {
    const [activeKey, setActiveKey] = useState<string>('result');
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasUserClosed, setHasUserClosed] = useState(false);

    // 监听外部控制的面板状态
    useEffect(() => {
      if (isPanelOpen !== undefined) {
        setIsExpanded(isPanelOpen);
        if (!isPanelOpen) {
          setHasUserClosed(false); // 重置用户关闭状态
        }
      }
    }, [isPanelOpen]);

    // 监听运行状态变化，当运行完成时自动打开面板（但初始状态为收起）
    useEffect(() => {
      if (
        runStatus === RunningStatus.SUCCESS ||
        runStatus === RunningStatus.FAILED
      ) {
        // 运行完成时，如果面板当前是关闭的，则自动打开
        if (!isExpanded && !hasUserClosed) {
          setIsExpanded(true);
          onPanelStateChange?.(true);
        }
      }
    }, [runStatus, isExpanded, hasUserClosed, onPanelStateChange]);

    // 监听运行状态变化，当开始新运行时重置用户关闭状态
    useEffect(() => {
      if (runStatus === RunningStatus.RUNNING) {
        setHasUserClosed(false);
      }
    }, [runStatus]);

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

      // 如果用户手动关闭面板，记录这个状态
      if (!newExpanded) {
        setHasUserClosed(true);
      }
    };

    const renderRunStatus = (status?: RunningStatus) => {
      if (status === RunningStatus.RUNNING) {
        return (
          <div className="run-status running">
            <span className="mr-4">运行中</span>
            <IconLoading style={{ color: '#007DFA' }} />
          </div>
        );
      }
      if (status === RunningStatus.SUCCESS) {
        return (
          <div className="run-status success">
            <span className="mr-4">运行成功</span>
            <IconCheckCircle style={{ color: '#10B981' }} />
          </div>
        );
      }
      if (status === RunningStatus.FAILED) {
        return (
          <div className="run-status failed">
            <span className="mr-4">运行失败</span>
            <IconCloseCircle style={{ color: '#EF4444' }} />
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
                defaultActiveTab={activeKey}
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

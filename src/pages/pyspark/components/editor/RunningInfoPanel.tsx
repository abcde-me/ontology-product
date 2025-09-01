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
}

const RunningInfoPanel: React.FC<RunningInfoPanelProps> = memo(
  ({ runResult, runLog, runStatus }) => {
    const [activeKey, setActiveKey] = useState<string>('result');
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasUserClosed, setHasUserClosed] = useState(false);

    // 监听运行结果变化，自动展开面板
    useEffect(() => {
      // 当有运行结果或日志时，自动展开面板（除非用户手动关闭过）
      if ((runResult || runLog) && !hasUserClosed) {
        setIsExpanded(true);
      }
    }, [runResult, runLog, hasUserClosed]);

    // 监听运行状态变化，当开始新运行时重置用户关闭状态
    useEffect(() => {
      if (runStatus === RunningStatus.RUNNING) {
        setHasUserClosed(false);
      }
    }, [runStatus]);

    const handlePanelChange = (key: string, keys: string[]) => {
      const newExpanded = keys.length > 0;
      setIsExpanded(newExpanded);

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

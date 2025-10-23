import React, { useState, useEffect, memo } from 'react';
import {
  Collapse,
  Tabs,
  Typography,
  Popover,
  Message,
  Button
} from '@arco-design/web-react';
import {
  IconDown,
  IconUp,
  IconLoading,
  IconCopy
} from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import RunSuccessIcon from '@/assets/python/run-success-icon.svg';
import RunFailedIcon from '@/assets/python/run-fail-icon.svg';
import { RunningStatus } from '@/types/pythonApi';
import './RunningInfoPanel.scss';
import timeFormattig from '@/utils/timeFormatting';

const { Item: CollapseItem } = Collapse;
const { TabPane } = Tabs;
const { Text } = Typography;

interface RunningInfoPanelProps {
  activeKey: string;
  setActiveKey: (key: string) => void;
  runResult: string;
  runLog: string;
  runStatus?: RunningStatus;
  runStartTime?: Date | null;
  runDuration?: number;
  hasFetchedResult?: boolean;
  onGetRunLog?: () => Promise<void>;
  onGetRunResult?: () => Promise<void>;
  isPanelOpen?: boolean;
  onPanelStateChange?: (isOpen: boolean) => void;
  getPrevRunStatus?: () => RunningStatus;
}

const RunningInfoPanel: React.FC<RunningInfoPanelProps> = memo(
  ({
    runResult,
    runLog,
    runStatus,
    runStartTime,
    runDuration,
    hasFetchedResult,
    activeKey,
    setActiveKey,
    onGetRunLog,
    onGetRunResult,
    isPanelOpen,
    onPanelStateChange,
    getPrevRunStatus
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // 自定义expandIcon组件，包含popover功能
    const CustomExpandIcon = () => {
      const getPopoverContent = () => {
        if (isExpanded) {
          return '收起';
        } else {
          return '展开';
        }
      };

      return (
        <Popover content={getPopoverContent()} position="top" trigger="hover">
          <div className="custom-expand-icon">
            {isExpanded ? <IconDown /> : <IconUp />}
          </div>
        </Popover>
      );
    };

    // 监听父组件传递的面板状态变化
    useEffect(() => {
      console.log('isPanelOpen', isPanelOpen);
      setIsExpanded(isPanelOpen || false);
    }, [isPanelOpen]);

    // 监听运行状态变化，自动展开面板
    useEffect(() => {
      // 运行中时自动展开面板
      if (runStatus === RunningStatus.RUNNING) {
        setIsExpanded(true);
        onPanelStateChange?.(true);
        setActiveKey('log'); // 运行中时显示日志标签页
        // onGetRunLog?.();
      }
      // 运行完成时自动展开面板
      // else if (
      //   runStatus === RunningStatus.SUCCESS ||
      //   runStatus === RunningStatus.FAILED
      // ) {
      //   // 检查前一个状态，避免在状态重置时误触发
      //   const prevStatus = getPrevRunStatus?.() || RunningStatus.IDLE;

      //   // 只有当状态真正从运行中变为完成状态时才执行自动行为
      //   // 避免在标签页切换时状态重置导致的误触发
      //   if (prevStatus === RunningStatus.RUNNING) {
      //     setIsExpanded(true);
      //     onPanelStateChange?.(true);

      //     // 根据运行结果自动定位到对应标签页
      //     if (runStatus === RunningStatus.SUCCESS) {
      //       setActiveKey('result');
      //     } else if (runStatus === RunningStatus.FAILED) {
      //       setActiveKey('log');
      //       onGetRunLog?.();
      //     }
      //   }
      // }
    }, [runStatus, onPanelStateChange, getPrevRunStatus]);

    const handleClickTab = (key: string) => {
      setActiveKey(key);
      if (key === 'log' && onGetRunLog) {
        onGetRunLog();
      } else if (key === 'result' && onGetRunResult) {
        onGetRunResult();
      }
    };

    const handlePanelChange = (key: string, keys: string[]) => {
      const newExpanded = keys.length > 0;
      setIsExpanded(newExpanded);
      onPanelStateChange?.(newExpanded);
    };

    // 复制内容到剪贴板
    const handleCopyContent = (content: string) => {
      const success = copy(content);
      if (success) {
        Message.success('复制成功');
      } else {
        Message.error('复制失败');
      }
    };

    // 复制按钮组件
    const CopyButton = ({ content }: { content: string }) => (
      <Button
        type="outline"
        icon={<IconCopy />}
        onClick={() => handleCopyContent(content)}
        className="copy-button"
      >
        复制
      </Button>
    );

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
          expandIcon={<CustomExpandIcon />}
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
              <div className="tabs-container">
                <Tabs
                  activeTab={activeKey}
                  onClickTab={handleClickTab}
                  destroyOnHide
                  style={{
                    backgroundColor: '#F8FAFD'
                  }}
                >
                  <TabPane key="result" title="结果">
                    <div className="run-result-content tab-content-wrapper">
                      {(() => {
                        // 如果有结果内容，直接显示
                        if (runResult && runResult.trim() !== '') {
                          return runResult;
                        }

                        // 没有结果时，根据是否已获取过结果和运行状态显示相应提示
                        if (!hasFetchedResult) {
                          // 还没有调用过 getRunResult，显示开始输出
                          return '开始输出...';
                        } else {
                          // 已经调用过 getRunResult 但结果为空
                          if (runStatus === RunningStatus.SUCCESS) {
                            return '运行成功，暂无输出结果';
                          } else if (runStatus === RunningStatus.FAILED) {
                            return '运行失败，请查看日志获取详细信息';
                          } else {
                            return '暂无运行结果';
                          }
                        }
                      })()}
                    </div>
                  </TabPane>

                  <TabPane key="log" title="日志">
                    <div className="runlog-content tab-content-wrapper">
                      {runLog}
                    </div>
                  </TabPane>
                </Tabs>

                {/* 复制按钮放在滚动容器外部 */}
                {activeKey === 'result' &&
                  runResult &&
                  runResult.trim() !== '' && <CopyButton content={runResult} />}
                {activeKey === 'log' && runLog && runLog.trim() !== '' && (
                  <CopyButton content={runLog} />
                )}
              </div>
            </div>
          </CollapseItem>
        </Collapse>
      </div>
    );
  }
);

RunningInfoPanel.displayName = 'RunningInfoPanel';

export default RunningInfoPanel;

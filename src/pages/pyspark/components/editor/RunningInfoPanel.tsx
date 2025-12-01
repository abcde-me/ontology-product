import React, {
  useState,
  useEffect,
  memo,
  useRef,
  useLayoutEffect,
  useCallback,
  useMemo
} from 'react';
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
import { useVirtualList } from 'ahooks';

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
    const logContentRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true); // 是否应该自动滚动
    const logContainerRef = useRef<HTMLDivElement>(null);
    const resultContainerRef = useRef<HTMLDivElement>(null);
    const resultContentRef = useRef<HTMLDivElement>(null);

    const logLines = useMemo(() => {
      if (!runLog || runLog.trim() === '') return [];
      return runLog.split('\n');
    }, [runLog]);

    const resultLines = useMemo(() => {
      if (!runResult || runResult.trim() === '') return [];
      return runResult.split('\n');
    }, [runResult]);

    const [logList, logScrollTo] = useVirtualList(logLines, {
      containerTarget: logContainerRef,
      wrapperTarget: logContentRef,
      itemHeight: 20, // 每行大约20px高度
      overscan: 5 // 额外渲染的行数，减少以提升性能
    });

    const logVirtualListContent = useMemo(() => {
      // 如果有日志内容，直接显示
      if (logLines && logLines.length > 0) {
        return logList.map((item) => {
          return (
            <div
              key={item.index}
              style={{
                height: '20px',
                lineHeight: '20px',
                padding: '0 12px',
                whiteSpace: 'pre',
                wordBreak: 'normal',
                overflowWrap: 'normal'
              }}
            >
              {item.data}
            </div>
          );
        });
      }

      // 没有日志时，根据是否已获取过日志和运行状态显示相应提示
      let emptyMessage = '';
      if (!hasFetchedResult) {
        // 还没有调用过 getRunLog，显示开始输出
        emptyMessage = '开始输出...';
      } else {
        // 已经调用过 getRunLog 但日志为空
        if (runStatus === RunningStatus.SUCCESS) {
          emptyMessage = '运行成功，暂无日志输出';
        } else if (runStatus === RunningStatus.FAILED) {
          emptyMessage = '运行失败，暂无错误日志';
        } else {
          emptyMessage = '暂无运行日志';
        }
      }

      return (
        <div style={{ height: '20px', lineHeight: '20px' }}>{emptyMessage}</div>
      );
    }, [logList, logLines, hasFetchedResult, runStatus]);

    const [resultList] = useVirtualList(resultLines, {
      containerTarget: resultContentRef,
      wrapperTarget: resultContainerRef,
      itemHeight: 20, // 每行大约20px高度
      overscan: 5 // 额外渲染的行数，减少以提升性能
    });

    const resultVirtualListContent = useMemo(() => {
      // 如果有结果内容，直接显示
      if (resultLines && resultLines.length > 0) {
        return resultList.map((item) => {
          return (
            <div
              key={item.index}
              style={{ height: '20px', lineHeight: '20px', padding: '0 12px' }}
            >
              {item.data}
            </div>
          );
        });
      }

      // 没有结果时，根据是否已获取过结果和运行状态显示相应提示
      let emptyMessage = '';
      if (!hasFetchedResult) {
        // 还没有调用过 getRunResult，显示开始输出
        emptyMessage = '开始输出...';
      } else {
        // 已经调用过 getRunResult 但结果为空
        if (runStatus === RunningStatus.SUCCESS) {
          emptyMessage = '运行成功，暂无结果输出';
        } else if (runStatus === RunningStatus.FAILED) {
          emptyMessage = '运行失败，请查看日志获取详细信息';
        } else {
          emptyMessage = '暂无运行结果';
        }
      }

      return (
        <div style={{ height: '20px', lineHeight: '20px' }}>{emptyMessage}</div>
      );
    }, [resultList, resultLines, hasFetchedResult, runStatus]);

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
      setIsExpanded(isPanelOpen || false);
    }, [isPanelOpen]);

    // 自动滚动到底部的函数
    const scrollToBottom = useCallback(() => {
      if (!shouldAutoScrollRef.current) return;

      // 使用虚拟列表的 logScrollTo 方法
      if (logScrollTo && logLines.length > 0) {
        requestAnimationFrame(() => {
          logScrollTo(logLines.length - 1);
        });
      } else {
        // 降级方案：直接操作 DOM
        const container = logContainerRef.current;
        if (container) {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
          });
        }
      }
    }, [scrollTo, logLines.length]);

    // 监听日志内容变化，自动滚动到底部
    useLayoutEffect(() => {
      scrollToBottom();
    }, [runLog, scrollToBottom]);

    // 监听运行状态变化，自动展开面板
    useEffect(() => {
      // 运行中时自动展开面板
      if (runStatus === RunningStatus.RUNNING) {
        setIsExpanded(true);
        onPanelStateChange?.(true);
        setActiveKey('log'); // 运行中时显示日志标签页
      }
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
                    <div
                      ref={resultContentRef}
                      className="run-result-content tab-content-wrapper"
                      style={{
                        height: '100%',
                        overflow: 'auto'
                      }}
                    >
                      <div ref={resultContainerRef}>
                        {resultVirtualListContent}
                      </div>
                    </div>
                  </TabPane>

                  <TabPane key="log" title="日志">
                    <div
                      ref={logContainerRef}
                      className="runlog-content tab-content-wrapper"
                      style={{
                        height: '100%',
                        overflow: 'auto'
                      }}
                      onScroll={(e) => {
                        // 检测用户是否手动滚动，如果是则停止自动滚动
                        const target = e.target as HTMLElement;
                        const isAtBottom =
                          target.scrollHeight -
                            target.scrollTop -
                            target.clientHeight <
                          10;
                        shouldAutoScrollRef.current = isAtBottom;
                      }}
                    >
                      <div ref={logContentRef}>{logVirtualListContent}</div>
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

{
  /* {(() => {
                        // 如果有日志内容，直接显示
                        if (runLog && runLog.trim() !== '') {
                          return runLog;
                        }

                        // 没有日志时，根据是否已获取过日志和运行状态显示相应提示
                        if (!hasFetchedResult) {
                          // 还没有调用过 getRunLog，显示开始输出
                          return '开始输出...';
                        } else {
                          // 已经调用过 getRunLog 但日志为空
                          if (runStatus === RunningStatus.SUCCESS) {
                            return '运行成功，暂无日志输出';
                          } else if (runStatus === RunningStatus.FAILED) {
                            return '运行失败，暂无错误日志';
                          } else {
                            return '暂无运行日志';
                          }
                        }
                      })()} */
}

export default RunningInfoPanel;

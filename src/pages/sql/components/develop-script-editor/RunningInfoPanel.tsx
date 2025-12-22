import RunFailedIcon from '@/assets/python/run-fail-icon.svg';
import RunSuccessIcon from '@/assets/python/run-success-icon.svg';
import { RunningStatus } from '@/types/sqlApi';
import {
  Button,
  Collapse,
  Message,
  Popover,
  Space
} from '@arco-design/web-react';
import {
  IconCopy,
  IconDown,
  IconLoading,
  IconUp
} from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import React, {
  memo,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  useMemo
} from 'react';
import { useVirtualList } from 'ahooks';
import { useEditorContext } from '../../contexts/DevelopScriptEditorContext';
// import { formatDateTime } from '../../utils';
import styles from './RunningInfoPanel.module.scss';
import { RunLogStatus } from '@/types/sqlDevelopApi';
import dayjs from 'dayjs';

const { Item: CollapseItem } = Collapse;

interface RunningInfoPanelProps {
  isPanelOpen?: boolean;
  onPanelStateChange?: (isOpen: boolean) => void;
  getPrevRunStatus?: () => RunningStatus;
}

const RunningInfoPanel: React.FC<RunningInfoPanelProps> = memo(
  ({ isPanelOpen, onPanelStateChange, getPrevRunStatus }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasUserClosed, setHasUserClosed] = useState(false);
    const logContentRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true); // 是否应该自动滚动
    const logContainerRef = useRef<HTMLDivElement>(null);

    // 从 EditorContext 获取所有需要的数据
    const {
      runLogStatus,
      runDuration,
      runStartTime,
      runLog,
      handleGetRunLog,
      // lastScriptRunStatus,
      hasFetchedLog
    } = useEditorContext();

    // 将日志按行分割
    const logLines = useMemo(() => {
      if (!runLog || runLog.trim() === '') return [];
      return runLog.split('\n');
    }, [runLog]);

    // 使用虚拟列表渲染日志
    const [logList, logScrollTo] = useVirtualList(logLines, {
      containerTarget: logContainerRef,
      wrapperTarget: logContentRef,
      itemHeight: 20, // 每行大约20px高度
      overscan: 5 // 额外渲染的行数，减少以提升性能
    });

    // 虚拟列表内容
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
      if (!hasFetchedLog) {
        // 还没有调用过 getRunLog，显示开始输出
        emptyMessage = '开始输出...';
      } else {
        // 已经调用过 getRunLog 但日志为空
        if (runLogStatus === RunLogStatus.SUCCESS) {
          emptyMessage = '运行成功，暂无日志输出';
        } else if (runLogStatus === RunLogStatus.FAILED) {
          emptyMessage = '运行失败，暂无错误日志';
        } else {
          emptyMessage = '暂无运行日志';
        }
      }

      return (
        <div style={{ height: '20px', lineHeight: '20px' }}>{emptyMessage}</div>
      );
    }, [logList, logLines, hasFetchedLog, runLogStatus]);

    // 监听父组件传递的面板状态变化
    useEffect(() => {
      if (isPanelOpen !== undefined) {
        setIsExpanded(isPanelOpen);
      }
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
    }, [logScrollTo, logLines.length]);

    // 监听日志内容变化，自动滚动到底部
    useLayoutEffect(() => {
      if (isExpanded) {
        scrollToBottom();
      }
    }, [runLog, isExpanded, scrollToBottom]);

    // 监听运行状态变化，自动展开面板
    useEffect(() => {
      if (runLogStatus !== RunLogStatus.CANCEL) {
        setIsExpanded(true);
        onPanelStateChange?.(true);
      }
    }, [runLogStatus, onPanelStateChange]);

    const handlePanelChange = (key: string, keys: string[]) => {
      const newExpanded = keys.length > 0;
      setIsExpanded(newExpanded);
      onPanelStateChange?.(newExpanded);

      // 如果用户手动关闭面板，记录这个状态
      if (!newExpanded) {
        setHasUserClosed(true);
      }
    };

    const renderRunStatus = (status?: RunLogStatus) => {
      if (status === RunLogStatus.RUNNING) {
        return (
          <div className={styles['run-status']}>
            <span className="mr-[4px] text-[14px]">运行中</span>
            <IconLoading style={{ color: '#007DFA' }} />
          </div>
        );
      }
      if (status === RunLogStatus.SUCCESS) {
        return (
          <Space>
            <div className={styles['run-status']}>
              <span className="mr-[4px] text-[14px]">运行成功</span>
              <RunSuccessIcon className="mr-[8px]" />
              <span className="text-[14px]">
                {dayjs(runStartTime).format('YYYY-MM-DD HH:mm:ss')}（
                {runDuration < 1000
                  ? `${runDuration}ms`
                  : `${(runDuration / 1000).toFixed(2)}s`}
                ）
              </span>
            </div>
          </Space>
        );
      }
      if (status === RunLogStatus.FAILED) {
        return (
          <div className={styles['run-status']}>
            <span className="mr-[4px] text-[14px]">运行失败</span>
            <RunFailedIcon className="mr-[8px]" />
            <span className="text-[14px]">
              {dayjs(runStartTime).format('YYYY-MM-DD HH:mm:ss')}（
              {runDuration < 1000
                ? `${runDuration}ms`
                : `${(runDuration / 1000).toFixed(2)}s`}
              ）
            </span>
          </div>
        );
      }
      return null;
    };

    // 复制内容到剪贴板
    const handleCopyContent = (content: string) => {};

    // 复制按钮组件
    // const CopyButton = ({ content }: { content: string }) => (
    //   <Button
    //     type="secondary"
    //     icon={<IconCopy />}
    //     onClick={() => handleCopyContent(content)}
    //     className={styles['sql-copy-button']}
    //   >
    //     复制
    //   </Button>
    // );

    return (
      <div className={styles['sql-running-info-panel']}>
        <Collapse
          activeKey={isExpanded ? ['1'] : []}
          onChange={handlePanelChange}
          triggerRegion="icon"
          expandIconPosition="left"
          expandIcon={
            isExpanded ? (
              <Popover content="收起" position="top">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconDown />
                </div>
              </Popover>
            ) : (
              <Popover content="展开" position="top">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconUp />
                </div>
              </Popover>
            )
          }
          style={{
            border: 'none'
          }}
        >
          <CollapseItem
            key="result"
            header={
              <div className={styles['panel-header']}>
                <div className="flex flex-1 items-center gap-[12px]">
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    运行信息
                  </span>
                  {renderRunStatus(runLogStatus)}
                </div>
              </div>
            }
            name="1"
          >
            <div className={styles['panel-content']}>
              <div
                ref={logContainerRef}
                className={styles['runlog-content']}
                style={{
                  height: '100%',
                  overflowX: 'scroll', // 始终显示横向滚动条，避免临界点抖动
                  overflowY: 'auto'
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
              {/* 复制按钮放在滚动容器外部 */}
              {/* {runLog && runLog.trim() !== '' && (
                <CopyButton content={runLog} />
              )} */}
            </div>
          </CollapseItem>
        </Collapse>
      </div>
    );
  }
);

RunningInfoPanel.displayName = 'RunningInfoPanel';

export default RunningInfoPanel;

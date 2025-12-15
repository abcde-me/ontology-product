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
import React, { memo, useEffect, useState, useRef } from 'react';
import { useEditorContext } from '../../contexts/DevelopScriptEditorContext';
import { formatDateTime } from '../../utils';
import styles from './RunningInfoPanel.module.scss';
import { RunLogStatus } from '@/types/sqlDevelopApi';

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

    // 从 EditorContext 获取所有需要的数据
    const {
      runLogStatus,
      runDuration,
      runStartTime,
      runLog,
      handleGetRunLog,
      lastScriptRunStatus,
      hasFetchedLog
    } = useEditorContext();

    // 监听父组件传递的面板状态变化
    useEffect(() => {
      if (isPanelOpen !== undefined) {
        setIsExpanded(isPanelOpen);
      }
    }, [isPanelOpen]);

    // 监听运行状态变化，当开始新运行时重置用户关闭状态
    // useEffect(() => {
    //   if (runLogStatus === RunLogStatus.RUNNING) {
    //     setHasUserClosed(false);
    //   }
    // }, [runStatus]);

    // 监听日志内容变化，自动滚动到底部
    useEffect(() => {
      if (runLog && isExpanded && logContentRef.current) {
        // 使用 ref 直接获取滚动容器，确保 DOM 更新后再滚动
        requestAnimationFrame(() => {
          if (logContentRef.current) {
            logContentRef.current.scrollTop =
              logContentRef.current.scrollHeight;
          }
        });
      }
    }, [runLog, isExpanded]);

    // 监听运行状态变化，自动展开面板
    useEffect(() => {
      if (runLogStatus !== RunLogStatus.CANCEL) {
        setIsExpanded(true);
        onPanelStateChange?.(true);
        // 运行中时自动获取日志
        // if (handleGetRunLog) {
        //   handleGetRunLog();
        // }
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
      // if (
      //   status === RunLogStatus.RUNNING &&
      //   (lastScriptRunStatus === RunningStatus.SUCCESS ||
      //     lastScriptRunStatus === RunningStatus.FAILED)
      // ) {
      //   return (
      //     <div className={styles['run-status']}>
      //       <span className="mr-4 text-[14px]">结果加载中</span>
      //       <IconLoading style={{ color: '#007DFA' }} />
      //     </div>
      //   );
      // }
      if (status === RunLogStatus.RUNNING) {
        return (
          <div className={styles['run-status']}>
            <span className="mr-4 text-[14px]">运行中</span>
            <IconLoading style={{ color: '#007DFA' }} />
          </div>
        );
      }
      if (status === RunLogStatus.SUCCESS) {
        return (
          <Space>
            <div className={styles['run-status']}>
              <span className="mr-4 text-[14px]">运行成功</span>
              <RunSuccessIcon className="mr-[8px]" />
              <span className="text-[14px]">
                {formatDateTime(runStartTime ?? '')}（
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
            <span className="mr-4 text-[14px]">运行失败</span>
            {/* {status !== RunningStatus.IDLE ? ( */}
            <>
              <RunFailedIcon className="mr-[8px]" />
              <span className="text-[14px]">
                {formatDateTime(runStartTime ?? '')}（
                {runDuration < 1000
                  ? `${runDuration}ms`
                  : `${(runDuration / 1000).toFixed(2)}s`}
                ）
              </span>
            </>
            {/* ) : null} */}
          </div>
        );
      }
      return null;
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
              <div ref={logContentRef} className={styles['runlog-content']}>
                {(() => {
                  // 如果有日志内容，直接显示
                  if (runLog && runLog.trim() !== '') {
                    return runLog;
                  }

                  // 没有日志时，根据是否已获取过日志和运行状态显示相应提示
                  if (!hasFetchedLog) {
                    // 还没有调用过 getRunLog，显示开始输出
                    return '开始输出...';
                  } else {
                    // 已经调用过 getRunLog 但日志为空
                    if (runLogStatus === RunLogStatus.SUCCESS) {
                      return '运行成功，暂无日志输出';
                    } else if (runLogStatus === RunLogStatus.FAILED) {
                      return '运行失败，暂无错误日志';
                    } else {
                      return '暂无运行日志';
                    }
                  }
                })()}
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

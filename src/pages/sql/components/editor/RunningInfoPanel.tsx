import RunFailedIcon from '@/assets/python/run-fail-icon.svg';
import RunSuccessIcon from '@/assets/python/run-success-icon.svg';
import SaveToDasetIcon from '@/assets/sql/save-to-daset.svg';
import { RunningStatus } from '@/types/sqlApi';
import {
  Button,
  Collapse,
  Dropdown,
  Empty,
  Input,
  Menu,
  Message,
  Popover,
  Space,
  Table,
  Tabs,
  Typography
} from '@arco-design/web-react';
import {
  IconCopy,
  IconDown,
  IconLoading,
  IconUp
} from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import React, { memo, useEffect, useState } from 'react';
import { useEditorContext } from '../../contexts/EditorContext';
import { addSortToColumns, formatDateTime } from '../../utils';
import { ModalDatasetForm, ModalDatasetFormVersion } from '../ModalDatasetForm';
import './RunningInfoPanel.scss';

const { Item: CollapseItem } = Collapse;
const { TabPane } = Tabs;
const { Text } = Typography;

interface RunningInfoPanelProps {
  isPanelOpen?: boolean;
  onPanelStateChange?: (isOpen: boolean) => void;
  getPrevRunStatus?: () => RunningStatus;
}

const RunningInfoPanel: React.FC<RunningInfoPanelProps> = memo(
  ({ isPanelOpen, onPanelStateChange, getPrevRunStatus }) => {
    const [activeKey, setActiveKey] = useState<string>('result');
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasUserClosed, setHasUserClosed] = useState(false);

    const [formVisible, setFormVisible] = useState(false); // 保存为新数据集
    const [versionFormVisible, setVersionFormVisible] = useState(false); // 保存为新版本
    const [formOrigin, setFormOrigin] = useState({});

    // 从 EditorContext 获取所有需要的数据
    const {
      columns,
      data,
      runStatus,
      runDuration,
      runStartTime,
      runError,
      runLog,
      size,
      setSize,
      currentFileId,
      currentScriptId,
      execid,
      cancelGetRunResultPolling,
      getRunResultPolling,
      resultLoading,
      loadRunResult,
      handleGetRunLog,
      lastScriptRunStatus
    } = useEditorContext();

    const sortableColumns = addSortToColumns(columns);

    // 监听父组件传递的面板状态变化
    useEffect(() => {
      if (isPanelOpen !== undefined) {
        setIsExpanded(isPanelOpen);
      }
    }, [isPanelOpen]);

    // 监听运行状态变化，当开始新运行时重置用户关闭状态
    useEffect(() => {
      if (runStatus === RunningStatus.RUNNING) {
        setHasUserClosed(false);
      }
    }, [runStatus]);

    // 监听运行状态变化，自动展开面板
    useEffect(() => {
      // 运行完成时自动展开面板
      if (
        runStatus === RunningStatus.SUCCESS ||
        runStatus === RunningStatus.FAILED
      ) {
        // 检查前一个状态，避免在状态重置时误触发
        const prevStatus = getPrevRunStatus?.() || RunningStatus.IDLE;

        // 只有当状态真正从运行中变为完成状态时才执行自动行为
        // 避免在标签页切换时状态重置导致的误触发
        if (prevStatus === RunningStatus.RUNNING && !hasUserClosed) {
          setIsExpanded(true);
          onPanelStateChange?.(true);

          // 根据运行结果自动定位到对应标签页
          if (runStatus === RunningStatus.SUCCESS) {
            setActiveKey('result');
          } else if (runStatus === RunningStatus.FAILED) {
            setActiveKey('log');
            handleGetRunLog?.();
          }
        }
      }
    }, [
      runStatus,
      onPanelStateChange,
      getPrevRunStatus,
      hasUserClosed,
      handleGetRunLog
    ]);

    const handleShowForm = () => {
      setFormVisible(true);
    };

    const handleHideForm = () => {
      setFormVisible(false);
    };

    const handleShowVersionForm = () => {
      setVersionFormVisible(true);
    };

    const handleHideVersionForm = () => {
      setVersionFormVisible(false);
    };

    const handlePanelChange = (key: string, keys: string[]) => {
      const newExpanded = keys.length > 0;
      setIsExpanded(newExpanded);
      onPanelStateChange?.(newExpanded);

      // 如果用户手动关闭面板，记录这个状态
      if (!newExpanded) {
        setHasUserClosed(true);
      }
    };

    // 处理菜单点击事件
    const handleMenuClick = (key: string) => {
      setFormOrigin({
        columns: columns,
        script_id: currentScriptId,
        script_file_id: currentFileId,
        execid: execid
      });

      if (key === '1') {
        handleShowForm();
      } else if (key === '2') {
        handleShowVersionForm();
      }
    };

    const handleClickTab = (key: string) => {
      setActiveKey(key);
      if (key === 'log' && handleGetRunLog) {
        handleGetRunLog();
      } else if (key === 'result' && loadRunResult) {
        loadRunResult(execid, size);
      }
    };

    const renderRunStatus = (status?: RunningStatus) => {
      if (
        status === RunningStatus.RUNNING &&
        (lastScriptRunStatus === RunningStatus.SUCCESS ||
          lastScriptRunStatus === RunningStatus.FAILED)
      ) {
        return (
          <div className="run-status">
            <span className="mr-4 text-[14px]">结果加载中</span>
            <IconLoading style={{ color: '#007DFA' }} />
          </div>
        );
      }
      if (status === RunningStatus.RUNNING) {
        return (
          <div className="run-status">
            <span className="mr-4 text-[14px]">运行中</span>
            <IconLoading style={{ color: '#007DFA' }} />
          </div>
        );
      }
      if (status === RunningStatus.SUCCESS) {
        return (
          <Space>
            <div className="run-status">
              <span className="mr-4 text-[14px]">运行成功</span>
              <RunSuccessIcon className="mr-[8px]" />
              <span className="text-[14px]">
                {formatDateTime(runStartTime || '')}（
                {runDuration < 1000
                  ? `${runDuration}ms`
                  : `${(runDuration / 1000).toFixed(2)}s`}
                ）
              </span>
            </div>
          </Space>
        );
      }
      if (status === RunningStatus.FAILED) {
        return (
          <div className="run-status">
            <span className="mr-4 text-[14px]">运行失败</span>
            <RunFailedIcon className="mr-[8px]" />
            <span className="text-[14px]">
              {formatDateTime(runStartTime || '')}（
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
        type="secondary"
        icon={<IconCopy />}
        onClick={() => handleCopyContent(content)}
        className="sql-copy-button"
      >
        复制
      </Button>
    );

    return (
      <div className="sql-running-info-panel">
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
              <div className="panel-header">
                <div className="flex flex-1 items-center gap-[12px]">
                  <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                    运行信息
                  </Text>
                  {renderRunStatus(runStatus)}
                </div>
                {runStatus !== RunningStatus.RUNNING && (
                  <div className="flex items-center gap-[12px]">
                    <Space>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#0F172A',
                          fontWeight: 400
                        }}
                      >
                        展示
                      </span>
                      <Input
                        style={{ width: 52, height: 22 }}
                        size="mini"
                        value={String(size)}
                        maxLength={1000}
                        disabled={runStatus !== RunningStatus.SUCCESS}
                        onChange={(value) => setSize(value)}
                        onPressEnter={(event) => {
                          event.stopPropagation();
                          // 按回车键时触发轮询获取新结果
                          if (execid) {
                            // 避异步没更新结束获取不到正确size
                            setTimeout(() => {
                              loadRunResult(execid, size);
                            }, 50);
                          }
                        }}
                        onBlur={() => {
                          // 失去焦点时也触发查询
                          if (execid) {
                            // 避异步没更新结束获取不到正确size
                            setTimeout(() => {
                              loadRunResult(execid, size);
                            }, 50);
                          }
                        }}
                      />
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#0F172A',
                          fontWeight: 400
                        }}
                      >
                        行数据
                      </span>
                    </Space>
                    <Dropdown
                      position="br"
                      disabled={runStatus !== RunningStatus.SUCCESS}
                      droplist={
                        <Menu onClickMenuItem={handleMenuClick}>
                          <Menu.Item key="1" style={{ height: 'auto' }}>
                            <div style={{ padding: '7px 12px' }}>
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  lineHeight: '22px',
                                  color: '#0F172A',
                                  marginBottom: '4px'
                                }}
                              >
                                保存为新数据集
                              </div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  lineHeight: '18px',
                                  color: '#334155'
                                }}
                              >
                                适用于字段变更或使用场景差异较大等场景
                              </div>
                            </div>
                          </Menu.Item>
                          <Menu.Item key="2" style={{ height: 'auto' }}>
                            <div style={{ padding: '7px 12px' }}>
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  lineHeight: '22px',
                                  color: '#0F172A',
                                  marginBottom: '4px'
                                }}
                              >
                                保存为新版本
                              </div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  lineHeight: '18px',
                                  color: '#334155'
                                }}
                              >
                                已存在数据集且字段不变
                              </div>
                            </div>
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button
                        type="outline"
                        size="mini"
                        icon={<SaveToDasetIcon />}
                        style={{
                          fontSize: '14px',
                          color: '#1E293B',
                          fontWeight: 600
                        }}
                        disabled={runStatus !== RunningStatus.SUCCESS}
                      >
                        保存到数据集
                      </Button>
                    </Dropdown>
                  </div>
                )}
              </div>
            }
            name="1"
          >
            <div className="panel-content">
              <Tabs
                activeTab={activeKey}
                onClickTab={handleClickTab}
                style={{
                  backgroundColor: '#F8FAFD'
                }}
              >
                <TabPane key="result" title="结果">
                  <div className="run-result-content">
                    {runStatus === RunningStatus.RUNNING && (
                      <Empty description="正在运行中，请等待..." />
                    )}

                    {runStatus === RunningStatus.FAILED && (
                      <div className="h-[100px]">
                        <Typography.Text>
                          {runError || '运行失败！'}
                        </Typography.Text>
                      </div>
                    )}
                    {runStatus === RunningStatus.SUCCESS && (
                      <div className="run-result-table">
                        {columns.length > 0 && data.length > 0 ? (
                          <Table
                            border={false}
                            columns={sortableColumns}
                            data={data}
                            pagination={false}
                            scroll={{ y: 240, x: true }}
                            loading={resultLoading}
                          />
                        ) : (
                          <Empty description="暂无数据" />
                        )}
                      </div>
                    )}
                  </div>
                </TabPane>
                <TabPane key="log" title="日志">
                  <div className="runlog-content">{runLog}</div>
                </TabPane>
              </Tabs>
              {/* 复制按钮放在滚动容器外部 */}
              {activeKey === 'log' && runLog && runLog.trim() !== '' && (
                <CopyButton content={runLog} />
              )}
            </div>
          </CollapseItem>
        </Collapse>

        {/* 模态框组件 */}
        <ModalDatasetForm
          formOrigin={formOrigin}
          visible={formVisible}
          onCancel={handleHideForm}
        />
        <ModalDatasetFormVersion
          formOrigin={formOrigin}
          visible={versionFormVisible}
          onCancel={handleHideVersionForm}
        />
      </div>
    );
  }
);

RunningInfoPanel.displayName = 'RunningInfoPanel';

export default RunningInfoPanel;

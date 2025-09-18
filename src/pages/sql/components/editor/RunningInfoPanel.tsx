import React, { useState, useEffect, memo } from 'react';
import {
  Button,
  Collapse,
  Dropdown,
  Empty,
  Input,
  Menu,
  Space,
  Table,
  Tabs,
  Typography
} from '@arco-design/web-react';
import { useEditorContext } from '../../contexts/EditorContext';
import {
  IconDown,
  IconUp,
  IconLoading,
  IconCheckCircle,
  IconCloseCircle
} from '@arco-design/web-react/icon';
import RunSuccessIcon from '@/assets/python/run-success-icon.svg';
import RunFailedIcon from '@/assets/python/run-fail-icon.svg';
import { RunningStatus } from '@/types/sqlApi';
import { ModalDatasetForm, ModalDatasetFormVersion } from '../ModalDatasetForm';

import './RunningInfoPanel.scss';
import { addSortToColumns, formatDateTime } from '../../utils';

const { Item: CollapseItem } = Collapse;
const { TabPane } = Tabs;
const { Text } = Typography;

const RunningInfoPanel: React.FC = memo(() => {
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
    handleGetRunLog
  } = useEditorContext();

  const sortableColumns = addSortToColumns(columns);

  // 监听运行状态变化，当开始新运行时重置用户关闭状态
  useEffect(() => {
    if (runStatus === RunningStatus.RUNNING) {
      setHasUserClosed(false);
    }
  }, [runStatus]);

  // 监听运行状态变化，当运行成功或失败时自动弹开面板
  useEffect(() => {
    if (
      runStatus === RunningStatus.SUCCESS ||
      runStatus === RunningStatus.FAILED
    ) {
      setIsExpanded(true);
    }
  }, [runStatus]);

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
    if (status === RunningStatus.RUNNING) {
      return (
        <div className="run-status">
          <span className="mr-4">运行中</span>
          <IconLoading style={{ color: '#007DFA' }} />
        </div>
      );
    }
    if (status === RunningStatus.SUCCESS) {
      return (
        <Space>
          <div className="run-status">
            <span className="mr-4">运行成功</span>
            <RunSuccessIcon className="mr-[8px]" />
            <span>
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
          <span className="mr-4">运行失败</span>
          <RunFailedIcon className="mr-[8px]" />
          <span>
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

  return (
    <div className="sql-running-info-panel">
      <Collapse
        activeKey={isExpanded ? ['1'] : []}
        onChange={handlePanelChange}
        triggerRegion="icon"
        expandIconPosition="left"
        expandIcon={isExpanded ? <IconDown /> : <IconUp />}
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
              <div className="flex items-center gap-[12px]">
                <Space>
                  <span>展示</span>
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
                  <span>行数据</span>
                </Space>
                <Dropdown
                  position="br"
                  disabled={runStatus !== RunningStatus.SUCCESS}
                  droplist={
                    <Menu onClickMenuItem={handleMenuClick}>
                      <Menu.Item key="1">保存为新数据集</Menu.Item>
                      <Menu.Item key="2">保存为新版本</Menu.Item>
                    </Menu>
                  }
                >
                  <Button
                    type="outline"
                    size="mini"
                    disabled={runStatus !== RunningStatus.SUCCESS}
                  >
                    保存到数据集
                  </Button>
                </Dropdown>
              </div>
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
                      <Typography.Text>{runError}</Typography.Text>
                    </div>
                  )}
                  {runStatus === RunningStatus.SUCCESS && (
                    <div className="run-result-table">
                      {columns.length > 0 && data.length > 0 ? (
                        <Table
                          border
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
});

RunningInfoPanel.displayName = 'RunningInfoPanel';

export default RunningInfoPanel;

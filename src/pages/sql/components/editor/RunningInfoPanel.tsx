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
import { RunningStatus } from '@/types/sqlApi';
import { RunResult } from '@/types/sqlApi';
import { ModalDatasetForm, ModalDatasetFormVersion } from '../ModalDatasetForm';
import { useSqlIndexStore } from '../../store';

import './RunningInfoPanel.scss';
import { formatDateTime } from '../../utils';

const { Item: CollapseItem } = Collapse;
const { TabPane } = Tabs;
const { Text } = Typography;

const RunningInfoPanel: React.FC = memo(() => {
  const [activeKey, setActiveKey] = useState<string>('result');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUserClosed, setHasUserClosed] = useState(false);

  // 从 EditorContext 获取所有需要的数据
  const {
    columns,
    data,
    runResult,
    runLog,
    runStatus,
    runDuration,
    runStartTime,
    size,
    setSize,
    currentFileId
  } = useEditorContext();

  // 获取store中的方法
  const showDatasetForm = useSqlIndexStore((state) => state.showDatasetForm);
  const showDatasetVersionForm = useSqlIndexStore(
    (state) => state.showDatasetVersionForm
  );
  const setCurrentRunResult = useSqlIndexStore(
    (state) => state.setCurrentRunResult
  );

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

  // 处理菜单点击事件
  const handleMenuClick = (key: string) => {
    setCurrentRunResult &&
      setCurrentRunResult({ columns: columns, script_id: currentFileId });

    if (key === '1') {
      showDatasetForm?.();
    } else if (key === '2') {
      showDatasetVersionForm?.();
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
        <Space>
          <div className="run-status success">
            <span className="mr-4">运行成功</span>
            <IconCheckCircle style={{ color: '#10B981' }} />
          </div>
          <div className="run-status">
            <span className="mr-4">
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
                    onChange={(value) => setSize(value)}
                  />
                  <span>行数据</span>
                </Space>
                <Dropdown
                  position="br"
                  droplist={
                    <Menu onClickMenuItem={handleMenuClick}>
                      <Menu.Item key="1">保存为新数据集</Menu.Item>
                      <Menu.Item key="2">保存为新版本</Menu.Item>
                    </Menu>
                  }
                >
                  <Button type="outline" size="mini">
                    保存到数据集
                  </Button>
                </Dropdown>
              </div>
            </div>
          }
          name="1"
        >
          <div className="panel-content">
            {runStatus === RunningStatus.RUNNING && (
              <Empty description="正在运行中，请等待..." />
            )}

            {runStatus === RunningStatus.FAILED && (
              <div className="h-[100px]">
                <Typography.Text>
                  有无法执行的语法，请修改后重试
                </Typography.Text>
              </div>
            )}

            {runStatus === RunningStatus.SUCCESS && (
              <div className="flex flex-col gap-[8px]">
                {runLog && <Typography.Text>{runLog}</Typography.Text>}
                {columns.length > 0 && data.length > 0 ? (
                  <Table
                    border
                    columns={columns}
                    data={data}
                    pagination={false}
                  />
                ) : (
                  <Empty description="暂无数据" />
                )}
              </div>
            )}
          </div>
        </CollapseItem>
      </Collapse>

      {/* 模态框组件 */}
      <ModalDatasetForm />
      <ModalDatasetFormVersion />
    </div>
  );
});

RunningInfoPanel.displayName = 'RunningInfoPanel';

export default RunningInfoPanel;

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
import {
  IconDown,
  IconUp,
  IconLoading,
  IconCheckCircle,
  IconCloseCircle
} from '@arco-design/web-react/icon';
import { RunningStatus } from '@/types/pythonApi';
import { RunResult } from '@/types/sqlApi';

import './RunningInfoPanel.scss';

const { Item: CollapseItem } = Collapse;
const { TabPane } = Tabs;
const { Text } = Typography;

const data = Array(5)
  .fill('')
  .map((_, index) => ({
    key: `${index}`,
    name: `Kevin ${index}`,
    salary: 22000,
    address: `${index} Park Road, London`,
    email: `kevin.sandra_${index}@example.com`,
    email2: `kevin.sandra_${index}@example.com`,
    email3: `kevin.sandra_${index}@example.com`,
    email4: `kevin.sandra_${index}@example.com`,
    email5: `kevin.sandra_${index}@example.com`,
    email6: `kevin.sandra_${index}@example.com`
  }));

interface RunningInfoPanelProps {
  runResult: RunResult[];
  runLog: string;
  runStatus?: RunningStatus; // 使用正确的类型
  runDuration: number;
  runStartTime: Date | null;
  size: string | number;
  setSize: (value: string | number) => void;
}

const RunningInfoPanel: React.FC<RunningInfoPanelProps> = memo(
  ({
    runResult,
    runLog,
    runStatus,
    size,
    setSize,
    runDuration,
    runStartTime
  }) => {
    const [activeKey, setActiveKey] = useState<string>('result');
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasUserClosed, setHasUserClosed] = useState(false);

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        width: 150,
        ellipsis: true
      },
      {
        title: 'Salary',
        dataIndex: 'salary',
        width: 150,
        ellipsis: true
      },
      {
        title: 'Address',
        dataIndex: 'address',
        width: 150,
        ellipsis: true
      },
      {
        title: 'Email',
        dataIndex: 'email',
        width: 150,
        ellipsis: true
      },
      {
        title: 'Email',
        dataIndex: 'email2',
        width: 150,
        ellipsis: true
      },
      {
        title: 'Email',
        dataIndex: 'email3',
        width: 150,
        ellipsis: true
      },
      {
        title: 'Email',
        dataIndex: 'email4',
        width: 150,
        ellipsis: true
      },
      {
        title: 'Email',
        dataIndex: 'email5',
        width: 150,
        ellipsis: true
      },
      {
        title: 'WeiTing',
        dataIndex: 'email6',
        width: 150,
        ellipsis: true
      }
    ];

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
          <Space>
            <div className="run-status success">
              <span className="mr-4">运行成功</span>
              <IconCheckCircle style={{ color: '#10B981' }} />
            </div>
            <div className="run-status">
              <span className="mr-4">
                {runStartTime} ({runDuration}s)
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
                      <Menu>
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
                  <Typography.Text>
                    检测到有多个Select语句，当前展示的是第一个Select语句的运行结果
                  </Typography.Text>
                  <Table
                    border
                    columns={columns}
                    data={data}
                    pagination={false}
                  />
                </div>
              )}
            </div>
          </CollapseItem>
        </Collapse>
      </div>
    );
  }
);

RunningInfoPanel.displayName = 'RunningInfoPanel';

export default RunningInfoPanel;

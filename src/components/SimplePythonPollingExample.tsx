import React, { useState } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Spin } from 'antd';
import { usePythonRunResultPolling } from '../hooks/usePythonRunResultPolling';

const { Title, Text } = Typography;
const { Search } = Input;

const SimplePythonPollingExample: React.FC = () => {
  const [execId, setExecId] = useState<string>('');
  const [currentExecId, setCurrentExecId] = useState<string>('');

  // 使用自定义 Hook
  const { data, loading, error, isPolling, startPolling, stopPolling, reset } =
    usePythonRunResultPolling({
      execId: currentExecId,
      enabled: false, // 手动控制
      onResultChange: (result) => {
        console.log('轮询结果更新:', result);
      },
      onComplete: (result) => {
        console.log('运行完成:', result);
      },
      onError: (error) => {
        console.error('轮询错误:', error);
      }
    });

  // 开始轮询
  const handleStartPolling = () => {
    if (execId.trim()) {
      setCurrentExecId(execId.trim());
      reset(); // 重置状态
      startPolling();
    }
  };

  // 停止轮询
  const handleStopPolling = () => {
    stopPolling();
  };

  // 获取状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case -1:
        return '未运行';
      case 0:
        return '运行失败';
      case 1:
        return '运行成功';
      case 2:
        return '运行中';
      default:
        return '未知状态';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>使用 Hook 的 Python 轮询示例</Title>

      <Card title="轮询控制" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>输入执行ID开始轮询：</Text>
          <Space>
            <Search
              placeholder="请输入执行ID"
              value={execId}
              onChange={(e) => setExecId(e.target.value)}
              onSearch={handleStartPolling}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              onClick={handleStartPolling}
              disabled={!execId.trim() || isPolling}
            >
              开始轮询
            </Button>
            <Button onClick={handleStopPolling} disabled={!isPolling}>
              停止轮询
            </Button>
          </Space>
        </Space>
      </Card>

      {isPolling && (
        <Alert
          message="正在轮询中..."
          description={`每 3 秒请求一次 getRunResult 接口，执行ID: ${currentExecId}`}
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {loading && !data && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '10px' }}>正在获取运行结果...</div>
          </div>
        </Card>
      )}

      {error && (
        <Alert
          message="请求失败"
          description={error.message || '获取运行结果时发生错误'}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {data && (
        <Card title="运行结果" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>运行状态: </Text>
              <Text
                type={
                  data.run_status === 1
                    ? 'success'
                    : data.run_status === 0
                      ? 'error'
                      : 'processing'
                }
              >
                {getStatusText(data.run_status)}
              </Text>
            </div>

            {data.run_result && (
              <div>
                <Text strong>运行结果: </Text>
                <Text>{data.run_result}</Text>
              </div>
            )}

            {data.run_duration && (
              <div>
                <Text strong>运行耗时: </Text>
                <Text>{data.run_duration} 秒</Text>
              </div>
            )}

            {data.run_end_time && (
              <div>
                <Text strong>运行结束时间: </Text>
                <Text>{data.run_end_time}</Text>
              </div>
            )}
          </Space>
        </Card>
      )}

      <Card title="Hook 特性" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>✅ 使用 ahooks 的 useRequest 进行轮询</Text>
          <Text>✅ 轮询间隔：3 秒</Text>
          <Text>✅ 自动停止：运行完成时自动停止轮询</Text>
          <Text>✅ 错误处理：轮询失败时的错误处理</Text>
          <Text>✅ 状态管理：完整的加载、错误、轮询状态</Text>
          <Text>✅ 手动控制：可以手动开始/停止轮询</Text>
        </Space>
      </Card>
    </div>
  );
};

export default SimplePythonPollingExample;

/**
 * useXChat Demo 示例
 */

import React, { useState } from 'react';
import { Button, Input, Space, Card, Tag, Spin } from '@arco-design/web-react';
import { useXChat } from '@/hooks/chat';

export default function UseXChatDemo() {
  const [inputText, setInputText] = useState('');

  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    stopGeneration,
    clearMessages,
    deleteMessage,
    regenerateMessage
  } = useXChat({
    appId: 'demo-app-id',
    projectId: 'demo-project-id',
    onConversationCreated: (id) => {
      console.log('✅ 新会话创建:', id);
    },
    onError: (error) => {
      console.error('❌ 对话错误:', error);
    }
  });

  const handleSend = async () => {
    if (!inputText.trim()) return;

    await sendMessage({
      text: inputText,
      enableDeepThink: false
    });

    setInputText('');
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      local: 'gray',
      loading: 'blue',
      streaming: 'cyan',
      success: 'green',
      error: 'red',
      abort: 'orange'
    };
    return colorMap[status] || 'default';
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>useXChat Demo</h1>

      {/* 控制按钮 */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={handleSend}
          disabled={isLoading || isStreaming || !inputText.trim()}
          loading={isLoading}
        >
          发送消息
        </Button>
        <Button onClick={stopGeneration} disabled={!isStreaming}>
          停止生成
        </Button>
        <Button onClick={clearMessages} disabled={messages.length === 0}>
          清空消息
        </Button>
      </Space>

      {/* 状态指示 */}
      <div style={{ marginBottom: 16 }}>
        {isLoading && <Tag color="blue">加载中...</Tag>}
        {isStreaming && <Tag color="cyan">流式输出中...</Tag>}
        <Tag>消息数: {messages.length}</Tag>
      </div>

      {/* 输入框 */}
      <Input.TextArea
        placeholder="输入消息..."
        value={inputText}
        onChange={setInputText}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        style={{ marginBottom: 16 }}
        autoSize={{ minRows: 3, maxRows: 6 }}
      />

      {/* 消息列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => (
          <Card
            key={msg.id}
            title={
              <Space>
                <span>{msg.type === 'user' ? '👤 用户' : '�� AI'}</span>
                <Tag color={getStatusColor(msg.status)}>{msg.status}</Tag>
              </Space>
            }
            extra={
              <Space>
                {msg.type === 'assistant' && msg.status === 'success' && (
                  <Button
                    size="small"
                    onClick={() => regenerateMessage(msg.id)}
                  >
                    重新生成
                  </Button>
                )}
                <Button
                  size="small"
                  status="danger"
                  onClick={() => deleteMessage(msg.id)}
                >
                  删除
                </Button>
              </Space>
            }
            style={{
              backgroundColor: msg.type === 'user' ? '#f0f9ff' : '#f9fafb'
            }}
          >
            {msg.status === 'streaming' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spin size={16} />
                <span>{msg.content}</span>
              </div>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            )}

            {msg.files && msg.files.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Tag>📎 {msg.files.length} 个文件</Tag>
              </div>
            )}
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            color: '#999',
            border: '2px dashed #e5e7eb',
            borderRadius: 8
          }}
        >
          暂无消息，开始对话吧 👋
        </div>
      )}
    </div>
  );
}

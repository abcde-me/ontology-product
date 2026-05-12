# useXChat

核心消息管理 Hook，处理 AI 对话的 SSE 流式响应。

## 功能特性

- ✅ SSE 流式对话处理
- ✅ 消息队列管理
- ✅ 会话 ID 自动管理
- ✅ 停止/清空/删除/重新生成消息
- ✅ 错误处理
- ✅ 集成项目认证（cookie/session）

## API

### 参数 (UseChatConfig)

```typescript
interface UseChatConfig {
  appId: string | number; // 应用 ID（必填）
  conversationId?: string; // 会话 ID（可选）
  projectId?: string | number; // 项目 ID（可选）
  onConversationCreated?: (conversationId: string) => void; // 会话创建回调
  onError?: (error: Error) => void; // 错误回调
}
```

### 返回值 (UseChatReturn)

```typescript
interface UseChatReturn {
  messages: ChatMessage[]; // 消息列表
  isLoading: boolean; // 是否加载中
  isStreaming: boolean; // 是否流式输出中
  sendMessage: (params: SendMessageParams) => Promise<void>; // 发送消息
  stopGeneration: () => void; // 停止生成
  clearMessages: () => void; // 清空消息
  deleteMessage: (messageId: string) => void; // 删除消息
  regenerateMessage: (messageId: string) => Promise<void>; // 重新生成
}
```

## 基础用法

```typescript
import { useXChat } from '@/hooks/chat';

function ChatComponent() {
  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    stopGeneration,
    clearMessages
  } = useXChat({
    appId: 'your-app-id',
    onConversationCreated: (id) => {
      console.log('新会话创建:', id);
    },
    onError: (error) => {
      console.error('对话错误:', error);
    },
  });

  const handleSend = async () => {
    await sendMessage({
      text: '你好，AI助手',
      enableDeepThink: false,
    });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={handleSend} disabled={isLoading || isStreaming}>
        发送
      </button>
      <button onClick={stopGeneration}>停止</button>
      <button onClick={clearMessages}>清空</button>
    </div>
  );
}
```

## 高级用法

### 带文件上传

```typescript
const handleSendWithFiles = async () => {
  await sendMessage({
    text: '请分析这个文件',
    files: [{ id: '1', name: 'doc.pdf', size: 1024, type: 'application/pdf' }],
    enableDeepThink: true
  });
};
```

### 重新生成消息

```typescript
const handleRegenerate = async (messageId: string) => {
  await regenerateMessage(messageId);
};
```

### 删除消息

```typescript
const handleDelete = (messageId: string) => {
  deleteMessage(messageId);
};
```

## 注意事项

1. **会话管理**: `conversationId` 会在首次对话后自动生成并保存
2. **错误处理**: 建议提供 `onError` 回调处理错误
3. **停止生成**: 调用 `stopGeneration()` 会中止当前流式输出
4. **消息状态**: 消息有多种状态 - `local`, `loading`, `streaming`, `success`, `error`, `abort`

## 类型定义

详见 `../types.ts`

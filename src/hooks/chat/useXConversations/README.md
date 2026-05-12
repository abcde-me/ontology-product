# useXConversations

会话管理 Hook，用于管理多个对话会话。

## 功能特性

- ✅ 创建/删除/更新会话
- ✅ 会话切换
- ✅ 活跃会话管理
- ✅ 会话元数据管理

## API

### 参数 (UseConversationsConfig)

```typescript
interface UseConversationsConfig {
  defaultConversations?: Conversation[]; // 默认会话列表
  defaultActiveConversationId?: string; // 默认活跃会话 ID
}
```

### 返回值 (UseConversationsReturn)

```typescript
interface UseConversationsReturn {
  conversations: Conversation[]; // 会话列表
  activeConversationId?: string; // 当前活跃会话 ID
  setActiveConversation: (id: string) => void; // 设置活跃会话
  createConversation: (title?: string) => Conversation; // 创建会话
  deleteConversation: (id: string) => void; // 删除会话
  updateConversation: (id: string, updates: Partial<Conversation>) => void; // 更新会话
  getConversation: (id: string) => Conversation | undefined; // 获取会话
}
```

### 会话类型 (Conversation)

```typescript
interface Conversation {
  id: string; // 会话 ID
  title: string; // 会话标题
  createdAt: number; // 创建时间戳
  updatedAt: number; // 更新时间戳
  messageCount: number; // 消息数量
  lastMessage?: string; // 最后一条消息
}
```

## 基础用法

```typescript
import { useXConversations } from '@/hooks/chat';

function ConversationManager() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    updateConversation,
  } = useXConversations();

  const handleCreate = () => {
    const newConv = createConversation('新对话');
    console.log('创建会话:', newConv);
  };

  const handleSwitch = (id: string) => {
    setActiveConversation(id);
  };

  const handleDelete = (id: string) => {
    deleteConversation(id);
  };

  return (
    <div>
      <button onClick={handleCreate}>新建会话</button>
      {conversations.map(conv => (
        <div
          key={conv.id}
          onClick={() => handleSwitch(conv.id)}
          style={{
            background: activeConversationId === conv.id ? '#e3f2fd' : 'white'
          }}
        >
          <h3>{conv.title}</h3>
          <p>{conv.messageCount} 条消息</p>
          <button onClick={() => handleDelete(conv.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
```

## 高级用法

### 与 useXChat 配合使用

```typescript
import { useXChat, useXConversations } from '@/hooks/chat';

function ChatApp() {
  const {
    conversations,
    activeConversationId,
    createConversation,
    updateConversation,
  } = useXConversations();

  const { messages, sendMessage } = useXChat({
    appId: 'your-app-id',
    conversationId: activeConversationId,
    onConversationCreated: (id) => {
      // 更新会话信息
      updateConversation(activeConversationId!, {
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]?.content,
      });
    },
  });

  const handleNewChat = () => {
    createConversation('新对话');
  };

  return (
    <div>
      <button onClick={handleNewChat}>新建会话</button>
      {/* 会话列表和聊天界面 */}
    </div>
  );
}
```

### 更新会话元数据

```typescript
const handleUpdateTitle = (id: string, newTitle: string) => {
  updateConversation(id, { title: newTitle });
};

const handleUpdateMessageCount = (id: string, count: number) => {
  updateConversation(id, {
    messageCount: count,
    updatedAt: Date.now()
  });
};
```

### 获取特定会话

```typescript
const conv = getConversation('conversation-id');
if (conv) {
  console.log('会话标题:', conv.title);
  console.log('消息数量:', conv.messageCount);
}
```

## 注意事项

1. **自动切换**: 创建新会话时会自动切换到该会话
2. **删除保护**: 删除当前活跃会话时会自动切换到第一个会话
3. **时间戳**: `updatedAt` 会在调用 `updateConversation` 时自动更新
4. **持久化**: 此 Hook 不包含持久化逻辑，需要自行实现

## 类型定义

详见 `../types.ts`

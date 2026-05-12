# ChatPanel 组件

AI 本体工作台的聊天面板组件，支持深度思考链和本体工具调用展示。

## 组件结构

```
ChatPanel/
├── MessageList/              # 消息列表
├── MessageBubble/            # 消息气泡
│   ├── UserBubble           # 用户消息（右侧）
│   └── AIBubble             # AI 消息（左侧）
├── ThinkingChain/           # 深度思考组件
├── ToolCalling/             # 本体工具调用
│   ├── ToolCallItem         # 单个工具项
│   └── JSONViewer           # JSON 查看器
└── MarkdownRenderer/        # Markdown 渲染
```

## 使用示例

```tsx
import ChatPanel from '@/pages/aiOntologyWorkbench/components/ChatPanel';

function App() {
  return (
    <ChatPanel
      appId="your-app-id"
      projectId="your-project-id"
      conversationId="optional-conversation-id"
      onNewSession={() => console.log('新会话')}
      onHistoryClick={() => console.log('历史记录')}
      onConversationCreated={(id) => console.log('会话创建:', id)}
    />
  );
}
```

## Props

| 参数                  | 说明         | 类型                 | 必填 |
| --------------------- | ------------ | -------------------- | ---- |
| appId                 | 应用 ID      | string \| number     | 是   |
| projectId             | 项目 ID      | string \| number     | 否   |
| conversationId        | 会话 ID      | string               | 否   |
| onNewSession          | 新会话回调   | () => void           | 否   |
| onHistoryClick        | 历史记录回调 | () => void           | 否   |
| onConversationCreated | 会话创建回调 | (id: string) => void | 否   |

## 特性

- ✅ 用户消息右侧，AI 消息左侧
- ✅ 深度思考链展示，完成后自动收起
- ✅ 本体工具调用展示，完成后自动收起
- ✅ JSON 结果查看器（带行号和复制）
- ✅ Markdown 内容渲染
- ✅ SSE 流式对话
- ✅ 文件上传支持
- ✅ 语音输入支持

## Hooks

### useXChat

核心消息管理 Hook，处理 SSE 流式对话。

```tsx
import { useXChat } from '@/hooks/chat';

const {
  messages,
  isLoading,
  isStreaming,
  sendMessage,
  stopGeneration,
  clearMessages
} = useXChat({
  appId: 'your-app-id',
  projectId: 'your-project-id',
  conversationId: 'optional-conversation-id',
  onConversationCreated: (id) => console.log(id),
  onError: (error) => console.error(error)
});
```

### useXConversations

会话管理 Hook。

```tsx
import { useXConversations } from '@/hooks/chat';

const {
  conversations,
  activeConversationId,
  setActiveConversation,
  createConversation,
  deleteConversation
} = useXConversations();
```

### useAutoScroll

自动滚动 Hook（豆包风格）。

```tsx
import { useAutoScroll } from '@/hooks/chat';

const { scrollRef, enableAutoScroll, disableAutoScroll } = useAutoScroll({
  smooth: true,
  offset: 100
});
```

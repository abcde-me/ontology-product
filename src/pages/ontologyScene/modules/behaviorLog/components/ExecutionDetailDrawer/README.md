# 行为执行详情抽屉组件

## 概述

这是一个用于显示行为执行详情的抽屉组件，采用组件化设计和 Zustand 状态管理。

## 组件结构

```
ExecutionDetailDrawer/
├── index.tsx              # 主抽屉组件
├── store.ts               # Zustand 状态管理
├── types.ts               # 类型定义
├── StatusCard.tsx         # 状态卡片组件
├── BasicInfo.tsx          # 基本信息组件
├── ParamsTab.tsx          # 参数表格组件
├── LogsTab.tsx            # 运行日志组件
├── FunctionTab.tsx        # 函数代码组件
├── index.module.scss      # 样式文件
└── README.md              # 文档
```

## 使用方式

```tsx
import { ExecutionDetailDrawer } from './components';

function MyComponent() {
  const [visible, setVisible] = useState(false);
  const [executionId, setExecutionId] = useState<string>();

  return (
    <>
      <button
        onClick={() => {
          setExecutionId('001');
          setVisible(true);
        }}
      >
        查看详情
      </button>

      <ExecutionDetailDrawer
        visible={visible}
        onClose={() => setVisible(false)}
        executionId={executionId}
      />
    </>
  );
}
```

## 数据流

1. 组件接收 `executionId` 后，通过 Zustand store 触发数据加载
2. Store 并行请求以下 API：
   - `fetchBehaviorLogDetail` - 获取基本信息
   - `fetchBehaviorLogInputParams` - 获取入参
   - `fetchBehaviorLogRunLogs` - 获取运行日志
   - `fetchBehaviorLogExecutionDetail` - 获取函数代码
3. 数据加载完成后，各子组件从 store 中读取数据并渲染

## API 服务

所有 API 调用都通过 `services/behaviorLogApi.ts` 进行，支持 Mock 模式：

- 开发阶段：`USE_MOCK = true`，使用 mock 数据
- 生产阶段：`USE_MOCK = false`，调用真实接口

## 状态颜色

执行状态对应的颜色：

- 成功(2): 绿色 `#E8FFEA` / `#00B42A`
- 失败(3): 红色 `#FFECE8` / `#F53F3F`
- 运行中(1): 蓝色 `#E8F3FF` / `#165DFF`
- 已停止(4): 灰色 `#F7F8FA` / `#86909C`

## 扩展

### 添加新的 Tab

1. 创建新的 Tab 组件（如 `OutputTab.tsx`）
2. 在 `store.ts` 中添加对应的状态和 API 调用
3. 在 `index.tsx` 中添加新的 TabPane

### 切换到真实接口

1. 将 `mocks/index.ts` 中的 `USE_MOCK` 设置为 `false`
2. 确保 `@/api/behaviorTest` 中有对应的 API 方法
3. 更新 `services/behaviorLogApi.ts` 中的 API 调用逻辑

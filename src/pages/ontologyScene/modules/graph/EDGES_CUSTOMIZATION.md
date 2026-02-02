# Edges 定制实现方案

## 概述

本文档说明如何结合 `@ceai-front/workflow` 和 ReactFlow 实现 edges（边）的定制。

## 核心原理

### 1. ReactFlow 的 edgeTypes 机制

ReactFlow 通过 `edgeTypes` 来管理不同类型的 edge 组件：

```typescript
const edgeTypes = {
  default: DefaultEdge,
  custom: CustomEdge
  // ... 其他类型
};
```

### 2. @ceai-front/workflow 的限制

`@ceai-front/workflow` 的 `AIWorflow` 组件是封装好的，不直接暴露 `edgeTypes` 配置接口。但我们可以通过 ReactFlow 的内部 API 来动态注册。

### 3. 解决方案：使用 useStoreApi

ReactFlow 提供了 `useStoreApi` hook，可以访问其内部 store，从而动态修改 edgeTypes：

```typescript
import { useStoreApi } from 'reactflow';

const store = useStoreApi();
store.setState({
  edgeTypes: {
    ...currentEdgeTypes,
    custom: CustomEdge
  }
});
```

## 实现步骤

### 步骤 1: 创建自定义 Edge 组件

创建 `src/pages/ontologyScene/modules/graph/edges/custom-edge.tsx`：

```typescript
import React, { memo } from 'react';
import type { EdgeProps } from 'reactflow';
import { BaseEdge, EdgeLabelRenderer, Position, getBezierPath } from 'reactflow';

const CustomEdge = ({ id, data, sourceX, sourceY, targetX, targetY, ...props }: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
    curvature: 0.16
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: '#94a3b8',
          strokeWidth: 2,
          strokeDasharray: '5,5', // 虚线样式
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div style={{ /* 标签样式 */ }}>
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(CustomEdge);
```

### 步骤 2: 创建注册 Hook

创建 `src/pages/ontologyScene/modules/graph/hooks/use-register-custom-edges.tsx`：

```typescript
import { useEffect } from 'react';
import { useStoreApi } from 'reactflow';
import { CustomEdge } from '../edges';

export const useRegisterCustomEdges = () => {
  const store = useStoreApi();

  useEffect(() => {
    const currentState = store.getState();
    const currentEdgeTypes = currentState.edgeTypes || {};

    if (!currentEdgeTypes['custom']) {
      store.setState({
        edgeTypes: {
          ...currentEdgeTypes,
          custom: CustomEdge
        }
      });
    }
  }, [store]);
};
```

### 步骤 3: 创建注册组件

创建 `src/pages/ontologyScene/modules/graph/components/edge-types-registrar.tsx`：

```typescript
import React from 'react';
import { useRegisterCustomEdges } from '../hooks/use-register-custom-edges';

export const EdgeTypesRegistrar: React.FC = () => {
  useRegisterCustomEdges();
  return null;
};
```

### 步骤 4: 在 edges 数据中设置 type

在创建 edges 时，设置 `type: 'custom'`：

```typescript
const workflowEdges = topologyEdges.map((topologyEdge) => {
  return {
    id: String(topologyEdge.id),
    source: sourceId,
    target: targetId,
    sourceHandle: 'source', // 对应 NodeSourceHandle 的 handleId
    targetHandle: 'target', // 对应 NodeTargetHandle 的 handleId
    type: 'custom', // 指定使用自定义 edge 类型
    data: {
      label: topologyEdge.name || '',
      labelIcon: '🔗',
      labelColor: '#f1f5f9'
    },
    style: {
      stroke: '#94a3b8',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    }
  };
});
```

### 步骤 5: 在组件中使用

```typescript
<AIWorkflowProvider ...>
  <AIWorflow>
    <EdgeTypesRegistrar />
  </AIWorflow>
</AIWorkflowProvider>
```

## 节点连接点说明

根据 `@ceai-front/workflow` 的定义：

1. **默认连接点位置**：
   - 左侧：`target`（目标连接点）
   - 右侧：`source`（源连接点）

2. **控制连接点显示**：

   ```typescript
   const nodesConfig = [
     {
       type: 'default',
       showDefaultSourceHandle: true, // 显示源连接点
       showDefaultTargetHandle: true // 显示目标连接点
       // ...
     }
   ];
   ```

3. **连接点组件**：
   - `NodeTargetHandle` - 目标连接点组件
   - `NodeSourceHandle` - 源连接点组件

4. **动态创建连接点**：
   - 使用 `updateNodeInternals(nodeId)` 来更新节点内部结构
   - `handleId` 属性对应 `updateNodeInternals` 的 `id` 参数

## Edge 数据中的 handleId

在创建 edge 时，`sourceHandle` 和 `targetHandle` 必须对应节点中实际的 `handleId`：

```typescript
{
  source: 'node-1',
  sourceHandle: 'source', // 对应 NodeSourceHandle 的 handleId
  target: 'node-2',
  targetHandle: 'target', // 对应 NodeTargetHandle 的 handleId
}
```

## 注意事项

1. **时机问题**：`EdgeTypesRegistrar` 必须在 ReactFlow 初始化后执行，所以放在 `AIWorflow` 内部。

2. **Store 访问**：`useStoreApi` 只能在 `ReactFlowProvider` 内部使用。

3. **类型覆盖**：如果 `@ceai-front/workflow` 已经注册了 `'custom'` 类型，我们的实现会覆盖它。

4. **性能考虑**：edgeTypes 的注册是一次性的，不会影响性能。

## 扩展功能

### 1. 支持多种 edge 类型

```typescript
const edgeTypes = {
  custom: CustomEdge,
  dashed: DashedEdge,
  solid: SolidEdge
};

store.setState({ edgeTypes });
```

### 2. 根据数据动态选择 edge 类型

```typescript
const workflowEdges = topologyEdges.map((edge) => {
  const edgeType = edge.type === 1 ? 'dashed' : 'custom';
  return {
    ...edge,
    type: edgeType
  };
});
```

### 3. 自定义 edge 交互

在 CustomEdge 组件中可以添加：

- 点击事件
- 悬停效果
- 拖拽功能
- 右键菜单

## 参考资源

- [ReactFlow 官方文档](https://reactflow.dev/)
- [ReactFlow Edge Types](https://reactflow.dev/learn/customization/custom-edges)
- [ReactFlow Store API](https://reactflow.dev/api-reference/hooks/use-store-api)

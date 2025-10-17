# 项目变化监听Hook使用指南

## 概述

`useProjectChange` 和 `usePageRefresh` 是两个用于监听项目ID变化的Hook，可以帮助页面组件在项目切换时自动重新加载数据。

## 问题背景

当用户从一个项目切换到另一个项目时，如果跳转到相同的页面路径（如都是连接器页面），React Router不会重新渲染组件，导致页面显示的还是上一个项目的数据。

## 解决方案

### 方案1: 全局路由刷新（已实现）

在项目切换时，如果跳转到相同路径，会添加时间戳参数强制React Router重新渲染：

```typescript
// 在 header.tsx 中
const refreshPath = `${firstMenuPath}?refresh=${Date.now()}`;
history.replace(refreshPath);
```

### 方案2: 页面级监听（推荐）

使用 `usePageRefresh` Hook让页面组件自动监听项目变化：

```typescript
import { usePageRefresh } from '@/hooks/useProjectChange';

const MyPage: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 数据加载函数
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getMyPageData();
      setData(result);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 监听项目变化并自动重新加载数据
  usePageRefresh(loadData);

  return (
    <div>
      {/* 页面内容 */}
    </div>
  );
};
```

### 方案3: 自定义监听

使用 `useProjectChange` Hook进行更精细的控制：

```typescript
import { useProjectChange } from '@/hooks/useProjectChange';

const MyPage: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<string>('');

  useProjectChange((projectId) => {
    console.log('项目切换到:', projectId);
    setCurrentProject(projectId[1]);

    // 执行特定的业务逻辑
    if (projectId[1] === 'special-project') {
      // 特殊项目的处理逻辑
    }

    // 重新加载数据
    loadData();
  });

  return <div>当前项目: {currentProject}</div>;
};
```

## Hook API

### useProjectChange

```typescript
useProjectChange(
  callback: (projectId: string[]) => void,
  deps?: any[]
)
```

**参数:**

- `callback`: 项目变化时的回调函数，接收新的项目ID数组
- `deps`: 可选的依赖数组，当依赖变化时也会执行回调

### usePageRefresh

```typescript
usePageRefresh(
  loadData: () => void | Promise<void>,
  deps?: any[]
)
```

**参数:**

- `loadData`: 数据加载函数，支持同步和异步
- `deps`: 可选的依赖数组

## 使用建议

1. **优先使用方案1（全局路由刷新）**: 已经实现，无需修改现有页面代码
2. **对于复杂页面使用方案2**: 当页面有复杂的状态管理或特殊的数据加载逻辑时
3. **对于特殊需求使用方案3**: 当需要在项目切换时执行特定业务逻辑时

## 注意事项

1. Hook会在组件首次渲染时执行一次回调
2. 只有当项目ID真正发生变化时才会触发回调
3. 回调函数中的异步操作需要自行处理错误
4. 避免在回调中执行可能导致无限循环的操作

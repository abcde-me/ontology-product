# RAG 分段列表 - 快速参考指南

## 快速访问

### 5种场景的访问URL

```bash
# 场景1：基础文本分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=text-scene

# 场景2：分层级分段 + 目录树
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=hierarchical-scene

# 场景3：图文混合分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=image-text-scene

# 场景4：PPT展示
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=ppt-scene

# 场景5：表格分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=table-scene
```

## 文件结构

```
src/pages/ragDetail/
├── index.tsx                          # 主入口
├── types/
│   └── index.ts                       # 类型定义
├── store/
│   └── ragDetailStore.ts              # Zustand状态管理
├── api/
│   └── ragDetailApi.ts                # API接口层
├── utils/
│   └── mockData.ts                    # Mock数据
├── components/
│   ├── Header.tsx                     # 头部组件
│   ├── SceneRouter.tsx                # 场景路由
│   ├── MainContent.tsx                # 场景1容器
│   ├── PdfViewer.tsx                  # PDF查看器
│   ├── SegmentList.tsx                # 分段列表
│   ├── SegmentCard.tsx                # 分段卡片
│   ├── SegmentCardActions.tsx         # 卡片操作按钮
│   ├── SegmentCardContent.tsx         # 卡片内容
│   ├── SegmentListHeader.tsx          # 列表头部
│   ├── DirectoryTree.tsx              # 目录树（场景2）
│   ├── HierarchicalSegmentList.tsx    # 分层级列表（场景2）
│   ├── ImageTextSegmentCard.tsx       # 图文卡片（场景3）
│   ├── ImageTextSegmentList.tsx       # 图文列表（场景3）
│   ├── ImageModal.tsx                 # 图片弹窗（场景3）
│   ├── PptViewer.tsx                  # PPT查看器（场景4）
│   ├── PptSegmentCard.tsx             # PPT卡片（场景4）
│   ├── PptSegmentList.tsx             # PPT列表（场景4）
│   ├── TableViewer.tsx                # 表格查看器（场景5）
│   ├── TableSegmentCard.tsx           # 表格卡片（场景5）
│   ├── TableSegmentList.tsx           # 表格列表（场景5）
│   └── scenes/
│       ├── HierarchicalSceneContent.tsx
│       ├── ImageTextSceneContent.tsx
│       ├── PptSceneContent.tsx
│       └── TableSceneContent.tsx
├── styles/
│   └── index.css                      # 样式文件
└── __tests__/
    └── ragDetailStore.test.ts         # 单元测试
```

## 常用操作

### 1. 添加新的Mock数据场景

在 `utils/mockData.ts` 中：

```typescript
export const mockNewSceneData = (ragId: string): RagDetailData => {
  return {
    ragId,
    fileName: '文件名.pdf',
    filePath: '路径',
    sceneType: 'new-scene',
    segments: [
      {
        id: 'seg_001',
        content: '内容',
        charCount: 100,
        segmentIndex: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // 场景特定字段
      }
    ]
  };
};

// 在 mockRagDetailData 中添加
case 'new-scene':
  return mockNewSceneData(ragId);
```

### 2. 在Store中添加新的状态

在 `store/ragDetailStore.ts` 中：

```typescript
export const useRagDetailStore = create((set, get) => ({
  // 添加新状态
  newState: initialValue,
  
  // 添加新方法
  updateNewState: (value) => {
    set({ newState: value });
  }
}));
```

### 3. 创建新的场景组件

创建 `components/scenes/NewSceneContent.tsx`：

```typescript
import React from 'react';
import { useRagDetailStore } from '../../store/ragDetailStore';

interface NewSceneContentProps {
  loading: boolean;
}

const NewSceneContent: React.FC<NewSceneContentProps> = ({ loading }) => {
  const { segments } = useRagDetailStore();

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="flex h-full w-full bg-white">
      {/* 场景特定的布局 */}
    </div>
  );
};

export default NewSceneContent;
```

### 4. 在SceneRouter中注册新场景

在 `components/SceneRouter.tsx` 中：

```typescript
case 'new-scene':
  return <NewSceneContent loading={loading} />;
```

## 常用Hook

### useRagDetailStore

```typescript
import { useRagDetailStore } from './store/ragDetailStore';

// 获取状态
const { 
  ragId, 
  segments, 
  selectedSegmentId,
  loading,
  error 
} = useRagDetailStore();

// 调用方法
const { 
  selectSegment, 
  updateSegmentContent,
  togglePdfViewer 
} = useRagDetailStore();
```

## 常用组件Props

### SegmentCard

```typescript
interface SegmentCardProps {
  segment: Segment;
  isSelected: boolean;
}
```

### ImageTextSegmentCard

```typescript
interface ImageTextSegmentCardProps {
  segment: ImageTextSegment;
  isSelected: boolean;
}
```

### PptSegmentCard

```typescript
interface PptSegmentCardProps {
  segment: PptSegment;
  isSelected: boolean;
}
```

### TableSegmentCard

```typescript
interface TableSegmentCardProps {
  segment: TableSegment;
  isSelected: boolean;
}
```

## 样式常量

### 颜色

```typescript
// 高亮蓝色
const highlightBlue = '#007DFA';

// 背景浅蓝
const lightBlue = '#eff6ff';

// 边框灰色
const borderGray = '#e5e7eb';
```

### Tailwind类名

```typescript
// 选中状态
'border-[#007DFA] bg-blue-50'

// Hover状态
'border-[#007DFA] bg-white'

// 默认状态
'border-gray-200 bg-white'
```

## 调试技巧

### 1. 查看Store状态

```typescript
const state = useRagDetailStore.getState();
console.log(state);
```

### 2. 监听Store变化

```typescript
const unsubscribe = useRagDetailStore.subscribe(
  (state) => console.log('State changed:', state)
);
```

### 3. 查看Mock数据

```typescript
import { mockRagDetailData } from './utils/mockData';
console.log(mockRagDetailData('text-scene'));
```

## 性能优化建议

### 1. 使用useMemo缓存

```typescript
const memoizedSegments = useMemo(() => {
  return segments.filter(/* ... */);
}, [segments]);
```

### 2. 使用useCallback缓存回调

```typescript
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependencies]);
```

### 3. 分离关注点

- 将大组件拆分为小组件
- 每个组件只订阅需要的状态

## 常见问题

### Q: 如何切换场景？
A: 修改URL中的ragId参数，例如从 `?ragId=text-scene` 改为 `?ragId=hierarchical-scene`

### Q: 如何添加新的分段类型？
A: 在types/index.ts中扩展Segment接口，然后在相应的场景组件中处理

### Q: 如何集成真实API？
A: 修改api/ragDetailApi.ts中的fetchRagDetail函数，替换为真实API调用

### Q: 如何处理错误？
A: Store中的error状态会保存错误信息，在UI中检查并显示

### Q: 如何测试？
A: 运行 `npm test` 执行单元测试

## 相关文档

- [完整实现教程](./RAG_SEGMENT_IMPLEMENTATION_GUIDE.md)
- [5种场景详解](./SCENE_DETAILS.md)
- [架构设计文档](./ARCHITECTURE.md)

---

祝你使用愉快！如有问题，请参考相关文档或查看源代码注释。


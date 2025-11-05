# RAG Detail Page - 快速开始

## 🚀 5分钟快速开始

### 1. 访问页面

```
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=test-rag-id
```

### 2. 看到的界面

- **顶部**：文件路径和名称
- **左侧**：PDF原文件查看器
- **右侧**：分段列表

### 3. 基本操作

#### 选中分段

- 点击任何分段卡片
- 卡片边框变为蓝色（#007DFA）
- 背景色变为浅蓝色

#### 编辑分段

1. 点击分段卡片的"✎ 编辑分段"按钮
2. 内容区域变为文本输入框
3. 修改内容
4. 点击输入框外的任何地方自动保存

#### 隐藏原文件

- 点击右上角"隐藏原文件"按钮
- 分段列表占满整个屏幕
- 再次点击"显示原文件"恢复

## 📁 项目结构速览

```
ragDetail/
├── components/          # UI组件
├── store/              # 状态管理（Zustand）
├── api/                # API接口
├── types/              # TypeScript类型
├── utils/              # 工具函数
├── styles/             # 样式文件
└── index.tsx           # 入口文件
```

## 🔧 主要技术栈

- **React 18**: UI框架
- **TypeScript**: 类型安全
- **Zustand**: 状态管理
- **Tailwind CSS**: 样式
- **Mock Data**: 当前使用Mock数据

## 💡 核心概念

### 1. Zustand Store

所有状态都在`store/ragDetailStore.ts`中管理：

```typescript
import { useRagDetailStore } from './store/ragDetailStore';

// 在组件中使用
const { segments, selectedSegmentId, selectSegment } = useRagDetailStore();
```

### 2. 组件通信

通过Store进行组件间通信，无需Props传递：

```typescript
// 任何组件都可以访问和修改状态
const { updateSegmentContent } = useRagDetailStore();
await updateSegmentContent(segmentId, newContent);
```

### 3. 异步操作

Store支持异步操作：

```typescript
// 初始化数据
await initializeRagDetail(ragId);

// 更新分段
await updateSegmentContent(segmentId, content);
```

## 🎨 样式定制

### 主要颜色

- 蓝色（高亮）: `#007DFA`
- 灰色（边框）: `#e5e7eb`
- 浅蓝色（背景）: `#eff6ff`

### 修改样式

所有样式都使用Tailwind CSS，在组件中直接修改className：

```tsx
<div className="border-[#007DFA] bg-blue-50">{/* 内容 */}</div>
```

## 📊 数据结构

### Segment（分段）

```typescript
interface Segment {
  id: string; // 分段ID
  content: string; // 分段内容
  charCount: number; // 字符数
  segmentIndex: number; // 分段序号
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}
```

### Store State

```typescript
interface RagDetailState {
  ragId: string | null;
  fileName: string;
  filePath: string;
  segments: Segment[];
  selectedSegmentId: string | null;
  editingSegmentId: string | null;
  showPdfViewer: boolean;
  loading: boolean;
  error: string | null;
}
```

## 🔌 集成真实API

### 当前状态

- 使用Mock数据
- 位于`utils/mockData.ts`
- 模拟真实API延迟（500ms）

### 集成步骤

1. 打开`api/ragDetailApi.ts`
2. 替换Mock调用为真实API：

```typescript
export async function fetchRagDetail(ragId: string): Promise<RagDetailData> {
  // 替换这里
  const response = await fetch(`/api/rag/${ragId}`);
  const data = await response.json();
  return data;
}
```

3. 确保API返回的数据结构与`types/index.ts`一致

## 🧪 测试

### 运行测试

```bash
npm test -- src/pages/ragDetail/__tests__
```

### 测试覆盖

- Store状态管理
- 异步操作
- 状态更新

## 📝 常见任务

### 添加新的操作按钮

1. 在`components/SegmentCardActions.tsx`中添加按钮
2. 在Store中添加对应的方法
3. 在组件中调用方法

### 添加新的分段属性

1. 在`types/index.ts`中更新Segment类型
2. 在`utils/mockData.ts`中添加Mock数据
3. 在组件中使用新属性

### 实现搜索功能

1. 在Store中添加搜索状态
2. 在SegmentList中实现过滤逻辑
3. 添加搜索输入框

## 🐛 调试技巧

### 查看Store状态

```javascript
// 在浏览器控制台
import { useRagDetailStore } from './store/ragDetailStore';
const store = useRagDetailStore.getState();
console.log(store);
```

### 查看组件Props

- 使用React DevTools
- 检查组件的Props和State

### 查看网络请求

- 打开浏览器Network标签
- 查看API调用和响应

## 📚 更多资源

- [README.md](./README.md) - 详细项目说明
- [USAGE.md](./USAGE.md) - 完整使用指南
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 项目结构详解
- [types/index.ts](./types/index.ts) - 类型定义
- [store/ragDetailStore.ts](./store/ragDetailStore.ts) - Store实现

## ❓ 常见问题

**Q: 如何修改分段卡片的样式？**
A: 编辑`components/SegmentCard.tsx`中的className。

**Q: 如何添加新的分段操作？**
A: 在`SegmentCardActions.tsx`中添加按钮，在Store中添加方法。

**Q: 如何实现PDF同步滚动？**
A: 在`components/PdfViewer.tsx`中集成PDF库，实现滚动同步。

**Q: 如何优化大数据量性能？**
A: 使用虚拟滚动库（如react-window）替换SegmentList。

## 🎯 下一步

1. ✅ 基础功能已完成
2. ⏳ 集成真实API
3. ⏳ 实现PDF渲染
4. ⏳ 添加搜索和过滤
5. ⏳ 实现虚拟滚动
6. ⏳ 添加更多操作（删除、批量编辑等）

祝你使用愉快！🎉

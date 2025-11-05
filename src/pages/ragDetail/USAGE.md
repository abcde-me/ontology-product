# RAG Detail Page - 使用指南

## 快速开始

### 1. 访问页面

```
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=test-rag-id
```

### 2. 页面功能

#### 顶部Header

- 显示文件的完整路径
- 显示文件名称
- 返回按钮（待实现）

#### 左侧PDF查看器

- 显示PDF原文件
- 支持缩放和翻页（待实现）
- 可通过右上角按钮隐藏

#### 右侧分段列表

- 显示所有分段
- 支持选中、编辑、查看详情等操作

### 3. 分段卡片交互

#### 默认状态

- 灰色边框
- 显示分段内容
- 显示字符数和分段序号

#### Hover状态

- 边框变为蓝色（#007DFA）
- 显示操作按钮：
  - ✎ 编辑分段
  - ⓘ 分段详情
  - ⟲ 溯源日志

#### 选中状态

- 边框为蓝色（#007DFA）
- 背景色为浅蓝色
- 始终显示操作按钮

#### 编辑状态

- 内容区域变为文本输入框
- 编辑按钮高亮为蓝色
- 点击外部区域自动保存

## 功能详解

### 隐藏/显示原文件

点击右上角的"隐藏原文件"或"显示原文件"按钮，可以切换PDF查看器的显示状态。

### 编辑分段

1. 点击分段卡片的"编辑分段"按钮
2. 内容区域变为文本输入框
3. 修改内容
4. 点击输入框外的任何地方自动保存

### 查看分段详情

点击"分段详情"按钮，弹出分段详情弹窗（待实现）。

### 查看溯源日志

点击"溯源日志"按钮，弹出溯源日志弹窗（待实现）。

## 状态管理

### Zustand Store

所有状态都通过Zustand进行管理，位于`store/ragDetailStore.ts`。

#### 主要状态

- `ragId`: 当前RAG的ID
- `fileName`: 文件名称
- `filePath`: 文件路径
- `segments`: 分段列表
- `selectedSegmentId`: 当前选中的分段ID
- `editingSegmentId`: 当前编辑的分段ID
- `showPdfViewer`: 是否显示PDF查看器
- `loading`: 是否加载中
- `error`: 错误信息

#### 主要方法

- `initializeRagDetail(ragId)`: 初始化RAG详情
- `selectSegment(segmentId)`: 选中分段
- `startEditingSegment(segmentId)`: 开始编辑分段
- `cancelEditingSegment()`: 取消编辑
- `updateSegmentContent(segmentId, content)`: 更新分段内容
- `togglePdfViewer()`: 切换PDF查看器显示状态
- `setError(error)`: 设置错误信息

## 性能优化

### 1. 组件拆分

- 每个组件职责单一
- 减少不必要的重新渲染

### 2. useMemo优化

- SegmentList使用useMemo缓存分段列表
- 避免频繁重新渲染

### 3. 事件委托

- 使用事件冒泡处理点击事件
- 减少事件监听器数量

### 4. 虚拟滚动（待实现）

- 对于大数据量，可以使用虚拟滚动
- 只渲染可见区域的分段

## 集成真实API

### 1. 修改API文件

编辑`api/ragDetailApi.ts`，替换Mock数据为真实API调用：

```typescript
export async function fetchRagDetail(ragId: string): Promise<RagDetailData> {
  const response = await fetch(`/api/rag/${ragId}`);
  const data = await response.json();
  return data;
}
```

### 2. 更新数据结构

确保API返回的数据结构与`types/index.ts`中定义的类型一致。

### 3. 错误处理

API调用失败时，错误信息会自动显示在页面上。

## 样式定制

### Tailwind CSS

所有样式都使用Tailwind CSS编写，可以在组件中直接修改className。

### 主要颜色

- 蓝色（高亮）: `#007DFA`
- 灰色（边框）: `#e5e7eb`
- 背景色（选中）: `#eff6ff`

### 修改样式

1. 在组件中找到对应的className
2. 修改Tailwind CSS类名
3. 或在`styles/index.css`中添加自定义样式

## 常见问题

### Q: 如何添加新的分段操作？

A: 在`SegmentCardActions.tsx`中添加新的按钮，然后在store中添加对应的方法。

### Q: 如何实现虚拟滚动？

A: 可以使用`react-window`或`react-virtualized`库，替换`SegmentList`组件。

### Q: 如何集成PDF渲染？

A: 可以使用`pdfjs-dist`或`react-pdf`库，替换`PdfViewer`组件。

### Q: 如何实现搜索和过滤？

A: 在store中添加搜索状态和过滤方法，在`SegmentList`中使用。

## 调试

### 查看Store状态

在浏览器控制台中：

```javascript
import { useRagDetailStore } from './store/ragDetailStore';
const store = useRagDetailStore.getState();
console.log(store);
```

### 查看组件Props

在React DevTools中检查组件的Props。

### 查看网络请求

在浏览器Network标签中查看API调用。

## 部署

### 构建

```bash
npm run build
```

### 测试

```bash
npm run test
```

### 部署到生产环境

```bash
npm run deploy
```

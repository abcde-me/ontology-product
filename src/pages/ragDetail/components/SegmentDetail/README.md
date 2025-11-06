# SegmentDetail 组件

分段详情组件，用于展示分段的基本信息和元素信息。

## 组件结构

```
SegmentDetail/
├── index.tsx                    # 主入口组件
├── store/
│   └── segmentDetailStore.ts    # Zustand 状态管理
├── BasicInfo.tsx                # 基本信息组件
├── ElementList.tsx              # 元素列表组件
├── TextElementCard.tsx          # 文本元素卡片
├── ImageElementCard.tsx         # 图片元素卡片
├── TableElementCard.tsx         # 表格元素卡片
├── ElementEnhancedInfo.tsx      # 元素增强信息组件
├── mockData.ts                  # 模拟数据
└── README.md                    # 本文件
```

## 组件说明

### index.tsx

主入口组件，负责：

- 管理编辑状态
- 渲染基本信息和元素信息
- 提供编辑/取消/确定按钮

### BasicInfo.tsx

基本信息组件，显示：

- 分段编号
- 分段大小（字符数）

### ElementList.tsx

元素列表组件，负责：

- 遍历元素数组
- 根据元素类型渲染对应的卡片组件

### TextElementCard.tsx

文本元素卡片，显示：

- 元素类型标签（蓝色）
- 元素ID
- 文本内容
- 定位类型和位置信息
- 元素增强信息

### ImageElementCard.tsx

图片元素卡片，显示：

- 元素类型标签（紫色）
- 元素ID
- 图片URL（带复制按钮）
- 定位类型和位置信息
- 尺寸和修饰
- 元素增强信息

### TableElementCard.tsx

表格元素卡片，显示：

- 元素类型标签（绿色）
- 元素ID
- 表格数据
- 定位类型和位置信息
- 元素增强信息

### ElementEnhancedInfo.tsx

元素增强信息组件，显示：

- 关键描述
- 抽取实体（标签）

## 使用方式

### 基本使用

```tsx
import SegmentDetail from './components/SegmentDetail';

<SegmentDetail segmentId="segment_001" />;
```

### 在 SegmentDrawer 中使用

```tsx
import SegmentDetail from './SegmentDetail';

<Drawer visible={visible} onClose={onClose}>
  <SegmentDetail segmentId={currentSegmentId} />
</Drawer>;
```

## 交互说明

### 查看模式

- 显示所有元素的只读信息
- 点击图片链接可以弹窗放大预览
- 点击"编辑"按钮进入编辑模式

### 编辑模式

- 文本元素：可编辑文本内容、关键描述、抽取实体
- 图片元素：可编辑关键描述、抽取实体
- 表格元素：可编辑表头、单元格、关键描述、抽取实体
- 抽取实体：使用 Select 多选组件，支持输入新标签和选择已有标签
- **关键描述和抽取实体是共享的**：修改任意一个元素的关键描述或抽取实体，所有元素的对应字段都会同步更新
- 点击"取消"按钮放弃修改并退出编辑模式
- 点击"确定"按钮保存修改并退出编辑模式

## 数据结构

详见 `src/pages/ragDetail/types/index.ts` 中的类型定义：

- `SegmentDetailData`
- `Element`
- `TextElement`
- `ImageElement`
- `TableElement`

## 编辑功能

### 文本元素编辑

- ✅ 文本内容可编辑（TextArea）
- ✅ 关键描述可编辑（TextArea）
- ✅ 抽取实体可编辑（Select 多选组件，支持 allowCreate）

### 图片元素编辑

- ✅ 关键描述可编辑（TextArea）
- ✅ 抽取实体可编辑（Select 多选组件，支持 allowCreate）
- ✅ 点击图片链接弹窗放大预览

### 表格元素编辑

- ✅ 表格表头可编辑（Input）
- ✅ 表格单元格可编辑（Input）
- ✅ 关键描述可编辑（TextArea）
- ✅ 抽取实体可编辑（Select 多选组件，支持 allowCreate）

## 状态管理（Zustand）

### 架构优势

使用 Zustand 进行状态管理，相比 Props 传递有以下优势：

1. **简化组件通信**：无需层层传递 props
2. **集中式状态管理**：所有状态在 store 中统一管理
3. **更好的性能**：使用选择器避免不必要的重新渲染
4. **易于调试**：状态变化可追踪
5. **代码更清晰**：组件职责更单一

### Store API

```tsx
import { useSegmentDetailStore } from './store/segmentDetailStore';

// 在组件中使用
const {
  detailData, // 当前数据
  isEditing, // 是否编辑模式
  loading, // 加载状态
  initializeDetail, // 初始化数据
  startEditing, // 开始编辑
  cancelEditing, // 取消编辑（恢复初始数据）
  confirmEditing, // 确认编辑（保存到后端）
  updateElement, // 更新元素
  reset // 重置状态
} = useSegmentDetailStore();
```

### 使用选择器优化性能

```tsx
// 只订阅需要的状态，避免不必要的重新渲染
const isEditing = useSegmentDetailStore((state) => state.isEditing);
const updateElement = useSegmentDetailStore((state) => state.updateElement);
```

### 字段独立性

**所有字段都是独立的**，修改一个元素的任何字段（包括关键描述、抽取实体、文本内容、图片URL、表格数据等）都只会更新当前元素，不会影响其他元素。

这个逻辑在 `store/segmentDetailStore.ts` 的 `updateElement` 方法中实现。

### 与溯源日志的关系

SegmentDetail 组件使用独立的 `useSegmentDetailStore`，不会影响溯源日志（Trace）的数据管理。

两者是完全独立的：

- **SegmentDetail**：使用 `useSegmentDetailStore` 管理详情数据
- **Trace**：使用自己的状态管理

## 待实现功能

1. 编辑功能的实际保存逻辑（调用后端API）
2. 从API获取真实数据
3. 复制成功的提示消息（Toast）
4. 表单验证

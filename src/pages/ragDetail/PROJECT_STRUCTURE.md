# RAG Detail Page - 项目结构

## 完整目录树

```
src/pages/ragDetail/
├── __tests__/                          # 测试文件
│   └── ragDetailStore.test.ts          # Store单元测试
│
├── api/                                # API接口层
│   └── ragDetailApi.ts                 # RAG详情API（支持Mock和真实API）
│
├── components/                         # React组件
│   ├── Header.tsx                      # 顶部文件路径和名称
│   ├── MainContent.tsx                 # 主内容区域（PDF + 分段列表）
│   ├── PdfViewer.tsx                   # PDF查看器
│   ├── SegmentCard.tsx                 # 单个分段卡片
│   ├── SegmentCardActions.tsx          # 分段卡片操作按钮
│   ├── SegmentCardContent.tsx          # 分段卡片内容（支持编辑）
│   ├── SegmentList.tsx                 # 分段列表容器
│   └── SegmentListHeader.tsx           # 分段列表头部
│
├── store/                              # Zustand状态管理
│   └── ragDetailStore.ts               # 全局状态管理
│
├── styles/                             # 样式文件
│   └── index.css                       # 全局样式和滚动条样式
│
├── types/                              # TypeScript类型定义
│   └── index.ts                        # 所有类型定义
│
├── utils/                              # 工具函数
│   └── mockData.ts                     # Mock数据生成
│
├── index.tsx                           # 页面入口
├── README.md                           # 项目说明
├── USAGE.md                            # 使用指南
└── PROJECT_STRUCTURE.md                # 本文件
```

## 文件说明

### 入口文件

#### `index.tsx`

- 页面主入口
- 从URL获取ragId参数
- 初始化Store数据
- 渲染Header和MainContent

### 组件层

#### `components/Header.tsx`

- 显示文件路径和名称
- 返回按钮（待实现）

#### `components/MainContent.tsx`

- 管理PDF和分段列表的布局
- 根据showPdfViewer状态切换布局

#### `components/PdfViewer.tsx`

- PDF查看器容器
- 占据左侧50%宽度
- 待集成PDF渲染库

#### `components/SegmentList.tsx`

- 分段列表容器
- 使用useMemo优化性能
- 渲染所有分段卡片

#### `components/SegmentListHeader.tsx`

- 显示统计信息（字符数、分段数）
- 隐藏/显示原文件按钮

#### `components/SegmentCard.tsx`

- 单个分段卡片
- 管理选中、Hover、编辑状态
- 显示操作按钮

#### `components/SegmentCardActions.tsx`

- 分段卡片操作按钮
- 编辑、详情、溯源日志按钮
- 按钮样式根据编辑状态变化

#### `components/SegmentCardContent.tsx`

- 分段内容显示和编辑
- 支持文本输入框编辑
- 点击外部自动保存

### 状态管理

#### `store/ragDetailStore.ts`

- 使用Zustand进行状态管理
- 包含所有应用状态
- 提供所有操作方法
- 支持异步操作

**主要状态：**

- ragId, fileName, filePath
- segments, selectedSegmentId, editingSegmentId
- showPdfViewer, loading, error

**主要方法：**

- initializeRagDetail: 初始化数据
- selectSegment: 选中分段
- startEditingSegment: 开始编辑
- updateSegmentContent: 更新内容
- togglePdfViewer: 切换PDF显示

### API层

#### `api/ragDetailApi.ts`

- 所有API调用的集中管理
- 当前使用Mock数据
- 支持快速切换到真实API
- 包含以下接口：
  - fetchRagDetail: 获取RAG详情
  - updateSegmentContent: 更新分段
  - fetchSegmentDetail: 获取分段详情
  - fetchSegmentTraceLog: 获取溯源日志
  - deleteSegment: 删除分段
  - batchUpdateSegments: 批量更新

### 类型定义

#### `types/index.ts`

- 所有TypeScript类型定义
- 包括State、Props、API Response等
- 提供完整的类型安全

### 工具函数

#### `utils/mockData.ts`

- 生成Mock数据
- 模拟真实API返回
- 包含7个示例分段

### 样式

#### `styles/index.css`

- 全局样式
- 自定义滚动条样式
- 支持Tailwind CSS

### 测试

#### `__tests__/ragDetailStore.test.ts`

- Store单元测试
- 测试所有状态和方法
- 使用Jest和React Testing Library

## 数据流

```
URL参数 (ragId)
    ↓
index.tsx (获取参数)
    ↓
initializeRagDetail (Store方法)
    ↓
fetchRagDetail (API)
    ↓
mockRagDetailData (Mock数据)
    ↓
Store状态更新
    ↓
组件重新渲染
    ↓
显示分段列表
```

## 交互流程

### 选中分段

```
点击分段卡片
    ↓
selectSegment (Store方法)
    ↓
selectedSegmentId 更新
    ↓
卡片高亮显示
```

### 编辑分段

```
点击编辑按钮
    ↓
startEditingSegment (Store方法)
    ↓
editingSegmentId 更新
    ↓
内容变为输入框
    ↓
修改内容
    ↓
点击外部
    ↓
updateSegmentContent (Store方法)
    ↓
API调用
    ↓
Store状态更新
    ↓
编辑完成
```

## 性能优化策略

### 1. 组件拆分

- 细粒度组件设计
- 减少不必要的重新渲染

### 2. useMemo

- SegmentList使用useMemo缓存分段列表
- 避免频繁重新渲染

### 3. 事件处理

- 使用事件委托
- 减少事件监听器数量

### 4. 状态管理

- Zustand自动优化
- 只订阅需要的状态

### 5. 虚拟滚动（待实现）

- 对于大数据量优化
- 只渲染可见区域

## 扩展点

### 1. 添加新功能

- 在Store中添加新状态和方法
- 在API中添加新接口
- 在组件中使用新状态

### 2. 集成真实API

- 修改`api/ragDetailApi.ts`
- 替换Mock数据为真实API调用

### 3. 添加PDF渲染

- 在`components/PdfViewer.tsx`中集成PDF库
- 实现PDF同步滚动

### 4. 添加搜索和过滤

- 在Store中添加搜索状态
- 在SegmentList中实现过滤逻辑

## 依赖项

- React 18+
- TypeScript
- Zustand 4.5.2+
- Tailwind CSS
- React Router

## 开发建议

1. **遵循组件拆分原则**：每个组件职责单一
2. **使用TypeScript**：充分利用类型检查
3. **优化性能**：使用useMemo和useCallback
4. **编写测试**：确保功能正确性
5. **文档完善**：保持代码可维护性

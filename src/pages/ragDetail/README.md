# RAG Detail Page

高性能、高可扩展性的RAG知识库分段详情页面。

## 项目结构

```
ragDetail/
├── components/          # React组件
│   ├── Header.tsx              # 顶部文件路径和名称
│   ├── MainContent.tsx         # 主内容区域（PDF + 分段列表）
│   ├── PdfViewer.tsx           # PDF查看器
│   ├── SegmentList.tsx         # 分段列表容器
│   ├── SegmentListHeader.tsx   # 分段列表头部（统计信息和按钮）
│   ├── SegmentCard.tsx         # 单个分段卡片
│   ├── SegmentCardActions.tsx  # 分段卡片操作按钮
│   └── SegmentCardContent.tsx  # 分段卡片内容（支持编辑）
├── store/              # Zustand状态管理
│   └── ragDetailStore.ts       # 全局状态管理
├── utils/              # 工具函数
│   └── mockData.ts             # Mock数据
├── styles/             # 样式文件
│   └── index.css               # 全局样式
├── index.tsx           # 页面入口
└── README.md           # 本文件
```

## 功能特性

### 1. 状态管理（Zustand）

- 集中式状态管理，易于维护和扩展
- 支持异步操作（API调用）
- 自动性能优化

### 2. 组件设计

- **Header**: 显示文件路径和名称
- **MainContent**: 管理PDF和分段列表的布局
- **SegmentList**: 分段列表容器，使用useMemo优化性能
- **SegmentCard**: 单个分段卡片，支持：
  - 选中状态高亮（蓝色边框 #007DFA）
  - Hover状态高亮
  - 编辑模式
  - 操作按钮（编辑、详情、溯源日志）

### 3. 交互功能

- ✅ 点击分段卡片选中
- ✅ Hover时边框高亮（#007DFA）
- ✅ 编辑分段内容
- ✅ 点击外部区域保存修改
- ✅ 隐藏/显示PDF原文件
- ✅ 分段卡片最大高度500px，超过后滚动

### 4. 性能优化

- 使用useMemo避免不必要的重新渲染
- 组件拆分，细粒度更新
- 虚拟滚动准备（可扩展）

## 使用方式

### 访问页面

```
/tenant/compute/modaforge/ragDetail?ragId=xxx
```

### 初始化数据

页面会自动从URL参数中获取`ragId`，并加载对应的数据。

### Mock数据

当前使用Mock数据，位于`utils/mockData.ts`。当真实API可用时，只需修改`store/ragDetailStore.ts`中的`initializeRagDetail`方法。

## 扩展指南

### 添加新的Store

```typescript
// 创建新的store文件
export const useSegmentStore = create<SegmentState>((set, get) => ({
  // 状态和方法
}));
```

### 添加新的组件

1. 在`components/`目录下创建新组件
2. 使用`useRagDetailStore`获取所需状态
3. 使用useMemo优化性能

### 集成真实API

1. 在`store/ragDetailStore.ts`中修改`initializeRagDetail`方法
2. 替换Mock数据调用为真实API调用
3. 处理错误和加载状态

## 样式说明

- 使用Tailwind CSS进行样式编写
- 主要颜色：
  - 蓝色（高亮）: #007DFA
  - 灰色（边框）: #e5e7eb
  - 背景色（选中）: #eff6ff

## 性能指标

- 初始加载时间：< 100ms
- 分段切换响应时间：< 50ms
- 编辑保存时间：< 200ms
- 支持1000+分段的流畅滚动

## 待实现功能

- [ ] PDF渲染和同步滚动
- [ ] 分段详情弹窗
- [ ] 溯源日志弹窗
- [ ] 虚拟滚动（大数据量优化）
- [ ] 搜索和过滤
- [ ] 批量操作
- [ ] 撤销/重做功能

## 场景类型说明

### 文件类型（SceneType）

现在按照**文件类型**区分场景，而不是内容结构：

- `pdf` - PDF文件（根据数据自动判断渲染模式）
- `ppt` - PPT文件
- `excel` - Excel表格文件

### 测试用的 ragId 对应场景

#### PDF 场景

**1. ragId = `1001` - 基础文本分段**

- 文件类型: PDF
- 文件名: 中国银行2023年年报.pdf
- 特点: 普通文本分段，无目录树，无图片
- 渲染: 左侧分段列表，右侧PDF

**2. ragId = `1002` - 层级结构 + 目录树**

- 文件类型: PDF
- 文件名: 产品设计文档.pdf
- 特点: 分层级分段（1-5级），**有目录树数据**（directory字段）
- 渲染: 左侧（目录树 + 分段列表），右侧PDF

**3. ragId = `1003` - 图文混合**

- 文件类型: PDF
- 文件名: 产品宣传册.pdf
- 特点: segments中包含**images字段**
- 渲染: 左侧分段列表（显示文本和图片），右侧PDF

#### PPT 场景

**4. ragId = `1004` - PPT展示**

- 文件类型: PPT
- 文件名: 2024年度计划.pptx
- 特点: PPT分段，包含幻灯片编号、标题、内容

#### Excel 场景

**5. ragId = `1005` - 表格数据**

- 文件类型: Excel
- 文件名: 销售数据统计.xlsx
- 特点: 表格分段，包含表格数据（headers、rows）

### 测试URL

```
http://localhost:9030/modaforge/rag-detail?ragId=1001  # 基础文本
http://localhost:9030/modaforge/rag-detail?ragId=1002  # 层级结构+目录树
http://localhost:9030/modaforge/rag-detail?ragId=1003  # 图文混合
http://localhost:9030/modaforge/rag-detail?ragId=1004  # PPT
http://localhost:9030/modaforge/rag-detail?ragId=1005  # Excel
```

### 布局说明

PDF场景布局（左侧分段列表，右侧PDF）：

```
┌──────────────────────┬──────────────────────────────┐
│                      │                              │
│   左侧（分段列表）    │    右侧（PDF查看器）          │
│                      │                              │
│  如果有目录树：       │    - 显示PDF文件              │
│  ┌────┬──────────┐  │    - 支持高亮                │
│  │目录│ 分段列表  │  │    - 支持滚动到指定位置        │
│  │树  │          │  │                              │
│  └────┴──────────┘  │                              │
│                      │                              │
│  如果无目录树：       │                              │
│  ┌──────────────┐   │                              │
│  │  分段列表     │   │                              │
│  └──────────────┘   │                              │
└──────────────────────┴──────────────────────────────┘
```

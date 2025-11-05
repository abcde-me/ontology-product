# RAG 分段列表功能实现教程

## 项目概述

本教程详细介绍如何从零开始实现一个高性能、高可扩展的RAG（Retrieval-Augmented Generation）知识库分段列表功能。该功能支持5种不同的分段场景，每种场景都有独特的展示和交互方式。

## 目录

1. [第一阶段：基础文本分段](#第一阶段基础文本分段)
2. [第二阶段：多场景支持](#第二阶段多场景支持)
3. [技术栈和架构](#技术栈和架构)
4. [快速开始](#快速开始)

---

## 第一阶段：基础文本分段

### 1.1 项目初始化

#### 创建页面结构
```
src/pages/ragDetail/
├── components/          # React组件
├── store/              # Zustand状态管理
├── api/                # API接口层
├── types/              # TypeScript类型
├── utils/              # 工具函数
├── styles/             # 样式文件
└── index.tsx           # 入口文件
```

#### 添加路由配置
在 `src/pages/admin/route/index.ts` 中添加：
```typescript
{
  path: '/tenant/compute/modaforge/ragDetail',
  component: React.lazy(() => import('../../ragDetail')),
  exact: true
}
```

### 1.2 类型定义

创建 `src/pages/ragDetail/types/index.ts`，定义基础类型：

```typescript
export interface Segment {
  id: string;
  content: string;
  charCount: number;
  segmentIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface RagDetailData {
  ragId: string;
  fileName: string;
  filePath: string;
  segments: Segment[];
}
```

### 1.3 状态管理

使用Zustand创建 `src/pages/ragDetail/store/ragDetailStore.ts`：

```typescript
import { create } from 'zustand';

export const useRagDetailStore = create((set, get) => ({
  ragId: null,
  fileName: '',
  filePath: '',
  segments: [],
  selectedSegmentId: null,
  editingSegmentId: null,
  showPdfViewer: true,
  loading: false,
  error: null,

  // 初始化数据
  initializeRagDetail: async (ragId) => {
    set({ loading: true });
    try {
      const data = await fetchRagDetail(ragId);
      set({
        ragId,
        fileName: data.fileName,
        filePath: data.filePath,
        segments: data.segments,
        selectedSegmentId: data.segments[0]?.id || null,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // 选中分段
  selectSegment: (segmentId) => {
    set({ selectedSegmentId: segmentId, editingSegmentId: null });
  },

  // 编辑分段
  startEditingSegment: (segmentId) => {
    set({ editingSegmentId: segmentId });
  },

  // 更新分段内容
  updateSegmentContent: async (segmentId, content) => {
    try {
      const ragId = get().ragId;
      await updateSegmentContent(ragId, segmentId, content);
      
      const segments = get().segments.map(seg =>
        seg.id === segmentId
          ? { ...seg, content, charCount: content.length }
          : seg
      );
      set({ segments, editingSegmentId: null });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // 切换PDF显示
  togglePdfViewer: () => {
    set(state => ({ showPdfViewer: !state.showPdfViewer }));
  }
}));
```

### 1.4 API层

创建 `src/pages/ragDetail/api/ragDetailApi.ts`：

```typescript
import { RagDetailData, Segment } from '../types';
import { mockRagDetailData } from '../utils/mockData';

export async function fetchRagDetail(ragId: string): Promise<RagDetailData> {
  // 当前使用Mock数据，可替换为真实API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRagDetailData(ragId));
    }, 500);
  });
}

export async function updateSegmentContent(
  ragId: string,
  segmentId: string,
  content: string
): Promise<Segment> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: segmentId,
        content,
        charCount: content.length,
        segmentIndex: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }, 300);
  });
}
```

### 1.5 Mock数据

创建 `src/pages/ragDetail/utils/mockData.ts`：

```typescript
export const mockRagDetailData = (ragId: string) => {
  const segments = [
    {
      id: 'seg_001',
      content: '按照本次发行前的股份数计算...',
      charCount: 886,
      segmentIndex: 1,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    // ... 更多分段
  ];

  return {
    ragId,
    fileName: '北京市电话通信业务入网服务合同.pdf',
    filePath: '数据集市 / 中油油井结构化问答知识库 / ...',
    segments
  };
};
```

### 1.6 核心组件

#### Header 组件
显示文件路径和名称。

#### MainContent 组件
管理PDF查看器和分段列表的布局。

#### SegmentList 组件
渲染所有分段卡片。

#### SegmentCard 组件
单个分段卡片，支持选中、Hover、编辑状态。

#### SegmentCardContent 组件
分段内容显示和编辑，支持点击外部自动保存。

### 1.7 样式

使用Tailwind CSS编写样式，主要颜色：
- 蓝色（高亮）: `#007DFA`
- 灰色（边框）: `#e5e7eb`
- 浅蓝色（背景）: `#eff6ff`

### 1.8 测试

编写单元测试验证Store功能。

---

## 第二阶段：多场景支持

### 2.1 扩展类型定义

在 `types/index.ts` 中添加新的场景类型：

```typescript
export type SceneType = 'text' | 'hierarchical' | 'image-text' | 'ppt' | 'table';

// 分层级分段
export interface HierarchicalSegment extends Segment {
  level: number;
  parentId?: string;
}

// 图文混合分段
export interface ImageTextSegment extends Segment {
  images?: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
}

// PPT分段
export interface PptSegment extends Segment {
  slideNumber: number;
  slideTitle?: string;
}

// 表格分段
export interface TableSegment extends Segment {
  tableData?: {
    headers: string[];
    rows: Array<Record<string, string>>;
  };
}

// 目录树节点
export interface DirectoryNode {
  id: string;
  label: string;
  level: number;
  children?: DirectoryNode[];
  segmentIds?: string[];
}
```

### 2.2 更新Store

在Store中添加新的状态和方法：

```typescript
export const useRagDetailStore = create((set, get) => ({
  // ... 原有状态
  sceneType: 'text',
  directory: undefined,
  selectedDirectoryNodeId: null,
  showImageModal: false,
  selectedImageUrl: undefined,

  // 新方法
  selectDirectoryNode: (nodeId) => {
    set({ selectedDirectoryNodeId: nodeId });
    // 自动滚动到对应分段
  },

  showImageModal: (imageUrl) => {
    set({ showImageModal: true, selectedImageUrl: imageUrl });
  },

  hideImageModal: () => {
    set({ showImageModal: false, selectedImageUrl: undefined });
  }
}));
```

### 2.3 Mock数据扩展

为每种场景创建对应的Mock数据：

```typescript
export const mockTextSceneData = (ragId) => { /* ... */ };
export const mockHierarchicalSceneData = (ragId) => { /* ... */ };
export const mockImageTextSceneData = (ragId) => { /* ... */ };
export const mockPptSceneData = (ragId) => { /* ... */ };
export const mockTableSceneData = (ragId) => { /* ... */ };

export const mockRagDetailData = (ragId) => {
  switch (ragId) {
    case 'text-scene':
      return mockTextSceneData(ragId);
    case 'hierarchical-scene':
      return mockHierarchicalSceneData(ragId);
    // ... 其他场景
    default:
      return mockTextSceneData(ragId);
  }
};
```

### 2.4 场景路由组件

创建 `SceneRouter.tsx` 根据sceneType动态渲染不同的场景组件。

### 2.5 场景特定组件

#### 场景2：分层级分段 + 目录树
- `DirectoryTree.tsx` - 目录树组件
- `HierarchicalSegmentList.tsx` - 分层级分段列表
- `HierarchicalSceneContent.tsx` - 场景容器

#### 场景3：图文混合
- `ImageTextSegmentCard.tsx` - 图文混合卡片
- `ImageTextSegmentList.tsx` - 图文混合列表
- `ImageModal.tsx` - 图片放大弹窗
- `ImageTextSceneContent.tsx` - 场景容器

#### 场景4：PPT展示
- `PptViewer.tsx` - PPT查看器
- `PptSegmentCard.tsx` - PPT分段卡片
- `PptSegmentList.tsx` - PPT分段列表
- `PptSceneContent.tsx` - 场景容器

#### 场景5：表格分段
- `TableViewer.tsx` - 表格查看器
- `TableSegmentCard.tsx` - 表格分段卡片
- `TableSegmentList.tsx` - 表格分段列表
- `TableSceneContent.tsx` - 场景容器

---

## 技术栈和架构

### 技术栈
- React 18+
- TypeScript
- Zustand 4.5.2+
- Tailwind CSS 3+
- Jest & React Testing Library

### 架构设计

```
UI层 (Components)
    ↓
状态管理层 (Zustand Store)
    ↓
API层 (API Calls)
    ↓
数据层 (Mock/Real API)
```

### 性能优化
- 组件拆分（细粒度）
- useMemo缓存
- 虚拟滚动准备
- 事件委托

---

## 快速开始

### 访问不同场景

```
# 场景1：基础文本
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=text-scene

# 场景2：分层级分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=hierarchical-scene

# 场景3：图文混合
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=image-text-scene

# 场景4：PPT展示
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=ppt-scene

# 场景5：表格分段
http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=table-scene
```

### 集成真实API

修改 `api/ragDetailApi.ts` 中的 `fetchRagDetail` 函数：

```typescript
export async function fetchRagDetail(ragId: string): Promise<RagDetailData> {
  const response = await fetch(`/api/rag/${ragId}`);
  const data = await response.json();
  return data;
}
```

---

## 总结

通过本教程，你已经学会了如何：

1. ✅ 设计和实现基础的分段列表功能
2. ✅ 使用Zustand进行状态管理
3. ✅ 支持多种分段场景
4. ✅ 实现复杂的交互功能
5. ✅ 优化性能和可扩展性

下一步可以考虑：
- 集成真实API
- 添加搜索和过滤功能
- 实现虚拟滚动
- 添加更多交互功能

祝你使用愉快！🚀


# RAG 分段列表 - 架构设计文档

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React Components)           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ RagDetail (Main Entry)                           │   │
│  │  ├─ Header (文件信息)                            │   │
│  │  └─ SceneRouter (场景路由)                       │   │
│  │     ├─ MainContent (场景1)                       │   │
│  │     ├─ HierarchicalSceneContent (场景2)         │   │
│  │     ├─ ImageTextSceneContent (场景3)            │   │
│  │     ├─ PptSceneContent (场景4)                  │   │
│  │     └─ TableSceneContent (场景5)                │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│              State Management Layer (Zustand)            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ useRagDetailStore                                │   │
│  │  ├─ State (ragId, segments, selectedSegmentId)  │   │
│  │  ├─ Actions (selectSegment, updateContent)      │   │
│  │  └─ Selectors (getSelectedSegment)              │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                 API Layer (Data Fetching)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ragDetailApi.ts                                  │   │
│  │  ├─ fetchRagDetail(ragId)                        │   │
│  │  ├─ updateSegmentContent(ragId, segmentId)      │   │
│  │  └─ ... (其他API)                               │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│              Data Layer (Mock/Real API)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ mockData.ts / Real Backend API                   │   │
│  │  ├─ mockTextSceneData()                          │   │
│  │  ├─ mockHierarchicalSceneData()                  │   │
│  │  ├─ mockImageTextSceneData()                     │   │
│  │  ├─ mockPptSceneData()                           │   │
│  │  └─ mockTableSceneData()                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 数据流

### 初始化流程
```
1. 用户访问 /ragDetail?ragId=xxx
   ↓
2. RagDetail 组件 useEffect 触发
   ↓
3. 调用 initializeRagDetail(ragId)
   ↓
4. Store 调用 fetchRagDetail(ragId)
   ↓
5. API 层返回 Mock 数据
   ↓
6. Store 更新状态
   ↓
7. 组件重新渲染
```

### 分段选中流程
```
1. 用户点击分段卡片
   ↓
2. SegmentCard 调用 selectSegment(segmentId)
   ↓
3. Store 更新 selectedSegmentId
   ↓
4. 所有订阅 Store 的组件重新渲染
   ↓
5. 分段卡片显示高亮状态
```

### 编辑分段流程
```
1. 用户点击编辑按钮
   ↓
2. Store 更新 editingSegmentId
   ↓
3. SegmentCardContent 显示输入框
   ↓
4. 用户修改内容并点击外部
   ↓
5. 调用 updateSegmentContent(segmentId, content)
   ↓
6. API 保存数据
   ↓
7. Store 更新 segments 数据
   ↓
8. 组件重新渲染，退出编辑模式
```

## 组件树

```
RagDetail
├── Header
│   └── 显示文件路径和名称
└── SceneRouter
    ├── MainContent (场景1)
    │   ├── PdfViewer
    │   └── SegmentList
    │       └── SegmentCard[]
    │           ├── SegmentCardActions
    │           └── SegmentCardContent
    │
    ├── HierarchicalSceneContent (场景2)
    │   ├── PdfViewer
    │   ├── DirectoryTree
    │   │   └── DirectoryNode[]
    │   └── HierarchicalSegmentList
    │       └── SegmentCard[]
    │
    ├── ImageTextSceneContent (场景3)
    │   ├── PdfViewer
    │   ├── ImageTextSegmentList
    │   │   └── ImageTextSegmentCard[]
    │   │       └── Image[]
    │   └── ImageModal
    │
    ├── PptSceneContent (场景4)
    │   ├── PptViewer
    │   └── PptSegmentList
    │       └── PptSegmentCard[]
    │
    └── TableSceneContent (场景5)
        ├── TableViewer
        └── TableSegmentList
            └── TableSegmentCard[]
```

## 状态管理设计

### Store 结构
```typescript
interface RagDetailState {
  // 基础数据
  ragId: string | null;
  fileName: string;
  filePath: string;
  sceneType: SceneType;
  segments: Segment[];
  
  // 场景2特定
  directory?: DirectoryNode[];
  
  // UI状态
  selectedSegmentId: string | null;
  selectedDirectoryNodeId?: string | null;
  editingSegmentId: string | null;
  showPdfViewer: boolean;
  
  // 场景3特定
  showImageModal: boolean;
  selectedImageUrl?: string;
  
  // 加载状态
  loading: boolean;
  error: string | null;
}

interface RagDetailActions {
  initializeRagDetail(ragId: string): Promise<void>;
  selectSegment(segmentId: string): void;
  startEditingSegment(segmentId: string): void;
  updateSegmentContent(segmentId: string, content: string): Promise<void>;
  togglePdfViewer(): void;
  selectDirectoryNode(nodeId: string): void;
  showImageModal(imageUrl: string): void;
  hideImageModal(): void;
}
```

## 类型系统

### 基础类型
```typescript
export interface Segment {
  id: string;
  content: string;
  charCount: number;
  segmentIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type SceneType = 'text' | 'hierarchical' | 'image-text' | 'ppt' | 'table';
```

### 场景特定类型
```typescript
// 场景2
export interface HierarchicalSegment extends Segment {
  level: number;
  parentId?: string;
}

// 场景3
export interface ImageTextSegment extends Segment {
  images?: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
}

// 场景4
export interface PptSegment extends Segment {
  slideNumber: number;
  slideTitle?: string;
  slideContent?: string;
}

// 场景5
export interface TableSegment extends Segment {
  tableData?: {
    headers: string[];
    rows: Array<Record<string, string>>;
  };
}
```

## 性能优化策略

### 1. 组件拆分
- 细粒度组件设计
- 每个组件职责单一
- 减少不必要的重新渲染

### 2. 状态管理
- 使用 Zustand 的选择器避免全局重新渲染
- 分离关注点的状态

### 3. 缓存优化
- 使用 useMemo 缓存计算结果
- 使用 useCallback 缓存回调函数

### 4. 虚拟滚动（未来优化）
- 对于大量分段，使用虚拟滚动库
- 只渲染可见区域的组件

### 5. 代码分割
- 使用 React.lazy 进行路由级别的代码分割
- 场景组件可以按需加载

## 扩展性设计

### 添加新场景的步骤

1. **定义新类型**
   ```typescript
   export interface NewSceneSegment extends Segment {
     // 新字段
   }
   ```

2. **创建Mock数据**
   ```typescript
   export const mockNewSceneData = (ragId) => {
     return {
       sceneType: 'new-scene',
       segments: [...]
     };
   };
   ```

3. **创建场景组件**
   ```typescript
   export const NewSceneContent: React.FC = () => {
     return (
       <div>
         {/* 场景特定的布局 */}
       </div>
     );
   };
   ```

4. **更新 SceneRouter**
   ```typescript
   case 'new-scene':
     return <NewSceneContent />;
   ```

5. **更新 Store**（如需要）
   ```typescript
   // 添加新的状态和方法
   ```

## 错误处理

### 错误类型
- 网络错误
- 数据格式错误
- 业务逻辑错误

### 处理策略
- 在 API 层捕获错误
- 在 Store 中保存错误信息
- 在 UI 中显示错误提示

## 测试策略

### 单元测试
- Store 逻辑测试
- 组件渲染测试
- 工具函数测试

### 集成测试
- 数据流测试
- 用户交互测试

### E2E 测试
- 完整场景测试

## 部署和维护

### 环境配置
- 开发环境：使用 Mock 数据
- 生产环境：连接真实 API

### 监控
- 性能监控
- 错误监控
- 用户行为分析

---

## 总结

该架构设计遵循以下原则：

1. **分层设计** - 清晰的层次结构
2. **单一职责** - 每个模块职责明确
3. **高内聚低耦合** - 模块间依赖最小
4. **易于扩展** - 添加新场景简单
5. **性能优化** - 多种优化策略
6. **可维护性** - 代码结构清晰

这样的设计使得系统既能满足当前需求，又能灵活应对未来的扩展。


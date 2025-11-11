# SegmentDrawer 组件重构总结

## 🎯 重构目标

将 SegmentDrawer 从 Props 传递模式重构为 **Zustand 统一状态管理**模式，实现：

1. ✅ 统一管理分段详情和溯源日志数据
2. ✅ 抽离 Header 和 Tabs 为独立组件
3. ✅ 清晰的数据流和状态管理
4. ✅ 保持功能和样式不变

## 📁 新的文件结构

```
SegmentDrawer/
├── index.tsx                           # 主入口（简化后）
├── DrawerHeader.tsx                    # Header 组件（新增）
├── DrawerTabs.tsx                      # Tabs 组件（新增）
├── store/
│   └── segmentDrawerStore.ts          # 统一状态管理（新增）
└── README.md                           # 文档（新增）

SegmentDetail/
├── index.tsx                           # 使用统一 store 的数据
├── store/
│   └── segmentDetailStore.ts          # 本地编辑状态管理
└── ...

TraceLog.tsx                            # 使用统一 store 的数据
```

## 🔄 架构变化

### 之前的架构（Props 传递）

```
SegmentDrawer (index.tsx)
  ├── useState(activeTab)
  ├── useState(segmentIndex)
  ├── Header (内联)
  ├── Tabs (内联)
  ├── SegmentDetail
  │   └── useState(mockData)  ❌ 独立的数据源
  └── TraceLog
      └── useState(mockData)  ❌ 独立的数据源
```

**问题**：

- ❌ 数据分散在各个组件中
- ❌ 切换分段时无法统一加载数据
- ❌ Header 和 Tabs 代码内联，难以维护
- ❌ 没有统一的数据加载逻辑

### 现在的架构（Zustand 统一管理）

```
segmentDrawerStore (统一状态管理)
  ├── 抽屉状态 (visible, activeTab)
  ├── 分段导航 (currentSegmentIndex, totalSegments)
  ├── 分段详情数据 (segmentDetailData)
  ├── 溯源日志数据 (traceLogStatistics, traceLogNodes)
  └── 数据加载方法 (loadSegmentDetail, loadTraceLog)
      ↓
SegmentDrawer (index.tsx)
  ├── DrawerHeader (独立组件)
  ├── DrawerTabs (独立组件)
  ├── SegmentDetail
  │   ├── 从 segmentDrawerStore 获取数据
  │   └── 使用 segmentDetailStore 管理编辑状态
  └── TraceLog
      └── 从 segmentDrawerStore 获取数据
```

**优势**：

- ✅ 数据集中管理
- ✅ 切换分段时统一加载数据
- ✅ 组件职责清晰
- ✅ 易于维护和扩展

## 📊 数据流

### 1. 打开抽屉

```
用户点击打开抽屉
  ↓
SegmentDrawer.openDrawer(segmentIndex, activeTab)
  ↓
segmentDrawerStore.openDrawer()
  ↓
根据 activeTab 加载对应数据
  ├── activeTab === 'detail' → loadSegmentDetail()
  └── activeTab === 'trace' → loadTraceLog()
  ↓
组件自动重新渲染
```

### 2. 切换分段

```
用户点击上一个/下一个分段
  ↓
DrawerHeader.goToPrevSegment() / goToNextSegment()
  ↓
segmentDrawerStore 更新 currentSegmentIndex
  ↓
根据当前 activeTab 加载新分段数据
  ├── activeTab === 'detail' → loadSegmentDetail(newIndex)
  └── activeTab === 'trace' → loadTraceLog(newIndex)
  ↓
组件自动重新渲染
```

### 3. 切换 Tab

```
用户点击切换 Tab
  ↓
DrawerTabs.setActiveTab(tab)
  ↓
segmentDrawerStore 更新 activeTab
  ↓
加载对应数据
  ├── tab === 'detail' → loadSegmentDetail(currentIndex)
  └── tab === 'trace' → loadTraceLog(currentIndex)
  ↓
组件自动重新渲染
```

### 4. 分段详情编辑

```
SegmentDetail 组件
  ↓
从 segmentDrawerStore 获取初始数据
  ↓
初始化到 segmentDetailStore（本地编辑状态）
  ↓
用户编辑
  ↓
segmentDetailStore 管理编辑状态
  ↓
确认保存 → 调用 API → 更新 segmentDrawerStore
取消编辑 → 恢复到初始数据
```

## 🔑 核心代码

### segmentDrawerStore.ts

```typescript
export const useSegmentDrawerStore = create<SegmentDrawerStore>((set, get) => ({
  // 状态
  visible: false,
  activeTab: 'trace',
  currentSegmentIndex: 1,
  totalSegments: 100,
  segmentDetailData: null,
  traceLogStatistics: null,
  traceLogNodes: [],

  // 打开抽屉
  openDrawer: async (segmentIndex, activeTab = 'trace') => {
    set({ visible: true, currentSegmentIndex: segmentIndex, activeTab });

    // 根据 activeTab 加载对应数据
    if (activeTab === 'detail') {
      await get().loadSegmentDetail(segmentIndex);
    } else {
      await get().loadTraceLog(segmentIndex);
    }
  },

  // 切换分段
  goToNextSegment: async () => {
    const { currentSegmentIndex, totalSegments, activeTab } = get();
    if (currentSegmentIndex < totalSegments) {
      const newIndex = currentSegmentIndex + 1;
      set({ currentSegmentIndex: newIndex });

      // 加载新分段的数据
      if (activeTab === 'detail') {
        await get().loadSegmentDetail(newIndex);
      } else {
        await get().loadTraceLog(newIndex);
      }
    }
  },

  // 加载分段详情
  loadSegmentDetail: async (segmentIndex) => {
    set({ segmentDetailLoading: true });

    // TODO: 调用真实 API
    // const response = await fetch(`/api/segments/${segmentIndex}/detail`);
    // const data = await response.json();

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = JSON.parse(JSON.stringify(mockSegmentDetailData));

    set({ segmentDetailData: data, segmentDetailLoading: false });
  },

  // 加载溯源日志
  loadTraceLog: async (segmentIndex) => {
    set({ traceLogLoading: true });

    // TODO: 调用真实 API
    // const response = await fetch(`/api/segments/${segmentIndex}/trace`);
    // const data = await response.json();

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 300));
    const statistics = JSON.parse(JSON.stringify(mockTraceLogStatistics));
    const nodes = JSON.parse(JSON.stringify(mockNodeDetails));

    set({
      traceLogStatistics: statistics,
      traceLogNodes: nodes,
      traceLogLoading: false
    });
  }
}));
```

### DrawerHeader.tsx

```typescript
const DrawerHeader: React.FC = () => {
  const {
    currentSegmentIndex,
    totalSegments,
    goToPrevSegment,
    goToNextSegment,
    closeDrawer
  } = useSegmentDrawerStore();

  return (
    <div className="relative flex h-16 items-center">
      {/* 标题、分段导航、关闭按钮 */}
    </div>
  );
};
```

### DrawerTabs.tsx

```typescript
const DrawerTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useSegmentDrawerStore();

  return (
    <div className="flex border-b border-gray-200">
      {/* 分段详情和溯源日志 Tab */}
    </div>
  );
};
```

### SegmentDetail/index.tsx

```typescript
const SegmentDetail: React.FC<SegmentDetailProps> = ({ segmentId }) => {
  // 从本地 store 获取编辑状态
  const {
    detailData: localDetailData,
    isEditing,
    initializeDetail,
    startEditing,
    cancelEditing,
    confirmEditing
  } = useSegmentDetailStore();

  // 从统一的 drawer store 获取数据
  const { segmentDetailData, segmentDetailLoading } = useSegmentDrawerStore();

  // 初始化数据
  useEffect(() => {
    if (segmentDetailData) {
      initializeDetail(segmentId, segmentDetailData);
    }
  }, [segmentId, segmentDetailData, initializeDetail]);

  // 渲染...
};
```

### TraceLog.tsx

```typescript
const TraceLog: React.FC = () => {
  // 从统一的 drawer store 获取数据
  const { traceLogStatistics, traceLogNodes, traceLogLoading } =
    useSegmentDrawerStore();

  if (traceLogLoading || !traceLogStatistics) {
    return <div>加载中...</div>;
  }

  // 渲染...
};
```

## 🎯 API 集成

### 分段详情 API

```typescript
// TODO: 替换 mock 数据
loadSegmentDetail: async (segmentIndex) => {
  try {
    set({ segmentDetailLoading: true, segmentDetailError: null });

    const response = await fetch(`/api/segments/${segmentIndex}/detail`);
    const data = await response.json();

    set({ segmentDetailData: data, segmentDetailLoading: false });
  } catch (error) {
    set({
      segmentDetailError: error.message,
      segmentDetailLoading: false
    });
  }
};
```

### 溯源日志 API

```typescript
// TODO: 替换 mock 数据
loadTraceLog: async (segmentIndex) => {
  try {
    set({ traceLogLoading: true, traceLogError: null });

    const response = await fetch(`/api/segments/${segmentIndex}/trace`);
    const data = await response.json();

    set({
      traceLogStatistics: data.statistics,
      traceLogNodes: data.nodes,
      traceLogLoading: false
    });
  } catch (error) {
    set({
      traceLogError: error.message,
      traceLogLoading: false
    });
  }
};
```

## ✅ 重构成果

1. **✅ 组件抽离**
   - DrawerHeader - 独立的头部组件
   - DrawerTabs - 独立的标签页组件

2. **✅ 统一状态管理**
   - segmentDrawerStore - 管理整个抽屉的状态和数据
   - 分段详情和溯源日志数据集中管理

3. **✅ 清晰的数据流**
   - 切换分段 → 自动加载对应数据
   - 切换 Tab → 自动加载对应数据
   - 数据流向清晰可追踪

4. **✅ 易于扩展**
   - 添加新的 Tab 只需在 store 中添加数据和加载方法
   - 添加新的功能只需在 store 中添加 action

5. **✅ 功能和样式不变**
   - 所有功能保持不变
   - 所有样式保持不变
   - 用户体验完全一致

## 🚀 后续优化

1. **集成真实 API**
   - 替换 mock 数据为真实 API 调用
   - 添加错误处理和重试逻辑

2. **性能优化**
   - 添加数据缓存机制
   - 避免重复加载相同分段的数据

3. **用户体验优化**
   - 添加加载动画
   - 添加错误提示
   - 添加数据刷新功能

## 📚 参考资料

- [Zustand 官方文档](https://github.com/pmndrs/zustand)
- [React 组件设计最佳实践](https://react.dev/learn/thinking-in-react)
- [SegmentDetail 重构文档](../SegmentDetail/ZUSTAND_MIGRATION.md)
